'use client';

import { useState, useEffect } from 'react';
import { MoreVertical, X } from 'lucide-react';
import { DEFAULT_SEARCH_BAR_CONFIG, type SearchBarConfig } from '@/lib/anty-v3/animation/types';

const STORAGE_KEY = 'anty-search-bar-config';

/**
 * Get stored config from sessionStorage, or return defaults
 */
export function getStoredSearchBarConfig(): SearchBarConfig {
  if (typeof window === 'undefined') return DEFAULT_SEARCH_BAR_CONFIG;

  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_SEARCH_BAR_CONFIG;

  try {
    const parsed = JSON.parse(stored);
    return { ...DEFAULT_SEARCH_BAR_CONFIG, ...parsed };
  } catch {
    return DEFAULT_SEARCH_BAR_CONFIG;
  }
}

interface SearchBarDemoMenuProps {
  visible: boolean;
}

export function SearchBarDemoMenu({ visible }: SearchBarDemoMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [width, setWidth] = useState(DEFAULT_SEARCH_BAR_CONFIG.width);
  const [height, setHeight] = useState(DEFAULT_SEARCH_BAR_CONFIG.height);
  const [hasChanges, setHasChanges] = useState(false);

  // Load stored values on mount
  useEffect(() => {
    const stored = getStoredSearchBarConfig();
    setWidth(stored.width);
    setHeight(stored.height);
  }, []);

  // Close panel when search mode opens
  useEffect(() => {
    if (visible) {
      setIsOpen(false);
    }
  }, [visible]);

  // Track if values differ from current stored values
  useEffect(() => {
    const stored = getStoredSearchBarConfig();
    setHasChanges(width !== stored.width || height !== stored.height);
  }, [width, height]);

  const handleConfirm = () => {
    const config: Partial<SearchBarConfig> = { width, height };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.location.reload();
  };

  const handleReset = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50" data-search-demo-menu>
      {/* Ghost button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Search bar settings"
      >
        {isOpen ? <X size={20} /> : <MoreVertical size={20} />}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-10 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[200px]">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Search Bar Size
          </div>

          {/* Width input */}
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-600">Width</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-20 px-2 py-1 text-sm border border-gray-200 rounded text-right focus:outline-none focus:border-blue-400"
                min={200}
                max={1000}
              />
              <span className="text-xs text-gray-400">px</span>
            </div>
          </div>

          {/* Height input */}
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm text-gray-600">Height</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-20 px-2 py-1 text-sm border border-gray-200 rounded text-right focus:outline-none focus:border-blue-400"
                min={40}
                max={200}
              />
              <span className="text-xs text-gray-400">px</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleConfirm}
              disabled={!hasChanges}
              className="flex-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>

          {/* Current defaults hint */}
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
            Default: {DEFAULT_SEARCH_BAR_CONFIG.width} × {DEFAULT_SEARCH_BAR_CONFIG.height}
          </div>
        </div>
      )}
    </div>
  );
}
