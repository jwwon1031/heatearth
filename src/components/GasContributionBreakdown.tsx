import React from 'react';
import { GreenhouseGasState, EnergyFluxValues, UnitDisplay } from '../types';
import { formatFlux, BASELINE_CO2, BASELINE_CH4, BASELINE_H2O } from '../utils/physicsEngine';
import { CloudRain, Flame, Activity, ShieldCheck } from 'lucide-react';

interface GasContributionBreakdownProps {
  gasState: GreenhouseGasState;
  fluxes: EnergyFluxValues;
  unit: UnitDisplay;
}

export const GasContributionBreakdown: React.FC<GasContributionBreakdownProps> = ({
  gasState,
  fluxes,
  unit,
}) => {
  // Approximate share of atmospheric absorption
  const h2oRelative = (gasState.h2o / BASELINE_H2O) * 60;
  const co2Relative = Math.max(0.1, (gasState.co2 / BASELINE_CO2) * 26);
  const ch4Relative = Math.max(0.1, (gasState.ch4 / BASELINE_CH4) * 9);
  const others = 5;

  const totalRel = h2oRelative + co2Relative + ch4Relative + others;
  const h2oPct = ((h2oRelative / totalRel) * 100).toFixed(1);
  const co2Pct = ((co2Relative / totalRel) * 100).toFixed(1);
  const ch4Pct = ((ch4Relative / totalRel) * 100).toFixed(1);
  const othersPct = ((others / totalRel) * 100).toFixed(1);

  // Atmospheric window closing rate:
  // Baseline window is ~12 out of 116 (10.3%)
  const windowLossPercent = ((fluxes.atmosphericWindowLoss / fluxes.surfaceEmission) * 100).toFixed(1);
  const atmAbsPercent = ((fluxes.surfaceIRAtmAbsorption / fluxes.surfaceEmission) * 100).toFixed(1);

  return (
    <div className="bg-[#0f111a] border border-[#1f2937] rounded-xl p-4 shadow-xl text-[#e0e0e0] flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-[#1f2937] pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-rose-400" />
          <h3 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-wider">
            ATMOSPHERIC ABSORPTION & SPECTRAL WINDOW / 온실기체 기여도 & 대기의 창
          </h3>
        </div>
        <span className="text-[11px] text-gray-400 font-mono">
          대기 흡수율: <strong className="text-rose-400 font-bold">{atmAbsPercent}%</strong>
        </span>
      </div>

      {/* Stacked Percentage Bar for GHG Contribution */}
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-mono text-gray-400">
          <span>GHG CONTRIBUTION RATIO / 분담 비율</span>
          <span className="text-gray-400">TOTAL IR ABS: <strong className="text-gray-200">{formatFlux(fluxes.surfaceIRAtmAbsorption, unit)}</strong></span>
        </div>

        <div className="w-full h-3 rounded bg-[#0a0a0f] flex overflow-hidden border border-[#1f2937]">
          <div
            style={{ width: `${h2oPct}%` }}
            className="bg-cyan-500 h-full transition-all duration-300 relative group"
            title={`수증기 (H₂O): ${h2oPct}%`}
          />
          <div
            style={{ width: `${co2Pct}%` }}
            className="bg-rose-500 h-full transition-all duration-300 relative group"
            title={`이산화탄소 (CO₂): ${co2Pct}%`}
          />
          <div
            style={{ width: `${ch4Pct}%` }}
            className="bg-amber-500 h-full transition-all duration-300 relative group"
            title={`메테인 (CH₄): ${ch4Pct}%`}
          />
          <div
            style={{ width: `${othersPct}%` }}
            className="bg-purple-500 h-full transition-all duration-300"
            title={`기타 온실가스: ${othersPct}%`}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <div className="flex items-center gap-2 bg-[#11131c] p-2 rounded-lg border border-[#1f2937]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(6,182,212,0.6)]"></span>
            <div>
              <span className="text-[10px] text-gray-500 font-mono block">수증기 (H₂O)</span>
              <span className="font-mono font-bold text-cyan-300 text-xs">{h2oPct}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#11131c] p-2 rounded-lg border border-[#1f2937]">
            <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_5px_rgba(244,63,94,0.6)]"></span>
            <div>
              <span className="text-[10px] text-gray-500 font-mono block">이산화탄소 (CO₂)</span>
              <span className="font-mono font-bold text-rose-300 text-xs">{co2Pct}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#11131c] p-2 rounded-lg border border-[#1f2937]">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(245,158,11,0.6)]"></span>
            <div>
              <span className="text-[10px] text-gray-500 font-mono block">메테인 (CH₄)</span>
              <span className="font-mono font-bold text-amber-300 text-xs">{ch4Pct}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#11131c] p-2 rounded-lg border border-[#1f2937]">
            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_5px_rgba(168,85,247,0.6)]"></span>
            <div>
              <span className="text-[10px] text-gray-500 font-mono block">기타 (N₂O, O₃)</span>
              <span className="font-mono font-bold text-purple-300 text-xs">{othersPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Atmospheric Window Breakdown Card */}
      <div className="bg-[#11131c] rounded-lg p-3 border border-[#1f2937] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <div className="flex items-center gap-1.5 text-gray-200 font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-xs">대기의 창 (Atmospheric Window: 8~12μm) 투과율</span>
          </div>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            온실기체에 흡수되지 않고 우주로 직접 방출되는 적외선 창구입니다. 온실기체 농도가 증가하면 창이 좁아져 열이 지구에 축적됩니다.
          </p>
        </div>

        <div className="bg-[#0a0a0f] px-3 py-1.5 rounded border border-[#1f2937] font-mono text-right min-w-[130px]">
          <span className="text-[10px] text-gray-500 block">우주 직접 탈출량</span>
          <span className="text-sm font-bold text-rose-400">{formatFlux(fluxes.atmosphericWindowLoss, unit)}</span>
          <span className="text-[10px] text-gray-500 block">({windowLossPercent}%)</span>
        </div>
      </div>
    </div>
  );
};
