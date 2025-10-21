'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';

interface SearchBarProps {
  opticalMargin?: number;
}

export const SearchBar = forwardRef<HTMLDivElement, SearchBarProps>(
  function SearchBar({ opticalMargin = 60 }, ref) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [isHoveringButton, setIsHoveringButton] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleClick = () => {
      if (!isExpanded) {
        // Opening search
        setIsExpanded(true);
      } else if (searchValue.trim()) {
        // Submit search
        console.log('Submitting search:', searchValue);
        // TODO: Implement actual search functionality
      } else {
        // Close search (empty state)
        setIsExpanded(false);
        setSearchValue('');
      }
    };

    // Click outside to close
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          if (isExpanded) {
            setIsExpanded(false);
            setSearchValue('');
          }
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isExpanded]);

    // Determine which icon to show
    const getIcon = () => {
      if (!isExpanded) {
        return <Search className="h-4 w-4" />;
      } else if (searchValue.trim()) {
        return <ArrowRight className="h-4 w-4" />;
      } else if (isHoveringButton) {
        return <X className="h-4 w-4" />;
      } else {
        return <Search className="h-4 w-4" />;
      }
    };

    return (
      <div ref={ref} className="relative flex items-center flex-1 justify-end" style={{ paddingLeft: `${opticalMargin}px` }}>
        {/* Outer container - ALWAYS bg-muted, expands in width, has padding */}
        <motion.div
          ref={containerRef}
          initial={{ width: '40px' }}
          animate={{
            width: isExpanded ? '100%' : '40px',
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="h-10 rounded-full bg-muted flex items-center relative p-2"
        >
          {/* Input field that appears */}
          <AnimatePresence>
            {isExpanded && (
              <motion.input
                key="input"
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut', delay: 0.1 }}
                className="flex-1 h-full pr-10 pl-3 border-0 bg-transparent text-foreground text-sm focus:outline-none placeholder:text-muted-foreground"
                autoFocus
              />
            )}
          </AnimatePresence>

          {/* Inner button - smaller, animates from transparent to primary color */}
          <motion.button
            onClick={handleClick}
            onMouseEnter={() => setIsHoveringButton(true)}
            onMouseLeave={() => setIsHoveringButton(false)}
            animate={{
              backgroundColor: isExpanded
                ? (isHoveringButton && searchValue.trim()
                    ? 'rgba(154, 148, 255, 1)'
                    : 'rgba(4, 29, 43, 1)')
                : 'rgba(4, 29, 43, 0)',
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute right-2 h-6 w-6 flex items-center justify-center flex-shrink-0 rounded-full"
          >
            <motion.div
              animate={{
                color: isExpanded ? 'rgba(255, 255, 255, 1)' : 'rgba(9, 9, 11, 1)',
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {getIcon()}
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    );
  }
);
