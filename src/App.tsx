import { AppProvider, useApp } from './context/AppContext';
import { RoleSelector } from './components/RoleSelector';
import { MainPage } from './pages/MainPage';
import './index.css';

function AppContent() {
  const { currentUser } = useApp();
  
  if (!currentUser) {
    return <RoleSelector />;
  }
  
  return <MainPage />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
