import React from 'react';

interface FloatingTaskButtonProps {
  currentTaskIndex: number;
  totalTasks: number;
  onClick: () => void;
}

export const FloatingTaskButton: React.FC<FloatingTaskButtonProps> = ({
  currentTaskIndex,
  totalTasks,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-[9999] bg-[#800000] hover:bg-[#660000] text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-3 group animate-bounce-subtle"
      aria-label="Open task instructions"
    >
      <div className="flex flex-col items-start text-left">
        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Task {currentTaskIndex + 1} of {totalTasks}
        </span>
        <span className="text-sm font-bold">View Instructions</span>
      </div>
      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </button>
  );
};
