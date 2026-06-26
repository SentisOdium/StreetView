import React, { useState } from 'react';
import type { Task, TaskProgress } from '../../types/Task';

interface TaskContentProps {
  task: Task | null;
  currentIndex: number;
  totalTasks: number;
  isComplete: boolean;
  progress?: TaskProgress[];
}

export const TaskContent: React.FC<TaskContentProps> = ({
  task,
  currentIndex,
  totalTasks,
  isComplete,
  progress = [],
}) => {
  const [copied, setCopied] = useState(false);

  const formatDataForClipboard = () => {
    let data = "Task Results:\n";
    progress.forEach((p, idx) => {
      data += `\nTask ${idx + 1}:\n`;
      data += `Status: ${p.status}\n`;
      data += `Duration: ${p.durationMs ? (p.durationMs / 1000).toFixed(1) + 's' : 'N/A'}\n`;
      data += `Clicks: ${p.clickCount}\n`;
      data += `Searches: ${p.searchCount}\n`;
      data += `Routes Generated: ${p.routeGenerationCount}\n`;
      data += `Details Viewed: ${p.detailsViewed}\n`;
      data += `Route Info Viewed: ${p.routeInfoViewed}\n`;
      data += `Overlay Opens: ${p.overlayOpenedCount}\n`;
    });
    return data;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formatDataForClipboard()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isComplete) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#800000]/10 mb-2 shadow-sm">
          <svg className="w-6 h-6 text-[#800000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1 tracking-tight">
          Testing Completed!
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Please copy your results below and paste them into the Google Form.
        </p>

        <div className="bg-slate-50 rounded-xl p-4 text-left mb-4 overflow-y-auto max-h-48 text-xs border border-[#800000]/10 shadow-inner">
          {progress.map((p, idx) => (
            <div key={p.taskId} className="mb-3 border-b border-slate-200 pb-2 last:border-0 last:mb-0 last:pb-0">
              <strong className="text-slate-800 text-sm font-bold">Task {idx + 1} ({p.status})</strong>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-slate-600 font-medium">
                <div>Time: {p.durationMs ? (p.durationMs / 1000).toFixed(1) + 's' : '-'}</div>
                <div>Clicks: {p.clickCount}</div>
                <div>Searches: {p.searchCount}</div>
                <div>Routes: {p.routeGenerationCount}</div>
                <div>Details View: {p.detailsViewed ? 'Yes' : 'No'}</div>
                <div>Route Info: {p.routeInfoViewed ? 'Yes' : 'No'}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className={`w-full py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
            copied ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-[#800000] hover:bg-[#660000] text-white'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Copied to Clipboard!
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
              Copy Data
            </>
          )}
        </button>
      </div>
    );
  }

  if (!task) return null;

  // Function to render markdown-like bold text (e.g. **Text**)
  const renderDescription = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-[#800000]">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-extrabold text-white bg-[#800000] px-3 py-1 rounded-md uppercase tracking-wider shadow-sm">
          Task {currentIndex + 1} of {totalTasks}
        </span>
      </div>
      <h4 className="text-base font-bold text-slate-800 mb-2">
        {task.title}
      </h4>
      <div className="p-3 bg-slate-50 rounded-xl border border-[#800000]/10 text-sm text-slate-600 leading-relaxed shadow-inner">
        {renderDescription(task.description)}
      </div>
    </div>
  );
};
