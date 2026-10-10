'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Cinematic3DCanvasProps {
  scrollProgress: number; // 0 to 1
  activeSection?: number;
  hoveredProjectIndex?: number | null;
}

export default function Cinematic3DCanvas({
  scrollProgress,
  activeSection = 0,
  hoveredProjectIndex = null,
}: Cinematic3DCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // References for live updates across frames
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;

  const projectIndexRef = useRef(hoveredProjectIndex);
  projectIndexRef.current = hoveredProjectIndex;

  // Pointer tracking
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Assistant audio sync
  const speechStateRef = useRef({ speaking: false, amplitude: 0, listening: false });

  useEffect(() => {
    const handleSpeech = (e: Event) => {
      const detail = (e as CustomEvent<{ speaking: boolean; amplitude: number }>).detail;
      if (detail) {
        speechStateRef.current.speaking = detail.speaking;
        speechStateRef.current.amplitude = detail.amplitude || 0;
      }
    };
    const handleListening = (e: Event) => {
      const detail = (e as CustomEvent<{ listening: boolean }>).detail;
      if (detail) {
        speechStateRef.current.listening = detail.listening;
      }
    };

    window.addEventListener('jarvis:speech-state', handleSpeech);
    window.addEventListener('jarvis:listening-state', handleListening);
    return () => {
      window.removeEventListener('jarvis:speech-state', handleSpeech);
      window.removeEventListener('jarvis:listening-state', handleListening);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        console.warn('[3D Canvas] WebGL not supported, falling back gracefully.');
        return;
      }
    } catch {
      return;
    }

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // ── 1. Scene, Camera, Renderer ─────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05050a, 0.042);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 4.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // ── 2. Atmospheric Studio Lighting ─────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x080c18, 1.4);
    scene.add(ambientLight);

    // Cyber amber key light
    const keyLight = new THREE.DirectionalLight(0xf59e0b, 3.2);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    // Cyan electric rim light
    const rimLight = new THREE.DirectionalLight(0x06b6d4, 3.5);
    rimLight.position.set(-5, 3, -3);
    scene.add(rimLight);

    // Soft overhead fill
    const topLight = new THREE.DirectionalLight(0xffffff, 0.7);
    topLight.position.set(0, 6, 2);
    scene.add(topLight);

    // Quantum chest core point light
    const corePointLight = new THREE.PointLight(0xf59e0b, 3.0, 8);
    corePointLight.position.set(0, -0.6, 0.4);
    scene.add(corePointLight);

    // ── 3. High-Quality Material Palettes ──────────────────────────
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x181c24,
      metalness: 0.92,
      roughness: 0.18,
    });

    const darkAlloyMat = new THREE.MeshStandardMaterial({
      color: 0x0c0f16,
      metalness: 0.85,
      roughness: 0.35,
    });

    const amberEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.8,
      roughness: 0.2,
      metalness: 0.5,
    });

    const cyanEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.6,
      roughness: 0.2,
      metalness: 0.5,
    });

    const visorMat = new THREE.MeshPhysicalMaterial({
      color: 0x05070e,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    // ── 4. Ambient Energy & Starfield Particles ────────────────────
    const particleCount = 1600;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const amberCol = new THREE.Color(0xf59e0b);
    const cyanCol = new THREE.Color(0x06b6d4);
    const whiteCol = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.5 + Math.random() * 8.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePos[i * 3 + 1] = (radius * Math.sin(phi) * Math.sin(theta)) * 0.8;
      particlePos[i * 3 + 2] = radius * Math.cos(phi);

      const mixed = Math.random() > 0.65 ? amberCol : (Math.random() > 0.5 ? cyanCol : whiteCol);
      particleColors[i * 3] = mixed.r;
      particleColors[i * 3 + 1] = mixed.g;
      particleColors[i * 3 + 2] = mixed.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.038,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    const particleField = new THREE.Points(particleGeo, particleMat);
    scene.add(particleField);

    // ── 5. Detailed Procedural Cybernetic Humanoid ──────────────────
    const humanoidGroup = new THREE.Group();
    scene.add(humanoidGroup);

    // 5A. Torso & Upper Chest Chassis
    const chestGroup = new THREE.Group();
    humanoidGroup.add(chestGroup);

    // Sternum chassis block
    const sternumGeo = new THREE.BoxGeometry(0.9, 0.85, 0.45);
    const sternum = new THREE.Mesh(sternumGeo, darkAlloyMat);
    sternum.position.set(0, -0.75, 0);
    chestGroup.add(sternum);

    // Left and Right Pectoral armor plates (beveled & angled)
    const pecGeo = new THREE.BoxGeometry(0.48, 0.45, 0.12);
    const leftPec = new THREE.Mesh(pecGeo, titaniumMat);
    leftPec.position.set(-0.28, -0.65, 0.22);
    leftPec.rotation.y = -0.15;
    leftPec.rotation.z = -0.05;
    chestGroup.add(leftPec);

    const rightPec = new THREE.Mesh(pecGeo, titaniumMat);
    rightPec.position.set(0.28, -0.65, 0.22);
    rightPec.rotation.y = 0.15;
    rightPec.rotation.z = 0.05;
    chestGroup.add(rightPec);

    // Central Quantum Reactor Core (glowing ring + internal sphere)
    const reactorRingGeo = new THREE.TorusGeometry(0.16, 0.035, 16, 32);
    const reactorRing = new THREE.Mesh(reactorRingGeo, amberEmissiveMat);
    reactorRing.position.set(0, -0.65, 0.27);
    chestGroup.add(reactorRing);

    const reactorCoreGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const reactorCore = new THREE.Mesh(reactorCoreGeo, amberEmissiveMat);
    reactorCore.position.set(0, -0.65, 0.27);
    chestGroup.add(reactorCore);

    // Clavicle collar beam
    const clavicleGeo = new THREE.BoxGeometry(1.2, 0.1, 0.25);
    const clavicle = new THREE.Mesh(clavicleGeo, titaniumMat);
    clavicle.position.set(0, -0.35, 0.1);
    chestGroup.add(clavicle);

    // Deltoid shoulder armor pods
    const shoulderGeo = new THREE.SphereGeometry(0.28, 20, 16);
    const leftShoulder = new THREE.Mesh(shoulderGeo, titaniumMat);
    leftShoulder.scale.set(1.1, 0.85, 1.0);
    leftShoulder.position.set(-0.75, -0.45, 0.05);
    chestGroup.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeo, titaniumMat);
    rightShoulder.scale.set(1.1, 0.85, 1.0);
    rightShoulder.position.set(0.75, -0.45, 0.05);
    chestGroup.add(rightShoulder);

    // Deltoid status light nodes
    const shoulderLightGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.08, 12);
    const leftShLight = new THREE.Mesh(shoulderLightGeo, cyanEmissiveMat);
    leftShLight.rotation.z = Math.PI / 2;
    leftShLight.position.set(-0.95, -0.45, 0.1);
    chestGroup.add(leftShLight);

    const rightShLight = new THREE.Mesh(shoulderLightGeo, cyanEmissiveMat);
    rightShLight.rotation.z = Math.PI / 2;
    rightShLight.position.set(0.95, -0.45, 0.1);
    chestGroup.add(rightShLight);

    // 5B. Cervical Vertebrae & Hydraulic Neck
    const neckGroup = new THREE.Group();
    humanoidGroup.add(neckGroup);

    for (let i = 0; i < 3; i++) {
      const vertGeo = new THREE.TorusGeometry(0.18 - i * 0.015, 0.045, 12, 24);
      const vert = new THREE.Mesh(vertGeo, darkAlloyMat);
      vert.rotation.x = Math.PI / 2;
      vert.position.set(0, -0.28 + i * 0.09, 0.04);
      neckGroup.add(vert);
    }

    // Left and right hydraulic neck actuator pistons
    const pistonGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.35, 12);
    const leftPiston = new THREE.Mesh(pistonGeo, titaniumMat);
    leftPiston.position.set(-0.16, -0.18, 0.02);
    leftPiston.rotation.z = 0.1;
    neckGroup.add(leftPiston);

    const rightPiston = new THREE.Mesh(pistonGeo, titaniumMat);
    rightPiston.position.set(0.16, -0.18, 0.02);
    rightPiston.rotation.z = -0.1;
    neckGroup.add(rightPiston);

    // 5C. Articulated Head, Visor & Face
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.18, 0.05);
    humanoidGroup.add(headGroup);

    // Titanium Cranium (smooth contoured skull)
    const craniumGeo = new THREE.SphereGeometry(0.68, 32, 24);
    const cranium = new THREE.Mesh(craniumGeo, titaniumMat);
    cranium.scale.set(0.92, 1.15, 0.98);
    headGroup.add(cranium);

    // Temporal ear sensor nodes (auditory telemetry)
    const earSensorGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.12, 16);
    const leftEar = new THREE.Mesh(earSensorGeo, darkAlloyMat);
    leftEar.rotation.z = Math.PI / 2;
    leftEar.position.set(-0.64, 0.05, 0);
    headGroup.add(leftEar);

    const leftEarLight = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.015, 8, 16), amberEmissiveMat);
    leftEarLight.rotation.y = Math.PI / 2;
    leftEarLight.position.set(-0.69, 0.05, 0);
    headGroup.add(leftEarLight);

    const rightEar = new THREE.Mesh(earSensorGeo, darkAlloyMat);
    rightEar.rotation.z = Math.PI / 2;
    rightEar.position.set(0.64, 0.05, 0);
    headGroup.add(rightEar);

    const rightEarLight = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.015, 8, 16), amberEmissiveMat);
    rightEarLight.rotation.y = Math.PI / 2;
    rightEarLight.position.set(0.69, 0.05, 0);
    headGroup.add(rightEarLight);

    // Brow ridge plate
    const browGeo = new THREE.BoxGeometry(0.72, 0.1, 0.28);
    const brow = new THREE.Mesh(browGeo, titaniumMat);
    brow.position.set(0, 0.2, 0.52);
    headGroup.add(brow);

    // Curved Panoramic Holographic Visor
    const visorGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.26, 32, 1, true, -Math.PI * 0.42, Math.PI * 0.84);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.08, 0.26);
    visor.rotation.y = -Math.PI * 0.42;
    headGroup.add(visor);

    // Internal Glowing Ocular Optics (Cyber Eyes inside Visor)
    const eyeLensGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const leftEye = new THREE.Mesh(eyeLensGeo, cyanEmissiveMat);
    leftEye.position.set(-0.2, 0.08, 0.54);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeLensGeo, cyanEmissiveMat);
    rightEye.position.set(0.2, 0.08, 0.54);
    headGroup.add(rightEye);

    // Articulated Lower Mandible (Jaw) — Reactive to Lipsync Audio!
    const jawPivot = new THREE.Group();
    jawPivot.position.set(0, -0.22, 0.15);
    headGroup.add(jawPivot);

    const jawGeo = new THREE.BoxGeometry(0.46, 0.3, 0.42);
    const jaw = new THREE.Mesh(jawGeo, darkAlloyMat);
    jaw.position.set(0, -0.12, 0.15);
    jawPivot.add(jaw);

    const chinGeo = new THREE.BoxGeometry(0.3, 0.18, 0.16);
    const chin = new THREE.Mesh(chinGeo, titaniumMat);
    chin.position.set(0, -0.22, 0.32);
    jawPivot.add(chin);

    // 5D. Neural Gyroscopic Orbital Rings (Floating Holo Gimbals)
    const innerRingGeo = new THREE.TorusGeometry(1.2, 0.016, 16, 64);
    const innerRing = new THREE.Mesh(innerRingGeo, amberEmissiveMat);
    headGroup.add(innerRing);

    const outerRingGeo = new THREE.TorusGeometry(1.55, 0.012, 16, 64);
    const outerRing = new THREE.Mesh(outerRingGeo, cyanEmissiveMat);
    headGroup.add(outerRing);

    // ── 6. Scene B: Digital Architecture & System Nodes ────────────
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, -2.0);
    scene.add(archGroup);

    // Central Monolith Quantum Compute Core
    const monolithGeo = new THREE.OctahedronGeometry(0.85, 0);
    const monolith = new THREE.Mesh(monolithGeo, darkAlloyMat);
    archGroup.add(monolith);

    const monolithWire = new THREE.Mesh(
      monolithGeo,
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true })
    );
    monolithWire.scale.setScalar(1.08);
    archGroup.add(monolithWire);

    // 4 Interconnected Satellite Nodes
    const satelliteNodes: THREE.Mesh[] = [];
    const nodeCoords = [
      { pos: [-2.6, 1.4, 0], color: 0xf59e0b, label: 'Backend/Kafka' },
      { pos: [2.6, 1.4, 0], color: 0x06b6d4, label: 'AI/LangGraph' },
      { pos: [-2.2, -1.6, 0.4], color: 0x10b981, label: 'Mobile/Next' },
      { pos: [2.2, -1.6, 0.4], color: 0x8b5cf6, label: 'Cloud/Docker' },
    ];

    nodeCoords.forEach((n) => {
      const nodeMesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.38, 1),
        new THREE.MeshStandardMaterial({
          color: n.color,
          emissive: n.color,
          emissiveIntensity: 0.8,
          roughness: 0.3,
          metalness: 0.8,
        })
      );
      nodeMesh.position.set(n.pos[0], n.pos[1], n.pos[2]);
      archGroup.add(nodeMesh);
      satelliteNodes.push(nodeMesh);

      // Connecting laser beam to central monolith
      const beamGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(n.pos[0], n.pos[1], n.pos[2]),
      ]);
      const beamLine = new THREE.Line(
        beamGeo,
        new THREE.LineBasicMaterial({ color: n.color, transparent: true, opacity: 0.45 })
      );
      archGroup.add(beamLine);
    });

    // ── 7. Scene C: Interactive Project Spatial Portals ─────────────
    const projectsGroup = new THREE.Group();
    projectsGroup.position.set(0, 0, -1.5);
    scene.add(projectsGroup);

    const projectPortals: THREE.Group[] = [];
    const portalArc = [-2.4, -0.8, 0.8, 2.4];

    for (let p = 0; p < 4; p++) {
      const portal = new THREE.Group();
      portal.position.set(portalArc[p], 0.2, p % 2 === 0 ? 0.3 : -0.3);

      // Glass hologram plaque
      const plaqueGeo = new THREE.BoxGeometry(1.25, 1.6, 0.05);
      const plaqueMat = new THREE.MeshPhysicalMaterial({
        color: 0x0a0f1d,
        emissive: p === 0 ? 0xf59e0b : (p === 1 ? 0x06b6d4 : (p === 2 ? 0x10b981 : 0xa855f7)),
        emissiveIntensity: 0.25,
        roughness: 0.1,
        metalness: 0.85,
        transparent: true,
        opacity: 0.88,
      });
      const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
      portal.add(plaque);

      // Neon frame border
      const frameGeo = new THREE.EdgesGeometry(plaqueGeo);
      const frameLine = new THREE.LineSegments(
        frameGeo,
        new THREE.LineBasicMaterial({
          color: p === 0 ? 0xf59e0b : 0x06b6d4,
          transparent: true,
          opacity: 0.7,
        })
      );
      portal.add(frameLine);

      projectsGroup.add(portal);
      projectPortals.push(portal);
    }

    // ── 8. Pointer Event Handlers ──────────────────────────────────
    const handlePointerMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerRef.current.targetX = nx * 0.45;
      pointerRef.current.targetY = ny * 0.35;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // ── 9. Render Loop with Smooth Camera Spline & Interaction ─────
    let clock = new THREE.Clock();

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      const time = clock.getElapsedTime();

      // Smooth pointer lerp
      pointerRef.current.x += (pointerRef.current.targetX - pointerRef.current.x) * 0.06;
      pointerRef.current.y += (pointerRef.current.targetY - pointerRef.current.y) * 0.06;

      const px = pointerRef.current.x;
      const py = pointerRef.current.y;
      const scroll = scrollRef.current; // 0 to 1

      // ── Audio Speech / Lipsync Dynamics ──────────────────────────
      const isSpeaking = speechStateRef.current.speaking;
      const amp = speechStateRef.current.amplitude;
      const isListening = speechStateRef.current.listening;

      // Mandible talking movement
      if (isSpeaking && amp > 0) {
        jawPivot.rotation.x = THREE.MathUtils.lerp(jawPivot.rotation.x, amp * 0.28, 0.3);
        jawPivot.position.y = THREE.MathUtils.lerp(jawPivot.position.y, -0.22 - amp * 0.08, 0.3);
      } else {
        jawPivot.rotation.x = THREE.MathUtils.lerp(jawPivot.rotation.x, 0, 0.15);
        jawPivot.position.y = THREE.MathUtils.lerp(jawPivot.position.y, -0.22, 0.15);
      }

      // Visor & Core illumination on listening or speaking
      if (isListening) {
        visorMat.emissive.setHex(0x06b6d4);
        visorMat.emissiveIntensity = 1.4 + Math.sin(time * 8) * 0.4;
      } else if (isSpeaking) {
        visorMat.emissive.setHex(0xf59e0b);
        visorMat.emissiveIntensity = 1.0 + amp * 1.5;
      } else {
        visorMat.emissive.setHex(0xf59e0b);
        visorMat.emissiveIntensity = 0.75 + Math.sin(time * 1.8) * 0.15;
      }

      // Torso breathing expansion
      const breath = Math.sin(time * 1.6) * 0.018;
      chestGroup.scale.set(1 + breath, 1 + breath * 0.8, 1 + breath);

      // Head pointer tracking with smooth bounds
      headGroup.rotation.y = px * 0.65;
      headGroup.rotation.x = -py * 0.45;

      // Gyroscopic orbital rings
      const ringSpeed = isListening ? 3.0 : 1.0;
      innerRing.rotation.x = time * 0.5 * ringSpeed;
      innerRing.rotation.y = time * 0.8 * ringSpeed;
      outerRing.rotation.z = -time * 0.4 * ringSpeed;
      outerRing.rotation.y = time * 0.6 * ringSpeed;

      // Floating hover bobbing
      humanoidGroup.position.y = Math.sin(time * 1.2) * 0.06;

      // Particle field subtle cosmic drift
      particleField.rotation.y = time * 0.025;
      particleField.rotation.x = Math.sin(time * 0.02) * 0.05;

      // Scene B Architecture rotation
      monolith.rotation.x = time * 0.4;
      monolith.rotation.y = time * 0.6;
      monolithWire.rotation.x = -time * 0.2;
      monolithWire.rotation.y = -time * 0.3;

      satelliteNodes.forEach((node, i) => {
        node.rotation.y = time * (0.8 + i * 0.2);
        node.position.y += Math.sin(time * 2 + i) * 0.002;
      });

      // Scene C Project Portals floating
      projectPortals.forEach((portal, idx) => {
        portal.position.y = 0.2 + Math.sin(time * 1.5 + idx) * 0.05;
        const isHovered = projectIndexRef.current === idx;
        const targetScale = isHovered ? 1.15 : 1.0;
        portal.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      });

      // ── Camera Path Spline Interpolation across Scroll ───────────
      // Smooth interpolation for cinematic storytelling
      let targetCamX = 0;
      let targetCamY = 0.2;
      let targetCamZ = 4.2;
      let targetLookY = 0.1;

      if (scroll < 0.2) {
        // Section 0: Hero / Overview
        const t = scroll / 0.2;
        targetCamX = px * 0.5;
        targetCamY = 0.2 - py * 0.3;
        targetCamZ = 4.2 - t * 0.4;
        targetLookY = 0.1;
        humanoidGroup.visible = true;
        archGroup.visible = false;
        projectsGroup.visible = false;
      } else if (scroll < 0.45) {
        // Section 1: Architecture & Systems
        const t = (scroll - 0.2) / 0.25;
        targetCamX = Math.sin(t * Math.PI) * 1.2 + px * 0.5;
        targetCamY = 0.8 + t * 0.6;
        targetCamZ = 4.8 + t * 0.8;
        targetLookY = 0.2;
        humanoidGroup.visible = true;
        humanoidGroup.position.x = THREE.MathUtils.lerp(0, 2.5, t);
        archGroup.visible = true;
        projectsGroup.visible = false;
      } else if (scroll < 0.7) {
        // Section 2: Spatial Projects
        const t = (scroll - 0.45) / 0.25;
        targetCamX = -1.4 + t * 1.8 + px * 0.4;
        targetCamY = 0.4 - py * 0.3;
        targetCamZ = 4.5;
        targetLookY = 0.0;
        humanoidGroup.visible = false;
        archGroup.visible = false;
        projectsGroup.visible = true;
      } else if (scroll < 0.88) {
        // Section 3: AI Lab & Deep Conversation
        const t = (scroll - 0.7) / 0.18;
        targetCamX = px * 0.3;
        targetCamY = 0.48 - py * 0.2;
        targetCamZ = 2.4; // Tight intimate close-up on Humanoid Head
        targetLookY = 0.48;
        humanoidGroup.visible = true;
        humanoidGroup.position.x = 0;
        archGroup.visible = false;
        projectsGroup.visible = false;
      } else {
        // Section 4: Contact Nexus
        const t = (scroll - 0.88) / 0.12;
        targetCamX = px * 0.4;
        targetCamY = 1.4 + t * 0.6;
        targetCamZ = 5.2;
        targetLookY = 0.3;
        humanoidGroup.visible = true;
        archGroup.visible = false;
        projectsGroup.visible = false;
      }

      // Smooth camera interpolation
      camera.position.x += (targetCamX - camera.position.x) * 0.055;
      camera.position.y += (targetCamY - camera.position.y) * 0.055;
      camera.position.z += (targetCamZ - camera.position.z) * 0.055;
      camera.lookAt(0, targetLookY, 0);

      renderer.render(scene, camera);
    };

    render();

    // ── Cleanup on Unmount ─────────────────────────────────────────
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
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
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 bg-[#05050a]"
      aria-hidden="true"
    />
  );
}
