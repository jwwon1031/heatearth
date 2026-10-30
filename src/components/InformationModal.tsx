import React from 'react';
import { X, Sun, Globe, Flame, CloudSun, CheckCircle2, BookOpen } from 'lucide-react';

interface InformationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InformationModal: React.FC<InformationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f111a] border border-[#1f2937] w-full max-w-2xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden text-[#e0e0e0]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1f2937] bg-[#0a0a0f]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4.5 h-4.5 text-blue-400" />
            <h2 className="text-xs font-mono font-bold text-gray-100 uppercase tracking-wider">
              EARTH ENERGY BUDGET / 지구 열수지 과학적 원리 안내
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#161821] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs leading-relaxed text-gray-300">
          {/* 1. 기본 개념 */}
          <section className="space-y-1.5">
            <h3 className="text-white font-mono font-bold flex items-center gap-2 text-xs border-l-2 border-blue-500 pl-2 uppercase tracking-wider">
              1. 지구 열수지(Earth Energy Budget)란?
            </h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              지구가 태양으로부터 받는 <strong className="text-yellow-300 font-semibold">태양 복사 에너지(단파)</strong>와 지구가 우주 공간으로 방출하는 <strong className="text-rose-300 font-semibold">지구 복사 에너지(장파 적외선)</strong>의 출입 균형을 의미합니다.
              연평균 입사량과 방출량이 정확히 일치하여 지구 평균 기온(약 14~15℃)을 안정적으로 유지하는 상태를 <strong className="text-emerald-400 font-semibold">복사 평형(Radiative Equilibrium)</strong>이라고 부릅니다.
            </p>
          </section>

          {/* 2. 주요 경로 설명 */}
          <section className="space-y-2">
            <h3 className="text-white font-mono font-bold flex items-center gap-2 text-xs border-l-2 border-amber-500 pl-2 uppercase tracking-wider">
              2. 태양 복사 에너지 (입사량 100 기준)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="bg-[#11131c] p-3 rounded-lg border border-[#1f2937]">
                <span className="font-mono font-bold text-yellow-300 block mb-1">대기 반사·산란(23) & 지표 반사(7)</span>
                <span className="text-gray-400">
                  구름, 대기 분자, 지표면(빙하, 사막 등)에 의해 그대로 반사되어 우주로 되돌아가는 양(총 알베도 30)입니다.
                </span>
              </div>
              <div className="bg-[#11131c] p-3 rounded-lg border border-[#1f2937]">
                <span className="font-mono font-bold text-yellow-200 block mb-1">대기 흡수(23) & 지표면 흡수(47)</span>
                <span className="text-gray-400">
                  대기 중 오존·수증기가 23을 흡수하고, 지표면이 47을 직접 흡수하여 지구를 가열합니다 (지구계 총 흡수 70).
                </span>
              </div>
            </div>
          </section>

          {/* 3. 지구 복사 에너지와 온실효과 */}
          <section className="space-y-2">
            <h3 className="text-white font-mono font-bold flex items-center gap-2 text-xs border-l-2 border-rose-500 pl-2 uppercase tracking-wider">
              3. 지구 복사 에너지와 온실효과(Greenhouse Effect)
            </h3>
            <div className="space-y-1.5 text-[11px]">
              <div className="bg-[#11131c] p-2.5 rounded-lg border border-[#1f2937]">
                <span className="font-mono font-bold text-rose-300 block mb-0.5">지표면 방출 (116)</span>
                <span className="text-gray-400">
                  지표면은 가열된 온도에 따라 약 116에 해당하는 장파 적외선을 상공으로 방출합니다.
                </span>
              </div>
              <div className="bg-[#11131c] p-2.5 rounded-lg border border-[#1f2937]">
                <span className="font-mono font-bold text-red-300 block mb-0.5">대기의 창 (Atmospheric Window: 8~12μm, 12)</span>
                <span className="text-gray-400">
                  온실기체에 거의 흡수되지 않고 우주 공간으로 곧바로 탈출하는 적외선 영역입니다.
                </span>
              </div>
              <div className="bg-[#11131c] p-2.5 rounded-lg border border-[#1f2937]">
                <span className="font-mono font-bold text-rose-200 block mb-0.5">대기의 재복사 (98) - 온실효과의 핵심</span>
                <span className="text-gray-400">
                  지표 방출 적외선(104)과 증발 잠열(24), 대류 현열(5)을 흡수한 대기는 지표면으로 98만큼의 에너지를 재방출하여 지표를 보온합니다.
                </span>
              </div>
            </div>
          </section>

          {/* 4. 온실기체 증가 시 변화 */}
          <section className="space-y-2 bg-[#1a1318] p-3.5 rounded-lg border border-rose-900/40 text-[11px]">
            <h4 className="font-mono font-bold text-rose-400 flex items-center gap-1.5 text-xs">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> 온실기체(CO₂, CH₄, H₂O) 농도를 높이면?
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>대기의 적외선 흡수 능력이 강화되어 대기의 창을 통과하는 직접 탈출량(12)이 감소합니다.</li>
              <li>대기의 흡수량(104) 및 지표면으로 향하는 <strong className="text-rose-300">대기 재복사(98)</strong>가 증가합니다.</li>
              <li>지표면으로 전달되는 총 에너지가 증가하면서 지구 평균 기온이 상승하고, 새로운 복사 평형 상태에 도달할 때까지 지표면 방출량이 증가합니다.</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#1f2937] bg-[#0a0a0f] flex justify-end font-mono">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition shadow-sm"
          >
            CONFIRM & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
