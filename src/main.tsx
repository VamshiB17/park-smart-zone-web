import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ParkingProvider } from './contexts/ParkingContext.tsx';
import { FeedbackProvider } from './contexts/FeedbackContext.tsx';

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <ParkingProvider>
        <FeedbackProvider>
          <App />
        </FeedbackProvider>
      </ParkingProvider>
    </AuthProvider>
  </BrowserRouter>
);
