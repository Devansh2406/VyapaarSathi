import { useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Download } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import BottomNav from './BottomNav';

interface ReportsProps {
  onNavigate: (screen: string) => void;
}

export default function Reports({ onNavigate }: ReportsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  // Sample data for charts
  const salesData = [
    { day: 'Mon', sales: 3200, expenses: 450, profit: 2750 },
    { day: 'Tue', sales: 2800, expenses: 380, profit: 2420 },
    { day: 'Wed', sales: 4100, expenses: 520, profit: 3580 },
    { day: 'Thu', sales: 3600, expenses: 490, profit: 3110 },
    { day: 'Fri', sales: 4850, expenses: 650, profit: 4200 },
    { day: 'Sat', sales: 5400, expenses: 580, profit: 4820 },
    { day: 'Sun', sales: 4200, expenses: 440, profit: 3760 }
  ];

  const categoryData = [
    { name: 'Groceries', value: 12500, color: '#3b82f6' },
    { name: 'Dairy', value: 8500, color: '#10b981' },
    { name: 'Snacks', value: 6200, color: '#f59e0b' },
    { name: 'Beverages', value: 4800, color: '#8b5cf6' },
    { name: 'Others', value: 3200, color: '#6b7280' }
  ];

  const expenseBreakdown = [
    { category: 'Rent', amount: 5000, percent: 42 },
    { category: 'Salary', amount: 3000, percent: 25 },
    { category: 'Electricity', amount: 1700, percent: 14 },
    { category: 'Transport', amount: 1500, percent: 13 },
    { category: 'Others', amount: 700, percent: 6 }
  ];

  const topProducts = [
    { name: 'Milk (500ml)', sold: 156, revenue: 3900, trend: 'up' },
    { name: 'Bread', sold: 142, revenue: 4260, trend: 'up' },
    { name: 'Parle-G Biscuits', sold: 210, revenue: 1050, trend: 'up' },
    { name: 'Tata Salt (1kg)', sold: 89, revenue: 1958, trend: 'stable' },
    { name: 'Fortune Oil (1L)', sold: 45, revenue: 7425, trend: 'down' }
  ];

  const weekStats = {
    totalSales: 28150,
    totalExpenses: 3510,
    netProfit: 24640,
    avgDailySales: 4021,
    creditGiven: 5600,
    creditReceived: 2400
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 pt-6 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl">Reports & Analytics</h1>
            <p className="text-blue-100 text-sm">Business insights</p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              selectedPeriod === 'week'
                ? 'bg-white text-blue-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              selectedPeriod === 'month'
                ? 'bg-white text-blue-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setSelectedPeriod('year')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              selectedPeriod === 'year'
                ? 'bg-white text-blue-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            This Year
          </button>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <div className="text-sm text-green-100 mb-1">Net Profit</div>
            <div className="text-2xl mb-1">₹{weekStats.netProfit.toLocaleString()}</div>
            <Badge className="bg-white/20 text-white hover:bg-white/20 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5%
            </Badge>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <div className="text-sm text-blue-100 mb-1">Total Sales</div>
            <div className="text-2xl mb-1">₹{weekStats.totalSales.toLocaleString()}</div>
            <Badge className="bg-white/20 text-white hover:bg-white/20 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8.3%
            </Badge>
          </Card>

          <Card className="p-4 border-0">
            <div className="text-sm text-gray-600 mb-1">Avg Daily Sales</div>
            <div className="text-xl text-gray-800">₹{weekStats.avgDailySales.toLocaleString()}</div>
          </Card>

          <Card className="p-4 border-0">
            <div className="text-sm text-gray-600 mb-1">Total Expenses</div>
            <div className="text-xl text-red-600">₹{weekStats.totalExpenses.toLocaleString()}</div>
          </Card>
        </div>

        {/* Sales Trend Chart */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800">Sales & Profit Trend</h3>
            <Button size="sm" variant="outline" className="h-8">
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} name="Sales" />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Performance */}
        <Card className="p-4">
          <h3 className="text-gray-800 mb-4">Sales by Category</h3>
          <div className="flex items-center justify-center mb-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {categoryData.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                  <span className="text-sm text-gray-700">{category.name}</span>
                </div>
                <span className="text-sm text-gray-800">₹{category.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Expense Breakdown */}
        <Card className="p-4">
          <h3 className="text-gray-800 mb-4">Expense Breakdown</h3>
          <div className="space-y-3">
            {expenseBreakdown.map((expense, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">{expense.category}</span>
                  <span className="text-sm text-gray-800">₹{expense.amount} ({expense.percent}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all" 
                    style={{ width: `${expense.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-4">
          <h3 className="text-gray-800 mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-800">{product.name}</div>
                    <div className="text-xs text-gray-600">{product.sold} units sold</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-green-600">₹{product.revenue}</div>
                  {product.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600 inline" />}
                  {product.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600 inline" />}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Daily Comparison Chart */}
        <Card className="p-4">
          <h3 className="text-gray-800 mb-4">Daily Sales vs Expenses</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#3b82f6" name="Sales" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Credit Summary */}
        <Card className="p-4">
          <h3 className="text-gray-800 mb-4">Credit Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-red-50 rounded-xl">
              <div className="text-xs text-red-600 mb-1">Credit Given</div>
              <div className="text-xl text-red-700">₹{weekStats.creditGiven.toLocaleString()}</div>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <div className="text-xs text-green-600 mb-1">Received</div>
              <div className="text-xl text-green-700">₹{weekStats.creditReceived.toLocaleString()}</div>
            </div>
          </div>
          <div className="mt-3 p-3 bg-orange-50 rounded-xl">
            <div className="text-sm text-orange-700">
              Net Credit Outstanding: ₹{(weekStats.creditGiven - weekStats.creditReceived).toLocaleString()}
            </div>
          </div>
        </Card>

        {/* Download Report */}
        <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl">
          <Download className="w-4 h-4 mr-2" />
          Download Full Report (PDF)
        </Button>
      </div>

      <BottomNav currentScreen="reports" onNavigate={onNavigate} />
    </div>
  );
}
