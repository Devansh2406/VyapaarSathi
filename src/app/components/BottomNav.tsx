import { Home, Package, ShoppingCart, Users, Menu, Wallet } from 'lucide-react';

interface BottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export default function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'inventory', icon: Package, label: 'Stock' },
    { id: 'orders', icon: ShoppingCart, label: 'Orders' },
    { id: 'expenses', icon: Wallet, label: 'Expense' },
    { id: 'credit', icon: Users, label: 'Credit' },
    { id: 'insights', icon: Menu, label: 'More' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 safe-area-bottom z-50">
      <div className="flex items-center justify-around max-w-md mx-auto overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors min-w-[60px] flex-shrink-0 ${isActive
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-blue-100' : ''
                }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
