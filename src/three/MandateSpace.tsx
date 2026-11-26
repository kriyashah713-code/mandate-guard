import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import type { DecisionState } from '../types/domain';
import { formatCompactInr } from '../utils/format';

export interface MandateSpaceProps {
  decision: DecisionState;
  hasViolation: boolean;
  amountInr: number;
  agentName: string;
  principalName: string;
  registeredAccount: string;
  requestedAccount: string;
  payee: string;
  heightClass?: string;
  cameraPresetExternal?: CameraPreset;
  storyMode?: boolean;
  hideHud?: boolean;
  showBoundary?: boolean;
  showPacket?: boolean;
  interceptionProgress?: number;
  backdropImage?: string;
  backdropOpacity?: number;
  fullBleed?: boolean;
}

export type CameraPreset = 'overview' | 'agent' | 'boundary' | 'principal' | 'action';

interface CameraTarget {
  pos: THREE.Vector3;
  look: THREE.Vector3;
}

const CAMERA_PRESETS: Record<CameraPreset, CameraTarget> = {
  overview: {
    pos: new THREE.Vector3(0, 6.2, 12.2),
    look: new THREE.Vector3(0, 0.7, 0),
  },
  agent: {
    pos: new THREE.Vector3(-1.6, 2.7, 5.2),
    look: new THREE.Vector3(-1.6, 1.0, 0),
  },
  boundary: {
    pos: new THREE.Vector3(2.8, 3.8, 7.6),
    look: new THREE.Vector3(1.1, 0.8, 0),
  },
  principal: {
    pos: new THREE.Vector3(-6.2, 4.4, 6.8),
    look: new THREE.Vector3(-4.2, 1.1, 0),
  },
  action: {
    pos: new THREE.Vector3(4.2, 3.2, 6.8),
    look: new THREE.Vector3(2.4, 0.8, 1.1),
  },
};

// Reusable module-scope math helpers (Zero GC in render loop)
const _camGoalPos = new THREE.Vector3();
const _camGoalLook = new THREE.Vector3();
const _packetPos = new THREE.Vector3();
const _tempColor = new THREE.Color();

const _bgDark = new THREE.Color(0x050914);
const _bgLight = new THREE.Color(0xeef3f9);
const _floorDark = new THREE.Color(0x0a1326);
const _floorLight = new THREE.Color(0xe2eaf4);
const _titaniumDark = new THREE.Color(0x475569);
const _titaniumLight = new THREE.Color(0x94a3b8);
const _slateDark = new THREE.Color(0x0f172a);
const _slateLight = new THREE.Color(0xcbd5e1);
const _hemiSkyDark = new THREE.Color(0x7dd3fc);
const _hemiSkyLight = new THREE.Color(0xe0f2fe);
const _hemiGroundDark = new THREE.Color(0x0b1120);
const _hemiGroundLight = new THREE.Color(0xcbd5e1);
const _pulseMat = new THREE.Matrix4();

