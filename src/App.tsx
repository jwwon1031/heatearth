import React, { useState, useMemo } from 'react';
import { GreenhouseGasState, UnitDisplay } from './types';
import { calculateEnergyFluxes, BASELINE_CO2, BASELINE_CH4, BASELINE_H2O } from './utils/physicsEngine';
import { ControlPanel } from './components/ControlPanel';
import { Diagram2DView } from './components/Diagram2DView';
import { EnergyBalanceCard } from './components/EnergyBalanceCard';
import { GasContributionBreakdown } from './components/GasContributionBreakdown';
import { InformationModal } from './components/InformationModal';
import { Globe, Info, Sparkles, SunMedium } from 'lucide-react';

export default function App() {
  // State for greenhouse gases
  const [gasState, setGasState] = useState<GreenhouseGasState>({
    co2: BASELINE_CO2, // 280 ppm default (Pre-industrial baseline)
    ch4: BASELINE_CH4, // 720 ppb default
    h2o: BASELINE_H2O, // 100% default
  });

  const [activePresetId, setActivePresetId] = useState<string | null>('pre-industrial');
  const [unit, setUnit] = useState<UnitDisplay>('units');
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);

  // Dynamic physics calculation based on current state
  const fluxes = useMemo(() => {
    return calculateEnergyFluxes(gasState, true);
  }, [gasState]);

  const handleReset = () => {
    setActivePresetId('pre-industrial');
    setGasState({
      co2: BASELINE_CO2,
      ch4: BASELINE_CH4,
      h2o: BASELINE_H2O,
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e0e0e0] font-sans flex flex-col antialiased selection:bg-blue-500 selection:text-white high-density-grid">
      {/* Top Header Navbar - High Density Theme */}
      <header className="sticky top-0 z-40 bg-[#0f111a]/95 backdrop-blur-md border-b border-[#1f2937] px-4 sm:px-6 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* App Branding */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                <Globe className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex items-baseline">
                <h1 className="text-lg font-bold tracking-tight text-white">TERRA-THERM</h1>
                <span className="text-blue-400 font-mono text-xs ml-2 font-normal">v2.4.0</span>
                <span className="text-slate-400 text-xs ml-2 hidden lg:inline font-medium">| 지구 열수지 시뮬레이터 (외부-대기-지표)</span>
              </div>
            </div>

            <button
              onClick={() => setIsInfoOpen(true)}
              className="md:hidden p-1.5 rounded bg-[#161821] text-blue-400 hover:text-white border border-[#1f2937]"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* Center/Right: Telemetry Metrics & Information trigger */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 w-full md:w-auto">
            {/* Live Telemetry Badges */}
            <div className="flex space-x-6 text-xs font-mono uppercase tracking-widest text-gray-400">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-500">Flux Balance</span>
                <span className="text-green-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> CONSERVED (ΔE=0)
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-500">Global Mean Temp</span>
                <span className="text-white font-bold">
                  {fluxes.surfaceTempC > 0 ? `+${fluxes.surfaceTempC}` : fluxes.surfaceTempC}°C
                </span>
              </div>
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[10px] text-gray-500">Forcing Imbalance</span>
                <span className={`font-bold ${fluxes.radiativeForcingWm2 >= 0 ? 'text-amber-400' : 'text-blue-400'}`}>
                  {fluxes.radiativeForcingWm2 >= 0 ? `+${fluxes.radiativeForcingWm2}` : fluxes.radiativeForcingWm2} W/m²
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsInfoOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#161821] hover:bg-[#1f2937] text-blue-400 hover:text-blue-300 border border-[#1f2937] text-xs font-mono transition"
            >
              <Info className="w-3.5 h-3.5" />
              <span>원리 설명</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard Container */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-5 flex-1 flex flex-col gap-5">
        {/* Main 2D Earth Energy Budget Diagram Canvas: 외부(태양) - 대기 - 지표 */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="text-[11px] font-mono uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <SunMedium className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-gray-200">지구 열수지 모델 다이어그램</span>
              <span className="text-gray-500">| 외부(우주/태양) - 대기 - 지표</span>
            </div>
            <span className="text-[10px] font-mono text-gray-500 hidden sm:inline">
              * 각 노드를 호버/클릭하면 세부 물리적 설명이 표시됩니다.
            </span>
          </div>

          <Diagram2DView fluxes={fluxes} unit={unit} />
        </section>

        {/* Middle Section: Control Panel & Energy Balance Equation Metrics */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Controls: Left 5 Columns on Desktop */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <ControlPanel
              gasState={gasState}
              setGasState={setGasState}
              unit={unit}
              setUnit={setUnit}
              activePresetId={activePresetId}
              setActivePresetId={setActivePresetId}
              onReset={handleReset}
              onOpenInfo={() => setIsInfoOpen(true)}
            />
          </div>

          {/* Metrics & Atmospheric Breakdown: Right 7 Columns on Desktop */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Energy Balance Equations & Temperature */}
            <EnergyBalanceCard fluxes={fluxes} unit={unit} />

            {/* Greenhouse Gas Absorption Contribution & Atmospheric Window */}
            <GasContributionBreakdown gasState={gasState} fluxes={fluxes} unit={unit} />
          </div>
        </section>
      </main>

      {/* High Density Telemetry Footer */}
      <footer className="mt-auto border-t border-[#1f2937] bg-[#0f111a] py-2.5 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-gray-500 gap-2">
        <div className="tracking-wider">
          LATENCY: <span className="text-gray-400">12ms</span> | EARTH RADIUS: <span className="text-gray-400">6,371 KM</span> | SOLAR CONSTANT: <span className="text-gray-400">340.2 W/m²</span> | EMISSIVITY: <span className="text-gray-400">0.95</span>
        </div>
        <div className="flex space-x-4 uppercase tracking-widest">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1.5 shadow-[0_0_6px_rgba(234,179,8,0.6)]"></span> SHORTWAVE (SOLAR)
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5 shadow-[0_0_6px_rgba(239,68,68,0.6)]"></span> LONGWAVE (THERMAL IR)
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-cyan-500 rounded-full mr-1.5 shadow-[0_0_6px_rgba(6,182,212,0.6)]"></span> LATENT / CONVECTIVE
          </span>
        </div>
      </footer>

      {/* Information Modal */}
      <InformationModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </div>
  );
}
