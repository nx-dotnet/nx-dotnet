import { Temperature } from './temperature';
import { Person } from './person';

export interface WeatherForecast {
  date: string;
  temperature?: Temperature;
  summary?: string;
  forecaster?: Person;
}
