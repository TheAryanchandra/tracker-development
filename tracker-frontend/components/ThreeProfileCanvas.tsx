'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Bot,
  Cpu,
  Layers,
  RotateCw,
  Sparkles,
  Eye,
  Palette,
  Maximize2,
  Minimize2,
  Zap,
} from 'lucide-react';

export type ObjectType = 'architect' | 'neural' | 'pipeline';
export type ThemeColor = 'gold' | 'cyan' | 'emerald' | 'violet';

interface ThemeConfig {
  primary: number;
  secondary: number;
  emissive: number;
  glow: number;
  light1: number;
  light2: number;
  accentHex: string;
  gradFrom: string;
  gradTo: string;
  name: string;
}

const THEMES: Record<ThemeColor, ThemeConfig> = {
  gold: {
    primary: 0xf59e0b,
    secondary: 0xd97706,
    emissive: 0x92400e,
    glow: 0xfde68a,
    light1: 0xfbbf24,
    light2: 0xb45309,
    accentHex: '#f59e0b',
    gradFrom: '#f59e0b22',
    gradTo: '#d9770611',
    name: 'Cyber Amber',
  },
  cyan: {
    primary: 0x06b6d4,
    secondary: 0x3b82f6,
    emissive: 0x164e63,
    glow: 0x67e8f9,
    light1: 0x38bdf8,
    light2: 0x1d4ed8,
    accentHex: '#06b6d4',
    gradFrom: '#06b6d422',
    gradTo: '#3b82f611',
    name: 'Jarvis Cyan',
  },
  emerald: {
    primary: 0x10b981,
    secondary: 0x059669,
    emissive: 0x064e3b,
    glow: 0x6ee7b7,
    light1: 0x34d399,
    light2: 0x047857,
    accentHex: '#10b981',
    gradFrom: '#10b98122',
    gradTo: '#05966911',
    name: 'Neural Emerald',
  },
  violet: {
    primary: 0x8b5cf6,
    secondary: 0xa855f7,
    emissive: 0x4c1d95,
    glow: 0xc4b5fd,
    light1: 0xa78bfa,
    light2: 0xec4899,
    accentHex: '#8b5cf6',
    gradFrom: '#8b5cf622',
    gradTo: '#a855f711',
    name: 'Cosmic Violet',
  },
};

const OBJECT_META: Record<ObjectType, { label: string; tag: string; desc: string }> = {
  architect: {
    label: 'System Architect',
    tag: 'Full-Stack & Backend',
    desc: 'Distributed systems, APIs, cloud infrastructure',
  },
  neural: {
    label: 'Neural Core',
    tag: 'AI & Agent Engineering',
    desc: 'LangGraph ReAct agents, RAG pipelines, Gemini',
  },
  pipeline: {
    label: 'Data Pipeline',
    tag: 'Real-Time Streaming',
    desc: 'WebSocket events, Kafka, 50K+ daily transactions',
  },
};

interface SceneState {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  currentGroup: THREE.Group | null;
  particles: THREE.Points | null;
  energyField: THREE.Points | null;
  pointLight1: THREE.PointLight | null;
  pointLight2: THREE.PointLight | null;
  pointLight3: THREE.PointLight | null;
  rimLight: THREE.DirectionalLight | null;
  frameId: number;
  startTime: number;
  lastFrameTime: number;
  mouseX: number;
  mouseY: number;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  isHovered: boolean;
  autoRotate: boolean;
  wireframe: boolean;
  activeType: ObjectType;
  theme: ThemeConfig;
}

interface ThreeProfileCanvasProps {
  initialObject?: ObjectType;
  initialTheme?: ThemeColor;
  className?: string;
  showControls?: boolean;
}

