// Parser para exportaciones reales de Apple Salud (Apple HealthKit XML / JSON)

export interface ParsedHealthData {
  date: string;
  steps: number;
  distanceKm: number;
  activeEnergyKcal: number;
  workouts: Array<{
    id: string;
    type: string;
    durationMinutes: number;
    activeEnergyKcal?: number;
    distanceKm?: number;
    startedAt?: string;
    source: string;
  }>;
  history?: Array<{
    date: string;
    steps: number;
    distanceKm: number;
    activeEnergyKcal: number;
  }>;
}

export function parseAppleHealthXml(xmlString: string, targetDate?: string): ParsedHealthData {
  const todayStr = targetDate || new Date().toISOString().split('T')[0];
  const historyMap: Record<string, { steps: number; distanceKm: number; activeEnergyKcal: number }> = {};
  const workouts: ParsedHealthData['workouts'] = [];

  // Match Step records: <Record type="HKQuantityTypeIdentifierStepCount" ... value="123" ... startDate="2026-09-25 10:20:00 ..." />
  const recordRegex = /<Record\s+[^>]*type=["']([^"']+)["'][^>]*value=["']([^"']+)["'][^>]*startDate=["']([^"']+)["'][^>]*\/?>/gi;
  let match: RegExpExecArray | null;

  while ((match = recordRegex.exec(xmlString)) !== null) {
    const type = match[1];
    const value = parseFloat(match[2]);
    const startDate = match[3];
    const dateKey = startDate.split(' ')[0] || startDate.split('T')[0];

    if (!historyMap[dateKey]) {
      historyMap[dateKey] = { steps: 0, distanceKm: 0, activeEnergyKcal: 0 };
    }

    if (type.includes('StepCount')) {
      historyMap[dateKey].steps += Math.round(value);
    } else if (type.includes('DistanceWalkingRunning')) {
      historyMap[dateKey].distanceKm += Number((value).toFixed(2));
    } else if (type.includes('ActiveEnergyBurned')) {
      historyMap[dateKey].activeEnergyKcal += Math.round(value);
    }
  }

  // Match Workout records: <Workout workoutActivityType="HKWorkoutActivityTypeRunning" duration="30" totalDistance="5" totalEnergyBurned="300" startDate="..." />
  const workoutRegex = /<Workout\s+[^>]*workoutActivityType=["']([^"']+)["'][^>]*duration=["']([^"']+)["'][^>]*startDate=["']([^"']+)["'][^>]*\/?>/gi;
  while ((match = workoutRegex.exec(xmlString)) !== null) {
    const rawType = match[1];
    const duration = parseFloat(match[2]);
    const startDate = match[3];
    const cleanType = rawType.replace('HKWorkoutActivityType', '').replace(/([A-Z])/g, ' $1').trim();

    workouts.push({
      id: `wk_import_${Date.now()}_${workouts.length}`,
      type: cleanType || 'Entrenamiento',
      durationMinutes: Math.round(duration),
      startedAt: startDate,
      source: 'apple_health_export',
    });
  }

  const todayStats = historyMap[todayStr] || { steps: 0, distanceKm: 0, activeEnergyKcal: 0 };

  const history = Object.keys(historyMap)
    .sort()
    .reverse()
    .slice(0, 14)
    .map((d) => ({
      date: d,
      steps: historyMap[d].steps,
      distanceKm: Number(historyMap[d].distanceKm.toFixed(2)),
      activeEnergyKcal: historyMap[d].activeEnergyKcal,
    }));

  return {
    date: todayStr,
    steps: todayStats.steps,
    distanceKm: Number(todayStats.distanceKm.toFixed(2)),
    activeEnergyKcal: todayStats.activeEnergyKcal,
    workouts,
    history,
  };
}
