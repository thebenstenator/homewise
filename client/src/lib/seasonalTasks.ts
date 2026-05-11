import type { Appliance } from '../types/appliance'

export type Season = 'spring' | 'summer' | 'fall' | 'winter'

interface SeasonalTaskDef {
  typeId: string
  taskId: string
  label: string
}

const seasonalTaskMap: Record<Season, SeasonalTaskDef[]> = {
  spring: [
    { typeId: 'hvac_central',      taskId: 'hvac_coil_clean',            label: 'Clean AC coils before summer' },
    { typeId: 'hvac_window_ac',    taskId: 'window_ac_filter_clean',     label: 'Clean window AC filter' },
    { typeId: 'hvac_window_ac',    taskId: 'window_ac_coil_clean',       label: 'Clean window AC coils' },
    { typeId: 'sprinkler_system',  taskId: 'sprinkler_spring_startup',   label: 'Start up sprinkler system' },
    { typeId: 'gutter',            taskId: 'gutter_inspect',             label: 'Inspect gutters' },
    { typeId: 'sump_pump',         taskId: 'sump_test',                  label: 'Test sump pump (rainy season ahead)' },
  ],
  summer: [
    { typeId: 'hvac_central',      taskId: 'hvac_filter_replace',        label: 'Replace HVAC filter (peak use season)' },
    { typeId: 'hvac_window_ac',    taskId: 'window_ac_filter_clean',     label: 'Clean window AC filter (mid-season)' },
    { typeId: 'refrigerator',      taskId: 'fridge_coil_clean',          label: 'Clean refrigerator coils (works harder in heat)' },
  ],
  fall: [
    { typeId: 'hvac_central',      taskId: 'hvac_annual_tune',           label: 'Schedule furnace tune-up before winter' },
    { typeId: 'hvac_window_ac',    taskId: 'window_ac_winterize',        label: 'Winterize window AC' },
    { typeId: 'sprinkler_system',  taskId: 'sprinkler_winterize',        label: 'Winterize sprinkler system' },
    { typeId: 'gutter',            taskId: 'gutter_clean_fall',          label: 'Clean gutters (leaf season)' },
    { typeId: 'smoke_detector',    taskId: 'smoke_battery',              label: 'Replace smoke detector batteries' },
    { typeId: 'co_detector',       taskId: 'co_battery',                 label: 'Replace CO detector batteries' },
    { typeId: 'garage_door',       taskId: 'garage_weatherstripping',    label: 'Inspect garage door weatherstripping' },
  ],
  winter: [
    { typeId: 'water_heater_gas',      taskId: 'gas_wh_flush',       label: 'Flush water heater' },
    { typeId: 'water_heater_electric', taskId: 'elec_wh_flush',      label: 'Flush water heater' },
    { typeId: 'sump_pump',             taskId: 'sump_backup_check',  label: 'Check sump pump backup battery' },
    { typeId: 'garage_door',           taskId: 'garage_lubricate',   label: 'Lubricate garage door (cold weather)' },
  ],
}

export function getCurrentSeason(): Season {
  const month = new Date().getMonth() // 0–11
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'fall'
  return 'winter'
}

export interface RelevantSeasonalTask {
  applianceId: string
  applianceName: string
  taskId: string
  label: string
}

export function getSeasonalTasksForUser(
  season: Season,
  appliances: Appliance[]
): RelevantSeasonalTask[] {
  const result: RelevantSeasonalTask[] = []
  for (const def of seasonalTaskMap[season]) {
    const appliance = appliances.find((a) => a.typeId === def.typeId)
    if (appliance) {
      result.push({
        applianceId: appliance._id,
        applianceName: appliance.name,
        taskId: def.taskId,
        label: def.label,
      })
    }
  }
  return result
}
