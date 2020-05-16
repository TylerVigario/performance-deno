import mean from './statistics/mean.ts';
import median from './statistics/median.ts';
import mode from './statistics/mode.ts';
import range from './statistics/range.ts';

/**
 * Calculate test metrics.
 *
 * @param {Array} roundTimes Array of round times.
 * @returns {object} Metrics data object.
 */
export default function(roundTimes: any) {
  const data = {
    totalTime: 0,
    timePerRound: {
      mean: {
        normal: 0,
        trimmed: 0,
      },
      median: 0,
      modes: [],
      range: [],
      standardDeviation: 0,
    },
    standardDeviation: 0,
    operationsPerSecond: {
      normal: 0,
      trimmed: 0,
    },
  };

  // Calculate total time
  data.totalTime = roundTimes.reduce((a, b) => {
    return a + b;
  });

  // Calculate averages
  data.timePerRound.mean.normal = data.totalTime / roundTimes.length;
  data.timePerRound.mean.trimmed = mean(roundTimes, 0.1);
  data.timePerRound.median = median(roundTimes);
  data.timePerRound.modes = mode(roundTimes);
  data.timePerRound.range = range(roundTimes);

  // Calculate standard deviation
  data.timePerRound.standardDeviation = Math.sqrt(roundTimes.reduce(function(sq, n) {
    return sq + Math.pow(n - data.timePerRound.mean.normal, 2);
  }, 0) / (roundTimes.length - 1)),

  // Calculate operations per second
  data.operationsPerSecond = {
    normal: 1000 / data.timePerRound.mean.normal,
    trimmed: 1000 / data.timePerRound.mean.trimmed,
  };

  return data;
}
