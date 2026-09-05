import React, { useState, useEffect } from 'react';
import { userApi } from '../api/client';
import { ExerciseCard } from '../components/ExerciseCard';
import { RestTimer } from '../components/RestTimer';
import { StatusBadge } from '../components/StatusBadge';
import confetti from 'canvas-confetti';
import { 
  Flame, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Sparkles, 
  Timer, 
  Send, 
  Smile, 
  AlertCircle,
  Play,
  RotateCcw
} from 'lucide-react';

export const UserDashboard = () => {
  const [activePlan, setActivePlan] = useState(null);
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [setLogs, setSetLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Workout Session Timer
  const [workoutDuration, setWorkoutDuration] = useState(0); // in seconds
  const [isWorkoutActive, setIsWorkoutActive] = useState(true);

  // Rest Timer State
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);

  // Finish Workout Modal State
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [rpeScore, setRpeScore] = useState(8);
  const [userNotes, setUserNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTodayData();
  }, []);

  // Workout duration stopwatch ticker
  useEffect(() => {
    let interval = null;
    if (isWorkoutActive && !todayStatus) {
      interval = setInterval(() => {
        setWorkoutDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, todayStatus]);

  const fetchTodayData = async () => {
    setLoading(true);
    try {
      const [planRes, todayRes, statusRes] = await Promise.allSettled([
        userApi.getMyPlan(),
        userApi.getTodayWorkout(),
        userApi.getTodayStatus()
      ]);

      if (planRes.status === 'fulfilled' && planRes.value.data) {
        setActivePlan(planRes.value.data);
      }

      if (statusRes.status === 'fulfilled' && statusRes.value.data) {
        setTodayStatus(statusRes.value.data);
        setIsWorkoutActive(false);
      } else if (todayRes.status === 'fulfilled' && todayRes.value.data) {
        const todayData = todayRes.value.data;
        setTodayWorkout(todayData);

        // Initialize setLogs checklist from the assigned plan exercises
        const initialSets = [];
        todayData.exercises.forEach((ex) => {
          for (let s = 1; s <= (ex.targetSets || 3); s++) {
            initialSets.push({
              exerciseId: ex.exerciseId,
              setNumber: s,
              targetReps: ex.targetReps || 10,
              targetWeightKg: ex.targetWeightKg || 0,
              actualReps: ex.targetReps || 10,
              actualWeightKg: ex.targetWeightKg || 0,
              isCompleted: false,
            });
          }
        });
        setSetLogs(initialSets);
      }
    } catch (e) {
      console.error('Error loading today workout', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSet = (exerciseId, setNumber, changes) => {
    setSetLogs((prev) =>
      prev.map((set) =>
        set.exerciseId === exerciseId && set.setNumber === setNumber
          ? { ...set, ...changes }
          : set
      )
    );
  };

  const handleStartRestTimer = (seconds = 60) => {
    setTimerSeconds(seconds);
    setShowRestTimer(true);
  };

  const handleSubmitWorkout = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const durationMins = Math.max(1, Math.round(workoutDuration / 60));
      const res = await userApi.submitLog({
        planDayId: todayWorkout?.id,
        logDate: new Date().toISOString().split('T')[0],
        workoutTitle: todayWorkout?.title || 'Daily Workout',
        durationMinutes: durationMins,
        rpeScore: parseInt(rpeScore),
        userNotes,
        sets: setLogs,
      });

      setTodayStatus(res.data);
      setShowFinishModal(false);
      setIsWorkoutActive(false);

      // Trigger Confetti Celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      alert('Failed to submit workout: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatStopwatch = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const completedSetsCount = setLogs.filter((s) => s.isCompleted).length;
  const totalSetsCount = setLogs.length;
  const completionPercentage = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Already Completed Today Screen
  if (todayStatus) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-bounce-short">
          <CheckCircle2 className="w-10 h-10 text-slate-950 stroke-[2.5]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white">Workout Finished Today! 🔥</h1>
          <p className="text-slate-400 text-sm">
            Awesome job! You logged <span className="text-cyan-400 font-bold">{todayStatus.workoutTitle}</span> ({todayStatus.durationMinutes} mins).
          </p>
        </div>

        <div className="max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-left space-y-3 shadow-xl">
          <div className="flex justify-between text-xs pb-2 border-b border-slate-800">
            <span className="text-slate-400">Date Logged:</span>
            <span className="font-semibold text-slate-200">{todayStatus.logDate}</span>
          </div>
          <div className="flex justify-between text-xs pb-2 border-b border-slate-800">
            <span className="text-slate-400">RPE Difficulty:</span>
            <span className="font-semibold text-amber-400">{todayStatus.rpeScore}/10</span>
          </div>
          {todayStatus.userNotes && (
            <div className="text-xs pt-1">
              <span className="text-slate-400 block mb-1">Your Note to Coach:</span>
              <p className="text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                "{todayStatus.userNotes}"
              </p>
            </div>
          )}
          {todayStatus.coachFeedback && (
            <div className="text-xs pt-2">
              <span className="text-cyan-400 font-bold block mb-1">🛡️ Coach Feedback:</span>
              <p className="text-cyan-200 bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-800/60">
                "{todayStatus.coachFeedback}"
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Rest Day or No Assigned Workout Today
  if (!todayWorkout) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl">
          🏝️
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Rest & Recovery Day!</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {activePlan
              ? `You are on the "${activePlan.title}" plan, but no routine is scheduled for today. Rest up or consult your coach!`
              : 'Your coach has not assigned a workout plan yet. Ask your admin to assign one!'}
          </p>
        </div>
        {activePlan && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 text-left max-w-md mx-auto space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Your Plan Days:</h3>
            <div className="space-y-2">
              {activePlan.days?.map(d => (
                <div key={d.id} className="flex justify-between text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="font-bold text-cyan-300">{d.dayOfWeek}</span>
                  <span className="text-slate-300">{d.title} ({d.exercises?.length} exercises)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active Workout View
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner: Workout Info & Live Stopwatch */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {todayWorkout.dayOfWeek}
              </span>
              <span className="text-xs text-slate-400">{activePlan?.title}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{todayWorkout.title}</h1>
          </div>

          {/* Stopwatch & Rest Timer quick launcher */}
          <div className="flex items-center space-x-3 self-start sm:self-center">
            {/* Live Stopwatch */}
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-2xl shadow-inner">
              <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-semibold leading-none">Workout Time</span>
                <span className="font-mono text-base font-bold text-white leading-tight">
                  {formatStopwatch(workoutDuration)}
                </span>
              </div>
            </div>

            {/* Quick Rest Timer Launcher */}
            <button
              onClick={() => handleStartRestTimer(60)}
              className="p-3 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/80 text-cyan-400 rounded-2xl flex items-center justify-center transition-colors"
              title="Open Rest Timer"
            >
              <Timer className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">
              Completed Sets: <span className="text-cyan-400">{completedSetsCount}</span> / {totalSetsCount}
            </span>
            <span className="text-cyan-400 font-bold">{completionPercentage}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-4">
        {todayWorkout.exercises.map((ex) => (
          <ExerciseCard
            key={ex.id}
            exerciseData={ex}
            setLogs={setLogs}
            onUpdateSet={handleUpdateSet}
            onStartTimer={handleStartRestTimer}
          />
        ))}
      </div>

      {/* Floating / Sticky Finish Workout Button */}
      <div className="sticky bottom-6 z-30 pt-4">
        <button
          onClick={() => setShowFinishModal(true)}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-base uppercase tracking-wider flex items-center justify-center space-x-3 shadow-2xl shadow-cyan-500/30 transition-all transform hover:-translate-y-0.5"
        >
          <Sparkles className="w-5 h-5 fill-current" />
          <span>Complete & Submit Workout</span>
        </button>
      </div>

      {/* Rest Countdown Timer Modal */}
      {showRestTimer && (
        <RestTimer
          initialSeconds={timerSeconds}
          autoStart={true}
          onClose={() => setShowRestTimer(false)}
        />
      )}

      {/* Finish Workout Summary Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl">
                🏆
              </div>
              <h2 className="text-xl font-bold text-white">Finish Today's Session</h2>
              <p className="text-xs text-slate-400">
                Total duration: <span className="text-cyan-400 font-bold">{Math.round(workoutDuration / 60)} minutes</span> ({completedSetsCount} sets finished)
              </p>
            </div>

            <form onSubmit={handleSubmitWorkout} className="space-y-4">
              {/* RPE Rating Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold uppercase tracking-wider text-slate-300">
                    Difficulty / Effort (RPE)
                  </label>
                  <span className="font-bold text-amber-400 text-sm">{rpeScore} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rpeScore}
                  onChange={(e) => setRpeScore(e.target.value)}
                  className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                  <span>1 (Easy)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Max Out)</span>
                </div>
              </div>

              {/* Feedback Note to Coach */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Notes for Coach (Optional)
                </label>
                <textarea
                  rows="3"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="e.g. Felt great on bench, need to increase weight on squats next week..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFinishModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Continue Lifting
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Save & Submit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
