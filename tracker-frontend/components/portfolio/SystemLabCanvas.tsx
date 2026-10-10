'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

export interface ArchitectureNode {
  id: string;
  name: string;
  category: 'gateway' | 'queue' | 'compute' | 'cache' | 'vector' | 'storage';
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
  status: 'healthy' | 'degraded' | 'offline';
  throughput: string;
  latency: string;
  tech: string;
  description: string;
  deepDive: string;
}

const ARCH_NODES: ArchitectureNode[] = [
  {
    id: 'gateway',
    name: 'JWT RBAC Edge Gateway',
    category: 'gateway',
    x: -4.5,
    y: 0,
    z: 0,
    color: '#38bdf8',
    size: 0.65,
    status: 'healthy',
    throughput: '48.2k req/s',
    latency: '1.2ms',
    tech: 'Spring Cloud Gateway / Netty',
    description: 'Stateless edge router with rate-limiting token bucket and cryptographic JWT validation.',
    deepDive: 'Handles SSL termination and asymmetric JWT signature verification. Rejects unauthorized traffic before touching downstream microservices.',
  },
  {
    id: 'kafka',
    name: 'Kafka Partition Pipeline',
    category: 'queue',
    x: -1.8,
    y: 1.4,
    z: -0.5,
    color: '#fbbf24',
    size: 0.8,
    status: 'healthy',
    throughput: '120k ev/s',
    latency: '3.8ms',
    tech: 'Apache Kafka 3.6 / KRaft',
    description: 'High-throughput event streaming with log compaction and idempotent producers.',
    deepDive: 'Decouples heavy document ingestion from live user queries. Zero backpressure on API layer; partitioned by tenant key.',
  },
  {
    id: 'springboot',
    name: 'Java 21 Virtual Thread Workers',
    category: 'compute',
    x: 0.8,
    y: 1.2,
    z: 0.2,
    color: '#60a5fa',
    size: 0.9,
    status: 'healthy',
    throughput: '42.5k ops/s',
    latency: '18ms',
    tech: 'Java 21 / Spring Boot 3 / Loom',
    description: 'High concurrency Project Loom fibers handling async I/O with negligible memory footprint.',
    deepDive: 'Virtual threads eliminate OS thread threadpool exhaustion during high-concurrency vector database retrieval calls.',
  },
  {
    id: 'redis',
    name: 'L2 Redis Cache Cluster',
    category: 'cache',
    x: 0.4,
    y: -1.5,
    z: 0.4,
    color: '#f87171',
    size: 0.6,
    status: 'healthy',
    throughput: '98.4% Hit',
    latency: '0.4ms',
    tech: 'Redis 7 / Sentinel',
    description: 'In-memory hot-tier cache with TTL jitter preventing cache thundering herd.',
    deepDive: 'Stores pre-computed query embeddings and authorization token states, keeping P99 latency ultra-low.',
  },
  {
    id: 'qdrant',
    name: 'Qdrant Hybrid Vector Store',
    category: 'vector',
    x: 3.5,
    y: 0.8,
    z: -0.3,
    color: '#a78bfa',
    size: 0.75,
    status: 'healthy',
    throughput: '8.4k qps',
    latency: '42ms',
    tech: 'Qdrant / Dense HNSW + BM25',
    description: 'Hybrid search engine fusing dense geometric embeddings with sparse keyword BM25 retrieval.',
    deepDive: 'Reciprocal Rank Fusion (RRF) merges semantic nuance with exact enterprise part numbers & keyword accuracy.',
  },
  {
    id: 'postgres',
    name: 'PostgreSQL ACID Ledger',
    category: 'storage',
    x: 3.8,
    y: -1.4,
    z: 0.2,
    color: '#34d399',
    size: 0.7,
    status: 'healthy',
    throughput: '4.8k tx/s',
    latency: '6.2ms',
    tech: 'PostgreSQL 16 / Read Replicas',
    description: 'Relational transactional database with connection pooling and automated write auditing.',
    deepDive: 'Strict ACID transaction isolation for e-commerce purchases, user metadata, and historical indexing audits.',
  },
];

interface Props {
  onSelectNode?: (node: ArchitectureNode) => void;
  selectedNodeId?: string;
}

