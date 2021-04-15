import { convertNxExecutor } from '@nrwl/devkit';
import dotnetRunExecutor from './executor';

export default convertNxExecutor(dotnetRunExecutor);
