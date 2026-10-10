'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface IglooGlacialCanvasProps {
  scrollProgress: number; // 0 to 1
  activeSection?: number;
  hoveredProjectIndex?: number | null;
}

export default function IglooGlacialCanvas({
  scrollProgress,
  activeSection = 0,
  hoveredProjectIndex = null,
}: IglooGlacialCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;

  const projectIndexRef = useRef(hoveredProjectIndex);
  projectIndexRef.current = hoveredProjectIndex;

  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
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

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // ── 1. Scene, Camera, Pale Arctic Fog ──────────────────────────
    const scene = new THREE.Scene();
    // Misty Arctic Tundra Fog matching the reference screenshot
    scene.background = new THREE.Color(0xd2d9e3);
    scene.fog = new THREE.FogExp2(0xd2d9e3, 0.026);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 150);
    camera.position.set(0, 2.4, 8.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ── 2. Cinematic Glacial Sun & Ambient Lighting ────────────────
    const ambientSky = new THREE.AmbientLight(0xdde5f0, 1.4);
    scene.add(ambientSky);

    // Low Arctic sun casting long soft shadows
    const arcticSun = new THREE.DirectionalLight(0xfff6ea, 2.6);
    arcticSun.position.set(16, 14, 12);
    arcticSun.castShadow = true;
    arcticSun.shadow.mapSize.width = 2048;
    arcticSun.shadow.mapSize.height = 2048;
    arcticSun.shadow.camera.near = 0.5;
    arcticSun.shadow.camera.far = 40;
    arcticSun.shadow.bias = -0.0005;
    scene.add(arcticSun);

    // Cool rim light defining mountain and igloo silhouettes
    const rimLight = new THREE.DirectionalLight(0x9bb0c8, 1.6);
    rimLight.position.set(-14, 8, -12);
    scene.add(rimLight);

    // Glowing interior lights radiating from inside the igloo!
    const interiorCoreLight = new THREE.PointLight(0xa5c9eb, 5.5, 14);
    interiorCoreLight.position.set(0, 0.9, 0.2);
    scene.add(interiorCoreLight);

    const interiorAmberLight = new THREE.PointLight(0xf59e0b, 2.2, 8);
    interiorAmberLight.position.set(0, 0.8, 0.4);
    scene.add(interiorAmberLight);

    // ── 3. Realistic Procedural Glacial Snow Terrain ───────────────
    const terrainSize = 90;
    const terrainSegments = 120;
    const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, terrainSegments, terrainSegments);
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const distFromCenter = Math.sqrt(x * x + z * z);

      // Layer 1: Rolling tundra dunes
      let y = Math.sin(x * 0.06) * Math.cos(z * 0.06) * 3.2;
      // Layer 2: Wind-swept snow ripples
      y += Math.sin(x * 0.15 + 1.2) * Math.sin(z * 0.12) * 0.8;
      // Layer 3: Distant mountain peaks
      if (distFromCenter > 16) {
        const peakFactor = (distFromCenter - 16) / 25;
        y += Math.sin(x * 0.08) * Math.cos(z * 0.08) * 8 * peakFactor;
        if (z < -10) y += Math.abs(x * 0.15) * 4 * peakFactor; // Back mountain range
      }

      // Flatten ground directly beneath and around igloo
      if (distFromCenter < 4.2) {
        y *= (distFromCenter / 4.2) * 0.2;
      }

      posAttr.setY(i, y);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0xdde4ec,
      roughness: 0.88,
      metalness: 0.12,
      flatShading: false,
    });

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    terrainMesh.position.y = -0.15;
    scene.add(terrainMesh);

    // ── 4. The 3D Masonry Stone/Ice Igloo Structure ────────────────
    const iglooGroup = new THREE.Group();
    scene.add(iglooGroup);

    // Stone masonry material matching the reference image
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x98a2af,
      roughness: 0.78,
      metalness: 0.2,
      flatShading: false,
    });

    const glowingInteriorMat = new THREE.MeshBasicMaterial({
      color: 0xcfe2f7,
    });

    const iglooBlocks: { mesh: THREE.Mesh; originalPos: THREE.Vector3; normal: THREE.Vector3 }[] = [];

    // Construct concentric tiers of curved stone masonry blocks
    const tiers = [
      { radius: 2.7, y: 0.22, count: 18, height: 0.42, depth: 0.38, hasDoor: true },
      { radius: 2.55, y: 0.65, count: 17, height: 0.42, depth: 0.38, hasDoor: true },
      { radius: 2.3, y: 1.08, count: 15, height: 0.42, depth: 0.38, hasDoor: true },
      { radius: 1.9, y: 1.5, count: 13, height: 0.4, depth: 0.36, hasDoor: false },
      { radius: 1.35, y: 1.88, count: 10, height: 0.38, depth: 0.34, hasDoor: false },
      { radius: 0.7, y: 2.18, count: 6, height: 0.34, depth: 0.32, hasDoor: false },
    ];

    tiers.forEach((tier, tierIdx) => {
      const angleStep = (Math.PI * 2) / tier.count;
      for (let j = 0; j < tier.count; j++) {
        const angle = j * angleStep;

        // Skip front blocks for arched doorway tunnel
        if (tier.hasDoor && (angle > Math.PI * 0.35 && angle < Math.PI * 0.65)) {
          continue;
        }

        const widthVar = 0.52 + ((j * 17) % 5) * 0.02;
        const blockGeo = new THREE.BoxGeometry(widthVar, tier.height, tier.depth);
        const blockMesh = new THREE.Mesh(blockGeo, stoneMat);
        blockMesh.castShadow = true;
        blockMesh.receiveShadow = true;

        const bx = Math.cos(angle) * tier.radius;
        const bz = Math.sin(angle) * tier.radius;
        blockMesh.position.set(bx, tier.y, bz);

        // Point block towards dome center so it aligns along dome perimeter
        blockMesh.lookAt(0, tier.y * 0.5, 0);

        iglooGroup.add(blockMesh);

        const normal = new THREE.Vector3(bx, tier.y * 0.5, bz).normalize();
        iglooBlocks.push({
          mesh: blockMesh,
          originalPos: blockMesh.position.clone(),
          normal,
        });
      }
    });

    // Keystone Dome Capstone block
    const capGeo = new THREE.CylinderGeometry(0.55, 0.7, 0.28, 12);
    const capMesh = new THREE.Mesh(capGeo, stoneMat);
    capMesh.position.set(0, 2.38, 0);
    capMesh.castShadow = true;
    iglooGroup.add(capMesh);
    iglooBlocks.push({
      mesh: capMesh,
      originalPos: capMesh.position.clone(),
      normal: new THREE.Vector3(0, 1, 0),
    });

    // ── 5. Protruding Arched Entrance Tunnel ────────────────────────
    const tunnelGroup = new THREE.Group();
    tunnelGroup.position.set(0, 0, 2.3);
    iglooGroup.add(tunnelGroup);

    const archRings = 5;
    for (let r = 0; r < archRings; r++) {
      const zOffset = r * 0.34;
      const stonesInArch = 7;
      const archRadius = 0.95;

      for (let s = 0; s < stonesInArch; s++) {
        const sAngle = (s / (stonesInArch - 1)) * Math.PI;
        const ax = Math.cos(sAngle) * archRadius;
        const ay = Math.sin(sAngle) * archRadius + 0.12;

        const archStoneGeo = new THREE.BoxGeometry(0.32, 0.26, 0.32);
        const archStone = new THREE.Mesh(archStoneGeo, stoneMat);
        archStone.position.set(ax, ay, zOffset);
        archStone.rotation.z = sAngle - Math.PI / 2;
        archStone.castShadow = true;
        archStone.receiveShadow = true;
        tunnelGroup.add(archStone);

        iglooBlocks.push({
          mesh: archStone,
          originalPos: archStone.position.clone().add(tunnelGroup.position),
          normal: new THREE.Vector3(ax * 0.5, ay * 0.3, zOffset + 2.0).normalize(),
        });
      }
    }

    // Glowing interior light aperture mesh inside the tunnel
    const doorwayGlowGeo = new THREE.PlaneGeometry(1.2, 1.4);
    const doorwayGlow = new THREE.Mesh(doorwayGlowGeo, glowingInteriorMat);
    doorwayGlow.position.set(0, 0.65, 0.1);
    tunnelGroup.add(doorwayGlow);

    // Glowing core crystal floating inside the igloo
    const coreCrystalGeo = new THREE.OctahedronGeometry(0.48, 0);
    const coreCrystalMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      emissive: 0x60a5fa,
      emissiveIntensity: 2.2,
      metalness: 0.9,
      roughness: 0.1,
    });
    const coreCrystal = new THREE.Mesh(coreCrystalGeo, coreCrystalMat);
    coreCrystal.position.set(0, 1.0, 0);
    iglooGroup.add(coreCrystal);

    // ── 6. Atmospheric Drifting Blizzard Snow Particles ────────────
    const snowCount = 2200;
    const snowGeo = new THREE.BufferGeometry();
    const snowPos = new Float32Array(snowCount * 3);
    const snowVel = new Float32Array(snowCount * 3);

    for (let i = 0; i < snowCount; i++) {
      snowPos[i * 3] = (Math.random() - 0.5) * 45;
      snowPos[i * 3 + 1] = Math.random() * 18;
      snowPos[i * 3 + 2] = (Math.random() - 0.5) * 45;

      snowVel[i * 3] = -0.018 - Math.random() * 0.02; // wind left
      snowVel[i * 3 + 1] = -0.025 - Math.random() * 0.035; // falling
      snowVel[i * 3 + 2] = -0.012 - Math.random() * 0.015; // wind depth
    }

    snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));

    const snowMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.055,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const snowParticles = new THREE.Points(snowGeo, snowMat);
    scene.add(snowParticles);

    // ── 7. Pointer Event Handlers ──────────────────────────────────
    const handlePointerMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerRef.current.targetX = nx * 0.35;
      pointerRef.current.targetY = ny * 0.25;
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

    // ── 8. Animation & Scroll Flight Loop ──────────────────────────
    const clock = new THREE.Clock();

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      const time = clock.getElapsedTime();

      // Smooth pointer lerp
      pointerRef.current.x += (pointerRef.current.targetX - pointerRef.current.x) * 0.05;
      pointerRef.current.y += (pointerRef.current.targetY - pointerRef.current.y) * 0.05;

      const px = pointerRef.current.x;
      const py = pointerRef.current.y;
      const scroll = scrollRef.current; // 0 to 1

      // ── Speech / Voice Dynamic Reactive Glow ──────────────────────
      const isSpeaking = speechStateRef.current.speaking;
      const amp = speechStateRef.current.amplitude;
      if (isSpeaking && amp > 0) {
        interiorCoreLight.intensity = 5.5 + amp * 4.0;
        interiorAmberLight.intensity = 2.2 + amp * 3.0;
        coreCrystal.rotation.y = time * 2.5;
        coreCrystal.rotation.x = time * 1.5;
      } else {
        interiorCoreLight.intensity = 5.5 + Math.sin(time * 2) * 0.8;
        interiorAmberLight.intensity = 2.2 + Math.cos(time * 2) * 0.4;
        coreCrystal.rotation.y = time * 0.8;
        coreCrystal.rotation.x = time * 0.4;
      }

      // ── Snow Blizzard Particle Physics ───────────────────────────
      const sPos = snowGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < snowCount; i++) {
        sPos[i * 3] += snowVel[i * 3];
        sPos[i * 3 + 1] += snowVel[i * 3 + 1];
        sPos[i * 3 + 2] += snowVel[i * 3 + 2];

        // Wrap around bounds
        if (sPos[i * 3 + 1] < -0.5) sPos[i * 3 + 1] = 18;
        if (sPos[i * 3] < -22) sPos[i * 3] = 22;
        if (sPos[i * 3 + 2] < -22) sPos[i * 3 + 2] = 22;
      }
      snowGeo.attributes.position.needsUpdate = true;

      // ── Scroll-Linked 3D Exploration & Subtle Breathing Aperture ──
      // In the hero (scroll < 0.18), the igloo remains a pristine, solid dome
      const explodeFactor = Math.min(Math.max((scroll - 0.18) * 1.6, 0), 1);
      iglooBlocks.forEach((b) => {
        const offset = b.normal.clone().multiplyScalar(explodeFactor * 0.55);
        b.mesh.position.copy(b.originalPos).add(offset);
      });

      // ── Cinematic Camera Spline Journey ──────────────────────────
      let targetCamX = px * 0.4;
      let targetCamY = 1.9 - py * 0.3;
      let targetCamZ = 7.4;
      let targetLookY = 1.0;
      let targetLookZ = 0;

      if (scroll < 0.2) {
        // Section 0: The Igloo Manifesto (Exact hero view matching the reference)
        const t = scroll / 0.2;
        targetCamX = px * 0.4;
        targetCamY = 1.9 - t * 0.3 - py * 0.2;
        targetCamZ = 7.4 - t * 0.8;
        targetLookY = 1.0;
        targetLookZ = 0;
      } else if (scroll < 0.45) {
        // Section 1: The Foundry (Camera glides closer towards the arched tunnel)
        const t = (scroll - 0.2) / 0.25;
        targetCamX = Math.sin(t * Math.PI * 0.8) * 1.5 + px * 0.5;
        targetCamY = 1.6 - t * 0.4;
        targetCamZ = 7.0 - t * 2.8;
        targetLookY = 1.1;
        targetLookZ = 0.5;
      } else if (scroll < 0.7) {
        // Section 2: The Artifacts & Projects (Wide orbit viewing the glowing interior core)
        const t = (scroll - 0.45) / 0.25;
        targetCamX = -2.2 + t * 4.4 + px * 0.4;
        targetCamY = 1.8 + Math.sin(t * Math.PI) * 0.6;
        targetCamZ = 4.2;
        targetLookY = 1.0;
        targetLookZ = 0.2;
      } else if (scroll < 0.88) {
        // Section 3: The Copilot & AI Lab (Intimate focus on glowing cyber crystal)
        const t = (scroll - 0.7) / 0.18;
        targetCamX = px * 0.3;
        targetCamY = 1.2 - py * 0.2;
        targetCamZ = 2.8;
        targetLookY = 1.0;
        targetLookZ = 0;
      } else {
        // Section 4: The Nexus (Grand panoramic sweep looking over snowy mountain ridge)
        const t = (scroll - 0.88) / 0.12;
        targetCamX = px * 0.5;
        targetCamY = 3.6 + t * 1.2;
        targetCamZ = 9.5;
        targetLookY = 1.4;
        targetLookZ = -2.0;
      }

      // Smooth camera interpolation
      camera.position.x += (targetCamX - camera.position.x) * 0.055;
      camera.position.y += (targetCamY - camera.position.y) * 0.055;
      camera.position.z += (targetCamZ - camera.position.z) * 0.055;
      camera.lookAt(0, targetLookY, targetLookZ);

      renderer.render(scene, camera);
    };

    render();

    // ── Cleanup ────────────────────────────────────────────────────
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
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
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 bg-[#d2d9e3]"
      aria-hidden="true"
    />
  );
}
