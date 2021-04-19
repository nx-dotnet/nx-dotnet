import { TargetConfiguration } from "@nrwl/devkit"

export function GetTestExecutorConfig(): TargetConfiguration {
    return ({
        executor: '@nx-dotnet/core:test'
    })
}