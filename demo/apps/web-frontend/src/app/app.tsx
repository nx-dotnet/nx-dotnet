// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';

import { WeatherForecast } from '@nx-dotnet/demo-libs-generated-webapi-types';

const x: WeatherForecast = {
  date: 'TAOSNAPS',
  forecaster: {
    employer: { employees: [] },
  },
  summary: 'My weather forecast',
  temperature: {
    temperatureC: 12,
    temperatureF: 53
  }
};

export function App() {
  return (
    <>
      <div />
    </>
  );
}

export default App;
