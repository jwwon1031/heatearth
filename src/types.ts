export interface GreenhouseGasState {
  co2: number; // ppm (e.g. 280 - 1200)
  ch4: number; // ppb (e.g. 500 - 4000)
  h2o: number; // % relative to baseline (e.g. 50% - 200%)
  albedoFactor?: number; // 0.8 - 1.2
}

export interface EnergyFluxValues {
  // Solar fluxes (base 100 units & W/m²)
  solarInput: number; // 100
  solarAtmAbsorption: number; // 23
  solarAtmReflection: number; // 23
  solarSurfaceReflection: number; // 7
  solarSurfaceAbsorption: number; // 47
  solarTotalReflection: number; // 30

  // Non-radiative surface fluxes
  evaporationLatentHeat: number; // 24
  convectionSensibleHeat: number; // 5

  // Terrestrial Infrared fluxes
  surfaceEmission: number; // 116
  atmosphericWindowLoss: number; // 12
  surfaceIRAtmAbsorption: number; // 104
  atmosphericBackRadiation: number; // 98
  atmosphericSpaceRadiation: number; // 58
  totalSpaceRadiation: number; // 70

  // Total Absorptions and Emissions per Zone
  spaceTotalAbsorption: number; // 70 (Solar in 100 - Albedo 30)
  spaceTotalEmission: number; // 70 (Window 12 + Atm to space 58)
  atmosphereTotalAbsorption: number; // 156 (Solar atm 23 + IR abs 104 + Latent 24 + Convection 5)
  atmosphereTotalEmission: number; // 156 (Back radiation 98 + Space radiation 58)
  surfaceTotalAbsorption: number; // 145 (Solar surf 47 + Back radiation 98)
  surfaceTotalEmission: number; // 145 (Surf emission 116 + Latent 24 + Convection 5)

  // Balances (Net In - Net Out)
  spaceBalance: number; // In(100) - Reflected(30) - SpaceIR(70) = 0
  atmosphereBalance: number; // 156 - 156 = 0
  surfaceBalance: number; // 145 - 145 = 0

  // Scientific metrics
  surfaceTempC: number; // in °C (e.g. 15.0)
  surfaceTempK: number; // in K (e.g. 288.15)
  tempAnomalyC: number; // ΔT from pre-industrial baseline (°C)
  radiativeForcingWm2: number; // ΔF in W/m²
  greenhouseEffectIntensity: number; // G = E_surf - (Total Outgoing IR)
  opticalThicknessIR: number;
}

export interface SimulationPreset {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  co2: number;
  ch4: number;
  h2o: number;
  iconName: string;
  era: string;
}

export type ViewMode = '3d' | 'diagram2d' | 'sankey' | 'split';
export type UnitDisplay = 'units' | 'wm2'; // Relative units (100) or W/m² (340 W/m²)
