import React, { useState, useRef, useEffect } from 'react';
import { StickyNote, Trash2, X } from 'lucide-react';
import { clsx } from 'clsx';

const Scratchpad: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(() => {
    return localStorage.getItem("gearguard_scratchpad") || "";
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    localStorage.setItem("gearguard_scratchpad", newContent);
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear your scratchpad?")) {
      setContent("");
      localStorage.removeItem("gearguard_scratchpad");
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Icon Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "relative rounded-xl border p-2 backdrop-blur-xl transition-all duration-300",
          isOpen 
            ? "border-yellow-300 bg-white/60 dark:bg-slate-800/60 dark:border-yellow-500/50 text-yellow-600 dark:text-yellow-400 shadow-inner" 
            : "border-white/50 dark:border-slate-700 bg-white/30 dark:bg-slate-800/30 text-gray-600 dark:text-gray-300 shadow-sm dark:shadow-none hover:border-white/70 dark:hover:border-slate-600 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-white/60 dark:hover:bg-slate-800/60"
        )}
        title="Quick Add Scratchpad"
      >
        <StickyNote className={clsx("h-5 w-5 transition-transform", isOpen && "scale-110")} />
        {content.trim().length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-yellow-400 ring-2 ring-white animate-in zoom-in" />
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 lg:w-96 glass dark:glass-dark rounded-2xl border border-white/60 dark:border-slate-700/50 bg-white/90 dark:bg-slate-800/90 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-3 duration-300 overflow-hidden z-[60] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700/50 bg-yellow-50/50 dark:bg-yellow-900/10 p-4">
            <div className="flex items-center space-x-2">
              <StickyNote className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Quick Scratchpad</h3>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleClear}
                className="text-gray-400 hover:text-red-500 transition-colors duration-300 active:scale-95"
                title="Clear All"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-300 active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Text Area */}
          <div className="p-4 bg-white dark:bg-slate-800">
            <textarea
              className="w-full h-48 sm:h-64 resize-none bg-transparent border-none outline-none focus:ring-0 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 scrollbar-thin scrollbar-thumb-yellow-200 dark:scrollbar-thumb-yellow-700"
              placeholder="Jot down part numbers, diagnostic notes, or temporary reminders here...&#10;&#10;(Saved automatically)"
              value={content}
              onChange={handleChange}
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Scratchpad;
