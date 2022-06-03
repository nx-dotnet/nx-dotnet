import { StrictMode } from 'react';
import * as ReactDOMClient from 'react-dom';

import App from './app/app';

ReactDOMClient.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root'),
);
