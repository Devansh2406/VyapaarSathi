import { ArrowLeft, TrendingUp, Wallet, Users, ShoppingBag, DollarSign, Calendar, Check } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import BottomNav from './BottomNav';

interface DayClosingProps {
  onNavigate: (screen: string) => void;
}

export default function DayClosing({ onNavigate }: DayClosingProps) {
  const todaySummary = {
    date: 'Friday, Jan 9, 2026',
    sales: {
      total: 4850,
      cash: 3200,
      upi: 1650,
      transactions: 18
    },
    expenses: {
      total: 970,
      breakdown: [
        { category: 'Transport', amount: 120 },
        { category: 'Electricity', amount: 850 }
      ]
    },
    credit: {
      given: 1200,
      received: 500,
      netCredit: 700
    },
    inventory: {
      itemsSold: 45,
      lowStockItems: 3
    }
  };

  const netProfit = todaySummary.sales.total - todaySummary.expenses.total - todaySummary.credit.given + todaySummary.credit.received;
  const cashInHand = todaySummary.sales.cash - todaySummary.expenses.total;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 pt-6 pb-8 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl">Day Closing</h1>
            <p className="text-indigo-100 text-sm">{todaySummary.date}</p>
          </div>
        </div>

        {/* Net Profit Card */}
        <Card className="bg-white/95 backdrop-blur p-5 border-0">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Today's Net Profit</div>
            <div className="text-4xl text-green-600 mb-2">₹{netProfit.toLocaleString()}</div>
            <div className="text-xs text-gray-600">After all expenses and credits</div>
          </div>
        </Card>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Sales Summary */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-gray-800">Sales Summary</h3>
              <p className="text-sm text-gray-600">{todaySummary.sales.transactions} transactions</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div>
                <div className="text-sm text-gray-700">Total Sales</div>
                <div className="text-xs text-gray-600 mt-1">All payment methods</div>
              </div>
              <div className="text-xl text-green-700">₹{todaySummary.sales.total}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="text-xs text-gray-600 mb-1">💵 Cash</div>
                <div className="text-lg text-gray-800">₹{todaySummary.sales.cash}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="text-xs text-gray-600 mb-1">📱 UPI/Digital</div>
                <div className="text-lg text-gray-800">₹{todaySummary.sales.upi}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Expenses Summary */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-gray-800">Expenses</h3>
              <p className="text-sm text-gray-600">{todaySummary.expenses.breakdown.length} entries</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
              <div className="text-sm text-gray-700">Total Expenses</div>
              <div className="text-xl text-red-700">₹{todaySummary.expenses.total}</div>
            </div>

            {todaySummary.expenses.breakdown.map((expense, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-700">{expense.category}</div>
                <div className="text-sm text-gray-800">₹{expense.amount}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Credit Summary */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-gray-800">Credit Summary</h3>
              <p className="text-sm text-gray-600">उधार का हिसाब</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
              <div className="text-sm text-gray-700">Credit Given</div>
              <div className="text-lg text-red-700">₹{todaySummary.credit.given}</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="text-sm text-gray-700">Payment Received</div>
              <div className="text-lg text-green-700">₹{todaySummary.credit.received}</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
              <div className="text-sm text-gray-700">Net Credit</div>
              <div className="text-lg text-orange-700">₹{todaySummary.credit.netCredit}</div>
            </div>
          </div>
        </Card>

        {/* Inventory Update */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-800">Inventory Update</h3>
              <p className="text-sm text-gray-600">Stock status</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <div className="text-xs text-blue-600 mb-1">Items Sold</div>
              <div className="text-2xl text-blue-700">{todaySummary.inventory.itemsSold}</div>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <div className="text-xs text-red-600 mb-1">Low Stock Alert</div>
              <div className="text-2xl text-red-700">{todaySummary.inventory.lowStockItems}</div>
            </div>
          </div>
        </Card>

        {/* Cash in Hand */}
        <Card className="p-5 bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-green-100 mb-2">Cash in Hand</div>
              <div className="text-3xl mb-1">₹{cashInHand.toLocaleString()}</div>
              <div className="text-sm text-green-100">Cash sales - expenses</div>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
        </Card>

        {/* Summary Message */}
        <Card className="p-5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-purple-100">Weekly Summary</div>
              <div className="text-xl">You earned ₹12,450</div>
            </div>
          </div>
          <p className="text-sm text-purple-100">
            Great work this week! After all expenses and credits, your real profit is looking good. 🎉
          </p>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl text-lg"
            onClick={() => {
              // In real app, this would save the day's data
              alert('Day closed successfully! ✓');
              onNavigate('dashboard');
            }}
          >
            <Check className="w-5 h-5 mr-2" />
            Confirm & Close Day
          </Button>

          <Button 
            variant="outline"
            className="w-full h-12 rounded-xl"
            onClick={() => onNavigate('dashboard')}
          >
            Go Back
          </Button>
        </div>

        {/* Info */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-gray-700">
            💡 <strong>Tip:</strong> Closing your day helps you track daily performance and keeps your records organized. You can always view past summaries in Reports.
          </p>
        </Card>
      </div>

      <BottomNav currentScreen="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
