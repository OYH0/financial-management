
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'



try {
  const root = createRoot(document.getElementById("root")!);

  root.render(<App />);

} catch (error) {
  console.error('Error in main.tsx:', error);
}
