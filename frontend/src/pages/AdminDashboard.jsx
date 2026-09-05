import React, { useState, useEffect } from 'react';
import { adminApi, exerciseApi } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Users, 
  Calendar, 
  Plus, 
  Dumbbell, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Send, 
  ChevronRight, 
  Activity, 
  Trash2, 
  Info,
  Timer
} from 'lucide-react';

export const AdminDashboard = ({ initialView = 'home' }) => {
  const [activeTab, setActiveTab] = useState(initialView === 'create-plan' ? 'plans' : 'clients');
  const [clients, setClients] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);

  // Coach Feedback state
  const [feedbackInputs, setFeedbackInputs] = useState({});
  const [feedbackSending, setFeedbackSending] = useState({});

  // Plan Creation Modal / Form State
  const [showPlanModal, setShowPlanModal] = useState(initialView === 'create-plan');
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [addFriendLoading, setAddFriendLoading] = useState(false);
  const [newFriendForm, setNewFriendForm] = useState({
    name: '',
    email: '',
    password: '',
    targetGoal: '',
    bodyWeightKg: '',
  });
  const [planForm, setPlanForm] = useState({
    userId: '',
    title: '',
    description: '',
    days: [
      {
        dayOfWeek: 'MONDAY',
        title: 'Push Day (Chest, Shoulders & Triceps)',
        exercises: [{ exerciseId: '', targetSets: 3, targetReps: 10, targetWeightKg: 20, restSeconds: 60, notes: '' }]
      },
      {
        dayOfWeek: 'WEDNESDAY',
        title: 'Pull Day (Back & Biceps)',
        exercises: [{ exerciseId: '', targetSets: 3, targetReps: 10, targetWeightKg: 20, restSeconds: 60, notes: '' }]
      },
      {
        dayOfWeek: 'FRIDAY',
        title: 'Legs & Abs',
        exercises: [{ exerciseId: '', targetSets: 4, targetReps: 10, targetWeightKg: 40, restSeconds: 90, notes: '' }]
      }
    ]
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [clientsRes, exercisesRes, logsRes, statsRes] = await Promise.all([
        adminApi.getClients(),
        exerciseApi.getAll(),
        adminApi.getAllLogs(),
        adminApi.getStats()
      ]);
      setClients(clientsRes.data);
      setExercises(exercisesRes.data);
      setLogs(logsRes.data);
      setStats(statsRes.data);

      if (clientsRes.data.length > 0 && !planForm.userId) {
        setPlanForm(prev => ({ ...prev, userId: clientsRes.data[0].id }));
      }
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFeedback = async (logId) => {
    const text = feedbackInputs[logId];
    if (!text || !text.trim()) return;

    setFeedbackSending({ ...feedbackSending, [logId]: true });
    try {
      await adminApi.addFeedback(logId, text);
      setLogs(logs.map(l => l.id === logId ? { ...l, coachFeedback: text } : l));
      setFeedbackInputs({ ...feedbackInputs, [logId]: '' });
    } catch (err) {
      alert('Failed to send feedback');
    } finally {
      setFeedbackSending({ ...feedbackSending, [logId]: false });
    }
  };

  const handleCreateFriend = async (e) => {
    e.preventDefault();
    if (!newFriendForm.name || !newFriendForm.email || !newFriendForm.password) {
      alert('Please fill in name, email, and password');
      return;
    }

    setAddFriendLoading(true);
    try {
      await adminApi.createClient({
        name: newFriendForm.name,
        email: newFriendForm.email,
        password: newFriendForm.password,
        targetGoal: newFriendForm.targetGoal,
        bodyWeightKg: newFriendForm.bodyWeightKg ? parseFloat(newFriendForm.bodyWeightKg) : null,
      });
      alert('Friend account added successfully! 🎉');
      setNewFriendForm({
        name: '',
        email: '',
        password: '',
        targetGoal: '',
        bodyWeightKg: '',
      });
      setShowAddFriendModal(false);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add friend');
    } finally {
      setAddFriendLoading(false);
    }
  };

  const handleDeleteFriend = async (client) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove "${client.name}"?\n\nThis will permanently delete their account, assigned workout routines, and past workout logs.`
    );
    if (!confirmDelete) return;

    try {
      await adminApi.deleteClient(client.id);
      alert(`${client.name} has been removed.`);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to delete friend: ' + (err.response?.data?.message || err.message));
    }
  };

  // Plan Creation Handlers
  const handleAddDay = () => {
    setPlanForm({
      ...planForm,
      days: [
        ...planForm.days,
        {
          dayOfWeek: 'TUESDAY',
          title: 'Workout Day',
          exercises: [{ exerciseId: exercises[0]?.id || '', targetSets: 3, targetReps: 10, targetWeightKg: 0, restSeconds: 60, notes: '' }]
        }
      ]
    });
  };

  const handleRemoveDay = (dayIndex) => {
    setPlanForm({
      ...planForm,
      days: planForm.days.filter((_, idx) => idx !== dayIndex)
    });
  };

  const handleAddExerciseToDay = (dayIndex) => {
    const updatedDays = [...planForm.days];
    updatedDays[dayIndex].exercises.push({
      exerciseId: exercises[0]?.id || '',
      targetSets: 3,
      targetReps: 10,
      targetWeightKg: 0,
      restSeconds: 60,
      notes: ''
    });
    setPlanForm({ ...planForm, days: updatedDays });
  };

  const handleRemoveExerciseFromDay = (dayIndex, exIndex) => {
    const updatedDays = [...planForm.days];
    updatedDays[dayIndex].exercises = updatedDays[dayIndex].exercises.filter((_, idx) => idx !== exIndex);
    setPlanForm({ ...planForm, days: updatedDays });
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!planForm.userId || !planForm.title) {
      alert('Please select a client and provide a plan title');
      return;
    }

    try {
      await adminApi.createPlan({
        ...planForm,
        userId: parseInt(planForm.userId),
        days: planForm.days.map(d => ({
          ...d,
          exercises: d.exercises.map(ex => ({
            ...ex,
            exerciseId: parseInt(ex.exerciseId || exercises[0]?.id),
            targetSets: parseInt(ex.targetSets),
            targetReps: parseInt(ex.targetReps),
            targetWeightKg: parseFloat(ex.targetWeightKg || 0),
            restSeconds: parseInt(ex.restSeconds || 60)
          }))
        }))
      });
      alert('Plan successfully assigned to client!');
      setShowPlanModal(false);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to save plan: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats?.totalClients || clients.length}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Friends/Clients</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats?.completedWorkoutsToday || 0}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Workouts Finished Today</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats?.activePlans || 0}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Custom Plans</div>
          </div>
        </div>
      </div>

      {/* Action Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'clients'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            👥 Friends & Clients ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'activity'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            ⚡ Live Activity & Logs ({logs.length})
          </button>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          <button
            onClick={() => setShowAddFriendModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/60 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add New Friend</span>
          </button>
          <button
            onClick={() => setShowPlanModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Create & Assign Plan</span>
          </button>
        </div>
      </div>

      {/* Tab Content 1: Clients List */}
      {activeTab === 'clients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 font-bold text-lg flex items-center justify-center">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-base">{client.name}</h3>
                      <p className="text-xs text-slate-400">{client.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteFriend(client)}
                    title={`Delete ${client.name}`}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Goal:</span>
                    <span className="font-semibold text-slate-200">{client.targetGoal || 'General Fitness'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Body Weight:</span>
                    <span className="font-semibold text-slate-200">{client.bodyWeightKg ? `${client.bodyWeightKg} kg` : 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Plan:</span>
                    <span className={`font-semibold ${client.hasActivePlan ? 'text-cyan-400' : 'text-slate-500'}`}>
                      {client.activePlanTitle || 'No Plan Assigned'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  onClick={() => {
                    setPlanForm(prev => ({ ...prev, userId: client.id }));
                    setShowPlanModal(true);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs transition-colors text-center"
                >
                  Edit / Assign Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 2: Live Activity & Workout Logs */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          {logs.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-400">
              <Activity className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-base font-semibold">No workout logs submitted yet.</p>
              <p className="text-xs text-slate-500 mt-1">Once your friends finish workouts, their set logs, weights, and notes will appear here in real-time!</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold flex items-center justify-center">
                      {log.userName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-100 text-base">{log.userName}</span>
                        <StatusBadge status={log.status} />
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {log.workoutTitle} • {log.logDate} {log.durationMinutes ? `(${log.durationMinutes} mins)` : ''}
                      </div>
                    </div>
                  </div>

                  {log.rpeScore && (
                    <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-800 text-xs font-semibold text-amber-400 self-start sm:self-center">
                      <span>RPE Difficulty:</span>
                      <span className="text-amber-300 font-bold">{log.rpeScore}/10</span>
                    </div>
                  )}
                </div>

                {/* Sets Completed */}
                {log.setLogs && log.setLogs.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Logged Sets & Weights:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {log.setLogs.map((set) => (
                        <div
                          key={set.id}
                          className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-2xl text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-200">{set.exerciseName}</span>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Set #{set.setNumber} • Target: {set.targetReps} reps @ {set.targetWeightKg || 0}kg
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-1 rounded-lg bg-cyan-950 text-cyan-400 font-mono font-bold border border-cyan-800/60">
                              {set.actualReps}r @ {set.actualWeightKg}kg
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Friend's Notes */}
                {log.userNotes && (
                  <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/60 text-xs text-slate-300">
                    <span className="font-bold text-cyan-400 block mb-1">📝 Client Feedback:</span>
                    "{log.userNotes}"
                  </div>
                )}

                {/* Coach Feedback Section */}
                <div className="pt-2">
                  {log.coachFeedback ? (
                    <div className="bg-cyan-950/20 border border-cyan-500/30 p-3.5 rounded-2xl text-xs text-cyan-200">
                      <span className="font-bold text-cyan-400 block mb-1">🛡️ Your Coach Feedback:</span>
                      "{log.coachFeedback}"
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Leave coach feedback / encouragement..."
                        value={feedbackInputs[log.id] || ''}
                        onChange={(e) => setFeedbackInputs({ ...feedbackInputs, [log.id]: e.target.value })}
                        className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        onClick={() => handleSendFeedback(log.id)}
                        disabled={feedbackSending[log.id]}
                        className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Friend Modal */}
      {showAddFriendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Add New Friend</h2>
                  <p className="text-xs text-slate-400">Create a client account for your friend</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddFriendModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFriend} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Friend's Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Kumar"
                  value={newFriendForm.name}
                  onChange={(e) => setNewFriendForm({ ...newFriendForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="suresh@pirate.fit"
                  value={newFriendForm.email}
                  onChange={(e) => setNewFriendForm({ ...newFriendForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Temporary Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={newFriendForm.password}
                  onChange={(e) => setNewFriendForm({ ...newFriendForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Body Weight (KG)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="75.0"
                    value={newFriendForm.bodyWeightKg}
                    onChange={(e) => setNewFriendForm({ ...newFriendForm, bodyWeightKg: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Fitness Target
                  </label>
                  <input
                    type="text"
                    placeholder="Muscle Gain / Cut"
                    value={newFriendForm.targetGoal}
                    onChange={(e) => setNewFriendForm({ ...newFriendForm, targetGoal: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddFriendModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addFriendLoading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 disabled:opacity-50 transition-all"
                >
                  {addFriendLoading ? 'Adding...' : 'Add Friend'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plan Builder Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Create / Assign Personalized Workout Plan</h2>
                <p className="text-xs text-slate-400 mt-0.5">Customize daily routines, sets, reps, and rest intervals per friend</p>
              </div>
              <button
                onClick={() => setShowPlanModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Assign To Friend
                  </label>
                  <select
                    value={planForm.userId}
                    onChange={(e) => setPlanForm({ ...planForm, userId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 font-semibold"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Plan Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4-Week Hypertrophy Split"
                    value={planForm.title}
                    onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Plan Description / Coaching Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="Focus on progressive overload and explosive eccentrics..."
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Workout Days Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                    Workout Days & Routines
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddDay}
                    className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-bold flex items-center space-x-1.5 hover:bg-cyan-900"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Day</span>
                  </button>
                </div>

                {planForm.days.map((day, dIdx) => (
                  <div key={dIdx} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div className="grid grid-cols-2 gap-3 flex-1">
                        <select
                          value={day.dayOfWeek}
                          onChange={(e) => {
                            const updated = [...planForm.days];
                            updated[dIdx].dayOfWeek = e.target.value;
                            setPlanForm({ ...planForm, days: updated });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-cyan-400 font-bold"
                        >
                          {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>

                        <input
                          type="text"
                          value={day.title}
                          placeholder="Day Title (e.g. Chest & Tri)"
                          onChange={(e) => {
                            const updated = [...planForm.days];
                            updated[dIdx].title = e.target.value;
                            setPlanForm({ ...planForm, days: updated });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-semibold"
                        />
                      </div>

                      {planForm.days.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDay(dIdx)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Exercises in Day */}
                    <div className="space-y-3">
                      {day.exercises.map((ex, eIdx) => (
                        <div key={eIdx} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                          {/* Exercise Selector */}
                          <div className="sm:col-span-2">
                            <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Exercise</label>
                            <select
                              value={ex.exerciseId}
                              onChange={(e) => {
                                const updated = [...planForm.days];
                                updated[dIdx].exercises[eIdx].exerciseId = e.target.value;
                                setPlanForm({ ...planForm, days: updated });
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
                            >
                              {exercises.map(item => (
                                <option key={item.id} value={item.id}>{item.name} ({item.muscleGroup})</option>
                              ))}
                            </select>
                          </div>

                          {/* Sets */}
                          <div>
                            <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Sets</label>
                            <input
                              type="number"
                              min="1"
                              value={ex.targetSets}
                              onChange={(e) => {
                                const updated = [...planForm.days];
                                updated[dIdx].exercises[eIdx].targetSets = e.target.value;
                                setPlanForm({ ...planForm, days: updated });
                              }}
                              className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 text-center"
                            />
                          </div>

                          {/* Reps */}
                          <div>
                            <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Reps</label>
                            <input
                              type="number"
                              min="1"
                              value={ex.targetReps}
                              onChange={(e) => {
                                const updated = [...planForm.days];
                                updated[dIdx].exercises[eIdx].targetReps = e.target.value;
                                setPlanForm({ ...planForm, days: updated });
                              }}
                              className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 text-center"
                            />
                          </div>

                          {/* Target Weight */}
                          <div>
                            <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">KG</label>
                            <input
                              type="number"
                              step="0.5"
                              value={ex.targetWeightKg}
                              onChange={(e) => {
                                const updated = [...planForm.days];
                                updated[dIdx].exercises[eIdx].targetWeightKg = e.target.value;
                                setPlanForm({ ...planForm, days: updated });
                              }}
                              className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 text-center"
                            />
                          </div>

                          {/* Rest Secs & Delete */}
                          <div className="flex items-center space-x-1">
                            <div className="flex-1">
                              <label className="text-[10px] text-cyan-400 uppercase font-semibold block mb-0.5">Rest(s)</label>
                              <input
                                type="number"
                                step="5"
                                value={ex.restSeconds}
                                onChange={(e) => {
                                  const updated = [...planForm.days];
                                  updated[dIdx].exercises[eIdx].restSeconds = e.target.value;
                                  setPlanForm({ ...planForm, days: updated });
                                }}
                                className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-cyan-300 text-center font-bold"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveExerciseFromDay(dIdx, eIdx)}
                              className="p-1.5 mt-4 text-slate-500 hover:text-rose-400 rounded-lg"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleAddExerciseToDay(dIdx)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1 pt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Exercise to this day</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25"
                >
                  Save & Assign Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
