import { convertNxExecutor } from '@nrwl/devkit';
import dotnetBuildExecutor from './executor';

export default convertNxExecutor(dotnetBuildExecutor);