function createProceduralGridTexture(isDark: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = isDark ? '#050914' : '#eef3f9';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = isDark
      ? 'rgba(56, 189, 248, 0.14)'
      : 'rgba(15, 23, 42, 0.09)';
    ctx.lineWidth = 1;
    const step = 32;
    for (let i = 0; i <= 512; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    ctx.strokeStyle = isDark
      ? 'rgba(56, 189, 248, 0.25)'
      : 'rgba(2, 132, 199, 0.18)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, 512, 512);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 10);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.28)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function MandateSpace({
  decision,
  hasViolation,
  amountInr,
  agentName,
  principalName,
  registeredAccount,
  requestedAccount,
  payee,
  heightClass = 'h-[460px]',
  cameraPresetExternal,
  storyMode = false,
  hideHud = false,
  showBoundary = true,
  showPacket = true,
  interceptionProgress,
  backdropImage,
  backdropOpacity = 0.72,
  fullBleed = false,
}: MandateSpaceProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [preset, setPreset] = useState<CameraPreset>(
    cameraPresetExternal || 'overview',
  );
  const [hudVisible, setHudVisible] = useState(!hideHud);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  // Sync live React props & theme into mutable refs so Three.js canvas never tears down
  const stateRef = useRef({
    decision,
    hasViolation,
    preset: cameraPresetExternal || 'overview',
    cameraTweenActive: Boolean(cameraPresetExternal),
    storyMode,
    showBoundary,
    showPacket,
    isDark,
    interceptionProgress,
    backdropOpacity,
  });

  useEffect(() => {
    stateRef.current.decision = decision;
    stateRef.current.hasViolation = hasViolation;
    stateRef.current.storyMode = storyMode;
    stateRef.current.showBoundary = showBoundary;
    stateRef.current.showPacket = showPacket;
    stateRef.current.isDark = isDark;
    stateRef.current.interceptionProgress = interceptionProgress;
    stateRef.current.backdropOpacity = backdropOpacity;
  }, [
    decision,
    hasViolation,
    storyMode,
    showBoundary,
    showPacket,
    isDark,
    interceptionProgress,
    backdropOpacity,
  ]);

  useEffect(() => {
    if (cameraPresetExternal) {
      setPreset(cameraPresetExternal);
      stateRef.current.preset = cameraPresetExternal;
      stateRef.current.cameraTweenActive = true;
    }
  }, [cameraPresetExternal]);

  const handleSelectPreset = (next: CameraPreset) => {
    setPreset(next);
    stateRef.current.preset = next;
    stateRef.current.cameraTweenActive = true;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Software WebGL Guard per Three.js skill directive
    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglUnavailable(true);
    };
    const handleContextRestored = () => {
      setWebglUnavailable(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    const initialBg = stateRef.current.isDark ? 0x050914 : 0xeef3f9;
    scene.background = new THREE.Color(initialBg);
    scene.fog = new THREE.FogExp2(initialBg, 0.028);

    // Mandatory Studio Environment Reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(
      44,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      120,
    );
    camera.position.copy(CAMERA_PRESETS.overview.pos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enableZoom = !storyMode;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minDistance = 4.5;
    controls.maxDistance = 20;
    controls.target.copy(CAMERA_PRESETS.overview.look);
    controls.addEventListener('start', () => {
      stateRef.current.cameraTweenActive = false;
    });

    // Three-point studio lighting + cool hemisphere fill
    const hemiLight = new THREE.HemisphereLight(
      stateRef.current.isDark ? 0x7dd3fc : 0xe0f2fe,
      stateRef.current.isDark ? 0x0b1120 : 0xcbd5e1,
      stateRef.current.isDark ? 0.75 : 1.15,
    );
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfef3c7, stateRef.current.isDark ? 1.9 : 2.1);
    keyLight.position.set(6, 11, 7);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, stateRef.current.isDark ? 1.1 : 0.65);
    rimLight.position.set(-7, 5, -8);
    scene.add(rimLight);

    // Ground Plane + Dual-Theme Procedural Architectural Grid
    const darkGridTex = createProceduralGridTexture(true);
    const lightGridTex = createProceduralGridTexture(false);
    darkGridTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    lightGridTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    let appliedGridDark = stateRef.current.isDark;

    const floorGeo = new THREE.CircleGeometry(28, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: stateRef.current.isDark ? 0x0a1326 : 0xe2eaf4,
      map: appliedGridDark ? darkGridTex : lightGridTex,
      roughness: 0.74,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const shadowTex = createContactShadowTexture();
    const makeContactShadow = (x: number, z: number, scale: number) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(scale, scale),
        new THREE.MeshBasicMaterial({
          map: shadowTex,
          transparent: true,
          depthWrite: false,
          opacity: 0.65,
        }),
      );
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0.015, z);
      scene.add(m);
      return m;
    };

    // Shared PBR Materials
    const brushedTitaniumMat = new THREE.MeshPhysicalMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.24,
      anisotropy: 0.7,
    });
    const darkSlateMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.55,
      roughness: 0.52,
    });
    const cyanCrystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x22d3ee,
      emissive: 0x0891b2,
      emissiveIntensity: 0.45,
      metalness: 0.15,
      roughness: 0.15,
      clearcoat: 1.0,
    });

    // 1. PRINCIPAL NODE (Composite Group at x = -4.6)
    const principalGroup = new THREE.Group();
    principalGroup.position.set(-4.6, 0, 0);
    makeContactShadow(-4.6, 0, 3.0);

    const pBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 1.15, 0.28, 32),
      darkSlateMat,
    );
    pBase.position.y = 0.14;
    pBase.castShadow = true;
    principalGroup.add(pBase);

    const pCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.85, 0.22, 32),
      brushedTitaniumMat,
    );
    pCollar.position.y = 0.39;
    principalGroup.add(pCollar);

    const pCore = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.55, 0),
      cyanCrystalMat,
    );
    pCore.position.y = 1.25;
    pCore.castShadow = true;
    principalGroup.add(pCore);

    const pHalo = new THREE.Mesh(
      new THREE.TorusGeometry(0.82, 0.035, 16, 48),
      brushedTitaniumMat,
    );
    pHalo.position.y = 1.25;
    pHalo.rotation.x = Math.PI / 2.6;
    principalGroup.add(pHalo);
    scene.add(principalGroup);

    // 2. AGENT NODE (Composite Group at x = -1.6)
    const agentGroup = new THREE.Group();
    agentGroup.position.set(-1.6, 0, 0);
    makeContactShadow(-1.6, 0, 2.4);

    const aPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.62, 0.78, 0.22, 24),
      darkSlateMat,
    );
    aPedestal.position.y = 0.11;
    agentGroup.add(aPedestal);

    const aBody = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.42, 0),
      new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.3,
        metalness: 0.75,
        roughness: 0.22,
      }),
    );
    aBody.position.y = 1.05;
    aBody.castShadow = true;
    agentGroup.add(aBody);

    const aRing1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.64, 0.025, 12, 40),
      brushedTitaniumMat,
    );
    aRing1.position.y = 1.05;
    agentGroup.add(aRing1);

    const aRing2 = new THREE.Mesh(
      new THREE.TorusGeometry(0.75, 0.02, 12, 40),
      cyanCrystalMat,
    );
    aRing2.position.y = 1.05;
    aRing2.rotation.y = Math.PI / 2;
    agentGroup.add(aRing2);
    scene.add(agentGroup);

    // Delegation conduit beam (Principal -> Agent)
    const delegationCurve = new THREE.LineCurve3(
      new THREE.Vector3(-4.0, 1.15, 0),
      new THREE.Vector3(-2.2, 1.05, 0),
    );
    const delegationTube = new THREE.Mesh(
      new THREE.TubeGeometry(delegationCurve, 16, 0.04, 12, false),
      cyanCrystalMat,
    );
    scene.add(delegationTube);

    // 3. MANDATE BOUNDARY ASSEMBLY (Centered around Principal+Agent, Gate at x = +1.35)
    const boundaryGroup = new THREE.Group();
    boundaryGroup.position.set(-2.3, 0, 0);

    const boundaryRadius = 3.65;
    const boundaryRingMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      emissive: 0x0284c7,
      emissiveIntensity: 0.55,
      metalness: 0.6,
      roughness: 0.25,
    });

    const outerBoundaryRing = new THREE.Mesh(
      new THREE.TorusGeometry(boundaryRadius, 0.045, 16, 96),
      boundaryRingMat,
    );
    outerBoundaryRing.rotation.x = Math.PI / 2;
    outerBoundaryRing.position.y = 0.06;
    boundaryGroup.add(outerBoundaryRing);

    const verticalGateArc = new THREE.Mesh(
      new THREE.TorusGeometry(1.45, 0.055, 16, 64, Math.PI),
      boundaryRingMat,
    );
    verticalGateArc.position.set(boundaryRadius, 0.05, 0);
    verticalGateArc.rotation.y = Math.PI / 2;
    boundaryGroup.add(verticalGateArc);

    // Instanced calibration ticks around Mandate Boundary (36 precision markers)
    const tickGeo = new THREE.BoxGeometry(0.05, 0.14, 0.2);
    const tickMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.7,
      roughness: 0.3,
    });
    const tickCount = 36;
    const tickInstanced = new THREE.InstancedMesh(tickGeo, tickMat, tickCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < tickCount; i++) {
      const angle = (i / tickCount) * Math.PI * 2;
      dummy.position.set(
        Math.cos(angle) * boundaryRadius,
        0.1,
        Math.sin(angle) * boundaryRadius,
      );
      dummy.rotation.set(0, -angle, 0);
      dummy.updateMatrix();
      tickInstanced.setMatrixAt(i, dummy.matrix);
    }
    tickInstanced.computeBoundingSphere();
    boundaryGroup.add(tickInstanced);
    scene.add(boundaryGroup);

    // Interception Shield Mesh at Gate (activates on BLOCK / VIOLATION)
    const shieldMat = new THREE.MeshPhysicalMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const shieldMesh = new THREE.Mesh(
      new THREE.CircleGeometry(1.32, 32, 0, Math.PI),
      shieldMat,
    );
    shieldMesh.position.set(1.35, 0.08, 0.9);
    shieldMesh.rotation.y = Math.PI / 2.2;
    scene.add(shieldMesh);

    // 4. REGISTERED DESTINATION NODE (Inside Allowed Settlement Rail at x = 4.3, z = -0.6)
    const regDestGroup = new THREE.Group();
    regDestGroup.position.set(4.3, 0, -0.65);
    makeContactShadow(4.3, -0.65, 2.2);

    const regBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.58, 0.72, 0.22, 24),
      darkSlateMat,
    );
    regBase.position.y = 0.11;
    regDestGroup.add(regBase);

    const regBeacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.9, 24),
      new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.5,
        metalness: 0.35,
        roughness: 0.25,
      }),
    );
    regBeacon.position.y = 0.72;
    regDestGroup.add(regBeacon);
    scene.add(regDestGroup);

    // 5. ROGUE OUTSIDE DESTINATION NODE (Outside Mandate at x = 4.3, z = +2.3)
    const rogueDestGroup = new THREE.Group();
    rogueDestGroup.position.set(4.3, 0, 2.3);
    makeContactShadow(4.3, 2.3, 2.0);

    const rogueBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.65, 0.2, 6),
      darkSlateMat,
    );
    rogueBase.position.y = 0.1;
    rogueDestGroup.add(rogueBase);

    const rogueMat = new THREE.MeshPhysicalMaterial({
      color: 0xef4444,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.35,
      metalness: 0.5,
      roughness: 0.35,
    });
    const rogueSpike = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.38, 0),
      rogueMat,
    );
    rogueSpike.position.y = 0.82;
    rogueDestGroup.add(rogueSpike);
    scene.add(rogueDestGroup);

    // 6. TRANSACTION PACKET (Composite 3-part assembly)
    const packetGroup = new THREE.Group();
    const packetCoreMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.75,
      metalness: 0.2,
      roughness: 0.12,
      clearcoat: 1.0,
    });
    const packetCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.26, 1),
      packetCoreMat,
    );
    packetGroup.add(packetCore);

    const packetShellRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.025, 12, 32),
      brushedTitaniumMat,
    );
    packetGroup.add(packetShellRing);

    const packetHoldRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.02, 12, 32),
      new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0,
      }),
    );
    packetHoldRing.rotation.x = Math.PI / 2;
    packetGroup.add(packetHoldRing);
    scene.add(packetGroup);

    // 7. STEP-UP PRINCIPAL VERIFICATION BEAM (Connects Packet -> Principal when STEP-UP / HOLD)
    const stepUpMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0,
    });
    const stepUpBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 1, 12),
      stepUpMat,
    );
    scene.add(stepUpBeam);

    // Trajectory guide rails (Valid path vs Deviation path)
    const validCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.6, 1.05, 0),
      new THREE.Vector3(1.35, 1.05, -0.25),
      new THREE.Vector3(4.3, 0.85, -0.65),
    ]);
    const validRail = new THREE.Mesh(
      new THREE.TubeGeometry(validCurve, 40, 0.022, 8, false),
      new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.35,
      }),
    );
    scene.add(validRail);

    const rogueCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.6, 1.05, 0),
      new THREE.Vector3(1.25, 1.05, 0.95),
      new THREE.Vector3(4.3, 0.85, 2.3),
    ]);
    const rogueRailMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.15,
    });
    const rogueRail = new THREE.Mesh(
      new THREE.TubeGeometry(rogueCurve, 40, 0.022, 8, false),
      rogueRailMat,
    );
    scene.add(rogueRail);

    // 8. BANK / RISK VERIFICATION GATE PILLARS (Composite checkpoint at boundary x = 1.35)
    const bankGateGroup = new THREE.Group();
    bankGateGroup.position.set(1.35, 0, -0.25);
    const gatePillarGeo = new THREE.BoxGeometry(0.14, 1.45, 0.14);
    const gateLeft = new THREE.Mesh(gatePillarGeo, brushedTitaniumMat);
    gateLeft.position.set(0, 0.725, -1.25);
    gateLeft.castShadow = true;
    const gateRight = new THREE.Mesh(gatePillarGeo, brushedTitaniumMat);
    gateRight.position.set(0, 0.725, 1.25);
    gateRight.castShadow = true;
    bankGateGroup.add(gateLeft, gateRight);
    boundaryGroup.add(bankGateGroup);
    // Offset back so bankGateGroup sits cleanly at world x = 1.35 relative to boundaryGroup (-2.3)
    bankGateGroup.position.set(3.65, 0, -0.25);

    // 9. RESTRAINED DATA STREAM PULSES (12 instanced micro-nodes flowing along valid rail)
    const streamCount = 12;
    const streamGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const streamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.55,
    });
    const streamMesh = new THREE.InstancedMesh(streamGeo, streamMat, streamCount);
    streamMesh.frustumCulled = false;
    scene.add(streamMesh);

    // 10. OPTIONAL SPATIAL REAL-LIFE PHOTO BACKDROP PLANE (Embedded in 3D Z-depth)
    let backdropTex: THREE.Texture | null = null;
    let backdropMat: THREE.MeshBasicMaterial | null = null;
    let backdropMesh: THREE.Mesh | null = null;
    if (backdropImage) {
      backdropTex = new THREE.TextureLoader().load(backdropImage, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        tex.needsUpdate = true;
      });
      backdropTex.colorSpace = THREE.SRGBColorSpace;
      backdropMat = new THREE.MeshBasicMaterial({
        map: backdropTex,
        transparent: true,
        opacity: stateRef.current.backdropOpacity,
        color: stateRef.current.isDark ? 0x9ab3cc : 0xeaf2fa,
        depthWrite: false,
      });
      backdropMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(16, 9),
        backdropMat,
      );
      backdropMesh.position.set(0.3, 2.5, -4.4);
      scene.add(backdropMesh);
    }

    // Pre-warm shaders when GPU accelerated
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop with software WebGL afterDraw pacing
    let frameId = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const status = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      elapsed += dt;

      const {
        decision: curDecision,
        hasViolation: curViolation,
        preset: curPreset,
        cameraTweenActive,
        showBoundary: curShowBoundary,
        showPacket: curShowPacket,
        isDark: curDark,
        interceptionProgress: curIntercept,
        backdropOpacity: curBackdropOpacity,
      } = stateRef.current;

      if (backdropMat && backdropMesh) {
        backdropMat.opacity = THREE.MathUtils.damp(
          backdropMat.opacity,
          curBackdropOpacity,
          5,
          dt,
        );
        _tempColor.setHex(curDark ? 0x9ab3cc : 0xe2ecf6);
        backdropMat.color.lerp(_tempColor, 0.12);
        backdropMesh.rotation.y = Math.sin(elapsed * 0.25) * 0.035;
      }

      // Smoothly transition 3D atmosphere, lighting, and materials between Light & Dark Mode
      if (curDark !== appliedGridDark) {
        appliedGridDark = curDark;
        floorMat.map = curDark ? darkGridTex : lightGridTex;
        floorMat.needsUpdate = true;
      }

      if (scene.background instanceof THREE.Color) {
        scene.background.lerp(curDark ? _bgDark : _bgLight, 0.12);
      }
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.lerp(curDark ? _bgDark : _bgLight, 0.12);
        scene.fog.density = THREE.MathUtils.damp(scene.fog.density, curDark ? 0.032 : 0.018, 5, dt);
      }
      floorMat.color.lerp(curDark ? _floorDark : _floorLight, 0.12);
      brushedTitaniumMat.color.lerp(curDark ? _titaniumDark : _titaniumLight, 0.12);
      darkSlateMat.color.lerp(curDark ? _slateDark : _slateLight, 0.12);
      hemiLight.color.lerp(curDark ? _hemiSkyDark : _hemiSkyLight, 0.12);
      hemiLight.groundColor.lerp(curDark ? _hemiGroundDark : _hemiGroundLight, 0.12);
      hemiLight.intensity = THREE.MathUtils.damp(hemiLight.intensity, curDark ? 0.75 : 1.2, 5, dt);
      rimLight.intensity = THREE.MathUtils.damp(rimLight.intensity, curDark ? 1.1 : 0.6, 5, dt);
      cyanCrystalMat.emissiveIntensity = THREE.MathUtils.damp(
        cyanCrystalMat.emissiveIntensity,
        curDark ? 0.45 : 0.18,
        5,
        dt,
      );
      boundaryRingMat.emissiveIntensity = THREE.MathUtils.damp(
        boundaryRingMat.emissiveIntensity,
        curDark ? 0.55 : 0.22,
        5,
        dt,
      );

      boundaryGroup.visible = curShowBoundary;
      packetGroup.visible = curShowPacket;

      // Update restrained ambient transaction stream pulses
      const streamSpeed =
        curDecision === 'HOLD' ||
        curDecision === 'STEP-UP' ||
        curDecision === 'BLOCK'
          ? 0.03
          : 0.22;
      for (let i = 0; i < streamCount; i++) {
        const st = ((elapsed * streamSpeed) + i / streamCount) % 1;
        validCurve.getPointAt(st, _packetPos);
        _pulseMat.makeTranslation(_packetPos.x, _packetPos.y, _packetPos.z);
        streamMesh.setMatrixAt(i, _pulseMat);
      }
      streamMesh.instanceMatrix.needsUpdate = true;
      streamMat.opacity = curShowPacket
        ? curDecision === 'BLOCK'
          ? 0.18
          : curDark
            ? 0.55
            : 0.35
        : 0;

      // Smooth damped camera preset transitions
      if (cameraTweenActive) {
        const target = CAMERA_PRESETS[curPreset];
        _camGoalPos.copy(target.pos);
        _camGoalLook.copy(target.look);
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _camGoalPos.x, 4.2, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _camGoalPos.y, 4.2, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _camGoalPos.z, 4.2, dt);
        controls.target.x = THREE.MathUtils.damp(controls.target.x, _camGoalLook.x, 4.2, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _camGoalLook.y, 4.2, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _camGoalLook.z, 4.2, dt);
        if (camera.position.distanceTo(_camGoalPos) < 0.04) {
          stateRef.current.cameraTweenActive = false;
        }
      }

      // Idle rotations (calm down during FREEZE / HOLD / BLOCK)
      const isFrozenState =
        curDecision === 'BLOCK' ||
        (curDecision === 'HOLD' &&
          curIntercept !== undefined &&
          curIntercept > 0.65);
      const motionScale = isFrozenState ? 0.2 : 1.0;
      pCore.rotation.y += dt * 0.65 * motionScale;
      pHalo.rotation.z += dt * 0.35 * motionScale;
      aBody.rotation.y -= dt * 0.5 * motionScale;
      aRing1.rotation.x += dt * 0.8 * motionScale;
      aRing2.rotation.z -= dt * 0.6 * motionScale;
      packetShellRing.rotation.x += dt * 1.6 * motionScale;
      packetShellRing.rotation.y += dt * 1.1 * motionScale;

      // Restore default destination beacon scale when not blocked
      const targetRogueScale = curDecision === 'BLOCK' ? 0.62 : 1.0;
      rogueSpike.scale.x = THREE.MathUtils.damp(rogueSpike.scale.x, targetRogueScale, 5, dt);
      rogueSpike.scale.y = THREE.MathUtils.damp(rogueSpike.scale.y, targetRogueScale, 5, dt);
      rogueSpike.scale.z = THREE.MathUtils.damp(rogueSpike.scale.z, targetRogueScale, 5, dt);
      rogueMat.emissiveIntensity = THREE.MathUtils.damp(
        rogueMat.emissiveIntensity,
        curDecision === 'BLOCK' ? 0.06 : 0.35,
        5,
        dt,
      );

      // State-driven choreography
      if (curDecision === 'ALLOW' && !curViolation) {
        // Smoothly flows through Mandate Boundary to Registered Destination
        const t = (elapsed * 0.38) % 1;
        validCurve.getPointAt(t, _packetPos);
        packetGroup.position.lerp(_packetPos, 0.25);

        _tempColor.setHex(0x10b981);
        packetCoreMat.color.lerp(_tempColor, 0.12);
        packetCoreMat.emissive.lerp(_tempColor, 0.12);

        _tempColor.setHex(0x0ea5e9);
        boundaryRingMat.color.lerp(_tempColor, 0.12);
        boundaryRingMat.emissive.lerp(_tempColor, 0.12);

        shieldMat.opacity = THREE.MathUtils.damp(shieldMat.opacity, 0, 8, dt);
        stepUpMat.opacity = THREE.MathUtils.damp(stepUpMat.opacity, 0, 8, dt);
        (packetHoldRing.material as THREE.MeshBasicMaterial).opacity =
          THREE.MathUtils.damp(
            (packetHoldRing.material as THREE.MeshBasicMaterial).opacity,
            0,
            8,
            dt,
          );
        rogueRailMat.opacity = THREE.MathUtils.damp(rogueRailMat.opacity, 0.12, 6, dt);
      } else if (curDecision === 'STEP-UP') {
        // Pauses at the Mandate Boundary and opens visual link to Principal
        const curve = curViolation ? rogueCurve : validCurve;
        curve.getPointAt(0.46, _packetPos);
        _packetPos.y += Math.sin(elapsed * 2.2) * 0.05;
        packetGroup.position.lerp(_packetPos, 0.15);

        _tempColor.setHex(0x22d3ee);
        packetCoreMat.color.lerp(_tempColor, 0.12);
        packetCoreMat.emissive.lerp(_tempColor, 0.12);

        _tempColor.setHex(curViolation ? 0xf59e0b : 0x22d3ee);
        boundaryRingMat.color.lerp(_tempColor, 0.12);
        boundaryRingMat.emissive.lerp(_tempColor, 0.12);

        // Link packet to Principal Node (-4.6, 1.25, 0)
        const pOrigin = principalGroup.position;
        const dx = packetGroup.position.x - pOrigin.x;
        const dy = packetGroup.position.y - 1.25;
        const dz = packetGroup.position.z - pOrigin.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        stepUpBeam.position.set(
          (packetGroup.position.x + pOrigin.x) * 0.5,
          (packetGroup.position.y + 1.25) * 0.5,
          (packetGroup.position.z + pOrigin.z) * 0.5,
        );
        stepUpBeam.scale.set(1, dist, 1);
        stepUpBeam.lookAt(packetGroup.position);
        stepUpBeam.rotateX(Math.PI / 2);

        stepUpMat.opacity = THREE.MathUtils.damp(stepUpMat.opacity, 0.72, 6, dt);
        shieldMat.opacity = THREE.MathUtils.damp(shieldMat.opacity, curViolation ? 0.28 : 0, 6, dt);
        (packetHoldRing.material as THREE.MeshBasicMaterial).opacity =
          THREE.MathUtils.damp(
            (packetHoldRing.material as THREE.MeshBasicMaterial).opacity,
            0.55,
            6,
            dt,
          );
        rogueRailMat.opacity = THREE.MathUtils.damp(
          rogueRailMat.opacity,
          curViolation ? 0.6 : 0.12,
          6,
          dt,
        );
      } else if (curDecision === 'HOLD') {
        // Scroll-aware physical deceleration: approach -> slow down -> boundary response -> FREEZE -> HOLD
        const curve = curViolation ? rogueCurve : validCurve;
        let holdPoint = 0.42;
        if (curIntercept !== undefined) {
          // Map interceptionProgress [0.3..0.8] smoothly from 0.12 up to 0.42 (ease-out freeze)
          const norm = Math.min(1, Math.max(0, (curIntercept - 0.28) / 0.48));
          const eased = 1 - Math.pow(1 - norm, 3);
          holdPoint = 0.1 + eased * 0.32;
        }
        curve.getPointAt(holdPoint, _packetPos);
        packetGroup.position.lerp(_packetPos, 0.16);

        _tempColor.setHex(0xf59e0b);
        packetCoreMat.color.lerp(_tempColor, 0.15);
        packetCoreMat.emissive.lerp(_tempColor, 0.15);

        _tempColor.setHex(curViolation ? 0xef4444 : 0xf59e0b);
        boundaryRingMat.color.lerp(_tempColor, 0.12);
        boundaryRingMat.emissive.lerp(_tempColor, 0.12);

        packetHoldRing.rotation.z += dt * (isFrozenState ? 0.35 : 1.4);
        (packetHoldRing.material as THREE.MeshBasicMaterial).opacity =
          THREE.MathUtils.damp(
            (packetHoldRing.material as THREE.MeshBasicMaterial).opacity,
            0.85,
            6,
            dt,
          );
        shieldMat.opacity = THREE.MathUtils.damp(
          shieldMat.opacity,
          curViolation ? 0.44 : 0.15,
          6,
          dt,
        );
        // Also softly link to Principal showing STEP-UP readiness
        const pOrigin = principalGroup.position;
        const dx = packetGroup.position.x - pOrigin.x;
        const dy = packetGroup.position.y - 1.25;
        const dz = packetGroup.position.z - pOrigin.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        stepUpBeam.position.set(
          (packetGroup.position.x + pOrigin.x) * 0.5,
          (packetGroup.position.y + 1.25) * 0.5,
          (packetGroup.position.z + pOrigin.z) * 0.5,
        );
        stepUpBeam.scale.set(1, dist, 1);
        stepUpBeam.lookAt(packetGroup.position);
        stepUpBeam.rotateX(Math.PI / 2);
        stepUpMat.opacity = THREE.MathUtils.damp(stepUpMat.opacity, 0.45, 6, dt);
        rogueRailMat.opacity = THREE.MathUtils.damp(
          rogueRailMat.opacity,
          curViolation ? 0.78 : 0.15,
          6,
          dt,
        );
      } else {
        // BLOCK: Security boundary closes cleanly, path is interrupted, destination becomes inaccessible, packet held inside containment
        rogueCurve.getPointAt(0.22, _packetPos);
        packetGroup.position.lerp(_packetPos, 0.14);

        _tempColor.setHex(0xef4444);
        packetCoreMat.color.lerp(_tempColor, 0.2);
        packetCoreMat.emissive.lerp(_tempColor, 0.2);
        boundaryRingMat.color.lerp(_tempColor, 0.16);
        boundaryRingMat.emissive.lerp(_tempColor, 0.16);

        shieldMat.opacity = THREE.MathUtils.damp(shieldMat.opacity, 0.78, 8, dt);
        stepUpMat.opacity = THREE.MathUtils.damp(stepUpMat.opacity, 0, 8, dt);
        (packetHoldRing.material as THREE.MeshBasicMaterial).opacity =
          THREE.MathUtils.damp(
            (packetHoldRing.material as THREE.MeshBasicMaterial).opacity,
            0.7,
            6,
            dt,
          );
        rogueRailMat.opacity = THREE.MathUtils.damp(rogueRailMat.opacity, 0.14, 6, dt);
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener(
        'webglcontextrestored',
        handleContextRestored,
      );
      controls.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
      darkGridTex.dispose();
      lightGridTex.dispose();
      shadowTex.dispose();
      backdropTex?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [backdropImage]);

  const stateExplanation =
    decision === 'ALLOW'
      ? `Path verified: ${agentName} executing ${formatCompactInr(amountInr)} inside mandate boundary to ${payee} (${requestedAccount}).`
      : decision === 'HOLD'
        ? `Action frozen at boundary: ${formatCompactInr(amountInr)} to ${requestedAccount} diverges from registered ${registeredAccount}.`
        : decision === 'STEP-UP'
          ? `Boundary paused: Principal verification channel open to ${principalName}.`
          : `Interception active: ${formatCompactInr(amountInr)} attempt toward ${requestedAccount} blocked before crossing boundary.`;

  return (
    <div
      className={`relative w-full ${heightClass} ${
        fullBleed
          ? 'bg-[#EEF3F9] dark:bg-[#050914]'
          : 'rounded-xl border border-slate-200 dark:border-slate-800 bg-[#EEF3F9] dark:bg-[#050914]'
      } overflow-hidden select-none transition-colors duration-300`}
    >
      {/* Dedicated isolated WebGL mount node */}
      {!webglUnavailable ? (
        <div ref={mountRef} className="w-full h-full" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-100 dark:bg-[#070C1A]">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2">
            Mandate Space Spatial View (2D Fallback)
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mb-4">
            {stateExplanation}
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-700 dark:text-slate-300">
            <span>Principal: {principalName}</span>
            <span>→</span>
            <span>Agent: {agentName}</span>
            <span>→</span>
            <span
              className={
                hasViolation
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }
            >
              {decision}
            </span>
          </div>
        </div>
      )}

      {/* Minimal Top-Left Spatial Telemetry Context */}
      {!hideHud && (
        <div className="pointer-events-none absolute top-4 left-4 right-4 flex items-start justify-between gap-4">
          <div className="bg-white/95 dark:bg-[#070C1A]/90 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2 max-w-md shadow-xs">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-900 dark:text-slate-200">
                Mandate Space
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-cyan-700 dark:text-cyan-300 font-semibold">
                {decision}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {formatCompactInr(amountInr)}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-snug">
              {stateExplanation}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-4 bg-white/95 dark:bg-[#070C1A]/90 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-600 dark:text-slate-400 shadow-xs">
            <span>Principal → Agent → Boundary</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-mono">
              Reg {registeredAccount}
            </span>
            {hasViolation && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-red-600 dark:text-red-400 font-mono">
                  Req {requestedAccount}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Collapsible Bottom Control Dock (Zero Center Occlusion) */}
      {!hideHud && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 max-w-[94vw]">
          <button
            type="button"
            onClick={() => setHudVisible((v) => !v)}
            className="mb-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/95 dark:bg-[#070C1A]/95 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors whitespace-nowrap shadow-xs"
          >
            {hudVisible ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                Hide Controls
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                Show Controls
              </>
            )}
          </button>

          {hudVisible && (
            <div className="flex flex-wrap items-center gap-1.5 px-2.5 py-2 rounded-lg bg-white/95 dark:bg-[#070C1A]/95 border border-slate-200 dark:border-slate-800 shadow-sm">
              {(
                [
                  { id: 'overview', label: 'Full Topology' },
                  { id: 'agent', label: 'Agent Node' },
                  { id: 'principal', label: 'Principal Node' },
                  { id: 'boundary', label: 'Mandate Boundary' },
                  { id: 'action', label: 'Decision Point' },
                ] as const
              ).map((cam) => (
                <button
                  key={cam.id}
                  type="button"
                  onClick={() => handleSelectPreset(cam.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    preset === cam.id
                      ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cam.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handleSelectPreset('overview')}
                title="Reset camera"
                className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
