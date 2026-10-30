import { GreenhouseGasState, EnergyFluxValues, SimulationPreset } from '../types';

export const SOLAR_CONSTANT_WM2 = 340.2; // Globally averaged incoming solar flux (1361 / 4)
export const BASELINE_TEMP_K = 287.65; // ~14.5 °C pre-industrial
export const BASELINE_CO2 = 280; // ppm
export const BASELINE_CH4 = 720; // ppb
export const BASELINE_H2O = 100; // %

export const SIMULATION_PRESETS: SimulationPreset[] = [
  {
    id: 'pre-industrial',
    name: '산업혁명 이전 (1850년 기준)',
    nameEn: 'Pre-Industrial Baseline',
    description: '교과서 표준 열수지 기준 상태. 인간 활동에 의한 온실가스 배출 이전의 안정적인 복사 평형 상태입니다.',
    co2: 280,
    ch4: 720,
    h2o: 100,
    iconName: 'Trees',
    era: '1850년경',
  },
  {
    id: 'present-day',
    name: '현재 지구 (2026년 기준)',
    nameEn: 'Present Day (2026)',
    description: '산업화 이후 화석연료 연소와 농축산업으로 CO₂와 CH₄ 농도가 급증하여 지표 재복사에너지가 증가한 상태입니다.',
    co2: 425,
    ch4: 1930,
    h2o: 108,
    iconName: 'Factory',
    era: '2026년 현재',
  },
  {
    id: 'ice-age',
    name: '최종 빙하기 (LGM 약 2만년 전)',
    nameEn: 'Last Glacial Maximum',
    description: '온실기체 농도가 낮고 한랭 건조하여 대기의 온실효과 및 재복사량이 현재보다 현저히 적었던 시기입니다.',
    co2: 185,
    ch4: 380,
    h2o: 78,
    iconName: 'Snowflake',
    era: '약 20,000년 전',
  },
  {
    id: 'co2-double',
    name: 'CO₂ 2배 증가 시나리오 (560 ppm)',
    nameEn: 'Doubled CO₂ Equilibrium',
    description: 'IPCC 기후 민감도 평가의 핵심 기준. CO₂가 560ppm에 도달했을 때의 열수지 및 기온 상승 시뮬레이션입니다.',
    co2: 560,
    ch4: 2500,
    h2o: 120,
    iconName: 'TrendingUp',
    era: '기후 전망 시나리오',
  },
  {
    id: 'extreme-greenhouse',
    name: '고배출 폭주 온실 시나리오 (SSP5-8.5)',
    nameEn: 'High Emission Extreme',
    description: '온실기체 농도가 1000ppm 이상으로 폭증하여 대기 흡수율이 극대화되고 지표면 재복사가 심화된 고온 상태입니다.',
    co2: 1000,
    ch4: 3800,
    h2o: 150,
    iconName: 'Flame',
    era: '극단적 미래',
  },
  {
    id: 'no-ghg',
    name: '온실기체 없는 가상 지구',
    nameEn: 'Zero Greenhouse Earth',
    description: '대기 중 온실효과가 전혀 없는 상태로, 지표 복사에너지가 모두 우주로 직접 탈출하여 영하 18℃의 혹한이 됩니다.',
    co2: 0,
    ch4: 0,
    h2o: 0,
    iconName: 'Moon',
    era: '가상 극한 실험',
  },
];

/**
 * Cleanly round to 1 decimal place to eliminate floating point artifacts
 */
const round1 = (val: number) => Math.round(val * 10) / 10;

/**
 * Calculates radiative forcing and Earth energy budget fluxes based on GHG inputs
 */
