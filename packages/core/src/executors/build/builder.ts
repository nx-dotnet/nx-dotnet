import { convertNxExecutor } from '@nx/devkit';

import dotnetBuildExecutor from './executor';

export default convertNxExecutor(dotnetBuildExecutor);
