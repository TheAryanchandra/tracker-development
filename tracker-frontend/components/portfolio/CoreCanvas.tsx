'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * CoreCanvas — 3D Distributed Systems Topology & Quantum Core
 * ─────────────────────────────────────────────────────────────────────────────
 * Modeled precisely after the reference architecture visualization:
 *  • Central luminous electric-cyan energy core with counter-rotating orbital rings
 *  • 6 Illuminated Pedestals arranged in 3D perspective:
 *     1. API GATEWAY (top center)
 *     2. CLIENTS (left side panel)
 *     3. KAFKA (right top)
 *     4. WORKERS (right mid-bottom)
 *     5. VECTOR SEARCH (bottom left)
 *     6. DATABASE (bottom right)
 *  • Curved glowing neon laser bus lines connecting each pedestal to the core
 *  • Moving photon data packets pulsing continuously through the conduits
 *  • Perspective circuit grid floor with ambient cybernetic fog
 *  • Mouse parallax, smooth camera interpolation, and reactive copilot states!
 */

interface Props {
  chapter: number;
  progress: number;
}

export default function CoreCanvas({ chapter, progress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chapterRef = useRef(chapter);
  const progressRef = useRef(progress);
  chapterRef.current = chapter;
  progressRef.current = progress;

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
    renderer.setClearColor(0x000000, 0); // transparent background so it seamlessly integrates
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.035);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
    camera.position.set(0, 1.2, 11.8);

    // ── 2. Cinematic Lighting ────────────────────────────────────
    const ambLight = new THREE.AmbientLight(0x0c1e38, 2.2);
    scene.add(ambLight);

    const cyanLight = new THREE.DirectionalLight(0x38bdf8, 3.8);
    cyanLight.position.set(8, 14, 10);
    scene.add(cyanLight);

    const violetLight = new THREE.DirectionalLight(0x818cf8, 2.5);
    violetLight.position.set(-10, 8, -6);
    scene.add(violetLight);

    // Core point light illuminating the surrounding pedestals
    const corePointLight = new THREE.PointLight(0x38bdf8, 6.0, 18);
    corePointLight.position.set(0, 0.5, 0);
    scene.add(corePointLight);

    // ── 3. Cybernetic Grid Floor (Perspective) ───────────────────
    const gridHelper = new THREE.GridHelper(36, 36, 0x0284c7, 0x0f172a);
    gridHelper.position.set(0, -3.2, -1.0);
    gridHelper.rotation.x = 0.08;
    scene.add(gridHelper);

    // ── 4. The Central Electric Core Sphere & Orbital Rings ───────
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0.2, 0.4, 0);
    scene.add(coreGroup);

    // Electric Cyan Core Sphere
    const sphereGeo = new THREE.SphereGeometry(1.05, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 2.8,
      roughness: 0.1,
      metalness: 0.9,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    coreGroup.add(sphereMesh);

    // Inner bright plasma core
    const innerGeo = new THREE.SphereGeometry(0.85, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerMesh);

    // Orbital Rings
    const rings: THREE.Mesh[] = [];
    const ringConfigs = [
      { r: 1.5, w: 0.025, col: 0x38bdf8, rotX: Math.PI / 2.2, rotZ: 0.4 },
      { r: 1.85, w: 0.02, col: 0x818cf8, rotX: Math.PI / 1.7, rotZ: -0.6 },
      { r: 2.2, w: 0.018, col: 0x38bdf8, rotX: Math.PI / 2.6, rotZ: 1.1 },
    ];

    ringConfigs.forEach((cfg) => {
      const rGeo = new THREE.TorusGeometry(cfg.r, cfg.w, 8, 80);
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

    // ── 5. Helper Function to Generate High-Res 2D Billboard Canvas Textures ──
    const createPedestalTexture = (
      title: string,
      subtitle: string,
      tags: string[],
      iconType: 'gateway' | 'clients' | 'kafka' | 'workers' | 'vector' | 'db'
    ) => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 256;
      const ctx = c.getContext('2d')!;

      // Glass Card Background
      ctx.fillStyle = 'rgba(6, 12, 26, 0.94)';
      ctx.roundRect(8, 8, 496, 240, 20);
      ctx.fill();

      // Glowing Cyan Border
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.stroke();

      // Top Header Gradient line
      const grad = ctx.createLinearGradient(16, 12, 496, 12);
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(1, '#818cf8');
      ctx.fillStyle = grad;
      ctx.fillRect(20, 16, 472, 4);

      // Icon placeholder badge
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.roundRect(28, 38, 48, 48, 12);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Simple icon drawing
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const iconGlyphs: Record<string, string> = {
        gateway: '🌐',
        clients: '📱',
        kafka: '⚡',
        workers: '⚙️',
        vector: '🧠',
        db: '🗄️',
      };
      ctx.fillText(iconGlyphs[iconType] || '●', 52, 62);

      // Title
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px "Space Grotesk", sans-serif';
      ctx.fillText(title, 90, 56);

      // Subtitle
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px "Inter", sans-serif';
      ctx.fillText(subtitle, 90, 84);

      // Tags badges
      let tagX = 28;
      let tagY = 114;
      ctx.font = '14px monospace';

      tags.forEach((tag, idx) => {
        const textMetrics = ctx.measureText(tag);
        const tagW = textMetrics.width + 22;

        if (tagX + tagW > 480) {
          tagX = 28;
          tagY += 34;
        }

        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.roundRect(tagX, tagY, tagW, 26, 6);
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = idx === 0 ? '#38bdf8' : '#cbd5e1';
        ctx.fillText(tag, tagX + 11, tagY + 18);

        tagX += tagW + 10;
      });

      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    };

    // ── 6. Construct the 6 Architectural Pedestals from Reference ──
    const PEDESTAL_CONFIGS = [
      {
        id: 'gateway',
        title: 'API GATEWAY',
        subtitle: 'Load Balancing · Rate Limiting · Auth · Monitoring',
        tags: ['Netty SSL Termination', 'JWT RBAC Verification', 'Token Bucket Limiter'],
        iconType: 'gateway' as const,
        x: 0.2,
        y: 2.8,
        z: -1.2,
        width: 3.4,
        height: 1.7,
      },
      {
        id: 'clients',
        title: 'CLIENTS',
        subtitle: 'Web App · Mobile App · External Services',
        tags: ['HTTP / HTTPS', 'REST · gRPC', 'Bi-directional WSS'],
        iconType: 'clients' as const,
        x: -4.4,
        y: 0.4,
        z: 0.2,
        width: 3.2,
        height: 1.6,
      },
      {
        id: 'kafka',
        title: 'KAFKA',
        subtitle: 'Event Streaming · Real-time Data',
        tags: ['user-events', 'order-events', 'notification-events', 'analytics-events'],
        iconType: 'kafka' as const,
        x: 4.4,
        y: 1.8,
        z: -0.6,
        width: 3.5,
        height: 1.75,
      },
      {
        id: 'workers',
        title: 'WORKERS',
        subtitle: 'Background Jobs · Async Processing',
        tags: ['Media Processing', 'AI Inference', 'Notifications', 'Data Pipelines'],
        iconType: 'workers' as const,
        x: 4.5,
        y: -0.4,
        z: 0.8,
        width: 3.5,
        height: 1.75,
      },
      {
        id: 'vector',
        title: 'VECTOR SEARCH',
        subtitle: 'Embeddings · Similarity Search · RAG · Semantic Retrieval',
        tags: ['Qdrant HNSW', 'Dense MiniLM-L6', 'Sparse BM25 Fusion'],
        iconType: 'vector' as const,
        x: -1.8,
        y: -2.0,
        z: 0.8,
        width: 3.4,
        height: 1.7,
      },
      {
        id: 'database',
        title: 'DATABASE',
        subtitle: 'PostgreSQL · MongoDB · Redis · Scalable Storage',
        tags: ['PostgreSQL 16 ACID', 'Redis 7 Cache (0.4ms)', 'MongoDB Atlas'],
        iconType: 'db' as const,
        x: 2.6,
        y: -2.1,
        z: 0.9,
        width: 3.4,
        height: 1.7,
      },
    ];

    const pedestalMeshes: { group: THREE.Group; basePos: THREE.Vector3 }[] = [];

    PEDESTAL_CONFIGS.forEach((cfg) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(cfg.x, cfg.y, cfg.z);
      scene.add(pGroup);

      // Machined chassis base pedestal
      const baseGeo = new THREE.BoxGeometry(cfg.width, 0.22, 0.45);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x091224,
        roughness: 0.2,
        metalness: 0.85,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = -cfg.height / 2;
      pGroup.add(baseMesh);

      // Glowing Neon base rim
      const rimGeo = new THREE.BoxGeometry(cfg.width * 1.02, 0.04, 0.48);
      const rimMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.position.y = -cfg.height / 2 + 0.12;
      pGroup.add(rimMesh);

      // Holographic Glass Panel Screen
      const tex = createPedestalTexture(cfg.title, cfg.subtitle, cfg.tags, cfg.iconType);
      const screenGeo = new THREE.PlaneGeometry(cfg.width, cfg.height);
      const screenMat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide,
      });
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      pGroup.add(screenMesh);

      pedestalMeshes.push({ group: pGroup, basePos: new THREE.Vector3(cfg.x, cfg.y, cfg.z) });
    });

    // ── 7. Flowing Curved Neon Laser Conduits & Moving Photon Data Packets ──
    const conduitLines: { curve: THREE.CatmullRomCurve3; photons: THREE.Mesh[] }[] = [];
    const conduitGroup = new THREE.Group();
    scene.add(conduitGroup);

    PEDESTAL_CONFIGS.forEach((cfg) => {
      const pStart = new THREE.Vector3(coreGroup.position.x, coreGroup.position.y, coreGroup.position.z);
      const pEnd = new THREE.Vector3(cfg.x, cfg.y, cfg.z);

      // Mid arc with organic curve
      const midX = (pStart.x + pEnd.x) * 0.5;
      const midY = (pStart.y + pEnd.y) * 0.5 + (cfg.y > 0 ? 0.3 : -0.3);
      const midZ = (pStart.z + pEnd.z) * 0.5 + 0.3;
      const pMid = new THREE.Vector3(midX, midY, midZ);

      const curve = new THREE.CatmullRomCurve3([pStart, pMid, pEnd]);
      const points = curve.getPoints(40);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.65,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      conduitGroup.add(line);

      // Moving photon packets
      const photons: THREE.Mesh[] = [];
      const photonCount = 3;
      for (let k = 0; k < photonCount; k++) {
        const phGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const phMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
        const phMesh = new THREE.Mesh(phGeo, phMat);
        conduitGroup.add(phMesh);
        photons.push(phMesh);
      }

      conduitLines.push({ curve, photons });
    });

    // ── 8. Interactive Mouse Movement & Copilot Reactive State ───
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let isCopilotThinking = false;
    const handleCopilotState = (e: Event) => {
      const detail = (e as CustomEvent<{ thinking?: boolean }>).detail;
      isCopilotThinking = Boolean(detail?.thinking);
    };
    window.addEventListener('copilot:state', handleCopilotState);

    // ── 9. Render & Animation Loop ────────────────────────────────
    let animId = 0;
    const clock = new THREE.Clock();

    const render = () => {
      animId = requestAnimationFrame(render);
      const dt = clock.getDelta();
      const t = clock.getElapsedTime();

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const speedMultiplier = isCopilotThinking ? 2.4 : 1.0;

      // Animate central core
      sphereMesh.rotation.y += dt * 0.6 * speedMultiplier;
      innerMesh.rotation.y -= dt * 1.0 * speedMultiplier;

      // Pulse core lighting
      corePointLight.intensity = 5.0 + Math.sin(t * 4) * 1.2 * speedMultiplier;

      // Rotate orbital rings
      rings[0].rotation.z += dt * 0.9 * speedMultiplier;
      rings[1].rotation.z -= dt * 1.1 * speedMultiplier;
      rings[2].rotation.z += dt * 0.7 * speedMultiplier;

      // Gentle floating hover motion on pedestals
      pedestalMeshes.forEach(({ group, basePos }, idx) => {
        group.position.y = basePos.y + Math.sin(t * 1.6 + idx * 0.8) * 0.06;
      });

      // Move photon packets through conduits
      conduitLines.forEach(({ curve, photons }) => {
        photons.forEach((ph, pIdx) => {
          const progress = (t * 0.45 * speedMultiplier + pIdx * 0.33) % 1;
          const pos = curve.getPoint(progress);
          ph.position.copy(pos);
        });
      });

      // Camera subtle parallax tracking mouse
      camera.position.x = mouse.x * 0.7;
      camera.position.y = 1.2 + mouse.y * 0.4;
      camera.lookAt(0.2, 0.3, 0);

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
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('copilot:state', handleCopilotState);
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
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[460px] lg:min-h-[580px] relative pointer-events-none"
      aria-hidden="true"
    />
  );
}
