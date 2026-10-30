import React from 'react';
import { EnergyFluxValues, UnitDisplay } from '../types';
import { formatFlux } from '../utils/physicsEngine';
import { Thermometer, Activity, Scale, ShieldAlert, ArrowUpRight, ArrowDownRight, Equal } from 'lucide-react';

interface EnergyBalanceCardProps {
  fluxes: EnergyFluxValues;
  unit: UnitDisplay;
}

export const EnergyBalanceCard: React.FC<EnergyBalanceCardProps> = ({ fluxes, unit }) => {
  const isWarming = fluxes.tempAnomalyC > 0;
  const isCooling = fluxes.tempAnomalyC < 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Global Temperature & Radiative Forcing Card */}
      <div className="bg-[#0f111a] border border-[#1f2937] rounded-xl p-4 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-rose-400" /> GLOBAL MEAN TEMP & FORCING
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-tight ${
                isWarming
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                  : isCooling
                  ? 'bg-sky-950/80 text-sky-300 border border-sky-800/80'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
              }`}
            >
              {isWarming ? `+${fluxes.tempAnomalyC}°C WARMING` : isCooling ? `${fluxes.tempAnomalyC}°C COOLING` : 'EQUILIBRIUM'}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono tracking-tight text-white">
              {fluxes.surfaceTempC > 0 ? `+${fluxes.surfaceTempC}` : fluxes.surfaceTempC}°C
            </span>
            <span className="text-xs font-mono text-gray-500">({fluxes.surfaceTempK} K)</span>
          </div>

          <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
            산업화 이전 기준(14.5℃) 대비 온실효과 강화에 따른 복사 평형 온도 변화입니다.
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#1f2937] grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#11131c] p-2 rounded-lg border border-[#1f2937]">
            <span className="text-gray-500 block text-[10px] font-mono">복사 강제력 (ΔF)</span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              {fluxes.radiativeForcingWm2 >= 0 ? `+${fluxes.radiativeForcingWm2}` : fluxes.radiativeForcingWm2} W/m²
            </span>
          </div>
          <div className="bg-[#11131c] p-2 rounded-lg border border-[#1f2937]">
            <span className="text-gray-500 block text-[10px] font-mono">온실효과 세기 (G)</span>
            <span className="font-mono font-bold text-rose-400 text-sm">
              {formatFlux(fluxes.greenhouseEffectIntensity, unit)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Three Systems Energy Balance Verification (우주 / 대기 / 지표) */}
      <div className="md:col-span-2 bg-[#0f111a] border border-[#1f2937] rounded-xl p-4 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3 border-b border-[#1f2937] pb-2.5">
          <div className="flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 text-blue-400" />
            <h3 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-wider">
              3-TIER RADIATIVE FLUX CONSERVATION / 권역별 열수지 복사 평형 검증
            </h3>
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono font-medium">
            <Equal className="w-3 h-3" /> NET SUM = 0 (CONSERVED)
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          {/* Layer 1: Space / Outer (외부 · 우주 공간) */}
          <div className="bg-[#11131c] rounded-lg p-2.5 border border-[#1f2937] flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span className="font-mono font-bold text-xs text-indigo-300">1. 외부 · 우주 공간 (SPACE / TOA)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono font-bold text-indigo-200 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-700/60">
                  순 흡수 [{formatFlux(fluxes.spaceTotalAbsorption, unit)}] = 총 방출 [{formatFlux(fluxes.spaceTotalEmission, unit)}]
                </span>
                <span className="bg-emerald-950/80 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border border-emerald-800/60">
                  평형 ΔE=0
                </span>
              </div>
            </div>
            <div className="font-mono text-gray-400 flex flex-wrap items-center gap-1.5 text-[11px] pl-4">
              <span className="text-gray-300">총 입사 100</span>
              <span>=</span>
              <span className="text-amber-400">우주 반사({formatFlux(fluxes.solarTotalReflection, unit)})</span>
              <span>+</span>
              <span className="text-rose-400">우주 방출({formatFlux(fluxes.totalSpaceRadiation, unit)} = 대기창 {formatFlux(fluxes.atmosphericWindowLoss, unit)} + 대기상층 {formatFlux(fluxes.atmosphericSpaceRadiation, unit)})</span>
            </div>
          </div>

          {/* Layer 2: Atmosphere (대기층) */}
          <div className="bg-[#11131c] rounded-lg p-2.5 border border-[#1f2937] flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                <span className="font-mono font-bold text-xs text-sky-300">2. 대기층 (ATMOSPHERE)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono font-bold text-sky-200 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-700/60">
                  총 흡수 [{formatFlux(fluxes.atmosphereTotalAbsorption, unit)}] = 총 방출 [{formatFlux(fluxes.atmosphereTotalEmission, unit)}]
                </span>
                <span className="bg-emerald-950/80 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border border-emerald-800/60">
                  평형 ΔE=0
                </span>
              </div>
            </div>
            <div className="font-mono text-gray-400 flex flex-wrap items-center gap-1 text-[11px] pl-4">
              <span className="text-yellow-400">태양흡수({formatFlux(fluxes.solarAtmAbsorption, unit)})</span>
              <span>+</span>
              <span className="text-red-400">지표적외흡수({formatFlux(fluxes.surfaceIRAtmAbsorption, unit)})</span>
              <span>+</span>
              <span className="text-cyan-400">잠열({formatFlux(fluxes.evaporationLatentHeat, unit)})</span>
              <span>+</span>
              <span className="text-orange-400">현열({formatFlux(fluxes.convectionSensibleHeat, unit)})</span>
              <span className="text-gray-300 font-bold mx-0.5">=</span>
              <span className="text-rose-400">재복사({formatFlux(fluxes.atmosphericBackRadiation, unit)})</span>
              <span>+</span>
              <span className="text-purple-400">상층방출({formatFlux(fluxes.atmosphericSpaceRadiation, unit)})</span>
            </div>
          </div>

          {/* Layer 3: Surface (지표면) */}
          <div className="bg-[#11131c] rounded-lg p-2.5 border border-[#1f2937] flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-mono font-bold text-xs text-emerald-300">3. 지표면 (SURFACE)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono font-bold text-emerald-200 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/60">
                  총 흡수 [{formatFlux(fluxes.surfaceTotalAbsorption, unit)}] = 총 방출 [{formatFlux(fluxes.surfaceTotalEmission, unit)}]
                </span>
                <span className="bg-emerald-950/80 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border border-emerald-800/60">
                  평형 ΔE=0
                </span>
              </div>
            </div>
            <div className="font-mono text-gray-400 flex flex-wrap items-center gap-1 text-[11px] pl-4">
              <span className="text-yellow-400">태양직접흡수({formatFlux(fluxes.solarSurfaceAbsorption, unit)})</span>
              <span>+</span>
              <span className="text-rose-400">대기재복사({formatFlux(fluxes.atmosphericBackRadiation, unit)})</span>
              <span className="text-gray-300 font-bold mx-0.5">=</span>
              <span className="text-red-400">지표복사방출({formatFlux(fluxes.surfaceEmission, unit)})</span>
              <span>+</span>
              <span className="text-cyan-400">증발잠열({formatFlux(fluxes.evaporationLatentHeat, unit)})</span>
              <span>+</span>
              <span className="text-orange-400">대류전도({formatFlux(fluxes.convectionSensibleHeat, unit)})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
