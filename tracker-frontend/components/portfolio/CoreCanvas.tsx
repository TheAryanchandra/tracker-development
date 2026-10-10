'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * CoreCanvas — 3D Software Engineering Architecture & Distributed Monolith
 * ─────────────────────────────────────────────────────────────────────────────
 * Custom 3D objects built specifically for a Software Engineer & Systems Architect:
 *  1. Central Modular Quantum Monolith:
 *     - API Ingress Scanner Lens
 *     - Project Loom Virtual Thread Compute Core (dual counter-rotating gyros)
 *     - Kafka Event Partition Ring (orbital conveyor of glowing event payloads)
 *     - Qdrant Vector Engine (geometric HNSW embedding core)
 *     - ACID Storage Cylinders & Redis In-Memory Hot Platter
 *  2. Distributed Server Blade Towers (high-density server racks with blinking telemetry LEDs)
 *  3. Fiber-Optic High-Speed Conduits with animated pulsing data packets
 *  4. Floating Holographic Curved Code Glass HUDs (Java 21 virtual threads, Kafka, Qdrant)
 *  5. Cybernetic Infinite Circuit Floor Grid with moving glowing bus traces
 *  6. Scroll-Choreographed Camera Transitions + Exploded Blueprint View Mode
 *  7. Interactive Raycasting: Hovering highlights 3D objects with reticles; clicking focuses camera
 *  8. Copilot & Audio Reactive: Core accelerates and LEDs flash when Jarvis is thinking!
 */

interface Props {
  chapter: number;
  progress: number; // 0..1 page scroll
}

export type ViewMode = 'cinematic' | 'exploded' | 'network' | 'orbit';

