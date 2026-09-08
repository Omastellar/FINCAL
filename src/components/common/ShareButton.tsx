import React from 'react';
import { Share2, Check, Printer } from 'lucide-react';

interface ShareButtonProps {
  onShare: () => void;
  copied: boolean;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  onShare,
  copied,
  className = '',
}) => {
  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={onShare}
        type="button"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
          copied
            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600'
        } ${className}`}
        title="Share this calculation scenario"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Link Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Scenario</span>
          </>
        )}
      </button>

      {/* Toast Notification */}
      {copied && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-lg whitespace-nowrap z-50 animate-fade-in">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
};

export const PrintButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      type="button"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors ${className}`}
      title="Print or save as PDF"
    >
      <Printer className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Print / PDF</span>
    </button>
  );
};
