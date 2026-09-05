import React, { useState, useEffect } from 'react';
import { userApi } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { History, Calendar, Clock, Flame, ChevronDown, ChevronUp, MessageSquare, Dumbbell } from 'lucide-react';

export const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await userApi.getHistory();
      setHistory(res.data);
      if (res.data.length > 0) {
        setExpandedLogId(res.data[0].id);
      }
    } catch (e) {
      console.error('Failed to fetch history', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <History className="w-6 h-6 text-cyan-400" />
            <span>Workout History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Review past workouts, weights lifted, and coach notes</p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
          Total Sessions: <span className="text-cyan-400 font-bold">{history.length}</span>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-400 space-y-2">
          <Dumbbell className="w-12 h-12 mx-auto text-slate-600 mb-2" />
          <p className="font-semibold text-slate-300">No completed workouts yet.</p>
          <p className="text-xs text-slate-500">Go to "Today's Workout" and complete your first session!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div
                key={log.id}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl transition-all"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                      <Flame className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-100 text-base">{log.workoutTitle}</h3>
                        <StatusBadge status={log.status} />
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{log.logDate}</span>
                        </span>
                        {log.durationMinutes && (
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{log.durationMinutes} mins</span>
                          </span>
                        )}
                        {log.rpeScore && (
                          <span className="text-amber-400 font-semibold">RPE: {log.rpeScore}/10</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-800/80 space-y-4">
                    {/* Logged Sets Table */}
                    {log.setLogs && log.setLogs.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Completed Sets & Weights:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {log.setLogs.map((set) => (
                            <div
                              key={set.id}
                              className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs flex justify-between items-center"
                            >
                              <div>
                                <span className="font-bold text-slate-200">{set.exerciseName}</span>
                                <div className="text-[11px] text-slate-400">
                                  Set #{set.setNumber} (Target: {set.targetReps}r @ {set.targetWeightKg || 0}kg)
                                </div>
                              </div>
                              <span className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 font-mono font-bold border border-cyan-800/60">
                                {set.actualReps}r @ {set.actualWeightKg}kg
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {log.userNotes && (
                      <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300">
                        <span className="font-bold text-slate-400 block mb-1">Your Feedback:</span>
                        "{log.userNotes}"
                      </div>
                    )}

                    {/* Coach Feedback */}
                    {log.coachFeedback && (
                      <div className="bg-cyan-950/30 border border-cyan-500/30 p-3.5 rounded-2xl text-xs text-cyan-200">
                        <span className="font-bold text-cyan-400 block mb-1 flex items-center space-x-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Coach Review:</span>
                        </span>
                        "{log.coachFeedback}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