export default function SystemLabCanvas({ onSelectNode, selectedNodeId = 'springboot' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadRps, setLoadRps] = useState(25000);
  const [chaosMode, setChaosMode] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState(selectedNodeId);

  const loadRef = useRef(loadRps);
  loadRef.current = loadRps;

  const chaosRef = useRef(chaosMode);
  chaosRef.current = chaosMode;

  const activeRef = useRef(activeNodeId);
  activeRef.current = activeNodeId;

  const selectNode = useCallback((node: ArchitectureNode) => {
    setActiveNodeId(node.id);
    onSelectNode?.(node);
  }, [onSelectNode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060913, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 0, 9.5);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Subtle ambient lighting & directional lights
    const ambLight = new THREE.AmbientLight(0xddeafe, 1.2);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xa5e4ff, 2.4);
    dirLight.position.set(6, 8, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x60a5fa, 3.5, 18);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    // Grid plane base
    const gridHelper = new THREE.GridHelper(16, 24, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -2.8;
    scene.add(gridHelper);

    // Architecture 3D Nodes
    const nodeMeshes: { id: string; mesh: THREE.Mesh; halo: THREE.Mesh; wire: THREE.LineSegments; nodeData: ArchitectureNode }[] = [];

    ARCH_NODES.forEach((n) => {
      const col = new THREE.Color(n.color);

      // Core sphere
      const geo = new THREE.IcosahedronGeometry(n.size, 2);
      const mat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.7,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(n.x, n.y, n.z);
      scene.add(mesh);

      // Wireframe shell
      const wireGeo = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(n.size * 1.25, 1));
      const wireMat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.45 });
      const wire = new THREE.LineSegments(wireGeo, wireMat);
      wire.position.copy(mesh.position);
      scene.add(wire);

      // Outer pulse halo
      const haloGeo = new THREE.RingGeometry(n.size * 1.35, n.size * 1.55, 32);
      const haloMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.copy(mesh.position);
      scene.add(halo);

      nodeMeshes.push({ id: n.id, mesh, halo, wire, nodeData: n });
    });

    // Pipeline Data Streams (curves between connected nodes)
    const CONNECTIONS = [
      ['gateway', 'kafka'],
      ['gateway', 'redis'],
      ['kafka', 'springboot'],
      ['springboot', 'redis'],
      ['springboot', 'qdrant'],
      ['springboot', 'postgres'],
    ];

    const pipelineCurves: { curve: THREE.QuadraticBezierCurve3; packets: THREE.Mesh[] }[] = [];
    const pipelineGroup = new THREE.Group();
    scene.add(pipelineGroup);

    CONNECTIONS.forEach(([fromId, toId]) => {
      const fromNode = ARCH_NODES.find((n) => n.id === fromId)!;
      const toNode = ARCH_NODES.find((n) => n.id === toId)!;

      const p0 = new THREE.Vector3(fromNode.x, fromNode.y, fromNode.z);
      const p2 = new THREE.Vector3(toNode.x, toNode.y, toNode.z);
      const mid = new THREE.Vector3().addVectors(p0, p2).multiplyScalar(0.5);
      mid.y += (fromNode.y + toNode.y > 0 ? 0.4 : -0.4);
      mid.z += 0.3;

      const curve = new THREE.QuadraticBezierCurve3(p0, mid, p2);
      const points = curve.getPoints(40);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.35,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      pipelineGroup.add(line);

      // Streaming data packets on the line
      const packets: THREE.Mesh[] = [];
      const packetCount = 4;
      for (let k = 0; k < packetCount; k++) {
        const pGeo = new THREE.SphereGeometry(0.065, 8, 8);
        const pMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.85,
        });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        pipelineGroup.add(pMesh);
        packets.push(pMesh);
      }

      pipelineCurves.push({ curve, packets });
    });

    // Raycasting for clicking on nodes
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);

    const onPointerDown = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const targets = nodeMeshes.map((m) => m.mesh);
      const hits = raycaster.intersectObjects(targets);

      if (hits.length > 0) {
        const found = nodeMeshes.find((m) => m.mesh === hits[0].object);
        if (found) {
          selectNode(found.nodeData);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    // Camera rotation drag
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotX = 0;
    let rotY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      rotY += dx * 0.005;
      rotX += dy * 0.005;
      rotX = Math.max(-0.4, Math.min(0.4, rotX));
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const onResize = () => {
      if (!container) return;
      width = container.clientWidth || 800;
      height = container.clientHeight || 500;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', onResize);

    // Animation Render Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const render = () => {
      animId = requestAnimationFrame(render);
      const t = clock.getElapsedTime();
      const currentLoad = loadRef.current;
      const isChaos = chaosRef.current;
      const speedMultiplier = (currentLoad / 25000) * (isChaos ? 1.8 : 1.0);

      // Rotate scene container smoothly based on user drag
      scene.rotation.y = rotY + Math.sin(t * 0.15) * 0.04;
      scene.rotation.x = rotX + Math.cos(t * 0.2) * 0.03;

      // Animate 3D Nodes
      nodeMeshes.forEach(({ id, mesh, halo, wire }) => {
        const isSelected = id === activeRef.current;

        mesh.rotation.y = t * 0.5;
        mesh.rotation.x = t * 0.25;
        wire.rotation.y = -t * 0.3;
        halo.rotation.z = t * 0.8;

        // Pulse selected or degraded node
        if (isChaos && (id === 'kafka' || id === 'redis')) {
          const warnCol = new THREE.Color(0xff4444);
          (mesh.material as THREE.MeshStandardMaterial).emissive = warnCol;
          (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8 + Math.sin(t * 8) * 0.5;
          wire.scale.setScalar(1.2 + Math.sin(t * 6) * 0.1);
        } else if (isSelected) {
          const selCol = new THREE.Color(0xa5e4ff);
          (mesh.material as THREE.MeshStandardMaterial).emissive = selCol;
          (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.85 + Math.sin(t * 4) * 0.35;
          wire.scale.setScalar(1.3 + Math.sin(t * 3) * 0.08);
          halo.scale.setScalar(1.2 + Math.sin(t * 4) * 0.1);
        } else {
          const originalCol = new THREE.Color(ARCH_NODES.find((x) => x.id === id)?.color || 0x38bdf8);
          (mesh.material as THREE.MeshStandardMaterial).emissive = originalCol;
          (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3;
          wire.scale.setScalar(1.0);
          halo.scale.setScalar(1.0);
        }
      });

      // Animate packet stream along curves
      pipelineCurves.forEach(({ curve, packets }) => {
        packets.forEach((pMesh, k) => {
          const offset = (t * 0.3 * speedMultiplier + k * 0.25) % 1;
          const pos = curve.getPoint(offset);
          pMesh.position.copy(pos);
          (pMesh.material as THREE.MeshBasicMaterial).opacity = 0.4 + Math.sin(offset * Math.PI) * 0.6;
        });
      });

      renderer.render(scene, camera);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Line || o instanceof THREE.LineSegments) {
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
  }, [selectNode]);

  const activeNode = ARCH_NODES.find((n) => n.id === activeNodeId) || ARCH_NODES[0];

  // Calculated simulated real-time metrics
  const p95Latency = chaosMode ? '148ms' : Math.max(12, Math.round(18 + (loadRps / 50000) * 16)) + 'ms';
  const cpuUtilization = chaosMode ? '89%' : Math.round(24 + (loadRps / 50000) * 48) + '%';
  const virtualThreads = Math.round(loadRps * 0.082).toLocaleString();

  return (
    <div className="nx-lab">
      {/* 3D Interactive Stage */}
      <div className="nx-panel nx-lab-stage">
        <div ref={containerRef} className="w-full h-full" />

        {/* HUD Overlay */}
        <div className="nx-lab-hud">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive 3D Distributed Mesh // Cluster V2</span>
          </div>
          <div>Drag to Orbit • Click Nodes to Inspect</div>
        </div>

        {/* Controls bottom bar */}
        <div className="nx-lab-controls">
          <div className="nx-range">
            <span>Throughput Load:</span>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={loadRps}
              onChange={(e) => setLoadRps(Number(e.target.value))}
            />
            <span className="text-sky-300 font-bold">{loadRps.toLocaleString()} RPS</span>
          </div>

          <button
            onClick={() => setChaosMode(!chaosMode)}
            className={`nx-btn sm ${chaosMode ? 'amber' : 'ghost'}`}
            title="Inject simulated network latency & partition chaos"
          >
            {chaosMode ? '⚠️ Chaos Mode Active' : '⚡ Simulate Partition Chaos'}
          </button>
        </div>
      </div>

      {/* Telemetry & Deep-Dive Side Panel */}
      <div className="nx-lab-side">
        {/* Real-time Telemetry Stats */}
        <div className="nx-panel nx-telemetry">
          <div>
            <div className={`nx-tel-v ${chaosMode ? 'text-amber-400' : 'text-sky-300'}`}>{p95Latency}</div>
            <div className="nx-tel-l">P95 Retrieval Latency</div>
          </div>
          <div>
            <div className="nx-tel-v text-emerald-400">{loadRps.toLocaleString()}</div>
            <div className="nx-tel-l">Simulated Req / Sec</div>
          </div>
          <div>
            <div className="nx-tel-v text-indigo-300">{virtualThreads}</div>
            <div className="nx-tel-l">Active Loom Fibers</div>
          </div>
          <div>
            <div className="nx-tel-v text-purple-300">{cpuUtilization}</div>
            <div className="nx-tel-l">Core CPU Saturation</div>
          </div>
        </div>

        {/* Deep Dive Node Inspection Card */}
        <div className="nx-panel nx-node-card">
          <div className="flex items-center justify-between">
            <span className="nx-eyebrow">Node Inspector</span>
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase"
              style={{
                backgroundColor: `${activeNode.color}20`,
                color: activeNode.color,
                border: `1px solid ${activeNode.color}50`,
              }}
            >
              {activeNode.status}
            </span>
          </div>

          <h4>{activeNode.name}</h4>
          <p>{activeNode.description}</p>

          <div className="nx-why">
            <div className="text-[11px] font-bold text-sky-300 uppercase tracking-wider mb-1">
              Architecture Trade-Off:
            </div>
            {activeNode.deepDive}
          </div>

          <div className="flex flex-wrap gap-2 mt-4 text-xs font-mono">
            <div className="px-2 py-1 rounded bg-white/5 border border-white/10">
              <span className="text-zinc-500">Tech:</span> <strong className="text-white">{activeNode.tech}</strong>
            </div>
            <div className="px-2 py-1 rounded bg-white/5 border border-white/10">
              <span className="text-zinc-500">Peak:</span> <strong className="text-white">{activeNode.throughput}</strong>
            </div>
            <div className="px-2 py-1 rounded bg-white/5 border border-white/10">
              <span className="text-zinc-500">Latency:</span> <strong className="text-white">{activeNode.latency}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
