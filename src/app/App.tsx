import { useState } from 'react';
import { Toaster } from 'sonner';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import InventoryManagement from './components/InventoryManagement';
import WhatsAppOrders from './components/WhatsAppOrders';
import ExpensesTracking from './components/ExpensesTracking';
import CreditManagement from './components/CreditManagement';
import DayClosing from './components/DayClosing';
import Reports from './components/Reports';
import AIInsights from './components/AIInsights';
import StoreFront from './components/StoreFront';
import Settings from './components/Settings';
import PaymentSetup from './components/PaymentSetup';

type Screen = 'login' | 'dashboard' | 'inventory' | 'orders' | 'expenses' | 'credit' | 'dayClosing' | 'reports' | 'insights' | 'store' | 'settings' | 'paymentSetup';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    // Check if Payment Setup (QR Codes) is done
    const upiConfig = localStorage.getItem('upi_config');
    if (!upiConfig) {
      setCurrentScreen('paymentSetup');
    } else {
      setCurrentScreen('dashboard');
    }
  };

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('login');
  };

  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      {currentScreen === 'dashboard' && <Dashboard onNavigate={navigateTo} onLogout={handleLogout} />}
      {currentScreen === 'inventory' && <InventoryManagement onNavigate={navigateTo} />}
      {currentScreen === 'orders' && <WhatsAppOrders onNavigate={navigateTo} />}
      {currentScreen === 'expenses' && <ExpensesTracking onNavigate={navigateTo} />}
      {currentScreen === 'credit' && <CreditManagement onNavigate={navigateTo} />}
      {currentScreen === 'dayClosing' && <DayClosing onNavigate={navigateTo} />}
      {currentScreen === 'reports' && <Reports onNavigate={navigateTo} />}
      {currentScreen === 'insights' && <AIInsights onNavigate={navigateTo} onLogout={handleLogout} />}
      {currentScreen === 'store' && <StoreFront onNavigate={navigateTo} />}
      {currentScreen === 'settings' && <Settings onNavigate={navigateTo} onLogout={handleLogout} />}
      {currentScreen === 'paymentSetup' && <PaymentSetup onFinish={() => setCurrentScreen('dashboard')} />}
    </div>
  );
}
