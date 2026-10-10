'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Zap,
  RotateCw,
  Minimize2,
  Layers,
  X,
  Volume2,
  VolumeX,
  Bot,
} from 'lucide-react';

export interface SubsystemDetail {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  tech: string;
  protocol: string;
  latency: string;
  throughput: string;
  sla: string;
  tags: string[];
  tradeoff: string;
  copilotPrompt: string;
  iconGlyph: string;
}

export const SUBSYSTEMS: Record<string, SubsystemDetail> = {
  gateway: {
    id: 'gateway',
    title: 'API GATEWAY',
    category: 'Ingress & Edge Routing',
    subtitle: 'Load Balancing · Rate Limiting · Auth · Monitoring',
    tech: 'Spring Cloud Gateway / Express Netty Engine',
    protocol: 'HTTPS / HTTP/2 · Asymmetric JWT',
    latency: '1.2ms P95',
    throughput: '48,000 req/s',
    sla: '99.99%',
    tags: ['Netty SSL Termination', 'Token Bucket Limiter', 'JWT RBAC Verification', 'CORS Guard'],
    tradeoff: 'Stateless JWT signature verification performed at ingress edge to protect downstream services from unauthorized RPC traffic.',
    copilotPrompt: 'Explain how your API Gateway handles rate limiting, JWT validation, and SSL termination in production.',
    iconGlyph: '🌐',
  },
  clients: {
    id: 'clients',
    title: 'CLIENTS',
    category: 'Edge Applications',
    subtitle: 'Web App · Mobile App · External Services',
    tech: 'Next.js 14 App Router, React Native (Fonofy 10K+)',
    protocol: 'HTTPS / WSS / gRPC',
    latency: 'Client-side',
    throughput: '10,000+ app users',
    sla: '4.8★ Play Store',
    tags: ['Web App', 'Mobile App', 'External Services', 'HTTP / HTTPS', 'REST · gRPC'],
    tradeoff: 'Optimistic client-side cache updates with rollback handlers for instant UX during mobile trade-in device inspections.',
    copilotPrompt: 'How did you build and deploy the Fonofy mobile application on the Google Play Store with 10K+ downloads?',
    iconGlyph: '💻',
  },
  kafka: {
    id: 'kafka',
    title: 'KAFKA',
    category: 'Distributed Message Backbone',
    subtitle: 'Event Streaming · Real-time Data',
    tech: 'Apache Kafka 3.6, Spring Kafka, KRaft Quorum',
    protocol: 'Binary TCP / SASL Scram',
    latency: '3.8ms P95',
    throughput: '120,000 ev/s',
    sla: 'Zero Data Loss',
    tags: ['user-events', 'order-events', 'notification-events', 'analytics-events'],
    tradeoff: 'Partitioned by merchant tenant ID for strict in-order processing while scaling horizontally across cluster consumer groups.',
    copilotPrompt: 'Why did you choose Kafka over RabbitMQ for your event streaming architecture, and how do you handle dead-letter queues?',
    iconGlyph: '⚡',
  },
  workers: {
    id: 'workers',
    title: 'WORKERS',
    category: 'Background Compute Tier',
    subtitle: 'Background Jobs · Async Processing',
    tech: 'Java 21 Project Loom Fibers, Node.js Worker Cluster',
    protocol: 'Kafka Consumer Group / BullMQ',
    latency: 'Async / 45ms P95',
    throughput: '50,000 txns/day',
    sla: '99.9% Uptime',
    tags: ['Media Processing', 'AI Inference', 'Notifications', 'Data Pipelines'],
    tradeoff: 'Idempotent transaction deduplication keys prevent duplicate charge execution or duplicate document chunking on consumer rebalance.',
    copilotPrompt: 'Explain how Java 21 Virtual Threads (Project Loom) improved throughput in your background worker pipelines.',
    iconGlyph: '⚙️',
  },
  vector: {
    id: 'vector',
    title: 'VECTOR SEARCH',
    category: 'Applied AI Knowledge Tier',
    subtitle: 'Embeddings · Similarity Search · RAG · Semantic Retrieval',
    tech: 'Qdrant Vector DB / MongoDB Atlas Vector Search',
    protocol: 'gRPC Vector Similarity · HNSW Index',
    latency: '14ms P95 Search',
    throughput: '1,500 qps',
    sla: 'Sub-200ms E2E',
    tags: ['Embeddings', 'Similarity Search', 'RAG', 'Semantic Retrieval', 'Qdrant HNSW'],
    tradeoff: 'Reciprocal Rank Fusion (RRF) combines dense vector cosine similarity with BM25 lexical search to eliminate hallucination in technical document retrieval.',
    copilotPrompt: 'How does your Enterprise RAG pipeline extract text, generate vector embeddings, and assemble context for LLM generation?',
    iconGlyph: '🧠',
  },
  database: {
    id: 'database',
    title: 'DATABASE',
    category: 'Persistent Data Tier',
    subtitle: 'PostgreSQL · MongoDB · Redis · Scalable Storage',
    tech: 'PostgreSQL 16, MongoDB Atlas, Redis 7 In-Memory',
    protocol: 'Postgres Wire / BSON / Redis RESP',
    latency: '0.4ms Redis · 6ms Postgres',
    throughput: '98.4% Cache Hit',
    sla: 'ACID Compliant',
    tags: ['PostgreSQL', 'MongoDB', 'Redis', 'Scalable Storage'],
    tradeoff: 'PostgreSQL provides strict ACID transactions for order balances while MongoDB stores semi-structured device telemetry and document chunks.',
    copilotPrompt: 'What is your database caching strategy with Redis, and how do you prevent cache stampedes (thundering herd)?',
    iconGlyph: '🗄️',
  },
};

