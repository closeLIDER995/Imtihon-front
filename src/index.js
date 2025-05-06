import ReactDOM from 'react-dom/client';
import App from './App';
import { InfoProvider } from './Context/Context';
import { BrowserRouter } from 'react-router-dom';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <InfoProvider>
  <BrowserRouter>
    <App />
  </BrowserRouter>

  </InfoProvider>
);
