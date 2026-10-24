import React from 'react';
import { ExternalLink, Tag } from 'lucide-react';

interface Props {
  format?: 'leaderboard' | 'rectangle' | 'infeed' | 'sidebar';
  className?: string;
  adSlotId?: string;
}

export const AdBanner: React.FC<Props> = ({ format = 'leaderboard', className = '', adSlotId }) => {
  return (
    <div className={`w-full flex flex-col items-center justify-center my-6 ${className}`}>
      {/* Label compliant with advertising guidelines */}
      <div className="w-full max-w-4xl flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-500 uppercase px-2 py-1">
        <span>Advertisement</span>
        <span className="text-[10px] text-slate-600">AdSense Ready · Slot #{adSlotId || 'PZ-7701'}</span>
      </div>

      <div className={`relative overflow-hidden rounded-xl border border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-[#0e1124] to-slate-900/90 flex flex-col items-center justify-center text-center p-4 transition-all shadow-inner ${
        format === 'leaderboard' ? 'w-full max-w-4xl min-h-[90px] md:min-h-[110px]' :
        format === 'rectangle' ? 'w-full max-w-[340px] min-h-[250px]' :
        format === 'sidebar' ? 'w-full min-h-[400px]' : 'w-full max-w-5xl min-h-[100px]'
      }`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.04),transparent)] pointer-events-none" />

        <div className="flex items-center gap-2 mb-1.5">
          <Tag className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold text-slate-300 tracking-wide">PlayZone Premium Partner Space</span>
        </div>

        <p className="text-xs text-slate-400 max-w-md mb-2">
          Sponsor high-performance browser games or integrate Google AdSense responsive ad units seamlessly.
        </p>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium text-purple-300 bg-purple-950/60 border border-purple-800/40 rounded-md">
          <span>Inquire Advertising</span>
          <ExternalLink className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};
