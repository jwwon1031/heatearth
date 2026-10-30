import React from 'react';
import { GreenhouseGasState, SimulationPreset, UnitDisplay } from '../types';
import { SIMULATION_PRESETS, BASELINE_CO2, BASELINE_CH4, BASELINE_H2O } from '../utils/physicsEngine';
import { Flame, Snowflake, Trees, Factory, TrendingUp, Moon, RotateCcw, Info, Sparkles } from 'lucide-react';

interface ControlPanelProps {
  gasState: GreenhouseGasState;
  setGasState: React.Dispatch<React.SetStateAction<GreenhouseGasState>>;
  unit: UnitDisplay;
  setUnit: (unit: UnitDisplay) => void;
  activePresetId: string | null;
  setActivePresetId: (id: string | null) => void;
  onReset: () => void;
  onOpenInfo: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  gasState,
  setGasState,
  unit,
  setUnit,
  activePresetId,
  setActivePresetId,
  onReset,
  onOpenInfo,
}) => {
  const handlePresetSelect = (preset: SimulationPreset) => {
    setActivePresetId(preset.id);
    setGasState({
      co2: preset.co2,
      ch4: preset.ch4,
      h2o: preset.h2o,
    });
  };

  const handleSliderChange = (key: keyof GreenhouseGasState, value: number) => {
    setActivePresetId(null);
    setGasState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trees':
        return <Trees className="w-4 h-4 text-emerald-500" />;
      case 'Factory':
        return <Factory className="w-4 h-4 text-amber-500" />;
      case 'Snowflake':
        return <Snowflake className="w-4 h-4 text-sky-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'Flame':
        return <Flame className="w-4 h-4 text-red-500" />;
      case 'Moon':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="bg-[#0f111a] border border-[#1f2937] rounded-xl p-4 text-[#e0e0e0] shadow-xl flex flex-col gap-4">
      {/* Header with Title and Quick Actions */}
      <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
          <h2 className="text-xs font-mono font-bold text-gray-200 tracking-wider uppercase">
            GHG PARAMETER MATRIX / 온실기체 조절
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Unit Toggle */}
          <div className="flex bg-[#0d0e14] p-0.5 rounded border border-[#1f2937] text-[11px] font-mono">
            <button
              onClick={() => setUnit('units')}
              className={`px-2 py-0.5 rounded transition-all ${
                unit === 'units'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              title="태양 입사량을 100으로 정규화한 상대 단위"
            >
              NORM (100)
            </button>
            <button
              onClick={() => setUnit('wm2')}
              className={`px-2 py-0.5 rounded transition-all ${
                unit === 'wm2'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              title="실제 물리 에너지속 W/m² (입사량 340.2 W/m² 기준)"
            >
              W/m²
            </button>
          </div>

          <button
            onClick={onReset}
            className="p-1 rounded bg-[#161821] text-gray-400 hover:text-white hover:bg-[#1f2937] transition border border-[#1f2937]"
            title="기준 상태로 초기화"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenInfo}
            className="p-1 rounded bg-[#161821] text-blue-400 hover:text-blue-300 hover:bg-[#1f2937] transition border border-[#1f2937]"
            title="열수지 원리 설명"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preset Scenarios */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">
            SCENARIO PRESETS / 기후 시나리오
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SIMULATION_PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all duration-150 ${
                  isActive
                    ? 'bg-[#1a1c2e] border-blue-500/80 shadow-[0_0_12px_rgba(59,130,246,0.3)] ring-1 ring-blue-500/50'
                    : 'bg-[#11131c] border-[#1f2937] hover:bg-[#161821] hover:border-[#374151] text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-semibold text-gray-200 truncate">{preset.name.split(' (')[0]}</span>
                  {getPresetIcon(preset.iconName)}
                </div>
                <span className="text-[10px] text-gray-500 font-mono tracking-tight">{preset.era}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders for GHG Variables */}
      <div className="space-y-3 pt-1">
        {/* 1. CO2 Slider */}
        <div className="space-y-2 bg-[#11131c] p-3 rounded-lg border border-[#1f2937]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]"></span>
              <span className="text-xs font-semibold text-gray-200 font-mono">이산화탄소 (CO₂)</span>
            </div>
            <div className="flex items-baseline gap-1 bg-[#0a0a0f] px-2 py-0.5 rounded border border-[#1f2937]">
              <span className="text-sm font-bold font-mono text-rose-400">{gasState.co2}</span>
              <span className="text-[10px] text-gray-500 font-mono">ppm</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="1200"
            step="5"
            value={gasState.co2}
            onChange={(e) => handleSliderChange('co2', Number(e.target.value))}
            className="w-full h-1.5 bg-[#1f2937] rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <div className="flex justify-between text-[10px] text-gray-500 font-mono px-0.5">
            <span className="cursor-pointer hover:text-gray-300" onClick={() => handleSliderChange('co2', 185)}>
              빙하기 185
            </span>
            <span className="cursor-pointer hover:text-gray-300 font-medium text-gray-400" onClick={() => handleSliderChange('co2', BASELINE_CO2)}>
              산업이전 280
            </span>
            <span className="cursor-pointer hover:text-rose-300 text-rose-400 font-semibold" onClick={() => handleSliderChange('co2', 425)}>
              현재 425
            </span>
            <span className="cursor-pointer hover:text-gray-300" onClick={() => handleSliderChange('co2', 560)}>
              2배 560
            </span>
            <span>1200</span>
          </div>
        </div>

        {/* 2. CH4 Slider */}
        <div className="space-y-2 bg-[#11131c] p-3 rounded-lg border border-[#1f2937]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]"></span>
              <span className="text-xs font-semibold text-gray-200 font-mono">메테인 (CH₄)</span>
            </div>
            <div className="flex items-baseline gap-1 bg-[#0a0a0f] px-2 py-0.5 rounded border border-[#1f2937]">
              <span className="text-sm font-bold font-mono text-amber-400">{gasState.ch4}</span>
              <span className="text-[10px] text-gray-500 font-mono">ppb</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="4000"
            step="20"
            value={gasState.ch4}
            onChange={(e) => handleSliderChange('ch4', Number(e.target.value))}
            className="w-full h-1.5 bg-[#1f2937] rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-gray-500 font-mono px-0.5">
            <span className="cursor-pointer hover:text-gray-300" onClick={() => handleSliderChange('ch4', 380)}>
              빙하기 380
            </span>
            <span className="cursor-pointer hover:text-gray-300 font-medium text-gray-400" onClick={() => handleSliderChange('ch4', BASELINE_CH4)}>
              산업이전 720
            </span>
            <span className="cursor-pointer hover:text-amber-300 text-amber-400 font-semibold" onClick={() => handleSliderChange('ch4', 1930)}>
              현재 1930
            </span>
            <span>4000</span>
          </div>
        </div>

        {/* 3. H2O Slider */}
        <div className="space-y-2 bg-[#11131c] p-3 rounded-lg border border-[#1f2937]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.6)]"></span>
              <span className="text-xs font-semibold text-gray-200 font-mono">수증기 (H₂O 함유량)</span>
            </div>
            <div className="flex items-baseline gap-1 bg-[#0a0a0f] px-2 py-0.5 rounded border border-[#1f2937]">
              <span className="text-sm font-bold font-mono text-cyan-400">{gasState.h2o}</span>
              <span className="text-[10px] text-gray-500 font-mono">%</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            step="2"
            value={gasState.h2o}
            onChange={(e) => handleSliderChange('h2o', Number(e.target.value))}
            className="w-full h-1.5 bg-[#1f2937] rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[10px] text-gray-500 font-mono px-0.5">
            <span className="cursor-pointer hover:text-gray-300" onClick={() => handleSliderChange('h2o', 50)}>
              건조 50%
            </span>
            <span className="cursor-pointer hover:text-gray-300 font-medium text-gray-400" onClick={() => handleSliderChange('h2o', BASELINE_H2O)}>
              기준 100%
            </span>
            <span className="cursor-pointer hover:text-cyan-300 text-cyan-400 font-semibold" onClick={() => handleSliderChange('h2o', 120)}>
              온난화 +20%
            </span>
            <span>200%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
