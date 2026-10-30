import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EnergyFluxValues, UnitDisplay } from '../types';
import { formatFlux } from '../utils/physicsEngine';
import { Eye, Rotate3d, ZoomIn, ZoomOut, Layers, Sparkles } from 'lucide-react';

interface ThreeCanvas3DProps {
  fluxes: EnergyFluxValues;
  unit: UnitDisplay;
  onSelectFlux?: (fluxKey: string) => void;
}

export const ThreeCanvas3D: React.FC<ThreeCanvas3DProps> = ({
  fluxes,
  unit,
  onSelectFlux,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'solar' | 'terrestrial' | 'greenhouse'>('all');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [hovered3DNode, setHovered3DNode] = useState<string | null>(null);

  // References for dynamic animation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);
  const atmoGlowMeshRef = useRef<THREE.Mesh | null>(null);
  const particleSystemsRef = useRef<{ particles: THREE.Points; speed: number; dir: number }[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x040814);
    scene.fog = new THREE.FogExp2(0x040814, 0.015);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(16, 10, 22);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // 4. Lights
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.5);
    sunLight.position.set(-25, 18, -10);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x223355, 0.8);
    scene.add(ambientLight);

    const backFillLight = new THREE.DirectionalLight(0x3874b5, 0.6);
    backFillLight.position.set(20, -10, 20);
    scene.add(backFillLight);

    // 5. Starfield Background
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1200;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 200;
      starPositions[i + 1] = (Math.random() - 0.5) * 200;
      starPositions[i + 2] = (Math.random() - 0.5) * 200;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.8,
      transparent: true,
      opacity: 0.8,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 6. Glowing 3D Sun
    const sunGroup = new THREE.Group();
    sunGroup.position.copy(sunLight.position);

    const sunCoreGeo = new THREE.SphereGeometry(2.5, 32, 32);
    const sunCoreMat = new THREE.MeshBasicMaterial({
      color: 0xffe680,
    });
    const sunMesh = new THREE.Mesh(sunCoreGeo, sunCoreMat);
    sunGroup.add(sunMesh);

    // Sun Corona Glow Billboard
    const canvasCorona = document.createElement('canvas');
    canvasCorona.width = 128;
    canvasCorona.height = 128;
    const ctxCorona = canvasCorona.getContext('2d');
    if (ctxCorona) {
      const grad = ctxCorona.createRadialGradient(64, 64, 10, 64, 64, 64);
      grad.addColorStop(0, 'rgba(255, 240, 150, 1)');
      grad.addColorStop(0.3, 'rgba(255, 180, 50, 0.6)');
      grad.addColorStop(0.7, 'rgba(255, 100, 20, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctxCorona.fillStyle = grad;
      ctxCorona.fillRect(0, 0, 128, 128);
    }
    const coronaTex = new THREE.CanvasTexture(canvasCorona);
    const coronaMat = new THREE.SpriteMaterial({
      map: coronaTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const coronaSprite = new THREE.Sprite(coronaMat);
    coronaSprite.scale.set(12, 12, 1);
    sunGroup.add(coronaSprite);
    scene.add(sunGroup);

    // 7. Earth Globe Construction
    const earthRadius = 6.0;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);

    // Procedural Earth surface texture via Canvas
    const earthCanvas = document.createElement('canvas');
    earthCanvas.width = 1024;
    earthCanvas.height = 512;
    const ctxEarth = earthCanvas.getContext('2d');
    if (ctxEarth) {
      // Ocean deep blue
      const oceanGrad = ctxEarth.createLinearGradient(0, 0, 0, 512);
      oceanGrad.addColorStop(0, '#0b2545');
      oceanGrad.addColorStop(0.5, '#133a68');
      oceanGrad.addColorStop(1, '#0b2545');
      ctxEarth.fillStyle = oceanGrad;
      ctxEarth.fillRect(0, 0, 1024, 512);

      // Continents representation
      ctxEarth.fillStyle = '#2d5a27';
      // Eurasia & Africa
      ctxEarth.beginPath();
      ctxEarth.ellipse(550, 200, 180, 120, 0.2, 0, Math.PI * 2);
      ctxEarth.fill();
      ctxEarth.beginPath();
      ctxEarth.ellipse(510, 320, 90, 100, -0.1, 0, Math.PI * 2);
      ctxEarth.fill();
      // Americas
      ctxEarth.beginPath();
      ctxEarth.ellipse(240, 180, 110, 90, -0.3, 0, Math.PI * 2);
      ctxEarth.fill();
      ctxEarth.beginPath();
      ctxEarth.ellipse(280, 330, 80, 110, 0.4, 0, Math.PI * 2);
      ctxEarth.fill();
      // Australia
      ctxEarth.beginPath();
      ctxEarth.ellipse(780, 350, 60, 45, 0, 0, Math.PI * 2);
      ctxEarth.fill();
      // Polar Ice caps
      ctxEarth.fillStyle = '#e2f1ff';
      ctxEarth.fillRect(0, 0, 1024, 35);
      ctxEarth.fillRect(0, 480, 1024, 32);
    }
    const earthTex = new THREE.CanvasTexture(earthCanvas);

    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      roughness: 0.65,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.receiveShadow = true;
    scene.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // 8. Cloud Layer Sphere
    const cloudGeo = new THREE.SphereGeometry(earthRadius + 0.15, 48, 48);
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = 512;
    cloudCanvas.height = 256;
    const ctxClouds = cloudCanvas.getContext('2d');
    if (ctxClouds) {
      ctxClouds.fillStyle = 'rgba(0,0,0,0)';
      ctxClouds.fillRect(0, 0, 512, 256);
      ctxClouds.fillStyle = 'rgba(255,255,255,0.7)';
      for (let i = 0; i < 40; i++) {
        const cx = Math.random() * 512;
        const cy = 40 + Math.random() * 170;
        const rw = 20 + Math.random() * 50;
        const rh = 10 + Math.random() * 20;
        ctxClouds.beginPath();
        ctxClouds.ellipse(cx, cy, rw, rh, Math.random(), 0, Math.PI * 2);
        ctxClouds.fill();
      }
    }
    const cloudTex = new THREE.CanvasTexture(cloudCanvas);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.6,
      blending: THREE.NormalBlending,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(cloudMesh);
    cloudsMeshRef.current = cloudMesh;

    // 9. Atmosphere Layer & Greenhouse Blanket Glow
    const atmoGeo = new THREE.SphereGeometry(earthRadius + 1.2, 48, 48);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x4da6ff,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmoMesh);
    atmoGlowMeshRef.current = atmoMesh;

    // 10. Helper function to create 3D Bézier Energy Tubes with pulsing particles
    const createEnergyStream = (
      curve: THREE.QuadraticBezierCurve3 | THREE.CubicBezierCurve3,
      color: number,
      thickness: number,
      particleColor: number,
      particleCount: number,
      flowDir: number = 1
    ) => {
      const group = new THREE.Group();

      // Translucent glowing tube
      const tubeGeo = new THREE.TubeGeometry(curve, 32, thickness, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      group.add(tubeMesh);

      // Flowing photon particles
      const points = curve.getPoints(particleCount);
      const pGeo = new THREE.BufferGeometry().setFromPoints(points);
      const pMat = new THREE.PointsMaterial({
        color: particleColor,
        size: thickness * 2.2,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      });
      const particles = new THREE.Points(pGeo, pMat);
      group.add(particles);

      particleSystemsRef.current.push({
        particles,
        speed: 0.004 * flowDir,
        dir: flowDir,
      });

      scene.add(group);
      return group;
    };

    // Construct 3D Energy Flux Pathways:
    // A. Incoming Solar Beam (Yellow): Sun (-25, 18, -10) -> Earth Atmosphere / Surface
    const solarCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-22, 16, -9),
      new THREE.Vector3(-10, 8, -4),
      new THREE.Vector3(-4.0, 3.5, 2.5)
    );
    createEnergyStream(solarCurve, 0xffea00, 0.45, 0xffffff, 40, 1);

    // B. Atmosphere Solar Reflection (Yellow): from Atmosphere (-4.0, 4.2, 2.5) curving up to Space (2, 15, 6)
    const solarAtmReflectCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-4.0, 4.2, 2.5),
      new THREE.Vector3(-1.0, 9.0, 4.0),
      new THREE.Vector3(4.0, 16.0, 8.0)
    );
    createEnergyStream(solarAtmReflectCurve, 0xfacc15, 0.22, 0xfffaa0, 25, 1);

    // C. Surface Reflection (Yellow): from Earth Ground (-3.8, 3.2, 2.5) bouncing out
    const solarSurfReflectCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-3.8, 3.2, 2.5),
      new THREE.Vector3(0.0, 7.0, 5.0),
      new THREE.Vector3(5.5, 15.0, 10.0)
    );
    createEnergyStream(solarSurfReflectCurve, 0xfde047, 0.12, 0xffffff, 18, 1);

    // D. Surface Thermal Emission (Crimson/Red): Rising from Earth Surface
    const surfEmitCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(2.5, -2.0, 5.0),
      new THREE.Vector3(4.0, 0.0, 6.0),
      new THREE.Vector3(5.5, 3.5, 6.5)
    );
    createEnergyStream(surfEmitCurve, 0xff2a4b, 0.5, 0xff8090, 45, 1);

    // E. Atmospheric Window Direct Escape to Space (Red laser beam)
    const windowCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(4.0, 0.0, 6.0),
      new THREE.Vector3(7.0, 5.0, 9.0),
      new THREE.Vector3(12.0, 12.0, 14.0)
    );
    createEnergyStream(windowCurve, 0xff5555, 0.16, 0xffa0a0, 20, 1);

    // F. Atmospheric Back-Radiation (Crimson Umbrella descending onto ground)
    const backRadCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(5.5, 3.0, 5.5),
      new THREE.Vector3(4.8, 0.5, 4.8),
      new THREE.Vector3(3.2, -1.8, 4.5)
    );
    createEnergyStream(backRadCurve, 0xeb1436, 0.42, 0xff6b81, 40, 1);

    // G. Evaporation & Convection Spirals (Cyan / Teal)
    const evapCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0.5, -3.5, 4.8),
      new THREE.Vector3(1.5, -1.0, 5.5),
      new THREE.Vector3(3.0, 1.5, 6.0)
    );
    createEnergyStream(evapCurve, 0x00e5ff, 0.22, 0xa7f3d0, 25, 1);

    // 11. Mouse / Touch Orbit Controls implementation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !cameraRef.current) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      const cam = cameraRef.current;
      const radius = cam.position.length();
      let theta = Math.atan2(cam.position.x, cam.position.z);
      let phi = Math.acos(Math.max(-1, Math.min(1, cam.position.y / radius)));

      theta -= deltaX * 0.008;
      phi -= deltaY * 0.008;
      phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));

      cam.position.x = radius * Math.sin(phi) * Math.sin(theta);
      cam.position.y = radius * Math.cos(phi);
      cam.position.z = radius * Math.sin(phi) * Math.cos(theta);
      cam.lookAt(0, 0, 0);

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const cam = cameraRef.current;
      const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
      const newLen = cam.position.length() * zoomFactor;
      if (newLen > 10 && newLen < 60) {
        cam.position.multiplyScalar(zoomFactor);
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // 12. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Earth & Cloud Rotations
      if (earthMeshRef.current) {
        earthMeshRef.current.rotation.y += delta * 0.04;
      }
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += delta * 0.06;
      }

      // Auto Camera Orbit when enabled
      if (autoRotate && !isDragging && cameraRef.current) {
        const cam = cameraRef.current;
        const radius = cam.position.length();
        let theta = Math.atan2(cam.position.x, cam.position.z);
        const phi = Math.acos(Math.max(-1, Math.min(1, cam.position.y / radius)));
        theta += delta * 0.08;
        cam.position.x = radius * Math.sin(phi) * Math.sin(theta);
        cam.position.z = radius * Math.sin(phi) * Math.cos(theta);
        cam.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight || 520;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [autoRotate]);

  // Update atmosphere glow color based on greenhouse warming
  useEffect(() => {
    if (atmoGlowMeshRef.current) {
      const mat = atmoGlowMeshRef.current.material as THREE.MeshBasicMaterial;
      if (fluxes.tempAnomalyC > 2) {
        // Warmer earth has more infrared greenhouse trapping (rose-violet tint)
        mat.color.setHex(0xd946ef);
        mat.opacity = 0.28;
      } else if (fluxes.tempAnomalyC < -2) {
        // Cold ice age has crisp icy cyan atmosphere
        mat.color.setHex(0x38bdf8);
        mat.opacity = 0.14;
      } else {
        mat.color.setHex(0x4da6ff);
        mat.opacity = 0.20;
      }
    }
  }, [fluxes]);

  // Camera preset views
  const setCameraView = (view: 'oblique' | 'sun' | 'polar') => {
    if (!cameraRef.current) return;
    const cam = cameraRef.current;
    if (view === 'oblique') {
      cam.position.set(16, 10, 22);
    } else if (view === 'sun') {
      cam.position.set(-18, 12, -8);
    } else if (view === 'polar') {
      cam.position.set(2, 28, 4);
    }
    cam.lookAt(0, 0, 0);
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] rounded-xl overflow-hidden border border-[#1f2937] bg-[#07090e] flex flex-col select-none shadow-2xl">
      {/* 3D Canvas Host Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D HUD Stats Badges Overlay */}
      <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="bg-[#0f111a]/90 backdrop-blur-md border border-[#1f2937] rounded-lg p-3 shadow-xl max-w-xs pointer-events-auto">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-[11px] font-mono font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> FLUX TELEMETRY HUD
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
              WEBGL 3D
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="bg-[#11131c] p-2 rounded border border-[#1f2937]">
              <span className="text-[9px] font-mono text-yellow-400 block uppercase">태양 입사</span>
              <span className="font-mono font-bold text-gray-100 text-xs">
                {formatFlux(fluxes.solarInput, unit)}
              </span>
            </div>
            <div className="bg-[#11131c] p-2 rounded border border-[#1f2937]">
              <span className="text-[9px] font-mono text-rose-400 block uppercase">대기 재복사</span>
              <span className="font-mono font-bold text-rose-300 text-xs">
                {formatFlux(fluxes.atmosphericBackRadiation, unit)}
              </span>
            </div>
            <div className="bg-[#11131c] p-2 rounded border border-[#1f2937]">
              <span className="text-[9px] font-mono text-red-400 block uppercase">지표면 방출</span>
              <span className="font-mono font-bold text-red-300 text-xs">
                {formatFlux(fluxes.surfaceEmission, unit)}
              </span>
            </div>
            <div className="bg-[#11131c] p-2 rounded border border-[#1f2937]">
              <span className="text-[9px] font-mono text-cyan-400 block uppercase">지구 평균 기온</span>
              <span className="font-mono font-bold text-emerald-400 text-xs">
                {fluxes.surfaceTempC > 0 ? `+${fluxes.surfaceTempC}` : fluxes.surfaceTempC}°C
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3D View Controls & Camera Presets */}
      <div className="absolute top-3.5 right-3.5 z-20 flex flex-col gap-2">
        <div className="bg-[#0f111a]/90 backdrop-blur-md border border-[#1f2937] rounded-lg p-1 shadow-xl flex flex-col gap-0.5 text-xs font-mono">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded flex items-center gap-1.5 transition ${
              autoRotate
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#161821]'
            }`}
            title="자동 회전 토글"
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">
              {autoRotate ? 'ROTATION ON' : 'ROTATION PAUSED'}
            </span>
          </button>

          <div className="h-px bg-[#1f2937] my-0.5"></div>

          <button
            onClick={() => setCameraView('oblique')}
            className="px-2 py-1 rounded text-gray-400 hover:text-gray-200 hover:bg-[#161821] text-[10px] text-left transition"
            title="기본 대각 시점"
          >
            OBLIQUE 뷰
          </button>
          <button
            onClick={() => setCameraView('sun')}
            className="px-2 py-1 rounded text-gray-400 hover:text-gray-200 hover:bg-[#161821] text-[10px] text-left transition"
            title="태양 입사각 시점"
          >
            SOLAR 뷰
          </button>
          <button
            onClick={() => setCameraView('polar')}
            className="px-2 py-1 rounded text-gray-400 hover:text-gray-200 hover:bg-[#161821] text-[10px] text-left transition"
            title="극지방 상공 시점"
          >
            POLAR 뷰
          </button>
        </div>
      </div>

      {/* 3D Stream Legend & Interaction Hint */}
      <div className="absolute bottom-3 left-3.5 right-3.5 z-20 flex flex-wrap items-center justify-between gap-2 bg-[#0f111a]/95 border border-[#1f2937] px-3.5 py-1.5 rounded-lg backdrop-blur-md text-[11px] font-mono">
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.6)]"></span>
            <span className="text-yellow-300 font-medium">태양 복사광선 (100)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.6)]"></span>
            <span className="text-rose-300 font-medium">지표 적외방출 ({formatFlux(fluxes.surfaceEmission, unit)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_5px_rgba(220,38,38,0.6)]"></span>
            <span className="text-red-300 font-medium">대기 재복사 온실효과 ({formatFlux(fluxes.atmosphericBackRadiation, unit)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(6,182,212,0.6)]"></span>
            <span className="text-cyan-300 font-medium">잠열·대류 ({formatFlux(fluxes.evaporationLatentHeat + fluxes.convectionSensibleHeat, unit)})</span>
          </div>
        </div>

        <div className="text-gray-500 text-[10px] flex items-center gap-1">
          <span>DRAG TO ROTATE · SCROLL TO ZOOM</span>
        </div>
      </div>
    </div>
  );
};
