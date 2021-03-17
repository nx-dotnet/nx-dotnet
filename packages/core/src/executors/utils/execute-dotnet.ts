import { ExecutorContext } from "@nrwl/devkit";
import { readdirSync } from 'fs';
import { BuildCommandTypes, CommandParams, dotnetCLI } from "../../core/dotnet";

export function ExecuteDotNet(command: BuildCommandTypes, context: ExecutorContext, params: CommandParams) {
  try {
    console.info(`Executing command: ${command}`);
    const sourceRoot = context.workspace.projects[context.projectName].root;
    const projectFile = readdirSync(sourceRoot).find((elm) => { return elm.match(/.*\.([a-zA-Z]{2})(proj)/ig); })
    dotnetCLI(command, projectFile, params)
    return { success: true };
  } catch (e) {
    console.error(`Failed to execute command: ${command}`, e);
    return { success: false };
  }
}
