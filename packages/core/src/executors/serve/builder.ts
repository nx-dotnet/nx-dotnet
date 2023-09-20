import { convertNxExecutor } from '@nx/devkit';

import dotnetRunExecutor from './executor';

export default convertNxExecutor(dotnetRunExecutor);
