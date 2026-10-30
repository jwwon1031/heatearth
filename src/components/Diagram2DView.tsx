import React, { useState } from 'react';
import { EnergyFluxValues, UnitDisplay } from '../types';
import { formatFlux } from '../utils/physicsEngine';
import { Info, Sun, Sparkles, Wind, Droplets } from 'lucide-react';

interface Diagram2DViewProps {
  fluxes: EnergyFluxValues;
  unit: UnitDisplay;
  onSelectFlux?: (fluxKey: string) => void;
}

export const Diagram2DView: React.FC<Diagram2DViewProps> = ({
  fluxes,
  unit,
  onSelectFlux,
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const renderBadge = (
    label: string,
    value: number,
    colorClass: string,
    keyName: string,
    tooltip: string
  ) => {
    const isHovered = hoveredNode === keyName;
    return (
      <div
        id={`flux-node-${keyName}`}
        onMouseEnter={() => setHoveredNode(keyName)}
        onMouseLeave={() => setHoveredNode(null)}
        onClick={() => onSelectFlux && onSelectFlux(keyName)}
        className={`cursor-pointer transition-all duration-150 flex flex-col items-center select-none ${
          isHovered ? 'scale-105 z-30' : 'z-10'
        }`}
      >
        <div
          className={`px-2 py-0.5 rounded font-mono text-[11px] sm:text-xs border shadow-md flex items-center gap-1.5 backdrop-blur-md ${colorClass} ${
            isHovered ? 'ring-1 ring-white shadow-lg' : ''
          }`}
        >
          <span className="font-semibold">{label}</span>
          <span className="bg-black/50 px-1 py-0.2 rounded text-white text-[11px] font-mono font-bold">
            {formatFlux(value, unit)}
          </span>
        </div>
        {isHovered && (
          <div className="absolute top-full mt-1 w-48 p-2 bg-[#0f111a] border border-[#1f2937] rounded text-[10px] font-mono text-gray-200 shadow-2xl z-40 text-center pointer-events-none">
            {tooltip}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] rounded-xl overflow-hidden border border-[#1f2937] bg-[#07090e] flex flex-col select-none shadow-2xl">
      {/* Background Gradient Layers representing Space, Atmosphere, and Surface */}
      <div className="absolute inset-0 flex flex-col pointer-events-none">
        {/* Layer 1: Space / Outer (외부: 우주 / 태양) - 22% height */}
        <div className="h-[22%] bg-gradient-to-b from-[#060810] via-[#090d1a] to-[#0f172a] relative border-b border-dashed border-indigo-500/40">
          {/* Subtle stars */}
          <div className="absolute top-3 left-1/4 w-1 h-1 bg-white/70 rounded-full animate-ping"></div>
          <div className="absolute top-8 left-2/3 w-1 h-1 bg-white/50 rounded-full"></div>
          <div className="absolute top-5 right-1/4 w-1.5 h-1.5 bg-blue-200/60 rounded-full"></div>
          {/* Layer Label Watermark */}
          <div className="absolute left-4 bottom-1.5 text-[11px] font-mono font-bold text-indigo-400/70 tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500/50"></span> 외부 · 우주 공간 (TOA / SPACE)
          </div>
        </div>

        {/* Layer 2: Atmosphere (대기 / 대기권) - 56% height */}
        <div className="h-[56%] bg-gradient-to-b from-[#111f38] via-[#1e3a5f] to-[#2b5282] relative overflow-hidden border-b border-dashed border-emerald-500/40">
          {/* Clouds */}
          <div className="absolute top-[35%] left-[28%] w-36 h-10 bg-white/20 rounded-full blur-sm"></div>
          <div className="absolute top-[30%] left-[32%] w-24 h-12 bg-white/30 rounded-full blur-sm"></div>
          <div className="absolute top-[40%] right-[16%] w-44 h-12 bg-white/20 rounded-full blur-sm"></div>
          <div className="absolute top-[36%] right-[20%] w-28 h-14 bg-white/30 rounded-full blur-sm"></div>
          {/* Layer Label Watermark */}
          <div className="absolute left-4 bottom-2 text-[11px] font-mono font-bold text-sky-300/70 tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400/50"></span> 대기층 (ATMOSPHERE)
          </div>
        </div>

        {/* Layer 3: Surface (지표 / 지표면) - 22% height */}
        <div className="h-[22%] bg-gradient-to-b from-[#1a3821] via-[#142e1a] to-[#0d1f11] relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent"></div>
          {/* Layer Label Watermark */}
          <div className="absolute left-4 bottom-3 text-[11px] font-mono font-bold text-emerald-400/70 tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400/50"></span> 지표면 (EARTH SURFACE)
          </div>
        </div>
      </div>

      {/* Zone Side Navigation Badges with Exact Radiative Equilibrium Indicators */}
      <div className="absolute right-3 top-3 z-20 flex flex-col justify-between h-[88%] pointer-events-none font-mono">
        <div className="bg-[#0f111a]/95 border border-indigo-500/50 text-indigo-300 text-[10px] sm:text-[11px] font-bold px-2.5 py-1.5 rounded shadow-lg backdrop-blur-md flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span>1. 외부 (우주 / 태양)</span>
          </div>
          <div className="text-[10px] text-indigo-200/90 font-mono">
            순흡수 <strong className="text-yellow-300">{formatFlux(fluxes.spaceTotalAbsorption, unit)}</strong> = 방출 <strong className="text-rose-300">{formatFlux(fluxes.spaceTotalEmission, unit)}</strong>
          </div>
        </div>

        <div className="bg-[#0f111a]/95 border border-sky-500/50 text-sky-300 text-[10px] sm:text-[11px] font-bold px-2.5 py-1.5 rounded shadow-lg backdrop-blur-md flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            <span>2. 대기 (대기층)</span>
          </div>
          <div className="text-[10px] text-sky-200/90 font-mono">
            흡수 <strong className="text-cyan-300">{formatFlux(fluxes.atmosphereTotalAbsorption, unit)}</strong> = 방출 <strong className="text-rose-300">{formatFlux(fluxes.atmosphereTotalEmission, unit)}</strong>
          </div>
        </div>

        <div className="bg-[#0f111a]/95 border border-emerald-500/50 text-emerald-300 text-[10px] sm:text-[11px] font-bold px-2.5 py-1.5 rounded shadow-lg backdrop-blur-md flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>3. 지표 (지표면)</span>
          </div>
          <div className="text-[10px] text-emerald-200/90 font-mono">
            흡수 <strong className="text-yellow-300">{formatFlux(fluxes.surfaceTotalAbsorption, unit)}</strong> = 방출 <strong className="text-rose-300">{formatFlux(fluxes.surfaceTotalEmission, unit)}</strong>
          </div>
        </div>
      </div>

      {/* Sun Icon in top left */}
      <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-2 bg-[#0f111a]/90 border border-[#1f2937] p-2 rounded-lg backdrop-blur-md font-mono">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.5)]">
          <Sun className="w-5 h-5 text-amber-950" />
        </div>
        <div>
          <div className="text-[9px] text-amber-400 font-bold uppercase">태양 복사 입사</div>
          <div className="text-xs font-bold text-yellow-300">{formatFlux(fluxes.solarInput, unit)}</div>
        </div>
      </div>

      {/* SVG Canvas for Vector Flow Ribbons and Animated Arrows */}
      <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 580">
        <defs>
          {/* Gradients */}
          <linearGradient id="solarMainGrad" x1="0%" y1="0%" x2="40%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id="solarReflectGrad" x1="0%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#facc15" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="terrestrialGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id="backRadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f87171" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="latentGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
          </linearGradient>

          {/* Animated dashes marker / filters */}
          <filter id="glowYellow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. SOLAR PATHWAYS (Yellow Ribbons) */}
        {/* Main Solar Beam entering atmosphere: Sun (80, 50) -> Split (220, 240) */}
        <path
          d="M 60 40 L 90 20 L 220 240 L 190 260 Z"
          fill="url(#solarMainGrad)"
          filter="url(#glowYellow)"
          opacity="0.85"
        />

        {/* Atmosphere Solar Absorption branch: (200, 250) -> (170, 310) */}
        <path
          d="M 195 245 Q 160 270 180 320 L 160 325 Q 140 270 185 240 Z"
          fill="url(#solarMainGrad)"
          opacity="0.8"
        />
        {/* Solar Absorption Arrowhead */}
        <polygon points="170,335 155,315 185,315" fill="#facc15" />

        {/* Atmosphere Solar Reflection & Scattering branch: (210, 250) -> curves up to (420, 60) */}
        <path
          d="M 215 245 Q 260 270 330 200 L 415 70 L 435 80 L 345 220 Q 260 290 205 260 Z"
          fill="url(#solarReflectGrad)"
          opacity="0.85"
        />

        {/* Surface Solar Absorption path: from split (205, 250) down to Surface (240, 450) */}
        <path
          d="M 195 255 L 235 450 L 255 450 L 215 250 Z"
          fill="url(#solarMainGrad)"
          opacity="0.85"
        />
        <polygon points="245,465 230,445 260,445" fill="#facc15" />

        {/* Surface Solar Reflection: hits ground at (290, 450) and bounces up to merge with space reflection */}
        <path
          d="M 245 448 L 290 450 L 435 85 L 420 75 L 280 435 Z"
          fill="url(#solarReflectGrad)"
          opacity="0.75"
        />
        {/* Combined Solar Reflection Arrowhead to Space */}
        <polygon points="430,45 405,80 445,70" fill="#fde047" />

        {/* 2. TERRESTRIAL INFRARED PATHWAYS (Red Ribbons) */}
        {/* Surface Thermal Emission (116): Thick red trunk from Surface (530, 455) rising to (530, 310) */}
        <path
          d="M 495 455 L 495 330 Q 495 290 530 260 L 610 260 Q 600 300 580 455 Z"
          fill="url(#terrestrialGrad)"
          filter="url(#glowRed)"
          opacity="0.85"
        />

        {/* Direct to Space (Window 12): Narrow branch shooting straight up through atmosphere to space (510, 50) */}
        <path
          d="M 500 330 L 515 80 L 530 80 L 512 330 Z"
          fill="#f87171"
          opacity="0.9"
        />
        <polygon points="522,60 510,85 535,85" fill="#ef4444" />

        {/* Atmospheric IR Absorption (104): Major trunk absorbing into atmosphere curving right */}
        <path
          d="M 530 260 Q 560 240 620 250 L 640 280 Q 580 270 545 300 Z"
          fill="url(#terrestrialGrad)"
          opacity="0.9"
        />
        <polygon points="650,265 625,245 635,290" fill="#ef4444" />

        {/* Atmospheric Emission Upward to Space (58): From Atmosphere (600, 240) to Space (600, 60) */}
        <path
          d="M 570 230 Q 580 150 595 80 L 625 80 Q 610 150 600 230 Z"
          fill="url(#terrestrialGrad)"
          opacity="0.85"
        />
        <polygon points="610,55 585,85 635,85" fill="#dc2626" />

        {/* Atmospheric Back-Radiation (98): Downward thick red trunk warming the surface */}
        <path
          d="M 770 300 Q 780 370 820 440 L 780 445 Q 745 370 735 300 Z"
          fill="url(#backRadGrad)"
          filter="url(#glowRed)"
          opacity="0.9"
        />
        <polygon points="805,465 770,435 830,430" fill="#b91c1c" />

        {/* 3. NON-RADIATIVE TRANSFERS (Latent Evaporation 24 & Sensible Convection 5) */}
        {/* Water Evaporation (24) */}
        <path
          d="M 660 455 L 660 360 L 675 360 L 675 455 Z"
          fill="url(#latentGrad)"
          opacity="0.85"
        />
        <polygon points="667,340 655,365 680,365" fill="#06b6d4" />

        {/* Convection / Conduction (5) */}
        <path
          d="M 720 455 L 720 380 L 730 380 L 730 455 Z"
          fill="#f97316"
          opacity="0.85"
        />
        <polygon points="725,365 715,385 735,385" fill="#f97316" />
      </svg>

      {/* Interactive Overlay Badges positioned accurately according to the pathways */}
      <div className="absolute inset-0 z-20 pointer-events-auto">
        {/* 1. Solar Group */}
        {/* Atmosphere Absorption (23) */}
        <div className="absolute left-[13%] sm:left-[14%] top-[48%]">
          {renderBadge(
            '대기의 흡수',
            fluxes.solarAtmAbsorption,
            'bg-yellow-950/80 border-yellow-500/70 text-yellow-300',
            'solarAtmAbsorption',
            '오존(O₃), 수증기(H₂O), 에어로졸 등이 태양 단파 복사를 직접 흡수하는 양'
          )}
        </div>

        {/* Atmosphere Reflection & Scattering (23) */}
        <div className="absolute left-[24%] sm:left-[27%] top-[28%]">
          {renderBadge(
            '대기 반사 및 산란',
            fluxes.solarAtmReflection,
            'bg-yellow-900/80 border-yellow-400/80 text-yellow-200',
            'solarAtmReflection',
            '구름과 대기 분자에 의해 우주 공간으로 되돌아가는 태양빛'
          )}
        </div>

        {/* Surface Reflection (7) */}
        <div className="absolute left-[33%] sm:left-[36%] top-[60%]">
          {renderBadge(
            '지표면 반사',
            fluxes.solarSurfaceReflection,
            'bg-amber-950/80 border-amber-400/70 text-amber-200',
            'solarSurfaceReflection',
            '빙하, 사막, 수면 등 지표 알베도에 의해 반사되는 태양빛'
          )}
        </div>

        {/* Total Reflected Albedo to Space (30) */}
        <div className="absolute left-[38%] sm:left-[41%] top-[8%]">
          {renderBadge(
            '반사 및 산란',
            fluxes.solarTotalReflection,
            'bg-yellow-950/90 border-yellow-300 text-yellow-200 font-extrabold',
            'solarTotalReflection',
            '지구 전체 알베도 (대기 반사 23 + 지표 반사 7 = 30)'
          )}
        </div>

        {/* Surface Absorption (47) */}
        <div className="absolute left-[21%] sm:left-[23%] top-[82%]">
          {renderBadge(
            '지표면 흡수',
            fluxes.solarSurfaceAbsorption,
            'bg-yellow-900/90 border-yellow-400 text-yellow-100',
            'solarSurfaceAbsorption',
            '지표면이 직접 흡수하여 열로 변환하는 태양 에너지'
          )}
        </div>

        {/* 2. Terrestrial Group */}
        {/* Surface Emission (116) */}
        <div className="absolute left-[48%] sm:left-[51%] top-[82%]">
          {renderBadge(
            '지표면 방출',
            fluxes.surfaceEmission,
            'bg-rose-950/90 border-rose-500 text-rose-200 font-black',
            'surfaceEmission',
            '지표면 온도에 의해 방출되는 전자기적 장파 적외선 복사 (Stefan-Boltzmann)'
          )}
        </div>

        {/* Atmospheric Window Direct Loss to Space (12) */}
        <div className="absolute left-[47%] sm:left-[49%] top-[34%]">
          {renderBadge(
            '우주로 손실 (대기의 창)',
            fluxes.atmosphericWindowLoss,
            'bg-red-950/80 border-red-400/60 text-red-300',
            'atmosphericWindowLoss',
            '온실기체에 흡수되지 않고 8~12μm 파장대를 통해 우주로 직접 빠져나가는 열'
          )}
        </div>

        {/* Atmospheric IR Absorption (104) */}
        <div className="absolute left-[58%] sm:left-[60%] top-[45%]">
          {renderBadge(
            '대기의 흡수',
            fluxes.surfaceIRAtmAbsorption,
            'bg-red-950/90 border-red-500/80 text-red-200',
            'surfaceIRAtmAbsorption',
            '수증기, CO₂, 메테인 등 온실기체 분자가 지표 적외선을 흡수하여 대기를 가열하는 양'
          )}
        </div>

        {/* Evaporation Latent Heat (24) */}
        <div className="absolute left-[63%] sm:left-[66%] top-[70%]">
          {renderBadge(
            '물의 증발 (잠열)',
            fluxes.evaporationLatentHeat,
            'bg-cyan-950/90 border-cyan-400/80 text-cyan-200',
            'evaporationLatentHeat',
            '수증기 증발 및 상변화 과정에서 대기로 운반되는 잠열 에너지'
          )}
        </div>

        {/* Convection & Conduction (5) */}
        <div className="absolute left-[70%] sm:left-[73%] top-[78%]">
          {renderBadge(
            '대류와 전도',
            fluxes.convectionSensibleHeat,
            'bg-orange-950/80 border-orange-400/80 text-orange-200',
            'convectionSensibleHeat',
            '지표와 접촉한 공기의 전도 및 대류 현열 수송'
          )}
        </div>

        {/* Atmospheric Emission to Space (58) */}
        <div className="absolute left-[58%] sm:left-[60%] top-[23%]">
          {renderBadge(
            '대기의 복사 (우주 방출)',
            fluxes.atmosphericSpaceRadiation,
            'bg-rose-950/80 border-rose-400/80 text-rose-200',
            'atmosphericSpaceRadiation',
            '대기 상층부가 냉각되며 우주 공간으로 방출하는 적외선 복사'
          )}
        </div>

        {/* Total Outgoing Terrestrial Radiation to Space (70) */}
        <div className="absolute left-[57%] sm:left-[59%] top-[6%]">
          {renderBadge(
            '우주 방출 복사 합',
            fluxes.totalSpaceRadiation,
            'bg-red-950/90 border-red-400 text-red-100 font-extrabold',
            'totalSpaceRadiation',
            '지구계가 우주로 최종 방출하는 적외선 (지표 직접 12 + 대기 방출 58 = 70)'
          )}
        </div>

        {/* Atmospheric Back-Radiation (98) */}
        <div className="absolute left-[76%] sm:left-[80%] top-[56%]">
          {renderBadge(
            '대기의 재복사',
            fluxes.atmosphericBackRadiation,
            'bg-rose-950/95 border-rose-400 text-rose-100 font-black shadow-rose-950/60',
            'atmosphericBackRadiation',
            '온실효과의 핵심! 가열된 대기가 지표면으로 다시 방출하여 지표를 보온하는 에너지'
          )}
        </div>
      </div>

      {/* Legend Footer */}
      <div className="absolute bottom-3 left-3.5 z-20 flex flex-wrap items-center gap-3.5 bg-[#0f111a]/95 border border-[#1f2937] px-3 py-1.5 rounded-lg backdrop-blur-md text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2 rounded bg-gradient-to-r from-yellow-300 to-amber-500"></span>
          <span className="text-yellow-300 font-medium">태양 복사 에너지</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2 rounded bg-gradient-to-r from-rose-400 to-red-600"></span>
          <span className="text-rose-300 font-medium">지구 복사 에너지</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2 rounded bg-gradient-to-r from-cyan-400 to-blue-500"></span>
          <span className="text-cyan-300 font-medium">증발 잠열 / 대류</span>
        </div>
      </div>
    </div>
  );
};
