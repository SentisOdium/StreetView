import React from 'react';

interface TaskHeaderProps {
  versionName: string;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({ versionName }) => {
  return (
    <div className="mb-4 text-center border-b border-slate-100 pb-3 px-6">
      <h2 className="text-xl md:text-2xl font-bold text-[#800000] tracking-tight">
        Task-Based Usability Testing
      </h2>
      {versionName && (
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-1">
          {versionName}
        </h3>
      )}
    </div>
  );
};
