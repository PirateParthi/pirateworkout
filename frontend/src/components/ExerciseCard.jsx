import React from 'react';
import { Video, Check, Info, Timer, Dumbbell } from 'lucide-react';

export const ExerciseCard = ({ exerciseData, setLogs, onUpdateSet, onStartTimer }) => {
  const {
    exerciseId,
    exerciseName,
    muscleGroup,
    equipment,
    targetSets = 3,
    targetReps = 10,
    targetWeightKg = 0,
    restSeconds = 60,
    notes,
    videoUrl,
  } = exerciseData;

  // Filter logs corresponding to this exercise
  const exerciseSets = setLogs.filter((s) => s.exerciseId === exerciseId);

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl shadow-black/20 hover:border-slate-700/80 transition-all">
      {/* Exercise Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/60 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-100">{exerciseName}</h3>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-950/60 text-cyan-400 border border-cyan-800/50 uppercase tracking-wide">
                {muscleGroup}
              </span>
              {equipment && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  {equipment}
                </span>
              )}
            </div>
            {notes && (
              <p className="text-xs text-amber-300/90 mt-1 flex items-center space-x-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Coach Note: {notes}</span>
              </p>
            )}
          </div>
        </div>

        {/* Video Link & Rest Recommendation */}
        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => onStartTimer(restSeconds)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-colors"
          >
            <Timer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Rest: {restSeconds}s</span>
          </button>
          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Watch Exercise Demo"
            >
              <Video className="w-4 h-4 text-red-400" />
            </a>
          )}
        </div>
      </div>

      {/* Sets Table */}
      <div className="p-4 sm:p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                <th className="pb-2 w-12 text-center">Set</th>
                <th className="pb-2">Target</th>
                <th className="pb-2">Reps Done</th>
                <th className="pb-2">Weight (KG)</th>
                <th className="pb-2 w-20 text-center">Done</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {exerciseSets.map((set, idx) => {
                const isDone = set.isCompleted;
                return (
                  <tr
                    key={set.setNumber}
                    className={`transition-colors ${isDone ? 'bg-cyan-950/10' : 'hover:bg-slate-800/30'}`}
                  >
                    {/* Set Number */}
                    <td className="py-2.5 text-center font-bold text-slate-400">
                      #{set.setNumber}
                    </td>

                    {/* Target */}
                    <td className="py-2.5 text-slate-300">
                      <span className="font-semibold text-slate-200">{set.targetReps}</span> reps @{' '}
                      <span className="font-semibold text-slate-200">{set.targetWeightKg || 0}</span> kg
                    </td>

                    {/* Actual Reps Input */}
                    <td className="py-2.5">
                      <input
                        type="number"
                        min="0"
                        value={set.actualReps}
                        onChange={(e) =>
                          onUpdateSet(exerciseId, set.setNumber, {
                            actualReps: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-16 sm:w-20 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-semibold focus:outline-none focus:border-cyan-500 text-center text-xs sm:text-sm"
                      />
                    </td>

                    {/* Actual Weight Input */}
                    <td className="py-2.5">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={set.actualWeightKg}
                        onChange={(e) =>
                          onUpdateSet(exerciseId, set.setNumber, {
                            actualWeightKg: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-16 sm:w-20 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-semibold focus:outline-none focus:border-cyan-500 text-center text-xs sm:text-sm"
                      />
                    </td>

                    {/* Completion Checkbox */}
                    <td className="py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const newStatus = !isDone;
                          onUpdateSet(exerciseId, set.setNumber, { isCompleted: newStatus });
                          if (newStatus) {
                            // Auto-trigger rest timer when ticking off a set!
                            onStartTimer(restSeconds);
                          }
                        }}
                        className={`w-8 h-8 mx-auto rounded-xl flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                            : 'bg-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-700 border border-slate-700'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
