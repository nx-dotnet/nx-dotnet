import { cmdLineParameter } from '../models';

export function getParameterString(parameters: cmdLineParameter[]): string {
  return parameters.reduce(
    (acc, current) =>
      {
        if (typeof current.value === 'boolean' && current.value) {
          return acc + `--${current.flag} `;
        } else {
          return acc + `--${current.flag} ` + (current.value ? `${current.value} ` : '')
        }
      },
    ''
  );
}
