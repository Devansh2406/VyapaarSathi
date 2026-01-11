import { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, TrendingUp, AlertTriangle, Lightbulb, ShoppingBag, Users as UsersIcon, Settings, LogOut, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import BottomNav from './BottomNav';
import { generateDashboardInsights, isGeminiConfigured, AIAnalysisResult } from '../../services/gemini';
import { getFromDB, DB_KEYS } from '../../services/localDB';
import { toast } from 'sonner';

interface AIInsightsProps {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export default function AIInsights({ onNavigate, onLogout }: AIInsightsProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AIAnalysisResult | null>(null);

  // Default/Fallback data used if AI fails or key is missing
  const defaultData: AIAnalysisResult = {
    insights: [
      {
        id: 1,
        type: 'success',
        icon: '🎉',
        title: 'Great Week!',
        message: 'Your sales increased by 18% compared to last week. Keep it up!',
        action: 'View Details',
        screen: 'sales',
        color: 'from-green-500 to-green-600'
      },
      {
        id: 2,
        type: 'warning',
        icon: '⚠️',
        title: 'Transport Expense Increased',
        message: 'You spent ₹520 more on transport this week. Review delivery routes.',
        action: 'View Expenses',
        screen: 'expenses',
        color: 'from-orange-500 to-orange-600'
      }
    ],
    suggestions: [
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
      }
    ],
    demandPrediction: [
      { item: 'Milk', demand: 'High', prediction: '+35%', days: 'Weekend', color: 'green' },
      { item: 'Bread', demand: 'High', prediction: '+28%', days: 'Sunday', color: 'green' },
      { item: 'Rice', demand: 'Low', prediction: '-5%', days: 'Weekdays', color: 'gray' }
    ],
    reorderSuggestions: [
      { item: 'Milk (500ml)', current: 8, suggested: 40, reason: 'High weekend demand', urgency: 'urgent' },
      { item: 'Bread', current: 5, suggested: 30, reason: 'Stock will finish in 1 day', urgency: 'urgent' }
    ]
  };

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const fetchAIInsights = async () => {
    if (!isGeminiConfigured()) {
      setData(defaultData);
      return;
    }

    setLoading(true);
    try {
      const inventory = getFromDB(DB_KEYS.INVENTORY, []);
      const orders = getFromDB(DB_KEYS.ORDERS, []);

      const result = await generateDashboardInsights(inventory, orders);

      if (result) {
        setData(result);
        toast.success('AI Insights updated successfully!');
      } else {
        setData(defaultData);
        toast.error('Failed to generate insights. Using fallback data.');
      }
    } catch (error) {
      console.error(error);
      setData(defaultData);
      toast.error('Something went wrong with AI generation.');
    } finally {
      setLoading(false);
    }
  };

  const currentData = data || defaultData;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 pt-6 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl">AI Insights</h1>
            <p className="text-purple-100 text-sm">Smart business suggestions</p>
          </div>
          {isGeminiConfigured() && (
            <button
              onClick={fetchAIInsights}
              disabled={loading}
              className={`p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all ${loading ? 'opacity-50' : ''}`}
            >
              <Sparkles className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        <Card className="bg-white/95 backdrop-blur p-4 border-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              {loading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Sparkles className="w-6 h-6 text-white" />}
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">AI Analysis</div>
              <div className="text-lg text-gray-800">
                {loading ? 'Analyzing store data...' : `${currentData.insights.length + currentData.suggestions.length} insights found today`}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-4 mt-6 space-y-4">

        {!isGeminiConfigured() && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-4">
            <h3 className="text-yellow-800 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Demo Mode
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Gemini API Key is missing. These are sample insights. Add VITE_GEMINI_API_KEY to your .env file to enable real AI analysis.
            </p>
          </div>
        )}

        {/* Key Insights */}
        <div>
          <h3 className="text-gray-700 mb-3 px-1">Key Insights</h3>
          <div className="space-y-3">
            {currentData.insights.map((insight, idx) => {
              // Safe color mapping based on type to ensure visibility
              const colorMap: Record<string, string> = {
                success: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white',
                warning: 'bg-gradient-to-r from-orange-400 to-red-500 text-white',
                info: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
                // Alert: Use white background with Red text for high readability
                alert: 'bg-white border-2 border-red-100 text-gray-800'
              };

              const diffClass = colorMap[insight.type] || colorMap.info;
              const isAlert = insight.type === 'alert';

              return (
                <Card key={idx} className={`p-4 ${diffClass} border-0 shadow-sm`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-2xl">{insight.icon}</div>
                    <div className="flex-1">
                      <h4 className={`mb-1 font-semibold ${isAlert ? 'text-red-700' : 'text-white'}`}>{insight.title}</h4>
                      <p className={`text-sm ${isAlert ? 'text-gray-600' : 'text-white/90'}`}>{insight.message}</p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onNavigate(insight.screen || 'dashboard')}
                    className={`${isAlert ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur'}`}
                  >
                    {insight.action}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Smart Suggestions */}
        <div>
          <h3 className="text-gray-700 mb-3 px-1">Smart Suggestions</h3>
          <div className="space-y-3">
            {currentData.suggestions.map((suggestion, index) => {
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
            {currentData.demandPrediction.map((item, index) => {
              const colorClasses = {
                green: 'bg-green-50 text-green-700 border-green-200',
                yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                gray: 'bg-gray-50 text-gray-700 border-gray-200'
              };
              const selectedColor = colorClasses[item.color] || colorClasses.gray;

              return (
                <div key={index} className={`p-3 rounded-xl border ${selectedColor}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.item}</span>
                    <Badge className={`${selectedColor} hover:${selectedColor} border-0`}>
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
            {currentData.reorderSuggestions.map((item, index) => {
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
                    <Button
                      size="sm"
                      onClick={() => onNavigate('inventory')}
                      className="h-7 bg-green-600 hover:bg-green-700 text-white text-xs"
                    >
                      Order Now
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Customer Memory - Keep as static feature or prompt engineer it in future */}
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