export function calculateEnergyFluxes(state: GreenhouseGasState, equilibrium: boolean = true): EnergyFluxValues {
  const { co2, ch4, h2o } = state;

  // Zero GHG special case (No greenhouse atmosphere, blackbody equilibrium)
  if (co2 === 0 && ch4 === 0 && h2o === 0) {
    const solarIn = 100;
    const solarRefAtm = 18;
    const solarRefSurf = 12;
    const totalRef = 30; // 18 + 12
    const solarAbsSurf = 70; // All absorbed by surface
    const solarAbsAtm = 0;

    const surfTempK = 255.0; // -18 °C
    const surfTempC = surfTempK - 273.15;
    const surfEmit = 70; // In balance with absorbed solar

    return {
      solarInput: 100,
      solarAtmAbsorption: 0,
      solarAtmReflection: 18,
      solarSurfaceReflection: 12,
      solarSurfaceAbsorption: 70,
      solarTotalReflection: 30,
      evaporationLatentHeat: 0,
      convectionSensibleHeat: 0,
      surfaceEmission: surfEmit,
      atmosphericWindowLoss: surfEmit, // All directly to space
      surfaceIRAtmAbsorption: 0,
      atmosphericBackRadiation: 0,
      atmosphericSpaceRadiation: 0,
      totalSpaceRadiation: surfEmit,
      spaceTotalAbsorption: 70,
      spaceTotalEmission: 70,
      atmosphereTotalAbsorption: 0,
      atmosphereTotalEmission: 0,
      surfaceTotalAbsorption: 70,
      surfaceTotalEmission: 70,
      spaceBalance: 0,
      atmosphereBalance: 0,
      surfaceBalance: 0,
      surfaceTempC: round1(surfTempC),
      surfaceTempK: round1(surfTempK),
      tempAnomalyC: round1(surfTempC - 14.5),
      radiativeForcingWm2: -150.0,
      greenhouseEffectIntensity: 0,
      opticalThicknessIR: 0,
    };
  }

  // Radiative forcing calculations (IPCC AR6 / Myhre et al.)
  // CO2 forcing: ΔF_CO2 = 5.35 * ln(C / 280)
  const safeCo2 = Math.max(1, co2);
  const dF_co2 = 5.35 * Math.log(safeCo2 / BASELINE_CO2);

  // CH4 forcing: ΔF_CH4 = 0.036 * (sqrt(M) - sqrt(720))
  const safeCh4 = Math.max(1, ch4);
  const dF_ch4 = 0.036 * (Math.sqrt(safeCh4) - Math.sqrt(BASELINE_CH4));

  // Water vapor forcing & feedback factor
  const safeH2o = Math.max(1, h2o);
  const dF_h2o = 8.5 * Math.log(safeH2o / BASELINE_H2O);

  // Total Radiative Forcing (W/m²)
  const totalForcingWm2 = dF_co2 + dF_ch4 + dF_h2o;

  // Climate Sensitivity parameter λ ≈ 0.75 K / (W/m²)
  const lambda = 0.75;
  const tempAnomaly = totalForcingWm2 * lambda;
  const surfaceTempC = 14.5 + tempAnomaly;
  const surfaceTempK = surfaceTempC + 273.15;

  // Relative Stefan-Boltzmann emission scaling: (T / T_base)^4
  const tempRatio = surfaceTempK / BASELINE_TEMP_K;
  const surfEmitScale = Math.pow(tempRatio, 4);

  // Atmospheric IR Absorption fraction (Optical depth proxy)
  // Baseline absorption fraction = 104 / 116 ≈ 0.89655 (89.65%)
  // Window fraction = 12 / 116 ≈ 0.10345 (10.35%)
  const ghgIndex = (safeCo2 / BASELINE_CO2) * 0.45 + (safeCh4 / BASELINE_CH4) * 0.15 + (safeH2o / BASELINE_H2O) * 0.40;
  
  // Optical thickness τ scales with log of greenhouse concentration
  const tauFactor = Math.pow(ghgIndex, 0.42);
  const baseAbsFraction = 104 / 116; // 0.8965517...
  const absFraction = Math.min(0.975, Math.max(0.60, baseAbsFraction * (1 + 0.08 * Math.log(tauFactor))));
  const windowFraction = 1 - absFraction;

  // 1. Solar Radiation Partitioning (Shortwave: total incoming = 100)
  const solarInput = 100;
  const solarAtmRef = 23;
  const solarSurfRef = 7;
  const solarTotalRef = 30; // 23 + 7

  // Atmospheric solar absorption slightly scales with water vapor (baseline 23)
  const solarAtmAbs = round1(23 * (1 + 0.025 * Math.log(safeH2o / 100)));
  // Solar absorbed by surface (baseline 47): strictly 70 - solarAtmAbs
  const solarSurfAbs = round1(70.0 - solarAtmAbs);

  // 2. Terrestrial Infrared & Non-radiative surface fluxes
  // Surface thermal emission (baseline 116)
  const surfaceEmission = round1(116 * surfEmitScale);
  
  // Atmospheric window direct escape to space (baseline 12)
  const atmosphericWindowLoss = round1(surfaceEmission * windowFraction);
  // Surface IR absorbed by atmosphere (baseline 104): strictly surfaceEmission - windowLoss
  const surfaceIRAtmAbsorption = round1(surfaceEmission - atmosphericWindowLoss);

  // Non-radiative surface fluxes (Latent heat & Convection)
  const evapLatent = round1(24 * (1 + 0.035 * tempAnomaly));
  const convSensible = round1(5 * (1 + 0.015 * tempAnomaly));

  // Surface total heat emission: surfaceEmission + latent + sensible
  const surfaceTotalEmission = round1(surfaceEmission + evapLatent + convSensible);

  // In Radiative Equilibrium:
  // Surface Total Absorption = Solar Absorbed by Surface + Atmospheric Back Radiation
  // Surface Total Absorption MUST EQUAL Surface Total Emission:
  // solarSurfAbs + atmosphericBackRadiation = surfaceTotalEmission
  // => atmosphericBackRadiation = surfaceTotalEmission - solarSurfAbs
  const atmosphericBackRadiation = round1(surfaceTotalEmission - solarSurfAbs);
  const surfaceTotalAbsorption = surfaceTotalEmission; // Strictly equal by equilibrium

  // In Radiative Equilibrium for Space (TOA):
  // Net Absorbed Solar by Earth System = 100 - solarTotalRef = 70.0
  // Total Outgoing Longwave Radiation to Space MUST EQUAL Net Absorbed Solar = 70.0:
  // atmosphericWindowLoss + atmosphericSpaceRadiation = 70.0
  // => atmosphericSpaceRadiation = 70.0 - atmosphericWindowLoss
  const atmosphericSpaceRadiation = round1(70.0 - atmosphericWindowLoss);
  const totalSpaceRadiation = 70.0; // Strictly equal to 70.0

  const spaceTotalAbsorption = 70.0; // Net solar input (100 - 30)
  const spaceTotalEmission = 70.0; // Window (12) + Atm space (58) = 70.0

  // Atmosphere Energy Balance:
  // Input: solarAtmAbs + surfaceIRAtmAbsorption + evapLatent + convSensible
  const atmosphereTotalAbsorption = round1(solarAtmAbs + surfaceIRAtmAbsorption + evapLatent + convSensible);
  // Output: atmosphericBackRadiation + atmosphericSpaceRadiation
  // Note: mathematically,
  // atmosphericBackRadiation + atmosphericSpaceRadiation
  // = (surfaceTotalEmission - solarSurfAbs) + (70 - atmosphericWindowLoss)
  // = (surfaceEmission + evapLatent + convSensible - solarSurfAbs) + (70 - atmosphericWindowLoss)
  // = (surfaceEmission - atmosphericWindowLoss) + evapLatent + convSensible + (70 - solarSurfAbs)
  // = surfaceIRAtmAbsorption + evapLatent + convSensible + solarAtmAbs
  // = atmosphereTotalAbsorption!
  const atmosphereTotalEmission = round1(atmosphericBackRadiation + atmosphericSpaceRadiation);

  // Balances (Net Imbalance = Input - Output = 0.0)
  const spaceBalance = round1(spaceTotalAbsorption - spaceTotalEmission); // 0.0
  const atmosphereBalance = round1(atmosphereTotalAbsorption - atmosphereTotalEmission); // 0.0
  const surfaceBalance = round1(surfaceTotalAbsorption - surfaceTotalEmission); // 0.0

  const greenhouseEffectIntensity = round1(surfaceEmission - totalSpaceRadiation);

  return {
    solarInput,
    solarAtmAbsorption: solarAtmAbs,
    solarAtmReflection: solarAtmRef,
    solarSurfaceReflection: solarSurfRef,
    solarSurfaceAbsorption: solarSurfAbs,
    solarTotalReflection: solarTotalRef,
    evaporationLatentHeat: evapLatent,
    convectionSensibleHeat: convSensible,
    surfaceEmission,
    atmosphericWindowLoss,
    surfaceIRAtmAbsorption,
    atmosphericBackRadiation,
    atmosphericSpaceRadiation,
    totalSpaceRadiation,
    spaceTotalAbsorption,
    spaceTotalEmission,
    atmosphereTotalAbsorption,
    atmosphereTotalEmission,
    surfaceTotalAbsorption,
    surfaceTotalEmission,
    spaceBalance,
    atmosphereBalance,
    surfaceBalance,
    surfaceTempC: round1(surfaceTempC),
    surfaceTempK: round1(surfaceTempK),
    tempAnomalyC: round1(tempAnomaly),
    radiativeForcingWm2: Number(totalForcingWm2.toFixed(2)),
    greenhouseEffectIntensity,
    opticalThicknessIR: Number(tauFactor.toFixed(2)),
  };
}

/**
 * Format relative base 100 units to W/m² or retain unit
 */
export function formatFlux(value: number, unit: 'units' | 'wm2'): string {
  if (unit === 'wm2') {
    const wm2Value = value * (SOLAR_CONSTANT_WM2 / 100);
    return `${wm2Value.toFixed(1)} W/m²`;
  }
  return `${value.toFixed(1)}`;
}
