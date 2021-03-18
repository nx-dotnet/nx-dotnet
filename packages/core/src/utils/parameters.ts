import { cmdLineParameter } from "../models";

export function getParameterString(parameters: cmdLineParameter[]): string {
    return parameters.reduce((acc, current) => acc + `--${current.flag} ` + (current.value ? `${current.value} ` : ''), '')
}