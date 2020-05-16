import calculateMetrics from './functions/calculateMetrics.ts';
import { writeJsonSync } from 'https://deno.land/std/fs/mod.ts';

interface Options {
  rounds?: number,
};

/**
 * ES Module performance testing library
 */
export default class {
  /**
   * @var {Options} options
   */
  private options: Options = {
    rounds: 100000
  };

  /**
   * @var {any} results
   */
  private results: any;

  /**
   * @param {Options} [options]
   */
  constructor(options: Options = {}) {
    // Overwrite with user supplied options (if any)
    this.options = this._mergeOptions(options);
  }

  /**
   * Validate, merge with defaults, and return options.
   *
   * @param {Options} options
   * @returns {object}
   */
  _mergeOptions(options: Options) {
    // Validate options
    if (typeof options !== 'object') {
      throw new TypeError('Paramater "options" must be of type object.');
    }

    // Validate options.rounds
    if (options.rounds) {
      if (typeof options.rounds !== 'number') {
        throw new TypeError('Option "rounds" must be of type number.');
      }
    }

    // Combine options with defaults and return result
    return Object.assign(this.options, options);
  }

  /**
   * Test method performance and return statistics data
   *
   * @param {string} name
   * @param {Function} method
   * @param {Options} [options]
   * @returns {object} Statistics data
   */
  test(name: string, method: Function, options: Options = {}) {
    // Validate name
    if (typeof name !== 'string') {
      throw new TypeError('Paramater "name" must of type string.');
    }

    // Validate method
    if (typeof method !== 'function') {
      throw new TypeError('Parameter "method" must be of type function.');
    }

    options = this._mergeOptions(options);

    const roundTimes = [];

    // Run test for as many rounds as specified
    for (let i = options.rounds; i > 0; i--) {
      // Record start time
      const roundStartTime = performance.now();

      // Run user supplied method
      // Wrapped in Promise.resolve() for async compatability
      Promise.resolve(method());

      // Record stop time
      const roundStopTime = performance.now();

      // Calculate round time
      const roundTime = roundStopTime - roundStartTime;

      // Store round time
      roundTimes.push(roundTime);
    }

    // Return data object
    const data = {
      name: name,
      date: new Date(),
      options: options,
      results: calculateMetrics(roundTimes),
    };

    // Store results
    this.results.push(data);

    // Return test data
    return data;
  }

  /**
   * Output results to console.
   */
  output() {
    let maxLength = 0;

    this.results.forEach((test) => {
      const outputLength = Math.round(test.results.operationsPerSecond.trimmed).toLocaleString().length;

      if (outputLength > maxLength) {
        maxLength = outputLength;
      }
    });

    this.results.forEach((test) => {
      // Basic pretty formatting
      let output = Math.round(test.results.operationsPerSecond.trimmed).toLocaleString();

      // Add spaces to the front
      for (let i = maxLength - output.length; i > 0; i--) {
        output = ' ' + output;
      }

      console.log(`${output} op/s | ${test.name}`);
    });
  }

  /**
   * Save results to JSON file.
   *
   * @param {string} file
   */
  save(file: string) {
    writeJsonSync(file, this.results, {
      spaces: 2,
    });

    console.info(`Saved to: ${file}`);
  }
}
