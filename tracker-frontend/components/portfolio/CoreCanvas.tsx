'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Layers, X, Bot, Zap, ArrowUpRight } from 'lucide-react';

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
  iconType: 'gateway' | 'clients' | 'kafka' | 'workers' | 'vector' | 'db';
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
    iconType: 'gateway',
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
    tags: ['HTTP / HTTPS', 'REST · gRPC', 'Bi-directional WSS'],
    tradeoff: 'Optimistic client-side cache updates with rollback handlers for instant UX during mobile trade-in device inspections.',
    copilotPrompt: 'How did you build and deploy the Fonofy mobile application on the Google Play Store with 10K+ downloads?',
    iconType: 'clients',
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
    iconType: 'kafka',
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
    iconType: 'workers',
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
    tags: ['Embeddings', 'Similarity Search', 'RAG', 'Semantic Retrieval'],
    tradeoff: 'Reciprocal Rank Fusion (RRF) combines dense vector cosine similarity with BM25 lexical search to eliminate hallucination in technical document retrieval.',
    copilotPrompt: 'How does your Enterprise RAG pipeline extract text, generate vector embeddings, and assemble context for LLM generation?',
    iconType: 'vector',
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
    iconType: 'db',
  },
};

const PEDESTAL_CONFIGS = [
  { id: 'gateway', x: 0.15, y: 2.65, z: -1.2, rotX: 0.18, rotY: 0, rotZ: 0, width: 3.5, height: 1.7 },
  { id: 'clients', x: -4.4, y: 0.4, z: 0.2, rotX: 0.08, rotY: 0.42, rotZ: 0, width: 3.2, height: 2.1 },
  { id: 'kafka', x: 4.4, y: 1.85, z: -0.6, rotX: 0.1, rotY: -0.4, rotZ: 0, width: 3.8, height: 1.7 },
  { id: 'workers', x: 4.5, y: -0.5, z: 0.8, rotX: -0.08, rotY: -0.4, rotZ: 0, width: 3.8, height: 1.7 },
  { id: 'vector', x: -2.0, y: -2.1, z: 0.9, rotX: -0.22, rotY: 0.22, rotZ: 0, width: 3.5, height: 1.7 },
  { id: 'database', x: 2.7, y: -2.2, z: 0.9, rotX: -0.22, rotY: -0.22, rotZ: 0, width: 3.5, height: 1.7 },
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

  const selectedIdRef = useRef<string | null>(null);
  const hoveredIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedSubsystem ? selectedSubsystem.id : null;
  hoveredIdRef.current = hoveredSubsystemId;

  const triggerPulseRef = useRef<(() => void) | null>(null);
  const resetCameraRef = useRef<(() => void) | null>(null);

  const handleSelectNode = useCallback((id: string) => {
    if (id === 'core') {
      if (triggerPulseRef.current) triggerPulseRef.current();
      playSynthChime(880);
      return;
    }
    const detail = SUBSYSTEMS[id];
    if (detail) {
      setSelectedSubsystem(detail);
      playSynthChime(640);
    }
  }, []);

  const handleCloseInspector = () => {
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
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04060a, 0.035);

    const defaultCameraPos = new THREE.Vector3(0, 0.95, 11.4);
    const defaultCameraTarget = new THREE.Vector3(0.15, 0.2, 0);
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
    camera.position.copy(defaultCameraPos);

    const targetCameraPos = defaultCameraPos.clone();
    const currentCameraTarget = defaultCameraTarget.clone();
    const targetLookAt = defaultCameraTarget.clone();

    resetCameraRef.current = () => {
      targetCameraPos.copy(defaultCameraPos);
      targetLookAt.copy(defaultCameraTarget);
    };

    // ── 2. Cinematic Restrained Lighting ─────────────────────────
    const ambLight = new THREE.AmbientLight(0x0a1428, 1.2);
    scene.add(ambLight);

    const cyanLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    cyanLight.position.set(6, 12, 8);
    scene.add(cyanLight);

    const violetLight = new THREE.DirectionalLight(0x818cf8, 1.4);
    violetLight.position.set(-8, 6, -5);
    scene.add(violetLight);

    const corePointLight = new THREE.PointLight(0x00f0ff, 4.0, 16);
    corePointLight.position.set(0.15, 0.35, 0);
    scene.add(corePointLight);

    // ── 3. Cybernetic Ground Grid ────────────────────────────────
    const gridHelper = new THREE.GridHelper(38, 38, 0x0369a1, 0x091224);
    gridHelper.position.set(0, -3.2, -1.0);
    gridHelper.rotation.x = 0.08;
    scene.add(gridHelper);

    // ── 4. Central Electric Core (Radiant Cyan Orb — NO WIREFRAME) ──
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0.15, 0.35, 0);
    scene.add(coreGroup);

    // Main Deep Cyan Energy Sphere
    const sphereGeo = new THREE.SphereGeometry(1.15, 48, 48);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x00e5ff,
      emissiveIntensity: 2.2,
      roughness: 0.15,
      metalness: 0.85,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    sphereMesh.userData = { id: 'core' };
    coreGroup.add(sphereMesh);

    // Outer Soft Atmosphere Glow Halo
    const haloGeo = new THREE.SphereGeometry(1.25, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    coreGroup.add(haloMesh);

    // 3 Smooth Orbital Rings
    const rings: THREE.Mesh[] = [];
    const ringConfigs = [
      { r: 1.58, w: 0.02, col: 0x38bdf8, rotX: Math.PI / 2.2, rotZ: 0.35 },
      { r: 1.92, w: 0.016, col: 0x818cf8, rotX: Math.PI / 1.7, rotZ: -0.55 },
      { r: 2.28, w: 0.014, col: 0x38bdf8, rotX: Math.PI / 2.6, rotZ: 1.05 },
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

    // ── 5. Vector Graphics Generator (Exact Reference Card Design) ──
    const drawCardVectorIcon = (ctx: CanvasRenderingContext2D, type: string, x: number, y: number, s: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = '#38bdf8';
      ctx.lineWidth = 2.5;

      if (type === 'gateway') {
        // Globe
        ctx.beginPath();
        ctx.arc(s / 2, s / 2, s / 2.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(s / 2, s / 2, s / 5, s / 2.2, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s / 2 - s / 2.2, s / 2);
        ctx.lineTo(s / 2 + s / 2.2, s / 2);
        ctx.stroke();
      } else if (type === 'clients') {
        // Devices
        ctx.strokeRect(4, 6, s - 14, s / 1.8);
        ctx.strokeRect(s / 2 - 2, s - 12, 16, 10);
      } else if (type === 'kafka') {
        // Event Tree
        ctx.beginPath();
        ctx.arc(10, s / 2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s - 10, 12, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s - 10, s - 12, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(10, s / 2);
        ctx.lineTo(s - 10, 12);
        ctx.moveTo(10, s / 2);
        ctx.lineTo(s - 10, s - 12);
        ctx.stroke();
      } else if (type === 'workers') {
        // Gear
        ctx.beginPath();
        ctx.arc(s / 2, s / 2, s / 2.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(s / 2, s / 2, s / 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'vector') {
        // Layers
        ctx.strokeRect(6, 6, s - 12, 10);
        ctx.strokeRect(6, 20, s - 12, 10);
        ctx.strokeRect(6, 34, s - 12, 10);
      } else {
        // Database Cylinder
        ctx.beginPath();
        ctx.ellipse(s / 2, 12, s / 2.4, 7, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(s / 2, 26, s / 2.4, 7, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(s / 2, 40, s / 2.4, 7, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    };

    const createHighDefPedestalTexture = (detail: SubsystemDetail) => {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 512;
      const ctx = c.getContext('2d')!;

      // Deep solid dark obsidian backing (100% OPAQUE — no murky teal transparency)
      ctx.fillStyle = '#060c18';
      ctx.beginPath();
      ctx.roundRect(8, 8, 1008, 496, 20);
      ctx.fill();

      // Subtle gradient highlight
      const innerGrad = ctx.createLinearGradient(0, 8, 0, 500);
      innerGrad.addColorStop(0, '#09152a');
      innerGrad.addColorStop(1, '#050a14');
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.roundRect(10, 10, 1004, 492, 18);
      ctx.fill();

      // Razor-sharp glowing cyan neon border
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.stroke();

      // Top glowing cyan-to-violet accent line
      const topBarGrad = ctx.createLinearGradient(16, 12, 1008, 12);
      topBarGrad.addColorStop(0, '#38bdf8');
      topBarGrad.addColorStop(0.5, '#60a5fa');
      topBarGrad.addColorStop(1, '#818cf8');
      ctx.fillStyle = topBarGrad;
      ctx.fillRect(24, 12, 976, 4);

      if (detail.id === 'kafka' || detail.id === 'workers') {
        // Split layout: Main Card (Left) + Stacked Event Tags (Right)
        // Icon
        drawCardVectorIcon(ctx, detail.iconType, 42, 48, 54);

        // Title
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 48px "Space Grotesk", sans-serif';
        ctx.fillText(detail.title, 114, 88);

        // Subtitle
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 24px "Inter", sans-serif';
        ctx.fillText(detail.subtitle, 42, 160);

        // Right side stacked pills
        const tagBoxX = 540;
        let tagY = 48;
        detail.tags.forEach((tag) => {
          ctx.fillStyle = '#081324';
          ctx.beginPath();
          ctx.roundRect(tagBoxX, tagY, 440, 48, 10);
          ctx.fill();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 20px monospace';
          ctx.fillText(`▤  ${tag}`, tagBoxX + 20, tagY + 31);
          tagY += 60;
        });

        // Bottom Telemetry Footer
        ctx.fillStyle = '#040812';
        ctx.fillRect(24, 410, 976, 68);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(24, 410, 976, 68);

        ctx.font = 'bold 22px monospace';
        ctx.fillStyle = '#34d399';
        ctx.fillText(`● LATENCY: ${detail.latency}`, 46, 452);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`THROUGHPUT: ${detail.throughput}`, 420, 452);
        ctx.fillStyle = '#a78bfa';
        ctx.fillText(`SLA: ${detail.sla}`, 820, 452);
      } else if (detail.id === 'clients') {
        // Clients Layout (List of devices & protocols)
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 48px "Space Grotesk", sans-serif';
        ctx.fillText('CLIENTS', 42, 76);

        const clientsItems = [
          { icon: '💻', label: 'Web App' },
          { icon: '📱', label: 'Mobile App' },
          { icon: '⚙️', label: 'External Services' },
        ];

        let itemY = 120;
        clientsItems.forEach((ci) => {
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 28px sans-serif';
          ctx.fillText(ci.icon, 46, itemY + 28);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 26px "Inter", sans-serif';
          ctx.fillText(ci.label, 96, itemY + 26);
          itemY += 56;
        });

        // Protocol pill right side
        ctx.fillStyle = '#081324';
        ctx.beginPath();
        ctx.roundRect(500, 120, 480, 140, 14);
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('HTTP / HTTPS', 530, 175);
        ctx.fillText('REST · gRPC', 530, 220);

        // Bottom Telemetry Footer
        ctx.fillStyle = '#040812';
        ctx.fillRect(24, 410, 976, 68);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(24, 410, 976, 68);

        ctx.font = 'bold 22px monospace';
        ctx.fillStyle = '#34d399';
        ctx.fillText(`● STATUS: ONLINE`, 46, 452);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`ACTIVE USERS: ${detail.throughput}`, 380, 452);
        ctx.fillStyle = '#a78bfa';
        ctx.fillText(`STORE: ${detail.sla}`, 800, 452);
      } else {
        // Standard Card Layout (Gateway, Vector Search, Database)
        drawCardVectorIcon(ctx, detail.iconType, 42, 48, 54);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 48px "Space Grotesk", sans-serif';
        ctx.fillText(detail.title, 114, 88);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 24px "Inter", sans-serif';
        ctx.fillText(detail.subtitle, 42, 160);

        // Tags badges
        let tagX = 42;
        let tagY = 220;
        ctx.font = 'bold 22px monospace';

        detail.tags.forEach((tag, idx) => {
          const textMetrics = ctx.measureText(tag);
          const tagW = textMetrics.width + 36;
          if (tagX + tagW > 960) {
            tagX = 42;
            tagY += 54;
          }

          ctx.fillStyle = idx === 0 ? 'rgba(14, 165, 233, 0.25)' : '#081324';
          ctx.beginPath();
          ctx.roundRect(tagX, tagY, tagW, 44, 10);
          ctx.fill();
          ctx.strokeStyle = idx === 0 ? 'rgba(56, 189, 248, 0.7)' : 'rgba(56, 189, 248, 0.35)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = idx === 0 ? '#38bdf8' : '#cbd5e1';
          ctx.fillText(tag, tagX + 18, tagY + 29);
          tagX += tagW + 16;
        });

        // Bottom Telemetry Footer
        ctx.fillStyle = '#040812';
        ctx.fillRect(24, 410, 976, 68);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(24, 410, 976, 68);

        ctx.font = 'bold 22px monospace';
        ctx.fillStyle = '#34d399';
        ctx.fillText(`● LATENCY: ${detail.latency}`, 46, 452);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`THROUGHPUT: ${detail.throughput}`, 420, 452);
        ctx.fillStyle = '#a78bfa';
        ctx.fillText(`SLA: ${detail.sla}`, 820, 452);
      }

      const tex = new THREE.CanvasTexture(c);
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      return tex;
    };

    // ── 6. Construct 3D Pedestals with Angled Perspective ─────────
    interface PedestalMeshItem {
      id: string;
      group: THREE.Group;
      screenMesh: THREE.Mesh;
      basePos: THREE.Vector3;
      rimMesh: THREE.Mesh;
    }

    const pedestalMeshes: PedestalMeshItem[] = [];
    const interactiveObjects: THREE.Object3D[] = [];
    interactiveObjects.push(sphereMesh);

    PEDESTAL_CONFIGS.forEach((cfg) => {
      const detail = SUBSYSTEMS[cfg.id];
      const pGroup = new THREE.Group();
      pGroup.position.set(cfg.x, cfg.y, cfg.z);
      pGroup.rotation.set(cfg.rotX, cfg.rotY, cfg.rotZ);
      scene.add(pGroup);

      // Chassis base pedestal
      const baseGeo = new THREE.BoxGeometry(cfg.width, 0.24, 0.45);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x050c18,
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

      // High-Def Screen Mesh (OPAQUE — no washed-out teal transparency)
      const tex = createHighDefPedestalTexture(detail);
      const screenGeo = new THREE.PlaneGeometry(cfg.width, cfg.height);
      const screenMat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: false,
        side: THREE.DoubleSide,
      });
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.userData = { id: cfg.id };
      pGroup.add(screenMesh);

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

    PEDESTAL_CONFIGS.forEach((cfg) => {
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

      // Moving photon packets
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

    let pulseActive = false;
    triggerPulseRef.current = () => {
      pulseActive = true;
      corePointLight.intensity = 14.0;
      setTimeout(() => {
        pulseActive = false;
        corePointLight.intensity = 4.0;
      }, 500);
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
        orbitEuler.x = Math.max(-0.5, Math.min(0.5, orbitEuler.x));
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
            const cfg = PEDESTAL_CONFIGS.find((p) => p.id === nodeId);
            if (cfg) {
              targetCameraPos.set(cfg.x * 0.55, cfg.y * 0.55 + 0.25, 8.8);
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
      targetCameraPos.z = Math.max(7.0, Math.min(15.0, targetCameraPos.z));
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

      // Smooth orbit rotation
      scene.rotation.y = THREE.MathUtils.lerp(scene.rotation.y, orbitEuler.y, 0.08);
      scene.rotation.x = THREE.MathUtils.lerp(scene.rotation.x, orbitEuler.x, 0.08);

      const speedMultiplier = pulseActive ? 3.5 : 1.0;

      // Animate central core
      sphereMesh.rotation.y += dt * 0.5 * speedMultiplier;
      haloMesh.rotation.y -= dt * 0.3;

      // Pulse core lighting
      corePointLight.intensity = (pulseActive ? 10.0 : 4.0) + Math.sin(t * 3.5) * 1.0;

      // Rotate orbital rings
      rings[0].rotation.z += dt * 0.8 * speedMultiplier;
      rings[1].rotation.z -= dt * 1.0 * speedMultiplier;
      rings[2].rotation.z += dt * 0.6 * speedMultiplier;

      // Hover elevation and floating motion for pedestals
      const selectedId = selectedIdRef.current;
      const hoveredId = hoveredIdRef.current;

      pedestalMeshes.forEach(({ id, group, basePos, rimMesh }, idx) => {
        const isSelected = selectedId === id;
        const isHovered = hoveredId === id;

        const targetY = isSelected
          ? basePos.y + 0.35
          : isHovered
          ? basePos.y + 0.2
          : basePos.y + Math.sin(t * 1.4 + idx * 0.8) * 0.05;

        group.position.y = THREE.MathUtils.lerp(group.position.y, targetY, 0.1);

        const targetScale = isSelected ? 1.06 : isHovered ? 1.03 : 1.0;
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

      {/* ── Subsystem Quick Hover Tooltip ───────────────────────────── */}
      {hoveredSubsystemId && !selectedSubsystem && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-20 animate-fade-in">
          <div className="px-4 py-2 rounded-2xl bg-slate-950/95 border border-sky-400/50 backdrop-blur-xl shadow-2xl flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
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

              <button
                onClick={handleCloseInspector}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition"
                title="Close Inspector"
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
                  onClick={() => {
                    if (triggerPulseRef.current) triggerPulseRef.current();
                    playSynthChime(880);
                  }}
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
