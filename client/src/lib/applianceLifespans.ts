interface LifespanInfo {
  years: number
  thumbtackCategory: string
  angiCategory: string
}

const lifespans: Record<string, LifespanInfo> = {
  hvac_central:          { years: 18, thumbtackCategory: 'hvac-contractors',  angiCategory: 'heating-cooling' },
  hvac_window_ac:        { years: 12, thumbtackCategory: 'hvac-contractors',  angiCategory: 'heating-cooling' },
  water_heater_gas:      { years: 10, thumbtackCategory: 'plumbers',          angiCategory: 'plumbing' },
  water_heater_electric: { years: 12, thumbtackCategory: 'plumbers',          angiCategory: 'plumbing' },
  refrigerator:          { years: 13, thumbtackCategory: 'appliance-repair',  angiCategory: 'appliance-repair' },
  dishwasher:            { years: 12, thumbtackCategory: 'appliance-repair',  angiCategory: 'appliance-repair' },
  washing_machine:       { years: 12, thumbtackCategory: 'appliance-repair',  angiCategory: 'appliance-repair' },
  dryer_gas:             { years: 13, thumbtackCategory: 'appliance-repair',  angiCategory: 'appliance-repair' },
  dryer_electric:        { years: 13, thumbtackCategory: 'appliance-repair',  angiCategory: 'appliance-repair' },
  garbage_disposal:      { years: 12, thumbtackCategory: 'plumbers',          angiCategory: 'plumbing' },
  smoke_detector:        { years: 10, thumbtackCategory: 'electricians',      angiCategory: 'electrical' },
  co_detector:           { years:  7, thumbtackCategory: 'electricians',      angiCategory: 'electrical' },
  garage_door:           { years: 12, thumbtackCategory: 'garage-door-repair',angiCategory: 'garage-door' },
  sump_pump:             { years:  8, thumbtackCategory: 'plumbers',          angiCategory: 'plumbing' },
  water_softener:        { years: 12, thumbtackCategory: 'plumbers',          angiCategory: 'plumbing' },
  sprinkler_system:      { years: 20, thumbtackCategory: 'lawn-care',         angiCategory: 'irrigation' },
  // gutter omitted — lifespan varies too widely by material (20-50 yrs)
}

export interface AgeWarning {
  level: 'approaching' | 'past'
  age: number
  lifespan: number
  thumbtackCategory: string
  angiCategory: string
}

export function getAgeWarning(typeId: string, installYear: number | undefined): AgeWarning | null {
  if (!installYear) return null
  const info = lifespans[typeId]
  if (!info) return null
  const age = new Date().getFullYear() - installYear
  if (age < info.years - 2) return null
  return {
    level: age >= info.years ? 'past' : 'approaching',
    age,
    lifespan: info.years,
    thumbtackCategory: info.thumbtackCategory,
    angiCategory: info.angiCategory,
  }
}