export default function CoreCanvas({ chapter, progress }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const chapterRef = useRef(chapter);
  const progressRef = useRef(progress);
  chapterRef.current = chapter;
  progressRef.current = progress;

  const [activeInspectLabel, setActiveInspectLabel] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cinematic');
  const viewModeRef = useRef<ViewMode>(viewMode);
  viewModeRef.current = viewMode;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let width = host.clientWidth || window.innerWidth;
    let height = host.clientHeight || window.innerHeight;

    // ── 1. Renderer, Camera & Cybernetic Fog ──────────────────────
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x030712, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.032);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 120);
    camera.position.set(0, 3.2, 14.5);

    // ── 2. Atmospheric Cyber Lighting ─────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x0b1329, 2.4);
    scene.add(ambientLight);

    const keySun = new THREE.DirectionalLight(0x38bdf8, 3.2);
    keySun.position.set(12, 18, 14);
    scene.add(keySun);

    const violetRim = new THREE.DirectionalLight(0x818cf8, 2.8);
    violetRim.position.set(-14, 10, -10);
    scene.add(violetRim);

    const amberFill = new THREE.DirectionalLight(0xf59e0b, 1.4);
    amberFill.position.set(4, -8, 8);
    scene.add(amberFill);

    // Glowing core reactor point lights
    const reactorLight = new THREE.PointLight(0x38bdf8, 5.0, 16);
    reactorLight.position.set(0, 1.6, 0);
    scene.add(reactorLight);

    const vectorLight = new THREE.PointLight(0xa855f7, 4.0, 12);
    vectorLight.position.set(0, -0.8, 0);
    scene.add(vectorLight);

    // ── 3. Cybernetic Infinite Circuit Floor Grid ─────────────────
    const gridHelper = new THREE.GridHelper(60, 60, 0x0284c7, 0x0f172a);
    gridHelper.position.y = -3.8;
    scene.add(gridHelper);

    // Radial circuit floor disk
    const floorGeo = new THREE.CircleGeometry(32, 64);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x030712,
      roughness: 0.2,
      metalness: 0.85,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -3.82;
    scene.add(floorMesh);

    // ── 4. Procedural Glowing Code Texture for Holographic HUDs ───
    const createCodeTexture = (lines: string[]) => {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 256;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = 'rgba(6, 12, 24, 0.88)';
      ctx.fillRect(0, 0, 512, 256);

      // Top title bar
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.fillRect(0, 0, 512, 34);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('// RUNTIME TELEMETRY — SDE-1 NODE', 16, 23);

      ctx.font = '14px monospace';
      lines.forEach((line, idx) => {
        if (line.includes('class') || line.includes('public') || line.includes('const')) ctx.fillStyle = '#f472b6';
        else if (line.includes('Thread') || line.includes('Virtual') || line.includes('Kafka')) ctx.fillStyle = '#38bdf8';
        else if (line.includes('return') || line.includes('import') || line.includes('await')) ctx.fillStyle = '#a78bfa';
        else if (line.includes('"') || line.includes('`')) ctx.fillStyle = '#34d399';
        else ctx.fillStyle = '#94a3b8';
        ctx.fillText(line, 16, 62 + idx * 22);
      });

      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    };

    const loomCodeTex = createCodeTexture([
      'Thread.ofVirtual().name("rag-worker-", 0)',
      '  .start(() -> {',
      '    var record = kafkaConsumer.poll(Duration.ofMillis(50));',
      '    var vector = embedModel.embed(record.payload());',
      '    var hits = qdrant.searchHybrid(vector, BM25.rank());',
      '    return Response.ok(hits).p95Latency(18);',
      '  }); // Virtual threads: sub-200ms P95',
    ]);

    const archCodeTex = createCodeTexture([
      '// HIGH-THROUGHPUT COMMERCE (GiantCell)',
      'export const orderPipeline = async (ctx) => {',
      '  await redis.acquireDistributedLock(ctx.orderId);',
      '  const tx = await mysql.beginTransaction();',
      '  await inventory.decrementAtomic(ctx.sku);',
      '  await razorpay.capturePayment(ctx.amount);',
      '  return { status: 200, slaUptime: "99.9%" };',
      '}; // 50,000+ daily transactions',
    ]);

    // ── 5. The Central Microservices Monolith Group ───────────────
    const monolithGroup = new THREE.Group();
    scene.add(monolithGroup);

    // Data structures for exploded view transitions
    const explodedParts: { mesh: THREE.Object3D; basePos: THREE.Vector3; explodeOffset: THREE.Vector3 }[] = [];

    // TIER 1: Ingress API Gateway Lens (Top)
    const gatewayGroup = new THREE.Group();
    gatewayGroup.position.set(0, 3.2, 0);
    monolithGroup.add(gatewayGroup);

    const lensGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.45, 32);
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
    });
    const lensMesh = new THREE.Mesh(lensGeo, lensMat);
    gatewayGroup.add(lensMesh);

    // Holographic Gateway Scanner Rings
    const ringGeo1 = new THREE.TorusGeometry(2.1, 0.03, 8, 48);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringMesh1.rotation.x = Math.PI / 2;
    gatewayGroup.add(ringMesh1);

    const ringGeo2 = new THREE.TorusGeometry(2.35, 0.02, 8, 48);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.5 });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.x = Math.PI / 2;
    gatewayGroup.add(ringMesh2);

    explodedParts.push({
      mesh: gatewayGroup,
      basePos: new THREE.Vector3(0, 3.2, 0),
      explodeOffset: new THREE.Vector3(0, 2.2, 0),
    });

    // TIER 2: Project Loom Virtual Thread Compute Core (Upper Middle)
    const loomGroup = new THREE.Group();
    loomGroup.position.set(0, 1.4, 0);
    monolithGroup.add(loomGroup);

    // Glowing Inner Plasma Reactor
    const reactorGeo = new THREE.IcosahedronGeometry(1.15, 2);
    const reactorMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 2.2,
      roughness: 0.1,
      metalness: 0.95,
      wireframe: false,
    });
    const reactorMesh = new THREE.Mesh(reactorGeo, reactorMat);
    loomGroup.add(reactorMesh);

    // Outer Gyroscope Rings (Counter-Rotating Fibers)
    const gyroGeo1 = new THREE.TorusGeometry(1.65, 0.06, 12, 64);
    const gyroMat1 = new THREE.MeshStandardMaterial({ color: 0x93c5fd, metalness: 0.8, roughness: 0.2 });
    const gyro1 = new THREE.Mesh(gyroGeo1, gyroMat1);
    loomGroup.add(gyro1);

    const gyroGeo2 = new THREE.TorusGeometry(1.9, 0.05, 12, 64);
    const gyroMat2 = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.8, roughness: 0.2 });
    const gyro2 = new THREE.Mesh(gyroGeo2, gyroMat2);
    gyro2.rotation.x = Math.PI / 3;
    loomGroup.add(gyro2);

    explodedParts.push({
      mesh: loomGroup,
      basePos: new THREE.Vector3(0, 1.4, 0),
      explodeOffset: new THREE.Vector3(0, 1.2, 0),
    });

    // TIER 3: Kafka Event Partition Ring (Middle)
    const kafkaGroup = new THREE.Group();
    kafkaGroup.position.set(0, -0.2, 0);
    monolithGroup.add(kafkaGroup);

    const partitionBaseGeo = new THREE.CylinderGeometry(2.3, 2.3, 0.35, 32);
    const partitionBaseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const partitionBase = new THREE.Mesh(partitionBaseGeo, partitionBaseMat);
    kafkaGroup.add(partitionBase);

    // 8 Partition Broker Pods with amber glowing diodes
    const brokerPods: THREE.Mesh[] = [];
    const brokerCount = 8;
    for (let b = 0; b < brokerCount; b++) {
      const angle = (b / brokerCount) * Math.PI * 2;
      const bx = Math.cos(angle) * 2.2;
      const bz = Math.sin(angle) * 2.2;

      const podGeo = new THREE.BoxGeometry(0.38, 0.5, 0.38);
      const podMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.8,
        metalness: 0.85,
        roughness: 0.2,
      });
      const pod = new THREE.Mesh(podGeo, podMat);
      pod.position.set(bx, 0.25, bz);
      pod.lookAt(0, 0.25, 0);
      kafkaGroup.add(pod);
      brokerPods.push(pod);
    }

    // Glowing orbiting event data packets
    const eventPackets: THREE.Mesh[] = [];
    const eventCount = 12;
    for (let e = 0; e < eventCount; e++) {
      const pGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const pMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      kafkaGroup.add(pMesh);
      eventPackets.push(pMesh);
    }

    explodedParts.push({
      mesh: kafkaGroup,
      basePos: new THREE.Vector3(0, -0.2, 0),
      explodeOffset: new THREE.Vector3(0, 0, 0),
    });

    // TIER 4: Qdrant Vector Engine & Embedding Crystal (Lower Middle)
    const vectorGroup = new THREE.Group();
    vectorGroup.position.set(0, -1.6, 0);
    monolithGroup.add(vectorGroup);

    const vectorDodecaGeo = new THREE.DodecahedronGeometry(1.05, 0);
    const vectorDodecaMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x7e22ce,
      emissiveIntensity: 1.8,
      roughness: 0.15,
      metalness: 0.9,
    });
    const vectorCrystal = new THREE.Mesh(vectorDodecaGeo, vectorDodecaMat);
    vectorGroup.add(vectorCrystal);

    const vectorCage = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.DodecahedronGeometry(1.35, 0)),
      new THREE.LineBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.5 })
    );
    vectorGroup.add(vectorCage);

    explodedParts.push({
      mesh: vectorGroup,
      basePos: new THREE.Vector3(0, -1.6, 0),
      explodeOffset: new THREE.Vector3(0, -1.0, 0),
    });

    // TIER 5: ACID PostgreSQL Ledger & Redis Platter (Base)
    const storageGroup = new THREE.Group();
    storageGroup.position.set(0, -3.1, 0);
    monolithGroup.add(storageGroup);

    // 4 Database Storage Cylinders in cluster formation
    const dbCylinders: THREE.Mesh[] = [];
    const dbRadius = 1.35;
    for (let d = 0; d < 4; d++) {
      const dAngle = (d / 4) * Math.PI * 2 + Math.PI / 4;
      const dx = Math.cos(dAngle) * dbRadius;
      const dz = Math.sin(dAngle) * dbRadius;

      const cylGeo = new THREE.CylinderGeometry(0.5, 0.55, 1.1, 24);
      const cylMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.85,
        roughness: 0.25,
      });
      const cyl = new THREE.Mesh(cylGeo, cylMat);
      cyl.position.set(dx, 0.55, dz);
      storageGroup.add(cyl);
      dbCylinders.push(cyl);

      // Glowing read/write disk line rings on cylinder
      for (let r = 0; r < 3; r++) {
        const ringLineGeo = new THREE.TorusGeometry(0.52, 0.015, 6, 24);
        const ringLineMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
        const ringLine = new THREE.Mesh(ringLineGeo, ringLineMat);
        ringLine.rotation.x = Math.PI / 2;
        ringLine.position.set(dx, 0.25 + r * 0.3, dz);
        storageGroup.add(ringLine);
      }
    }

    explodedParts.push({
      mesh: storageGroup,
      basePos: new THREE.Vector3(0, -3.1, 0),
      explodeOffset: new THREE.Vector3(0, -2.0, 0),
    });

    // ── 6. Distributed Server Blade Towers (Satellite Racks) ──────
    const rackTowers: { group: THREE.Group; leds: THREE.Mesh[] }[] = [];
    const rackConfigs = [
      { x: -5.8, z: -2.2, label: 'KAFKA BROKER CLUSTER' },
      { x: 5.8, z: -2.2, label: 'DATABASE REPLICA RACK' },
      { x: -4.2, z: 4.2, label: 'EDGE INGRESS GATEWAY' },
      { x: 4.2, z: 4.2, label: 'VECTOR INDEX CLUSTER' },
    ];

    rackConfigs.forEach((cfg) => {
      const towerGroup = new THREE.Group();
      towerGroup.position.set(cfg.x, -1.2, cfg.z);
      scene.add(towerGroup);

      // Rack chassis frame
      const chassisGeo = new THREE.BoxGeometry(1.4, 5.2, 1.4);
      const chassisMat = new THREE.MeshStandardMaterial({
        color: 0x090d16,
        roughness: 0.3,
        metalness: 0.85,
      });
      const chassis = new THREE.Mesh(chassisGeo, chassisMat);
      chassis.castShadow = true;
      towerGroup.add(chassis);

      // Server Blade Units inside chassis
      const leds: THREE.Mesh[] = [];
      const bladeCount = 10;
      for (let b = 0; b < bladeCount; b++) {
        const bladeY = -2.2 + b * 0.48;
        const bladeGeo = new THREE.BoxGeometry(1.28, 0.38, 1.28);
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.9, roughness: 0.2 });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.y = bladeY;
        towerGroup.add(blade);

        // Blinking activity LEDs across the blade front
        for (let l = 0; l < 4; l++) {
          const ledGeo = new THREE.SphereGeometry(0.035, 6, 6);
          const ledMat = new THREE.MeshBasicMaterial({
            color: l === 0 ? 0x22c55e : l === 1 ? 0x38bdf8 : l === 2 ? 0xf59e0b : 0xa855f7,
          });
          const led = new THREE.Mesh(ledGeo, ledMat);
          led.position.set(-0.45 + l * 0.3, bladeY, 0.65);
          towerGroup.add(led);
          leds.push(led);
        }
      }

      rackTowers.push({ group: towerGroup, leds });
    });

    // ── 7. Floating Curved Glass Holographic Code HUDs ────────────
    const hudGroup = new THREE.Group();
    scene.add(hudGroup);

    // Left HUD: Loom Virtual Threads
    const hudPlaneGeo = new THREE.PlaneGeometry(3.6, 1.8);
    const hudMat1 = new THREE.MeshBasicMaterial({
      map: loomCodeTex,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
    });
    const hudMesh1 = new THREE.Mesh(hudPlaneGeo, hudMat1);
    hudMesh1.position.set(-4.5, 2.0, 1.5);
    hudMesh1.rotation.y = Math.PI * 0.18;
    hudGroup.add(hudMesh1);

    // Right HUD: High-Throughput Commerce Architecture
    const hudMat2 = new THREE.MeshBasicMaterial({
      map: archCodeTex,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
    });
    const hudMesh2 = new THREE.Mesh(hudPlaneGeo, hudMat2);
    hudMesh2.position.set(4.5, 1.6, 1.2);
    hudMesh2.rotation.y = -Math.PI * 0.18;
    hudGroup.add(hudMesh2);

    // ── 8. High-Speed Fiber-Optic Conduits & Data Pulses ──────────
    const fiberConduits: { curve: THREE.CatmullRomCurve3; pulses: THREE.Mesh[] }[] = [];
    const fiberGroup = new THREE.Group();
    scene.add(fiberGroup);

    rackConfigs.forEach((cfg) => {
      const pStart = new THREE.Vector3(cfg.x, -1.0, cfg.z);
      const pMid = new THREE.Vector3(cfg.x * 0.5, -3.2, cfg.z * 0.5);
      const pEnd = new THREE.Vector3(0, -3.0, 0);

      const curve = new THREE.CatmullRomCurve3([pStart, pMid, pEnd]);
      const points = curve.getPoints(50);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.45,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      fiberGroup.add(line);

      const pulses: THREE.Mesh[] = [];
      for (let p = 0; p < 3; p++) {
        const pulseMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        );
        fiberGroup.add(pulseMesh);
        pulses.push(pulseMesh);
      }

      fiberConduits.push({ curve, pulses });
    });

    // ── 9. Interactive Hover & Raycasting ──────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);
    const inspectTargets = [
      { mesh: lensMesh, label: 'JWT RBAC Ingress Gateway (Netty)' },
      { mesh: reactorMesh, label: 'Java 21 Project Loom (42K Ops/s)' },
      { mesh: partitionBase, label: 'Kafka Event Partition Cluster' },
      { mesh: vectorCrystal, label: 'Qdrant Hybrid Vector Store' },
      { mesh: storageGroup, label: 'PostgreSQL ACID Ledger & Redis Cache' },
    ];

    const onPointerMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Copilot reaction state
    const copilotStateRef = { thinking: false };
    const handleCopilotState = (e: Event) => {
      const detail = (e as CustomEvent<{ thinking?: boolean }>).detail;
      copilotStateRef.thinking = Boolean(detail?.thinking);
    };
    window.addEventListener('copilot:state', handleCopilotState);

    // ── 10. Animation & Scroll Orchestration Loop ──────────────────
    let animId = 0;
    const clock = new THREE.Clock();
    let currentExplode = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      const dt = clock.getDelta();
      const t = clock.getElapsedTime();
      const scroll = progressRef.current;
      const currentChapter = chapterRef.current;
      const mode = viewModeRef.current;
      const isThinking = copilotStateRef.thinking;

      const speedMultiplier = isThinking ? 2.5 : 1.0;

      // Rotate gyros and plasma reactor
      reactorMesh.rotation.y += dt * 0.8 * speedMultiplier;
      reactorMesh.rotation.x += dt * 0.4 * speedMultiplier;
      gyro1.rotation.z += dt * 1.2 * speedMultiplier;
      gyro2.rotation.y += dt * 0.9 * speedMultiplier;
      ringMesh1.rotation.z += dt * 0.6 * speedMultiplier;
      ringMesh2.rotation.z -= dt * 0.8 * speedMultiplier;
      vectorCrystal.rotation.y += dt * 0.7 * speedMultiplier;
      vectorCrystal.rotation.x = Math.sin(t * 0.8) * 0.35;

      // Rotate Kafka broker event packets along circular orbit
      eventPackets.forEach((p, idx) => {
        const pAngle = t * 1.4 * speedMultiplier + (idx / eventCount) * Math.PI * 2;
        p.position.set(Math.cos(pAngle) * 2.2, 0.25 + Math.sin(pAngle * 2) * 0.08, Math.sin(pAngle) * 2.2);
      });

      // Animate fiber optic pulses
      fiberConduits.forEach(({ curve, pulses }) => {
        pulses.forEach((p, pIdx) => {
          const offset = (t * 0.4 * speedMultiplier + pIdx * 0.33) % 1;
          const pos = curve.getPoint(offset);
          p.position.copy(pos);
        });
      });

      // Blink server blade LEDs with pseudo-random pattern
      rackTowers.forEach(({ leds }) => {
        leds.forEach((led, li) => {
          const blink = Math.sin(t * 12 + li * 2.5);
          (led.material as THREE.MeshBasicMaterial).opacity = blink > 0.1 ? 1.0 : 0.25;
        });
      });

      // Floating code HUD gentle oscillation
      hudMesh1.position.y = 2.0 + Math.sin(t * 1.2) * 0.1;
      hudMesh2.position.y = 1.6 + Math.cos(t * 1.4) * 0.1;

      // ── Exploded Architecture Blueprint Animation ─────────────────
      // If user toggles 'exploded' mode or is on Chapter 02 (Architecture/Lab)
      const targetExplode = mode === 'exploded' || currentChapter === 2 ? 1.0 : 0.0;
      currentExplode += (targetExplode - currentExplode) * 0.06;

      explodedParts.forEach(({ mesh, basePos, explodeOffset }) => {
        mesh.position.lerpVectors(basePos, basePos.clone().add(explodeOffset), currentExplode);
      });

      // ── Camera Flight Spline Choreography Based on Chapter ─────────
      let targetCamX = 0;
      let targetCamY = 2.2;
      let targetCamZ = 13.5;
      let targetLookY = 0.5;

      if (mode === 'exploded') {
        targetCamX = 4.5;
        targetCamY = 3.8;
        targetCamZ = 12.0;
        targetLookY = 0.8;
      } else if (mode === 'network') {
        targetCamX = 0;
        targetCamY = 12.0;
        targetCamZ = 8.0;
        targetLookY = -1.0;
      } else {
        // Scroll Chapter Narrative Transitions:
        if (currentChapter === 0) {
          // Chapter 0: Intro (Hero front view showing central monolith & fiber conduits)
          targetCamX = 1.8 + mouse.x * 0.8;
          targetCamY = 1.8 - mouse.y * 0.6;
          targetCamZ = 13.2;
          targetLookY = 0.4;
        } else if (currentChapter === 1) {
          // Chapter 1: Experience Signals (Camera drifts left, framing Left Server Tower)
          targetCamX = -4.5 + mouse.x * 0.6;
          targetCamY = 2.4 - mouse.y * 0.4;
          targetCamZ = 10.2;
          targetLookY = 0.2;
        } else if (currentChapter === 2) {
          // Chapter 2: System Lab (Up-close exploded view of Kafka & Project Loom Core)
          targetCamX = mouse.x * 1.2;
          targetCamY = 1.6 - mouse.y * 0.5;
          targetCamZ = 8.5;
          targetLookY = 0.6;
        } else if (currentChapter === 3) {
          // Chapter 3: Work & Shipped Apps (Drifts right to inspect Right Storage & Vector DB)
          targetCamX = 4.2 + mouse.x * 0.8;
          targetCamY = 1.4 - mouse.y * 0.4;
          targetCamZ = 9.8;
          targetLookY = 0.0;
        } else if (currentChapter === 4) {
          // Chapter 4: Technical Stack (High perspective observing interconnected node mesh)
          targetCamX = mouse.x * 0.8;
          targetCamY = 4.8 - mouse.y * 0.6;
          targetCamZ = 14.0;
          targetLookY = 0.0;
        } else if (currentChapter === 5) {
          // Chapter 5: Developer Terminal (Intimate focus on Code HUD)
          targetCamX = -2.8 + mouse.x * 0.5;
          targetCamY = 2.1 - mouse.y * 0.3;
          targetCamZ = 7.8;
          targetLookY = 1.2;
        } else {
          // Chapter 6: Contact Transmission (Grand panoramic overview)
          targetCamX = mouse.x * 0.6;
          targetCamY = 3.6 - mouse.y * 0.5;
          targetCamZ = 15.0;
          targetLookY = 0.2;
        }
      }

      // Smooth camera interpolation
      camera.position.x += (targetCamX - camera.position.x) * 0.045;
      camera.position.y += (targetCamY - camera.position.y) * 0.045;
      camera.position.z += (targetCamZ - camera.position.z) * 0.045;
      camera.lookAt(0, targetLookY, 0);

      // Raycasting for interactive hover labels
      raycaster.setFromCamera(mouse, camera);
      const hit = raycaster.intersectObjects(inspectTargets.map((t) => t.mesh));
      if (hit.length > 0) {
        const found = inspectTargets.find((t) => t.mesh === hit[0].object);
        if (found) setActiveInspectLabel(found.label);
      } else {
        setActiveInspectLabel(null);
      }

      renderer.render(scene, camera);
    };

    render();

    const onResize = () => {
      if (!host) return;
      width = host.clientWidth || window.innerWidth;
      height = host.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('copilot:state', handleCopilotState);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Line) {
          o.geometry.dispose();
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <>
      {/* 3D Background WebGL Canvas */}
      <div ref={hostRef} className="nx-canvas" aria-hidden="true" />

      {/* Floating 3D Object Hover Label HUD */}
      {activeInspectLabel && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 rounded-full bg-slate-900/90 border border-sky-400/50 text-sky-300 font-mono text-xs shadow-xl shadow-sky-500/10 backdrop-blur-md animate-fade-in pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-sky-400 inline-block mr-2 animate-ping" />
          <span>{activeInspectLabel}</span>
        </div>
      )}

      {/* 3D Viewport Mode Switcher (Fixed Bottom-Left) */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-xl shadow-2xl">
        <span className="text-[10px] font-mono text-zinc-400 px-2 uppercase font-semibold">
          3D View:
        </span>
        {[
          { id: 'cinematic' as ViewMode, label: 'Cinematic Flow' },
          { id: 'exploded' as ViewMode, label: 'Exploded Blueprint' },
          { id: 'network' as ViewMode, label: 'Network Topology' },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setViewMode(btn.id)}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono transition ${
              viewMode === btn.id
                ? 'bg-sky-400/20 text-sky-300 border border-sky-400/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </>
  );
}
