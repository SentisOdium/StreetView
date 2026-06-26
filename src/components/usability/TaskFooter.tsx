import React from 'react';

interface TaskFooterProps {
  isComplete: boolean;
  onStart: () => void;
  onNext: () => void;
  onSkip: () => void;
  onFinish: () => void;
  isTaskStarted: boolean; // Tells us if they are returning to an active task vs starting a new one
}

export const TaskFooter: React.FC<TaskFooterProps> = ({
  isComplete,
  onStart,
  onNext,
  onSkip,
  onFinish,
  isTaskStarted,
}) => {
  if (isComplete) {
    return (
      <div className="flex justify-center mt-6">
        <button
          onClick={onFinish}
          className="px-6 py-2.5 bg-transparent hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
        >
          Close Overlay
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 mt-4">
      {isTaskStarted ? (
        <button
          onClick={onNext}
          className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 order-1 sm:order-2"
        >
          Finish Task
        </button>
      ) : (
        <button
          onClick={onStart}
          className="flex-1 px-4 py-2.5 bg-[#800000] hover:bg-[#660000] text-white font-bold rounded-xl transition-all shadow-md active:scale-95 order-1 sm:order-2"
        >
          Start Task
        </button>
      )}
      
      <button
        onClick={onSkip}
        className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl transition-all shadow-sm active:scale-95 order-2 sm:order-1"
      >
        Skip Task
      </button>
    </div>
  );
};