const PEDESTAL_COORDS = [
  { id: 'gateway', x: 0.2, y: 2.8, z: -1.2, width: 3.5, height: 1.75 },
  { id: 'clients', x: -4.5, y: 0.35, z: 0.2, width: 3.3, height: 1.65 },
  { id: 'kafka', x: 4.4, y: 1.85, z: -0.6, width: 3.5, height: 1.75 },
  { id: 'workers', x: 4.5, y: -0.55, z: 0.8, width: 3.5, height: 1.75 },
  { id: 'vector', x: -1.8, y: -2.15, z: 0.9, width: 3.4, height: 1.7 },
  { id: 'database', x: 2.6, y: -2.25, z: 0.9, width: 3.4, height: 1.7 },
];

function playSynthChime(freq = 580) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  } catch {
    // Ignore audio errors if blocked by browser policy
  }
}

interface Props {
  chapter: number;
  progress: number;
}

export default function CoreCanvas({ chapter, progress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedSubsystem, setSelectedSubsystem] = useState<SubsystemDetail | null>(null);
  const [hoveredSubsystemId, setHoveredSubsystemId] = useState<string | null>(null);
  const [trafficSurgeActive, setTrafficSurgeActive] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const selectedIdRef = useRef<string | null>(null);
  const hoveredIdRef = useRef<string | null>(null);
  const trafficSurgeRef = useRef<boolean>(false);
  const autoRotateRef = useRef<boolean>(false);

  selectedIdRef.current = selectedSubsystem ? selectedSubsystem.id : null;
  hoveredIdRef.current = hoveredSubsystemId;
  trafficSurgeRef.current = trafficSurgeActive;
  autoRotateRef.current = autoRotate;

  const triggerPulseRef = useRef<(() => void) | null>(null);
  const resetCameraRef = useRef<(() => void) | null>(null);

  const handleSelectNode = useCallback((id: string) => {
    if (id === 'core') {
      handleFirePulse();
      return;
    }
    const detail = SUBSYSTEMS[id];
    if (detail) {
      setSelectedSubsystem(detail);
      if (soundEnabled) playSynthChime(640);
    }
  }, [soundEnabled]);

  const handleFirePulse = () => {
    setTrafficSurgeActive(true);
    if (soundEnabled) playSynthChime(880);
    if (triggerPulseRef.current) triggerPulseRef.current();
    setTimeout(() => setTrafficSurgeActive(false), 2400);
  };

  const handleResetCamera = () => {
    setSelectedSubsystem(null);
    if (resetCameraRef.current) resetCameraRef.current();
  };

  const handleAskJarvis = (promptText: string) => {
    window.dispatchEvent(new CustomEvent('atlas:open-assistant', { detail: { prompt: promptText } }));
  };

  const handleScrollToLab = (nodeId: string) => {
    const el = document.getElementById('systems');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.dispatchEvent(new CustomEvent('systems:focus-node', { detail: { nodeId } }));
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // ── 1. Renderer, Camera & Scene Setup ────────────────────────
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.035);

    const defaultCameraPos = new THREE.Vector3(0, 1.15, 11.6);
    const defaultCameraTarget = new THREE.Vector3(0.15, 0.25, 0);
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
    camera.position.copy(defaultCameraPos);

    const targetCameraPos = defaultCameraPos.clone();
    const currentCameraTarget = defaultCameraTarget.clone();
    const targetLookAt = defaultCameraTarget.clone();

    resetCameraRef.current = () => {
      targetCameraPos.copy(defaultCameraPos);
      targetLookAt.copy(defaultCameraTarget);
    };

    // ── 2. Cinematic Lighting ────────────────────────────────────
    const ambLight = new THREE.AmbientLight(0x0c1e38, 2.5);
    scene.add(ambLight);

    const cyanLight = new THREE.DirectionalLight(0x38bdf8, 4.0);
    cyanLight.position.set(8, 14, 10);
    scene.add(cyanLight);

    const violetLight = new THREE.DirectionalLight(0x818cf8, 2.8);
    violetLight.position.set(-10, 8, -6);
    scene.add(violetLight);

    const corePointLight = new THREE.PointLight(0x38bdf8, 7.5, 20);
    corePointLight.position.set(0, 0.5, 0);
    scene.add(corePointLight);

    // ── 3. Cybernetic Ground Grid ────────────────────────────────
    const gridHelper = new THREE.GridHelper(38, 38, 0x0284c7, 0x0f172a);
    gridHelper.position.set(0, -3.2, -1.0);
    gridHelper.rotation.x = 0.08;
    scene.add(gridHelper);

    // ── 4. Central Electric Core (Smooth Luminous Plasma Orb — NO WIREFRAME LINES) ──
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0.15, 0.35, 0);
    scene.add(coreGroup);

    // Outer Glowing Electric Sphere
    const sphereGeo = new THREE.SphereGeometry(1.18, 48, 48);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 3.2,
      roughness: 0.1,
      metalness: 0.85,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    sphereMesh.userData = { id: 'core' };
    coreGroup.add(sphereMesh);

    // Inner Radiant Core
    const innerGeo = new THREE.SphereGeometry(0.92, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0xf0f9ff });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerMesh);

    // 3 Sleek Orbital Rings (Pure Glowing Tori — NO POLYGON WIRES)
    const rings: THREE.Mesh[] = [];
    const ringConfigs = [
      { r: 1.6, w: 0.022, col: 0x38bdf8, rotX: Math.PI / 2.2, rotZ: 0.4 },
      { r: 1.95, w: 0.018, col: 0x818cf8, rotX: Math.PI / 1.7, rotZ: -0.6 },
      { r: 2.3, w: 0.016, col: 0x38bdf8, rotX: Math.PI / 2.6, rotZ: 1.1 },
    ];

    ringConfigs.forEach((cfg) => {
      const rGeo = new THREE.TorusGeometry(cfg.r, cfg.w, 8, 90);
      const rMat = new THREE.MeshBasicMaterial({
        color: cfg.col,
        transparent: true,
        opacity: 0.85,
      });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      rMesh.rotation.set(cfg.rotX, 0, cfg.rotZ);
      coreGroup.add(rMesh);
      rings.push(rMesh);
    });

    // ── 5. High-Resolution Billboard Canvas Textures (Matching Design Reference) ──
    const createHighDefPedestalTexture = (detail: SubsystemDetail) => {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 512;
      const ctx = c.getContext('2d')!;

      // Dark translucent glass card background
      ctx.fillStyle = 'rgba(6, 12, 26, 0.94)';
      ctx.beginPath();
      ctx.roundRect(14, 14, 996, 484, 24);
      ctx.fill();

      // Sleek subtle inner gradient
      const innerGrad = ctx.createLinearGradient(0, 14, 0, 498);
      innerGrad.addColorStop(0, 'rgba(14, 165, 233, 0.15)');
      innerGrad.addColorStop(1, 'rgba(6, 11, 24, 0.95)');
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.roundRect(16, 16, 992, 480, 22);
      ctx.fill();

      // Fine Neon Cyan Glowing Border (matching reference image)
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.stroke();

      // Top glowing cyan-to-violet accent line
      const topBarGrad = ctx.createLinearGradient(24, 18, 1000, 18);
      topBarGrad.addColorStop(0, '#38bdf8');
      topBarGrad.addColorStop(0.5, '#60a5fa');
      topBarGrad.addColorStop(1, '#818cf8');
      ctx.fillStyle = topBarGrad;
      ctx.fillRect(36, 18, 952, 4);

      // Icon Badge Square
      ctx.fillStyle = 'rgba(14, 165, 233, 0.2)';
      ctx.beginPath();
      ctx.roundRect(46, 50, 84, 84, 18);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Icon Glyph
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(detail.iconGlyph, 88, 92);

      // Subsystem Title (Crisp bold uppercase white text)
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px "Space Grotesk", sans-serif';
      ctx.fillText(detail.title, 150, 80);

      // Category / Tech Line
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(detail.category.toUpperCase(), 152, 118);

      // Subtitle (Role & Features)
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 24px "Inter", sans-serif';
      ctx.fillText(detail.subtitle, 48, 175);

      // Divider Line
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.fillRect(48, 198, 928, 2);

      // Tags Badges (Pills)
      let tagX = 48;
      let tagY = 224;
      ctx.font = 'bold 22px monospace';

      detail.tags.forEach((tag, idx) => {
        const textMetrics = ctx.measureText(tag);
        const tagW = textMetrics.width + 36;

        if (tagX + tagW > 960) {
          tagX = 48;
          tagY += 50;
        }

        ctx.fillStyle = idx === 0 ? 'rgba(14, 165, 233, 0.25)' : 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(tagX, tagY, tagW, 40, 10);
        ctx.fill();

        ctx.strokeStyle = idx === 0 ? 'rgba(56, 189, 248, 0.8)' : 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = idx === 0 ? '#38bdf8' : '#cbd5e1';
        ctx.fillText(tag, tagX + 18, tagY + 27);

        tagX += tagW + 16;
      });

      // Bottom Status Footer Bar
      ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
      ctx.beginPath();
      ctx.roundRect(48, 412, 928, 52, 12);
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = '#34d399';
      ctx.fillText(`● LATENCY: ${detail.latency}`, 68, 444);

      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`THROUGHPUT: ${detail.throughput}`, 440, 444);

      ctx.fillStyle = '#a78bfa';
      ctx.fillText(`SLA: ${detail.sla}`, 810, 444);

      const tex = new THREE.CanvasTexture(c);
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      return tex;
    };

    // ── 6. Construct Pedestals with Interactive Raycasting Meshes ──
    interface PedestalMeshItem {
      id: string;
      group: THREE.Group;
      screenMesh: THREE.Mesh;
      basePos: THREE.Vector3;
      rimMesh: THREE.Mesh;
    }

    const pedestalMeshes: PedestalMeshItem[] = [];
    const interactiveObjects: THREE.Object3D[] = [];

    // Also register the core sphere for interaction
    interactiveObjects.push(sphereMesh);

    PEDESTAL_COORDS.forEach((cfg) => {
      const detail = SUBSYSTEMS[cfg.id];
      const pGroup = new THREE.Group();
      pGroup.position.set(cfg.x, cfg.y, cfg.z);
      scene.add(pGroup);

      // Chassis base pedestal
      const baseGeo = new THREE.BoxGeometry(cfg.width, 0.24, 0.45);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x071120,
        roughness: 0.2,
        metalness: 0.9,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = -cfg.height / 2;
      pGroup.add(baseMesh);

      // Glowing Neon base rim
      const rimGeo = new THREE.BoxGeometry(cfg.width * 1.02, 0.04, 0.48);
      const rimMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.position.y = -cfg.height / 2 + 0.13;
      pGroup.add(rimMesh);

      // High-Def Screen Mesh
      const tex = createHighDefPedestalTexture(detail);
      const screenGeo = new THREE.PlaneGeometry(cfg.width, cfg.height);
      const screenMat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide,
      });
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.userData = { id: cfg.id };
      pGroup.add(screenMesh);

      // Floor Hologram Ring Anchor
      const anchorGeo = new THREE.RingGeometry(0.3, 0.85, 24);
      const anchorMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      });
      const anchorMesh = new THREE.Mesh(anchorGeo, anchorMat);
      anchorMesh.rotation.x = Math.PI / 2;
      anchorMesh.position.set(cfg.x, -3.1, cfg.z);
      scene.add(anchorMesh);

      interactiveObjects.push(screenMesh);
      pedestalMeshes.push({
        id: cfg.id,
        group: pGroup,
        screenMesh,
        basePos: new THREE.Vector3(cfg.x, cfg.y, cfg.z),
        rimMesh,
      });
    });

    // ── 7. Flowing Curved Neon Laser Conduits & Moving Photon Packets ──
    const conduitLines: { curve: THREE.CatmullRomCurve3; photons: THREE.Mesh[] }[] = [];
    const conduitGroup = new THREE.Group();
    scene.add(conduitGroup);

    PEDESTAL_COORDS.forEach((cfg) => {
      const pStart = new THREE.Vector3(coreGroup.position.x, coreGroup.position.y, coreGroup.position.z);
      const pEnd = new THREE.Vector3(cfg.x, cfg.y, cfg.z);

      const midX = (pStart.x + pEnd.x) * 0.5;
      const midY = (pStart.y + pEnd.y) * 0.5 + (cfg.y > 0 ? 0.35 : -0.35);
      const midZ = (pStart.z + pEnd.z) * 0.5 + 0.35;
      const pMid = new THREE.Vector3(midX, midY, midZ);

      const curve = new THREE.CatmullRomCurve3([pStart, pMid, pEnd]);
      const points = curve.getPoints(44);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.75,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      conduitGroup.add(line);

      // Photon packets
      const photons: THREE.Mesh[] = [];
      const photonCount = 4;
      for (let k = 0; k < photonCount; k++) {
        const phGeo = new THREE.SphereGeometry(0.09, 10, 10);
        const phMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
        const phMesh = new THREE.Mesh(phGeo, phMat);
        conduitGroup.add(phMesh);
        photons.push(phMesh);
      }

      conduitLines.push({ curve, photons });
    });

    triggerPulseRef.current = () => {
      corePointLight.intensity = 18.0;
      setTimeout(() => {
        corePointLight.intensity = 7.5;
      }, 400);
    };

    // ── 8. Raycaster & Pointer Interaction ───────────────────────
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-999, -999);
    let isDragging = false;
    let prevPointer = { x: 0, y: 0 };
    const orbitEuler = new THREE.Euler(0, 0, 0, 'YXZ');

    const updatePointerPos = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerMove = (e: PointerEvent) => {
      updatePointerPos(e.clientX, e.clientY);

      if (isDragging) {
        const dx = e.clientX - prevPointer.x;
        const dy = e.clientY - prevPointer.y;
        orbitEuler.y -= dx * 0.005;
        orbitEuler.x -= dy * 0.005;
        orbitEuler.x = Math.max(-0.6, Math.min(0.6, orbitEuler.x));
        prevPointer = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      updatePointerPos(e.clientX, e.clientY);
      prevPointer = { x: e.clientX, y: e.clientY };

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, false);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const nodeId = clickedMesh.userData.id;
        if (nodeId) {
          handleSelectNode(nodeId);
          if (nodeId !== 'core') {
            const cfg = PEDESTAL_COORDS.find((p) => p.id === nodeId);
            if (cfg) {
              targetCameraPos.set(cfg.x * 0.6, cfg.y * 0.6 + 0.3, 8.5);
              targetLookAt.set(cfg.x, cfg.y, cfg.z);
            }
          }
          return;
        }
      }

      isDragging = true;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      targetCameraPos.z += e.deltaY * 0.005;
      targetCameraPos.z = Math.max(6.5, Math.min(16.0, targetCameraPos.z));
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointermove', onPointerMove);
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    domEl.addEventListener('wheel', onWheel, { passive: true });

    // ── 9. Render & Animation Loop ────────────────────────────────
    let animId = 0;
    const clock = new THREE.Clock();

    const render = () => {
      animId = requestAnimationFrame(render);
      const dt = clock.getDelta();
      const t = clock.getElapsedTime();

      // Check hover state via raycasting
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, false);
      let hitNodeId: string | null = null;
      if (intersects.length > 0) {
        hitNodeId = (intersects[0].object as THREE.Mesh).userData.id || null;
      }

      if (hitNodeId !== hoveredIdRef.current) {
        setHoveredSubsystemId(hitNodeId === 'core' ? null : hitNodeId);
        domEl.style.cursor = hitNodeId ? 'pointer' : isDragging ? 'grabbing' : 'grab';
      }

      // Smooth camera position interpolation
      camera.position.lerp(targetCameraPos, 0.05);
      currentCameraTarget.lerp(targetLookAt, 0.05);
      camera.lookAt(currentCameraTarget);

      // Auto rotate if enabled
      if (autoRotateRef.current) {
        scene.rotation.y += dt * 0.35;
      } else {
        scene.rotation.y = THREE.MathUtils.lerp(scene.rotation.y, orbitEuler.y, 0.08);
        scene.rotation.x = THREE.MathUtils.lerp(scene.rotation.x, orbitEuler.x, 0.08);
      }

      const speedMultiplier = trafficSurgeRef.current ? 3.5 : 1.0;

      // Animate central core
      sphereMesh.rotation.y += dt * 0.6 * speedMultiplier;
      innerMesh.rotation.y -= dt * 1.0 * speedMultiplier;

      // Pulse core lighting
      corePointLight.intensity =
        (trafficSurgeRef.current ? 12.0 : 6.0) + Math.sin(t * 4) * 1.5;

      // Rotate orbital rings
      rings[0].rotation.z += dt * 0.9 * speedMultiplier;
      rings[1].rotation.z -= dt * 1.1 * speedMultiplier;
      rings[2].rotation.z += dt * 0.7 * speedMultiplier;

      // Hover elevation and floating motion for pedestals
      const selectedId = selectedIdRef.current;
      const hoveredId = hoveredIdRef.current;

      pedestalMeshes.forEach(({ id, group, basePos, rimMesh }, idx) => {
        const isSelected = selectedId === id;
        const isHovered = hoveredId === id;

        const targetY = isSelected
          ? basePos.y + 0.45
          : isHovered
          ? basePos.y + 0.25
          : basePos.y + Math.sin(t * 1.6 + idx * 0.8) * 0.06;

        group.position.y = THREE.MathUtils.lerp(group.position.y, targetY, 0.1);

        const targetScale = isSelected ? 1.08 : isHovered ? 1.04 : 1.0;
        group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, targetScale, 0.1));

        // Highlight rim material color
        const rimMat = rimMesh.material as THREE.MeshBasicMaterial;
        if (isSelected) {
          rimMat.color.setHex(0x38bdf8);
        } else if (isHovered) {
          rimMat.color.setHex(0x7dd3fc);
        } else {
          rimMat.color.setHex(0x0284c7);
        }
      });

      // Move photon packets through conduits
      conduitLines.forEach(({ curve, photons }) => {
        photons.forEach((ph, pIdx) => {
          const progress = (t * 0.45 * speedMultiplier + pIdx * 0.25) % 1;
          const pos = curve.getPoint(progress);
          ph.position.copy(pos);
        });
      });

      renderer.render(scene, camera);
    };

    render();

    const onResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      domEl.removeEventListener('pointermove', onPointerMove);
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('wheel', onWheel);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Line) {
          o.geometry.dispose();
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material.dispose();
        }
      });
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [handleSelectNode]);

  return (
    <div className="w-full h-full min-h-[460px] lg:min-h-[580px] relative select-none">
      {/* ── Three.js Canvas Container ───────────────────────────────── */}
      <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* ── Top-Left Status Pill (Completely Clear of 01 / INTRO) ───── */}
      <div className="absolute top-2 left-2 z-20 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/85 border border-sky-400/30 backdrop-blur-md text-xs font-mono text-zinc-300 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold text-white">LIVE SYSTEM TOPOLOGY</span>
          <span className="text-zinc-500">|</span>
          <span className="text-[11px] text-sky-300">Drag to Orbit · Click to Inspect</span>
        </div>
      </div>

      {/* ── Bottom-Left Interactive 3D Control Bar (Clean & Non-Intrusive) ─ */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={handleFirePulse}
          disabled={trafficSurgeActive}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-sky-400/40 text-sky-200 text-xs font-semibold backdrop-blur-md shadow-lg hover:border-sky-300 hover:bg-slate-900 transition disabled:opacity-50"
          title="Simulate 10,000 req/sec traffic surge across the pipeline"
        >
          <Zap size={13} className={trafficSurgeActive ? 'animate-bounce text-amber-300' : 'text-sky-300'} />
          <span>Simulate Traffic Surge</span>
        </button>

        <button
          onClick={() => setAutoRotate((r) => !r)}
          className={`p-2 rounded-xl border backdrop-blur-md transition ${
            autoRotate
              ? 'bg-sky-400/20 border-sky-400 text-sky-300'
              : 'bg-slate-950/90 border-white/10 text-zinc-400 hover:text-white hover:bg-slate-900'
          }`}
          title="Toggle 360° Auto-Orbit"
        >
          <RotateCw size={13} className={autoRotate ? 'animate-spin' : ''} />
        </button>

        <button
          onClick={() => setSoundEnabled((v) => !v)}
          className={`p-2 rounded-xl border backdrop-blur-md transition ${
            soundEnabled
              ? 'bg-sky-400/15 border-sky-400/40 text-sky-300'
              : 'bg-slate-950/90 border-white/10 text-zinc-400 hover:text-white hover:bg-slate-900'
          }`}
          title={soundEnabled ? 'Mute Audio Effects' : 'Enable Audio Feedback'}
        >
          {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>

        <button
          onClick={handleResetCamera}
          className="p-2 rounded-xl bg-slate-950/90 border border-white/10 text-zinc-400 hover:text-white hover:bg-slate-900 backdrop-blur-md transition"
          title="Reset Camera View"
        >
          <Minimize2 size={13} />
        </button>
      </div>

      {/* ── Subsystem Quick Hover Pill ──────────────────────────────── */}
      {hoveredSubsystemId && !selectedSubsystem && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 pointer-events-none z-20 animate-fade-in">
          <div className="px-4 py-2 rounded-2xl bg-slate-950/90 border border-sky-400/50 backdrop-blur-xl shadow-xl flex items-center gap-3">
            <span className="text-lg">{SUBSYSTEMS[hoveredSubsystemId]?.iconGlyph}</span>
            <div>
              <div className="text-xs font-bold text-white tracking-wide">
                {SUBSYSTEMS[hoveredSubsystemId]?.title}
              </div>
              <div className="text-[10px] font-mono text-sky-300">
                P95: {SUBSYSTEMS[hoveredSubsystemId]?.latency} · {SUBSYSTEMS[hoveredSubsystemId]?.throughput}
              </div>
            </div>
            <span className="text-[10px] text-zinc-400 border-l border-white/10 pl-2">
              Click to inspect
            </span>
          </div>
        </div>
      )}

      {/* ── Interactive Holographic Subsystem Inspector HUD ─────────── */}
      {selectedSubsystem && (
        <div className="absolute inset-x-3 bottom-3 z-30 pointer-events-auto animate-fade-in">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/95 border border-sky-400/60 backdrop-blur-2xl shadow-2xl text-left space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/40 flex items-center justify-center text-xl">
                  {selectedSubsystem.iconGlyph}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wide font-sans">
                      {selectedSubsystem.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-semibold">
                      ONLINE // {selectedSubsystem.sla}
                    </span>
                  </div>
                  <div className="text-xs text-sky-300 font-mono">
                    {selectedSubsystem.tech}
                  </div>
                </div>
              </div>

              <button
                onClick={handleResetCamera}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition"
                title="Close Drawer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Architecture Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-zinc-400 block">PROTOCOL</span>
                <span className="text-white font-medium">{selectedSubsystem.protocol}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-zinc-400 block">P95 LATENCY</span>
                <span className="text-emerald-400 font-semibold">{selectedSubsystem.latency}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-zinc-400 block">THROUGHPUT</span>
                <span className="text-sky-300 font-semibold">{selectedSubsystem.throughput}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] text-zinc-400 block">STATUS</span>
                <span className="text-white font-medium">Verified Active</span>
              </div>
            </div>

            {/* Tradeoff Explanation */}
            <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
              <strong className="text-sky-300 font-mono text-[11px] block mb-0.5">ENGINEERING DESIGN DECISION:</strong>
              {selectedSubsystem.tradeoff}
            </p>

            {/* Subsystem Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleScrollToLab(selectedSubsystem.id)}
                  className="px-3 py-1.5 rounded-xl bg-sky-400/20 hover:bg-sky-400/30 border border-sky-400/40 text-sky-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Layers size={13} />
                  <span>Inspect in 2D Systems Lab</span>
                </button>

                <button
                  onClick={handleFirePulse}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Zap size={13} className="text-amber-400" />
                  <span>Send Packet Surge</span>
                </button>
              </div>

              <button
                onClick={() => handleAskJarvis(selectedSubsystem.copilotPrompt)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400/20 to-indigo-500/20 hover:from-amber-400/30 hover:to-indigo-500/30 border border-amber-400/40 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Bot size={13} />
                <span>Ask Jarvis Subsystem Trade-Off</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
