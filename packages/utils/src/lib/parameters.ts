import { cmdLineParameter } from './models';

/**
 * Transforms an array of cmdLineParameter into a string.
 * @param parameters Parameters to transform into CLI arguments
 * @returns Parameter string to be appended to CLI command
 */
export function getParameterString(parameters: cmdLineParameter[]): string {
  return parameters.reduce((acc, current) => {
    if (typeof current.value === 'boolean' || !current.value) {
      if (current.value) {
        return acc + `--${current.flag} `;
      } else {
        return acc;
      }
    } else {
      return acc + `--${current.flag} ${current.value} `;
    }
  }, '');
}
