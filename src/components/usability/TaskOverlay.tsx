import React, { useEffect } from 'react';
import { useTaskTesting } from '../../hooks/useTaskTesting';
import { TaskHeader } from './TaskHeader';
import { TaskContent } from './TaskContent';
import { TaskFooter } from './TaskFooter';
import { FloatingTaskButton } from './FloatingTaskButton';

export const TaskOverlay: React.FC = () => {
  const {
    state,
    versionName,
    currentTask,
    startTask,
    completeTask,
    skipTask,
    openOverlay,
    closeOverlay,
    finishTesting,
    jumpToTask,
    resetTasks,
  } = useTaskTesting();

  // Disable escape key to close modal unless in researcher mode (optional enhancement)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.isOverlayOpen && !state.researcherMode) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [state.isOverlayOpen, state.researcherMode]);

  // If no testing version is active, don't render anything
  if (!state.version) {
    return null;
  }

  // Check if current task is already started (pending)
  const currentTaskProgress = state.progress.find(p => p.taskId === currentTask?.id);
  const isTaskStarted = currentTaskProgress?.status === 'pending';

  return (
    <>
      {/* Floating button when overlay is closed but testing is active */}
      {!state.isOverlayOpen && !state.isTestingComplete && (
        <FloatingTaskButton
          currentTaskIndex={state.currentTaskIndex}
          totalTasks={state.tasks.length}
          onClick={openOverlay}
        />
      )}

      {/* Floating Panel (Non-blocking) */}
      {state.isOverlayOpen && (
        <div className="fixed z-[9999] pointer-events-none p-4 right-0 top-0 sm:top-4 w-full sm:w-96 max-h-[85vh] flex flex-col justify-start">
          <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-[#800000]/20 w-full p-5 pointer-events-auto overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] animate-slideDown">
            
            {!state.isTestingComplete && (
              <button
                onClick={closeOverlay}
                className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 bg-slate-100/50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer z-10"
                title="Minimize Overlay"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}

            <TaskHeader versionName={versionName} />
            
            <TaskContent
              task={currentTask}
              currentIndex={state.currentTaskIndex}
              totalTasks={state.tasks.length}
              isComplete={state.isTestingComplete}
              progress={state.progress}
            />
            
            <TaskFooter
              isComplete={state.isTestingComplete}
              onStart={startTask}
              onNext={completeTask}
              onSkip={skipTask}
              onFinish={() => {
                finishTesting();
                closeOverlay();
              }}
              isTaskStarted={isTaskStarted}
            />

            {/* Researcher Mode Controls */}
            {state.researcherMode && (
              <div className="mt-6 pt-4 border-t border-slate-200">
                <h4 className="text-[10px] font-bold text-red-600 mb-2 uppercase tracking-wider">
                  Researcher Controls
                </h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button onClick={resetTasks} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-bold transition-colors">
                    Reset
                  </button>
                  <select 
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-lg border-none"
                    value={state.currentTaskIndex}
                    onChange={(e) => jumpToTask(Number(e.target.value))}
                  >
                    {state.tasks.map((_, i) => (
                      <option key={i} value={i}>Jump to {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
