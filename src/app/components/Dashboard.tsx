import { ArrowRight, Package, ShoppingCart, Wallet, Users, TrendingUp, AlertCircle, Calendar, IndianRupee, Settings, LogOut, HelpCircle, Sparkles } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import BottomNav from './BottomNav';

interface DashboardProps {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export default function Dashboard({ onNavigate, onLogout }: DashboardProps) {
  const todayStats = {
    sales: 4850,
    expenses: 650,
    credit: 1200,
    cashInHand: 3000
  };

  const lowStockItems = [
    { name: 'Milk (500ml)', stock: 8, minStock: 20 },
    { name: 'Bread', stock: 5, minStock: 15 },
    { name: 'Maggi', stock: 12, minStock: 30 }
  ];

  const pendingOrders = 2;
  const creditDue = 8500;

  return (
    <div className="min-h-screen bg-sky-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 to-blue-500 text-white px-4 pt-6 pb-8 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl mb-1">Good Morning! 👋</h1>
            <p className="text-blue-100 text-sm">Friday, Jan 9, 2026</p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
            <span className="text-2xl">🏪</span>
          </div>
        </div>

        {/* Today's Summary Card */}
        <Card className="bg-white/95 backdrop-blur p-4 border-0 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700">Today's Summary</h3>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Live</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700">Sales</span>
              </div>
              <div className="text-xl text-green-800">₹{todayStats.sales}</div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-red-600" />
                <span className="text-xs text-red-700">Expenses</span>
              </div>
              <div className="text-xl text-red-800">₹{todayStats.expenses}</div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-orange-700">Credit Given</span>
              </div>
              <div className="text-xl text-orange-800">₹{todayStats.credit}</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <IndianRupee className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-700">Cash in Hand</span>
              </div>
              <div className="text-xl text-blue-800">₹{todayStats.cashInHand}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Alerts Section */}
        {(lowStockItems.length > 0 || pendingOrders > 0) && (
          <Card className="border-l-4 border-l-orange-500 bg-orange-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-gray-800 mb-1">Attention Needed</h4>
                <div className="space-y-1 text-sm text-gray-700">
                  {pendingOrders > 0 && (
                    <div>• {pendingOrders} WhatsApp orders pending</div>
                  )}
                  {lowStockItems.length > 0 && (
                    <div>• {lowStockItems.length} items running low</div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-gray-700 mb-3 px-1">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Card
              onClick={() => onNavigate('orders')}
              className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <ShoppingCart className="w-6 h-6 mb-2" />
              <div className="text-sm mb-1">Orders</div>
              {pendingOrders > 0 && (
                <Badge className="bg-white/30 text-white hover:bg-white/30">{pendingOrders} New</Badge>
              )}
            </Card>

            <Card
              onClick={() => onNavigate('inventory')}
              className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <Package className="w-6 h-6 mb-2" />
              <div className="text-sm mb-1">Inventory</div>
              {lowStockItems.length > 0 && (
                <Badge className="bg-white/30 text-white hover:bg-white/30">{lowStockItems.length} Low</Badge>
              )}
            </Card>

            <Card
              onClick={() => onNavigate('expenses')}
              className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <Wallet className="w-6 h-6 mb-2" />
              <div className="text-sm">Add Expense</div>
            </Card>

            <Card
              onClick={() => onNavigate('credit')}
              className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <Users className="w-6 h-6 mb-2" />
              <div className="text-sm mb-1">Credit</div>
              <div className="text-xs text-white/80">₹{creditDue} Due</div>
            </Card>
          </div>
        </div>

        {/* Customer Pattern Alert */}
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold text-sm mb-1">Customer Pattern Alert</h4>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                🎯 <span className="font-medium text-gray-800">Ravi Kumar</span> usually buys bread and milk on Sunday mornings. Today is Friday - make sure you stock up for the weekend!
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigate('insights')}
                className="h-8 text-xs bg-white border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                View Customer Patterns
              </Button>
            </div>
          </div>
        </Card>

        {/* Day Closing Button */}
        <Button
          onClick={() => onNavigate('dayClosing')}
          className="w-full h-14 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white rounded-xl text-lg shadow-lg shadow-gray-200"
        >
          <Calendar className="w-5 h-5 mr-2" />
          Close Today's Business
        </Button>
      </div>

      <BottomNav currentScreen="dashboard" onNavigate={onNavigate} />
    </div>
  );
}