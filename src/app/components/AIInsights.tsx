import { ArrowLeft, Sparkles, TrendingUp, AlertTriangle, Lightbulb, Calendar, ShoppingBag, Users as UsersIcon, Settings, LogOut } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import BottomNav from './BottomNav';

interface AIInsightsProps {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export default function AIInsights({ onNavigate, onLogout }: AIInsightsProps) {
  const insights = [
    {
      id: 1,
      type: 'success',
      icon: '🎉',
      title: 'Great Week!',
      message: 'Your sales increased by 18% compared to last week. Keep it up!',
      action: 'View Details',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 2,
      type: 'warning',
      icon: '⚠️',
      title: 'Transport Expense Increased',
      message: 'You spent ₹520 more on transport this week. Consider optimizing delivery routes.',
      action: 'View Expenses',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 3,
      type: 'info',
      icon: '📊',
      title: 'Milk Sells More on Weekends',
      message: 'Stock analysis shows 35% more milk sales on Saturdays and Sundays.',
      action: 'Stock Prediction',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 4,
      type: 'alert',
      icon: '🚨',
      title: 'Credit Alert',
      message: 'Amit Patel has ₹4,500 overdue. Consider sending payment reminder.',
      action: 'Send Reminder',
      color: 'from-red-500 to-red-600'
    }
  ];

  const suggestions = [
    {
      icon: '🎯',
      title: 'Stock More Bread on Sundays',
      description: 'Your data shows Ravi usually buys bread on Sundays. Stock extra units.',
      priority: 'high'
    },
    {
      icon: '📅',
      title: 'Festival Week Coming',
      description: 'Republic Day week ahead. Consider stocking more sweets and snacks.',
      priority: 'medium'
    },
    {
      icon: '💰',
      title: 'Reduce Credit Risk',
      description: 'Avoid giving more credit to customers with overdue payments.',
      priority: 'high'
    },
    {
      icon: '🌧️',
      title: 'Weather Impact',
      description: 'Rain expected this week. Expect 15-20% lower footfall. Adjust inventory.',
      priority: 'low'
    }
  ];

  const demandPrediction = [
    { item: 'Milk (500ml)', demand: 'High', prediction: '+35%', days: 'Weekend', color: 'green' },
    { item: 'Bread', demand: 'High', prediction: '+28%', days: 'Sunday', color: 'green' },
    { item: 'Cold Drinks', demand: 'Medium', prediction: '+15%', days: 'Saturday', color: 'yellow' },
    { item: 'Rice', demand: 'Low', prediction: '-5%', days: 'Weekdays', color: 'gray' }
  ];

  const reorderSuggestions = [
    { item: 'Milk (500ml)', current: 8, suggested: 40, reason: 'High weekend demand', urgency: 'urgent' },
    { item: 'Bread', current: 5, suggested: 30, reason: 'Stock will finish in 1 day', urgency: 'urgent' },
    { item: 'Maggi Noodles', current: 12, suggested: 50, reason: 'Popular snack item', urgency: 'medium' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 pt-6 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl">AI Insights</h1>
            <p className="text-purple-100 text-sm">Smart business suggestions</p>
          </div>
        </div>

        <Card className="bg-white/95 backdrop-blur p-4 border-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">AI Analysis</div>
              <div className="text-lg text-gray-800">4 insights found today</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Key Insights */}
        <div>
          <h3 className="text-gray-700 mb-3 px-1">Key Insights</h3>
          <div className="space-y-3">
            {insights.map(insight => (
              <Card key={insight.id} className={`p-4 bg-gradient-to-r ${insight.color} text-white border-0`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl">{insight.icon}</div>
                  <div className="flex-1">
                    <h4 className="mb-1">{insight.title}</h4>
                    <p className="text-sm text-white/90">{insight.message}</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur"
                >
                  {insight.action}
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Smart Suggestions */}
        <div>
          <h3 className="text-gray-700 mb-3 px-1">Smart Suggestions</h3>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => {
              const priorityColors = {
                high: 'bg-red-100 text-red-700',
                medium: 'bg-orange-100 text-orange-700',
                low: 'bg-blue-100 text-blue-700'
              };

              return (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{suggestion.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-gray-800">{suggestion.title}</h4>
                        <Badge className={`${priorityColors[suggestion.priority]} hover:${priorityColors[suggestion.priority]} text-xs`}>
                          {suggestion.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{suggestion.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Demand Prediction */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-gray-800">Next 7-Day Demand</h3>
          </div>
          <div className="space-y-2">
            {demandPrediction.map((item, index) => {
              const colorClasses = {
                green: 'bg-green-50 text-green-700 border-green-200',
                yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                gray: 'bg-gray-50 text-gray-700 border-gray-200'
              };

              return (
                <div key={index} className={`p-3 rounded-xl border ${colorClasses[item.color]}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.item}</span>
                    <Badge className={`${colorClasses[item.color]} hover:${colorClasses[item.color]} border-0`}>
                      {item.prediction}
                    </Badge>
                  </div>
                  <div className="text-xs opacity-80">{item.demand} demand on {item.days}</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Auto Reorder Suggestions */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-5 h-5 text-orange-600" />
            <h3 className="text-gray-800">Reorder Suggestions</h3>
          </div>
          <div className="space-y-3">
            {reorderSuggestions.map((item, index) => {
              const isUrgent = item.urgency === 'urgent';

              return (
                <div key={index} className={`p-4 rounded-xl ${isUrgent ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm text-gray-800">{item.item}</h4>
                        {isUrgent && (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{item.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      Current: <span className="text-red-600">{item.current}</span> → Suggested: <span className="text-green-600">{item.suggested}</span>
                    </div>
                    <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700 text-white text-xs">
                      Order Now
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Customer Memory */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-purple-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <UsersIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-gray-800 mb-2">Customer Pattern Alert</h4>
              <p className="text-sm text-gray-700 mb-3">
                🎯 <strong>Ravi Kumar</strong> usually buys bread and milk on Sunday mornings. Today is Friday - make sure you stock up for the weekend!
              </p>
              <Button size="sm" variant="outline" className="h-8">
                View Customer Patterns
              </Button>
            </div>
          </div>
        </Card>

        {/* Settings Options */}
        <div>
          <h3 className="text-gray-700 mb-3 px-1">More Options</h3>
          <div className="space-y-2">
            <Card
              onClick={() => onNavigate('settings')}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="text-gray-800">Settings</span>
              </div>
            </Card>

            <Card className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-gray-600" />
                <span className="text-gray-800">Help & Support</span>
              </div>
            </Card>

            <Card
              onClick={onLogout}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-red-50 transition-colors group border-red-100"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="text-red-600 font-medium">Logout</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <BottomNav currentScreen="insights" onNavigate={onNavigate} />
    </div>
  );
}