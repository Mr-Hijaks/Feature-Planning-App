import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ChevronLeft, ChevronRight, Package, Calendar, Info, Settings, Edit, Save, X, Plus, Trash2, Eye, EyeOff, Search, Filter, Download, Upload, AlertCircle, Cloud, CloudOff, RefreshCw, Users, Database, LogIn, UserPlus, Building } from 'lucide-react';

// Initialize Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'
);

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Check for existing session on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Authentication functions
  const signUp = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Login/Signup Component
  const AuthForm = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      setAuthLoading(true);
      setError('');

      try {
        if (isSignUp) {
          await signUp(email, password, name);
          alert('Check your email for the confirmation link!');
        } else {
          await signIn(email, password);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setAuthLoading(false);
      }
    };

    // Show demo message if no Supabase configured
    const isDemo = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SKU Calendar</h1>
            <p className="text-gray-600 mt-2">Team Feature Planning Tool</p>
          </div>

          {isDemo && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <strong>Demo Mode:</strong> Add your Supabase environment variables to enable authentication.
                  <div className="mt-2">
                    <button 
                      onClick={() => setUser({ email: 'demo@example.com', id: 'demo' })}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700"
                    >
                      Continue as Demo User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your full name"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                minLength="6"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading || isDemo}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {authLoading ? <RefreshCw size={16} className="animate-spin" /> : isSignUp ? <UserPlus size={16} /> : <LogIn size={16} />}
              {authLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main SKU Calendar Component
  const SKUCalendar = () => {
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [activeTab, setActiveTab] = useState('new');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newFeature, setNewFeature] = useState({ name: '', description: '', priority: 'medium' });
    const [features, setFeatures] = useState({
      new: [
        { id: 1, name: 'User Authentication', description: 'Login/signup system', priority: 'high', status: 'In Progress' },
        { id: 2, name: 'Dashboard Analytics', description: 'User engagement metrics', priority: 'medium', status: 'Planning' }
      ],
      continuing: [
        { id: 3, name: 'Mobile Optimization', description: 'Responsive design improvements', priority: 'high', status: 'Testing' }
      ],
      ending: [
        { id: 4, name: 'Legacy API Migration', description: 'Move to new API endpoints', priority: 'low', status: 'Complete' }
      ]
    });
    
    const getWeeksInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      let startDate = new Date(firstDay);
      while (startDate.getDay() !== 6) {
        startDate.setDate(startDate.getDate() - 1);
      }
      
      const weeks = [];
      let currentWeekStart = new Date(startDate);
      
      while (currentWeekStart <= lastDay || currentWeekStart.getMonth() === month) {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        weeks.push({
          start: new Date(currentWeekStart),
          end: new Date(weekEnd),
          days: Array.from({ length: 7 }, (_, i) => {
            const day = new Date(currentWeekStart);
            day.setDate(day.getDate() + i);
            return day;
          })
        });
        
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        if (weeks.length > 6) break;
      }
      
      return weeks;
    };

    const weeks = getWeeksInMonth(currentDate);

    const formatWeekRange = (week) => {
      const startStr = week.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = week.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${startStr} - ${endStr}`;
    };

    const navigateMonth = (direction) => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + direction);
      setCurrentDate(newDate);
    };

    const getWeekNumber = (weekStart) => {
      const baselineWeek = new Date(2025, 5, 28);
      const baselineWeekNumber = 22;
      const diffTime = weekStart - baselineWeek;
      const diffWeeks = Math.round(diffTime / (7 * 24 * 60 * 60 * 1000));
      return baselineWeekNumber + diffWeeks;
    };

    const addFeature = () => {
      if (!newFeature.name.trim()) return;
      
      const newId = Date.now();
      const feature = {
        id: newId,
        ...newFeature,
        status: 'Planning'
      };
      
      setFeatures(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], feature]
      }));
      
      setNewFeature({ name: '', description: '', priority: 'medium' });
      setShowAddForm(false);
    };

    const deleteFeature = (id) => {
      setFeatures(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(f => f.id !== id)
      }));
    };

    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'high': return 'bg-red-100 text-red-800';
        case 'medium': return 'bg-yellow-100 text-yellow-800';
        case 'low': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getTabColor = (tab) => {
      switch (tab) {
        case 'new': return 'bg-green-500';
        case 'continuing': return 'bg-blue-500';
        case 'ending': return 'bg-red-500';
        default: return 'bg-gray-500';
      }
    };

    if (selectedWeek) {
      return (
        <div className="max-w-md mx-auto bg-white min-h-screen">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedWeek(null)} className="p-1 hover:bg-blue-700 rounded-lg transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h1 className="text-lg font-semibold flex items-center gap-2">
                    <Package size={20} />
                    Feature Planning
                  </h1>
                  <p className="text-blue-100 text-sm">
                    Week {getWeekNumber(selectedWeek.start)} • {formatWeekRange(selectedWeek)}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddForm(true)}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                title="Add feature"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-gray-50 shadow-sm">
            {['new', 'continuing', 'ending'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-4 text-sm font-medium capitalize transition-all relative ${
                  activeTab === tab
                    ? `${getTabColor(tab)} text-white shadow-lg`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span>{tab}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activeTab === tab 
                      ? 'bg-white bg-opacity-20' 
                      : 'bg-gray-200'
                  }`}>
                    {features[tab].length}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Features List */}
          <div className="p-4">
            {features[activeTab].length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package size={64} className="mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">No {activeTab} features</h3>
                <p className="mb-4 text-sm">Start adding features for this week.</p>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto shadow-lg"
                >
                  <Plus size={16} />
                  Add First Feature
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {features[activeTab].map((feature) => (
                  <div key={feature.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm group hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                      <button
                        onClick={() => deleteFeature(feature.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-100 rounded transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    {feature.description && (
                      <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(feature.priority)}`}>
                        {feature.priority} priority
                      </span>
                      <span className="text-xs text-gray-500">{feature.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Feature Form */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add Feature</h3>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Feature Name</label>
                    <input
                      type="text"
                      value={newFeature.name}
                      onChange={(e) => setNewFeature(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter feature name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newFeature.description}
                      onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the feature"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={newFeature.priority}
                      onChange={(e) => setNewFeature(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addFeature}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Feature
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-blue-700 rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <Calendar size={20} />
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setUser(null)} 
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors" 
                title="Sign out"
              >
                <X size={20} />
              </button>
              <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-blue-700 rounded-lg transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-600 mb-2">Select Week for Feature Planning</h2>
          </div>
          
          {weeks.map((week, index) => {
            const weekNumber = getWeekNumber(week.start);
            const totalFeatures = Object.values(features).reduce((sum, cat) => sum + cat.length, 0);
            
            return (
              <button
                key={index}
                onClick={() => setSelectedWeek(week)}
                className="w-full p-4 mb-3 bg-white hover:bg-blue-50 border border-gray-200 rounded-xl text-left transition-all hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-900">
                    Week {weekNumber}
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {totalFeatures} features
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {formatWeekRange(week)}
                </div>
                
                <div className="flex gap-2 mb-3">
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                    {features.new.length} new
                  </span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {features.continuing.length} continuing
                  </span>
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                    {features.ending.length} ending
                  </span>
                </div>
                
                <div className="flex justify-center space-x-1">
                  {week.days.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors ${
                        day.getMonth() === currentDate.getMonth()
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {day.getDate()}
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return user ? <SKUCalendar /> : <AuthForm />;
};

export default App;
