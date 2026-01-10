import { useState } from 'react';
import { ArrowLeft, Plus, Zap, Truck, Home, Users as UsersIcon, Receipt, Calendar } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import BottomNav from './BottomNav';

interface ExpensesTrackingProps {
  onNavigate: (screen: string) => void;
}

interface Expense {
  id: number;
  category: string;
  amount: number;
  description: string;
  date: string;
  icon: string;
}

export default function ExpensesTracking({ onNavigate }: ExpensesTrackingProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  const expenses: Expense[] = [
    { id: 1, category: 'Rent', amount: 5000, description: 'Shop rent - January', date: '2026-01-09', icon: '🏠' },
    { id: 2, category: 'Electricity', amount: 850, description: 'Power bill', date: '2026-01-09', icon: '⚡' },
    { id: 3, category: 'Transport', amount: 120, description: 'Auto fare for bank', date: '2026-01-09', icon: '🚗' },
    { id: 4, category: 'Salary', amount: 3000, description: 'Helper salary - advance', date: '2026-01-08', icon: '👤' },
    { id: 5, category: 'Transport', amount: 80, description: 'Petrol', date: '2026-01-08', icon: '🚗' },
    { id: 6, category: 'Other', amount: 250, description: 'Shop cleaning supplies', date: '2026-01-07', icon: '📦' },
    { id: 7, category: 'Transport', amount: 150, description: 'Goods delivery', date: '2026-01-07', icon: '🚗' },
    { id: 8, category: 'Electricity', amount: 100, description: 'Recharge prepaid meter', date: '2026-01-06', icon: '⚡' },
  ];

  const categoryIcons: { [key: string]: any } = {
    'Rent': Home,
    'Electricity': Zap,
    'Transport': Truck,
    'Salary': UsersIcon,
    'Other': Receipt
  };

  const todayExpenses = expenses.filter(e => e.date === '2026-01-09');
  const weekExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return expenseDate >= weekAgo;
  });

  const getCurrentExpenses = () => {
    if (selectedPeriod === 'today') return todayExpenses;
    if (selectedPeriod === 'week') return weekExpenses;
    return expenses;
  };

  const currentExpenses = getCurrentExpenses();
  const totalAmount = currentExpenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals = currentExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as { [key: string]: number });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 pt-6 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl">Daily Expenses</h1>
            <p className="text-orange-100 text-sm">Track all your expenses</p>
          </div>
        </div>

        {/* Total Card */}
        <Card className="bg-white/95 backdrop-blur p-4 border-0">
          <div className="text-sm text-gray-600 mb-2">Total Expenses</div>
          <div className="text-3xl text-red-600 mb-3">₹{totalAmount.toLocaleString()}</div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod('today')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedPeriod === 'today'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedPeriod === 'week'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedPeriod === 'month'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Month
            </button>
          </div>
        </Card>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Add Expense Button */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl">
              <Plus className="w-5 h-5 mr-2" />
              Add New Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Category</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">🏠 Rent</SelectItem>
                    <SelectItem value="electricity">⚡ Electricity</SelectItem>
                    <SelectItem value="transport">🚗 Transport</SelectItem>
                    <SelectItem value="salary">👤 Salary</SelectItem>
                    <SelectItem value="other">📦 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount (₹)</Label>
                <Input type="number" placeholder="0" className="mt-2" />
              </div>
              <div>
                <Label>Description</Label>
                <Input placeholder="e.g., Power bill payment" className="mt-2" />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" defaultValue="2026-01-09" className="mt-2" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={() => setShowAddDialog(false)}>
                  Add Expense
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Category Breakdown */}
        <Card className="p-4">
          <h3 className="text-gray-800 mb-3">Category Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(categoryTotals)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => {
                const Icon = categoryIcons[category] || Receipt;
                const percentage = ((amount / totalAmount) * 100).toFixed(1);
                
                return (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-800">{category}</div>
                        <div className="text-xs text-gray-600">{percentage}% of total</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-600">₹{amount.toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>

        {/* Recent Expenses */}
        <div>
          <h3 className="text-gray-700 mb-3 px-1">Recent Expenses</h3>
          <div className="space-y-3">
            {currentExpenses.map(expense => {
              const Icon = categoryIcons[expense.category] || Receipt;
              const date = new Date(expense.date);
              const isToday = expense.date === '2026-01-09';
              
              return (
                <Card key={expense.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h4 className="text-gray-800">{expense.category}</h4>
                          <p className="text-sm text-gray-600">{expense.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg text-red-600">₹{expense.amount}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {isToday ? 'Today' : date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </div>
                        {isToday && (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                            Today
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Summary Info */}
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <h4 className="text-gray-800 mb-2">💡 Expense Impact</h4>
          <p className="text-sm text-gray-600">
            Your expenses are automatically deducted from profit calculations. Keep tracking daily to know your real earnings!
          </p>
        </Card>
      </div>

      <BottomNav currentScreen="expenses" onNavigate={onNavigate} />
    </div>
  );
}