export default function ThreeProfileCanvas({
  initialObject = 'architect',
  initialTheme = 'gold',
  className = '',
  showControls = true,
}: ThreeProfileCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<SceneState>({
    scene: null,
    camera: null,
    renderer: null,
    currentGroup: null,
    particles: null,
    energyField: null,
    pointLight1: null,
    pointLight2: null,
    pointLight3: null,
    rimLight: null,
    frameId: 0,
    startTime: 0,
    lastFrameTime: 0,
    mouseX: 0,
    mouseY: 0,
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    isHovered: false,
    autoRotate: true,
    wireframe: false,
    activeType: initialObject,
    theme: THEMES[initialTheme],
  });

  const [activeObject, setActiveObject] = useState<ObjectType>(initialObject);
  const [activeTheme, setActiveTheme] = useState<ThemeColor>(initialTheme);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [fps, setFps] = useState(60);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ─────────────────────────────────────────────────────────────────────
  // Builder helpers
  // ─────────────────────────────────────────────────────────────────────

  const makeMat = (theme: ThemeConfig, opts?: Partial<THREE.MeshStandardMaterialParameters>) =>
    new THREE.MeshStandardMaterial({
      color: theme.primary,
      emissive: theme.emissive,
      emissiveIntensity: 0.4,
      roughness: 0.12,
      metalness: 0.9,
      wireframe: stateRef.current.wireframe,
      ...opts,
    });

  const makeGlowMat = (theme: ThemeConfig, opacity = 0.7) =>
    new THREE.MeshBasicMaterial({
      color: theme.glow,
      wireframe: true,
      transparent: true,
      opacity,
    });

  // ─────────────────────────────────────────────────────────────────────
  // Object 1: System Architect — Server Stack / Cloud Infrastructure
  // ─────────────────────────────────────────────────────────────────────
  const buildArchitect = useCallback((theme: ThemeConfig): THREE.Group => {
    const g = new THREE.Group();

    // Central hexagonal prism (server core)
    const hexGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.3, 6, 1);
    const hexMat = makeMat(theme, { flatShading: true });
    const hex = new THREE.Mesh(hexGeo, hexMat);
    hex.name = 'hexCore';
    g.add(hex);

    // Stacked server layers (3 horizontal slabs)
    [-0.6, 0.0, 0.6].forEach((y, i) => {
      const slabGeo = new THREE.BoxGeometry(1.4, 0.18, 0.6);
      const slabMat = makeMat(theme, {
        color: i === 1 ? theme.glow : theme.primary,
        emissiveIntensity: i === 1 ? 0.8 : 0.3,
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.set(0, y, -0.7);
      slab.name = `slab_${i}`;
      g.add(slab);

      // Activity LED dots on each slab
      const ledCount = 5 + i * 2;
      for (let l = 0; l < ledCount; l++) {
        const led = new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 8, 8),
          new THREE.MeshBasicMaterial({ color: l % 3 === 0 ? 0x22c55e : l % 3 === 1 ? 0xf59e0b : 0x3b82f6 })
        );
        led.position.set(-0.55 + l * 0.18, y + 0.12, -0.55);
        led.name = `led_${i}_${l}`;
        g.add(led);
      }
    });

    // Orbiting data packets (6 small cubes in elliptical orbit)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const packet = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.14, 0.14),
        new THREE.MeshStandardMaterial({
          color: theme.secondary,
          emissive: theme.primary,
          emissiveIntensity: 0.6,
          roughness: 0.1,
          metalness: 0.8,
        })
      );
      packet.position.set(Math.cos(angle) * 2.0, Math.sin(angle * 0.5) * 0.5, Math.sin(angle) * 2.0);
      packet.name = `packet_${i}`;
      g.add(packet);
    }

    // Spinning outer ring (API gateway ring)
    const apiRingGeo = new THREE.TorusGeometry(2.5, 0.03, 12, 80);
    const apiRing = new THREE.Mesh(apiRingGeo, new THREE.MeshStandardMaterial({
      color: theme.primary,
      emissive: theme.emissive,
      roughness: 0.2,
      metalness: 0.95,
    }));
    apiRing.rotation.x = Math.PI / 2;
    apiRing.name = 'apiRing';
    g.add(apiRing);

    // Vertical pillar tower
    const pillarGeo = new THREE.CylinderGeometry(0.07, 0.07, 2.2, 8);
    const pillar = new THREE.Mesh(pillarGeo, makeMat(theme, { emissiveIntensity: 0.6 }));
    pillar.position.set(0, 0, 0);
    pillar.name = 'pillar';
    g.add(pillar);

    // Cloud sphere at top of pillar
    const cloudGeo = new THREE.IcosahedronGeometry(0.45, 2);
    const cloud = new THREE.Mesh(cloudGeo, makeMat(theme, { flatShading: true, emissiveIntensity: 0.7 }));
    cloud.position.set(0, 1.3, 0);
    cloud.name = 'cloudNode';
    g.add(cloud);

    // Wireframe cage around cloud
    const cageGeo = new THREE.IcosahedronGeometry(0.65, 1);
    const cage = new THREE.Mesh(cageGeo, makeGlowMat(theme, 0.5));
    cage.position.set(0, 1.3, 0);
    cage.name = 'cageNode';
    g.add(cage);

    // Rotating equatorial ring
    const eqRingGeo = new THREE.TorusGeometry(1.8, 0.025, 12, 64);
    const eqRing = new THREE.Mesh(eqRingGeo, new THREE.MeshBasicMaterial({
      color: theme.glow,
      transparent: true,
      opacity: 0.55,
    }));
    eqRing.name = 'eqRing';
    g.add(eqRing);

    return g;
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  // Object 2: Neural Core — AI / Agents / ReAct Loop
  // ─────────────────────────────────────────────────────────────────────
  const buildNeural = useCallback((theme: ThemeConfig): THREE.Group => {
    const g = new THREE.Group();

    // Core: layered icosahedrons (nested brains)
    [2, 1, 0].forEach((detail, idx) => {
      const r = [1.4, 0.95, 0.5][idx];
      const geo = new THREE.IcosahedronGeometry(r, detail);
      const mat = idx === 0
        ? makeMat(theme, { emissiveIntensity: 1.0 })
        : idx === 1
        ? makeGlowMat(theme, 0.45)
        : makeMat(theme, { color: theme.glow, emissiveIntensity: 0.5, flatShading: true });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.name = `neuralLayer_${idx}`;
      g.add(mesh);
    });

    // Synaptic connection rings (3 gyroscopic rings at orthogonal angles)
    const ringAngles = [
      [0, 0, 0],
      [Math.PI / 2, 0, 0],
      [0, Math.PI / 3, Math.PI / 6],
    ];
    ringAngles.forEach(([rx, ry, rz], i) => {
      const rGeo = new THREE.TorusGeometry(2.0 + i * 0.22, 0.028, 16, 100);
      const rMesh = new THREE.Mesh(rGeo, new THREE.MeshStandardMaterial({
        color: i === 1 ? theme.secondary : theme.primary,
        emissive: theme.emissive,
        roughness: 0.15,
        metalness: 0.9,
      }));
      rMesh.rotation.set(rx, ry, rz);
      rMesh.name = `synRing_${i}`;
      g.add(rMesh);
    });

    // Neuron nodes orbiting in 3D shell
    const neuronCount = 14;
    for (let i = 0; i < neuronCount; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / neuronCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 2.7;
      const neuron = new THREE.Mesh(
        new THREE.SphereGeometry(0.07 + (i % 3) * 0.025, 10, 10),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? theme.glow : theme.primary })
      );
      neuron.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      neuron.name = `neuron_${i}`;
      g.add(neuron);
    }

    // Outer resonance sphere (large glow cage)
    const resonanceGeo = new THREE.IcosahedronGeometry(3.2, 1);
    const resonance = new THREE.Mesh(resonanceGeo, new THREE.MeshBasicMaterial({
      color: theme.emissive,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    }));
    resonance.name = 'resonance';
    g.add(resonance);

    return g;
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  // Object 3: Data Pipeline — Event Stream / WebSockets / 50K+ TPS
  // ─────────────────────────────────────────────────────────────────────
  const buildPipeline = useCallback((theme: ThemeConfig): THREE.Group => {
    const g = new THREE.Group();

    // Central Torus Knot — data stream manifold
    const knotGeo = new THREE.TorusKnotGeometry(1.2, 0.35, 200, 32, 3, 5);
    const knotMat = makeMat(theme, { roughness: 0.15, metalness: 0.95 });
    const knot = new THREE.Mesh(knotGeo, knotMat);
    knot.name = 'dataKnot';
    g.add(knot);

    // Inner crystal octahedron (DB shard)
    const octGeo = new THREE.OctahedronGeometry(0.6, 2);
    const oct = new THREE.Mesh(octGeo, makeMat(theme, {
      color: theme.glow,
      emissiveIntensity: 0.9,
      flatShading: true,
    }));
    oct.name = 'dbShard';
    g.add(oct);

    // Horizontal event rings (WebSocket channels)
    [-0.7, 0, 0.7].forEach((y, i) => {
      const ringGeo = new THREE.TorusGeometry(2.1 + i * 0.2, 0.03, 16, 80);
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({
        color: i === 1 ? theme.secondary : theme.primary,
        emissive: theme.emissive,
        roughness: 0.2,
        metalness: 0.9,
      }));
      ring.position.y = y;
      ring.rotation.x = Math.PI / 2;
      ring.name = `wsRing_${i}`;
      g.add(ring);
    });

    // Flowing transaction spheres on an elliptical path
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const tx = new THREE.Mesh(
        new THREE.SphereGeometry(0.09 + (i % 2) * 0.04, 12, 12),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? theme.glow : theme.secondary })
      );
      tx.position.set(
        Math.cos(angle) * 2.6,
        Math.sin(angle * 0.7) * 0.4,
        Math.sin(angle) * 2.6
      );
      tx.name = `tx_${i}`;
      g.add(tx);
    }

    // Satellite dish (scraper / DuckDuckGo search node)
    const dishGeo = new THREE.SphereGeometry(0.55, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    const dish = new THREE.Mesh(dishGeo, new THREE.MeshStandardMaterial({
      color: theme.secondary,
      emissive: theme.emissive,
      roughness: 0.25,
      metalness: 0.8,
      side: THREE.DoubleSide,
    }));
    dish.position.set(2.0, 1.4, 0);
    dish.rotation.z = Math.PI / 4;
    dish.name = 'satelliteDish';
    g.add(dish);

    // Dish arm
    const armGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8);
    const arm = new THREE.Mesh(armGeo, makeMat(theme));
    arm.position.set(2.0, 0.95, 0);
    arm.rotation.z = Math.PI / 4;
    arm.name = 'dishArm';
    g.add(arm);

    return g;
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  // Ambient Star-field Particle System
  // ─────────────────────────────────────────────────────────────────────
  const buildParticles = (theme: ThemeConfig, count = 500): THREE.Points => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c1 = new THREE.Color(theme.light1);
    const c2 = new THREE.Color(theme.secondary);
    for (let i = 0; i < count; i++) {
      const r = 4.5 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const c = c1.clone().lerp(c2, Math.random());
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    }));
  };

  // Energy field — dense inner halo
  const buildEnergyField = (theme: ThemeConfig): THREE.Points => {
    const geo = new THREE.BufferGeometry();
    const count = 200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 3.2 + Math.random() * 0.4;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
      color: theme.glow,
      size: 0.06,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    }));
  };

  // ─────────────────────────────────────────────────────────────────────
  // Swap the active object in the scene
  // ─────────────────────────────────────────────────────────────────────
  const swapObject = useCallback((type: ObjectType, theme: ThemeConfig) => {
    const s = stateRef.current;
    if (!s.scene) return;

    if (s.currentGroup) {
      s.scene.remove(s.currentGroup);
      s.currentGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
    }

    let group: THREE.Group;
    if (type === 'architect') group = buildArchitect(theme);
    else if (type === 'neural') group = buildNeural(theme);
    else group = buildPipeline(theme);

    s.currentGroup = group;
    s.activeType = type;
    s.scene.add(group);
  }, [buildArchitect, buildNeural, buildPipeline]);

  // Handle object switch
  const handleSelectObject = (type: ObjectType) => {
    setActiveObject(type);
    swapObject(type, stateRef.current.theme);
  };

  // Handle theme switch
  const handleSelectTheme = (themeKey: ThemeColor) => {
    setActiveTheme(themeKey);
    stateRef.current.theme = THEMES[themeKey];
    if (stateRef.current.pointLight1) stateRef.current.pointLight1.color.setHex(THEMES[themeKey].light1);
    if (stateRef.current.pointLight2) stateRef.current.pointLight2.color.setHex(THEMES[themeKey].light2);
    if (stateRef.current.pointLight3) stateRef.current.pointLight3.color.setHex(THEMES[themeKey].primary);
    swapObject(stateRef.current.activeType, THEMES[themeKey]);
  };

  // ─────────────────────────────────────────────────────────────────────
  // Animation tick helpers
  // ─────────────────────────────────────────────────────────────────────
  const animateArchitect = (group: THREE.Group, t: number, dt: number) => {
    const base = group.getObjectByName('hexCore');
    if (base) base.rotation.y += dt * 0.3;

    const cloud = group.getObjectByName('cloudNode');
    if (cloud) {
      cloud.position.y = 1.3 + Math.sin(t * 1.5) * 0.08;
      cloud.rotation.y += dt * 0.8;
    }
    const cage = group.getObjectByName('cageNode');
    if (cage) {
      cage.position.y = 1.3 + Math.sin(t * 1.5) * 0.08;
      cage.rotation.x += dt * 0.7;
      cage.rotation.y -= dt * 0.5;
    }

    const apiRing = group.getObjectByName('apiRing');
    if (apiRing) {
      apiRing.rotation.z += dt * 0.25;
    }
    const eqRing = group.getObjectByName('eqRing');
    if (eqRing) {
      eqRing.rotation.y += dt * 0.6;
    }

    // Orbit data packets
    for (let i = 0; i < 6; i++) {
      const p = group.getObjectByName(`packet_${i}`);
      if (p) {
        const angle = (i / 6) * Math.PI * 2 + t * 0.6;
        p.position.set(Math.cos(angle) * 2.0, Math.sin(angle * 0.5) * 0.5, Math.sin(angle) * 2.0);
        p.rotation.x += dt * 2;
        p.rotation.y += dt * 1.5;
      }
    }

    // Slab LED flicker
    for (let i = 0; i < 3; i++) {
      for (let l = 0; l < 7 + i * 2; l++) {
        const led = group.getObjectByName(`led_${i}_${l}`);
        if (led && led instanceof THREE.Mesh) {
          const flicker = 0.6 + 0.4 * Math.sin(t * (8 + l * 2.1 + i));
          (led.material as THREE.MeshBasicMaterial).opacity = flicker;
        }
      }
    }
  };

  const animateNeural = (group: THREE.Group, t: number, dt: number) => {
    const layer0 = group.getObjectByName('neuralLayer_0');
    const layer1 = group.getObjectByName('neuralLayer_1');
    const layer2 = group.getObjectByName('neuralLayer_2');

    if (layer0) {
      layer0.rotation.x += dt * 0.2;
      layer0.rotation.y += dt * 0.35;
      const pulse = 1 + Math.sin(t * 2.2) * 0.07;
      layer0.scale.set(pulse, pulse, pulse);
    }
    if (layer1) {
      layer1.rotation.y -= dt * 0.55;
      layer1.rotation.z += dt * 0.2;
      const pulse2 = 1 + Math.sin(t * 3.1 + 1) * 0.05;
      layer1.scale.set(pulse2, pulse2, pulse2);
    }
    if (layer2) {
      layer2.rotation.x -= dt * 1.2;
      layer2.rotation.z += dt * 0.9;
    }

    const ring0 = group.getObjectByName('synRing_0');
    const ring1 = group.getObjectByName('synRing_1');
    const ring2 = group.getObjectByName('synRing_2');
    if (ring0) ring0.rotation.z += dt * 0.4;
    if (ring1) ring1.rotation.x += dt * 0.6;
    if (ring2) { ring2.rotation.y += dt * 0.5; ring2.rotation.z -= dt * 0.3; }

    const resonance = group.getObjectByName('resonance');
    if (resonance) {
      resonance.rotation.x += dt * 0.1;
      resonance.rotation.y -= dt * 0.08;
      const rs = 1 + Math.sin(t * 0.8) * 0.04;
      resonance.scale.set(rs, rs, rs);
    }
  };

  const animatePipeline = (group: THREE.Group, t: number, dt: number) => {
    const knot = group.getObjectByName('dataKnot');
    if (knot) {
      knot.rotation.y += dt * 0.3;
      knot.rotation.x = Math.sin(t * 0.5) * 0.15;
    }

    const shard = group.getObjectByName('dbShard');
    if (shard) {
      shard.rotation.x += dt * 1.1;
      shard.rotation.y += dt * 0.9;
      const ps = 1 + Math.sin(t * 2.8) * 0.1;
      shard.scale.set(ps, ps, ps);
    }

    const wsRing0 = group.getObjectByName('wsRing_0');
    const wsRing1 = group.getObjectByName('wsRing_1');
    const wsRing2 = group.getObjectByName('wsRing_2');
    if (wsRing0) wsRing0.rotation.y += dt * 0.4;
    if (wsRing1) wsRing1.rotation.y -= dt * 0.65;
    if (wsRing2) wsRing2.rotation.y += dt * 0.3;

    // Orbit transactions
    for (let i = 0; i < 8; i++) {
      const tx = group.getObjectByName(`tx_${i}`);
      if (tx) {
        const angle = (i / 8) * Math.PI * 2 + t * (0.5 + i * 0.05);
        tx.position.set(
          Math.cos(angle) * 2.6,
          Math.sin(angle * 0.7 + i) * 0.4,
          Math.sin(angle) * 2.6
        );
      }
    }

    const dish = group.getObjectByName('satelliteDish');
    if (dish) dish.rotation.y += dt * 0.8;
  };

  // ─────────────────────────────────────────────────────────────────────
  // Main Three.js setup & render loop
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const w = container.clientWidth || 640;
    const h = container.clientHeight || 480;

    // Scene
    const scene = new THREE.Scene();
    stateRef.current.scene = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(0, 0.5, 8);
    stateRef.current.camera = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);
    stateRef.current.renderer = renderer;

    // Lighting
    const theme = stateRef.current.theme;
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const pl1 = new THREE.PointLight(theme.light1, 4.5, 35);
    pl1.position.set(6, 6, 6);
    scene.add(pl1);
    stateRef.current.pointLight1 = pl1;

    const pl2 = new THREE.PointLight(theme.light2, 3.0, 30);
    pl2.position.set(-5, -4, -4);
    scene.add(pl2);
    stateRef.current.pointLight2 = pl2;

    const pl3 = new THREE.PointLight(theme.primary, 2.0, 20);
    pl3.position.set(0, 0, 6);
    scene.add(pl3);
    stateRef.current.pointLight3 = pl3;

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
    rimLight.position.set(0, 8, 5);
    scene.add(rimLight);
    stateRef.current.rimLight = rimLight;

    // Particles
    const particles = buildParticles(theme, 550);
    scene.add(particles);
    stateRef.current.particles = particles;

    const energyField = buildEnergyField(theme);
    scene.add(energyField);
    stateRef.current.energyField = energyField;

    // Initial object
    swapObject(stateRef.current.activeType, theme);

    // Timing
    stateRef.current.startTime = performance.now();
    stateRef.current.lastFrameTime = performance.now();

    // FPS tracking
    let frameCount = 0;
    let lastFpsTime = performance.now();

    // Mouse handlers
    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      stateRef.current.mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      stateRef.current.mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      stateRef.current.targetX = stateRef.current.mouseY * 0.8;
      stateRef.current.targetY = stateRef.current.mouseX * 1.1;
      if (stateRef.current.pointLight1) {
        stateRef.current.pointLight1.position.x = stateRef.current.mouseX * 10;
        stateRef.current.pointLight1.position.y = stateRef.current.mouseY * 10;
      }
    };
    const onEnter = () => { stateRef.current.isHovered = true; setIsHovered(true); };
    const onLeave = () => {
      stateRef.current.isHovered = false;
      setIsHovered(false);
      stateRef.current.targetX = 0;
      stateRef.current.targetY = 0;
    };
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = container.getBoundingClientRect();
        const tx = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
        const ty = -(((e.touches[0].clientY - rect.top) / rect.height) * 2 - 1);
        stateRef.current.targetX = ty * 0.6;
        stateRef.current.targetY = tx * 0.9;
      }
    };
    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);
    container.addEventListener('touchmove', onTouch, { passive: true });

    // Resize
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const nw = e.contentRect.width;
        const nh = e.contentRect.height;
        if (nw > 0 && nh > 0) {
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        }
      }
    });
    ro.observe(container);

    // Render loop
    const tick = () => {
      const s = stateRef.current;
      const now = performance.now();
      const dt = Math.min((now - s.lastFrameTime) / 1000, 0.08);
      s.lastFrameTime = now;
      const t = (now - s.startTime) / 1000;

      frameCount++;
      if (now - lastFpsTime >= 600) {
        setFps(Math.round((frameCount * 1000) / (now - lastFpsTime)));
        frameCount = 0;
        lastFpsTime = now;
      }

      // Smooth parallax lerp
      s.currentX += (s.targetX - s.currentX) * 0.055;
      s.currentY += (s.targetY - s.currentY) * 0.055;

      // Top-level group rotation
      if (s.currentGroup) {
        const rotSpeed = s.isHovered ? 1.6 : 1.0;
        if (s.autoRotate) {
          s.currentGroup.rotation.y += dt * 0.45 * rotSpeed;
        }
        // Parallax tilt
        s.currentGroup.rotation.x += (s.currentX * 0.04 - s.currentGroup.rotation.x) * 0.08;
        s.currentGroup.rotation.z += (s.currentY * 0.015 - s.currentGroup.rotation.z) * 0.05;

        // Per-object sub-animations
        if (s.activeType === 'architect') animateArchitect(s.currentGroup, t, dt);
        else if (s.activeType === 'neural') animateNeural(s.currentGroup, t, dt);
        else animatePipeline(s.currentGroup, t, dt);
      }

      // Particle drift
      if (s.particles) {
        s.particles.rotation.y = t * 0.035;
        s.particles.rotation.x = Math.sin(t * 0.04) * 0.1;
      }
      if (s.energyField) {
        s.energyField.rotation.y = -t * 0.05;
        s.energyField.rotation.x = Math.cos(t * 0.06) * 0.12;
        const mat = s.energyField.material as THREE.PointsMaterial;
        mat.opacity = 0.3 + Math.sin(t * 1.8) * 0.15;
      }

      // Pulsing lights
      if (s.pointLight3) {
        s.pointLight3.intensity = 1.8 + Math.sin(t * 2.5) * 0.7;
      }

      renderer.render(scene, camera);
      s.frameId = requestAnimationFrame(tick);
    };

    stateRef.current.frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(stateRef.current.frameId);
      ro.disconnect();
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
      container.removeEventListener('touchmove', onTouch);

      if (stateRef.current.currentGroup) {
        scene.remove(stateRef.current.currentGroup);
      }
      if (stateRef.current.particles) {
        scene.remove(stateRef.current.particles);
        stateRef.current.particles.geometry.dispose();
      }
      if (stateRef.current.energyField) {
        scene.remove(stateRef.current.energyField);
        stateRef.current.energyField.geometry.dispose();
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [swapObject]);

  // Sync React state → stateRef
  useEffect(() => { stateRef.current.autoRotate = autoRotate; }, [autoRotate]);
  useEffect(() => {
    stateRef.current.wireframe = wireframe;
    stateRef.current.currentGroup?.traverse(child => {
      if (child instanceof THREE.Mesh && !Array.isArray(child.material)) {
        child.material.wireframe = wireframe;
      }
    });
  }, [wireframe]);

  const meta = OBJECT_META[activeObject];
  const theme = THEMES[activeTheme];

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl select-none transition-all duration-500 ${
        isFullscreen ? 'fixed inset-3 z-50' : ''
      } ${className}`}
      style={{
        background: `radial-gradient(ellipse at 50% 30%, ${theme.gradFrom} 0%, rgba(8,10,20,0.97) 70%)`,
      }}
    >
      {/* WebGL Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-[400px] sm:h-[460px] md:h-[520px] cursor-crosshair touch-none"
      />

      {/* ── Top HUD ── */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
        {/* Object Selector Tabs */}
        <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-2xl bg-black/55 backdrop-blur-md border border-white/10 shadow-lg">
          {(['architect', 'neural', 'pipeline'] as ObjectType[]).map(type => {
            const icons: Record<ObjectType, React.ReactNode> = {
              architect: <Cpu className="w-3.5 h-3.5" />,
              neural: <Bot className="w-3.5 h-3.5" />,
              pipeline: <Layers className="w-3.5 h-3.5" />,
            };
            const labels: Record<ObjectType, string> = {
              architect: 'Architect',
              neural: 'Neural Core',
              pipeline: 'Pipeline',
            };
            const isActive = activeObject === type;
            return (
              <button
                key={type}
                onClick={() => handleSelectObject(type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-black shadow-lg'
                    : 'text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
                style={isActive ? { backgroundColor: theme.accentHex, boxShadow: `0 0 16px ${theme.accentHex}55` } : {}}
                title={OBJECT_META[type].desc}
              >
                {icons[type]}
                <span className="hidden sm:inline">{labels[type]}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Telemetry badges */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-300">
            <span className={`w-1.5 h-1.5 rounded-full ${fps >= 55 ? 'bg-emerald-400' : fps >= 30 ? 'bg-amber-400' : 'bg-red-400'} animate-pulse`} />
            <span>{fps} FPS</span>
            <span className="text-zinc-600">|</span>
            <span style={{ color: theme.accentHex }} className="font-medium">WebGL</span>
          </div>
          <button
            onClick={() => setIsFullscreen(v => !v)}
            className="p-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-white transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Center info label ── */}
      <div className="absolute top-[4.5rem] left-1/2 -translate-x-1/2 pointer-events-none text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md bg-black/35"
          style={{ borderColor: `${theme.accentHex}44`, color: theme.accentHex }}
        >
          <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '7s' }} />
          <span>{meta.tag}</span>
          <span className="text-zinc-500 text-[10px] hidden sm:inline">— {meta.desc}</span>
        </div>
      </div>

      {/* ── Hover glow edge ── */}
      <div
        className="absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at 50% 80%, ${theme.accentHex}18 0%, transparent 65%)`,
          opacity: isHovered ? 1 : 0.4,
        }}
      />

      {/* ── Bottom Control Bar ── */}
      {showControls && (
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Theme Switcher */}
          <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 shadow-md">
            <Palette className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
            {(['gold', 'cyan', 'emerald', 'violet'] as ThemeColor[]).map(th => (
              <button
                key={th}
                onClick={() => handleSelectTheme(th)}
                className={`w-5 h-5 rounded-lg transition-all duration-200 ${activeTheme === th ? 'ring-2 ring-white ring-offset-1 ring-offset-black scale-110' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
                style={{ backgroundColor: THEMES[th].accentHex }}
                title={THEMES[th].name}
              />
            ))}
          </div>

          {/* Feature Toggles */}
          <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 shadow-md text-xs">
            <button
              onClick={() => setAutoRotate(v => !v)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-medium transition-all ${autoRotate ? 'text-black' : 'text-zinc-400 hover:text-white'}`}
              style={autoRotate ? { backgroundColor: theme.accentHex } : {}}
              title="Auto Rotate"
            >
              <RotateCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              <span className="hidden sm:inline">Spin</span>
            </button>

            <button
              onClick={() => setWireframe(v => !v)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-medium transition-all ${wireframe ? 'text-black' : 'text-zinc-400 hover:text-white'}`}
              style={wireframe ? { backgroundColor: theme.accentHex } : {}}
              title="Wireframe Matrix"
            >
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">Wire</span>
            </button>

            <div className="hidden sm:flex items-center gap-1 px-2 py-1 text-[11px] text-zinc-500 font-mono">
              <Zap className="w-3 h-3" style={{ color: theme.accentHex }} />
              <span>Mouse parallax</span>
            </div>
          </div>
        </div>
      )}

      {/* Scanline CRT overlay (subtle premium feel) */}
      <div
        className="absolute inset-0 pointer-events-none rounded-3xl opacity-[0.025]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
        }}
      />
    </div>
  );
}
