import React from 'react';
import { useSkillTreeStore } from '../store/skillTreeStore';
import rocketHoverCursor from '../assets/cursor_hover32.png';

const UIToggle: React.FC = () => {
  const { uiMode, setUIMode } = useSkillTreeStore();

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2">
      {/* Orbital Button */}
      <button
        onClick={() => setUIMode('orbital')}
        className={`
          w-28 h-9 text-xs sm:w-36 sm:h-12 sm:text-lg flex items-center justify-center
          rounded-none border-2 font-mono font-medium uppercase tracking-wider
          transition-all duration-300 shadow-lg
          ${uiMode === 'orbital'
            ? 'bg-blue-600/50 border-blue-400 text-blue-300'
            : 'bg-gray-800 border-gray-500 text-gray-400'
          }
          hover:bg-blue-500/30 hover:border-blue-300 hover:text-blue-200
          hover:scale-105 active:scale-95
        `}
        style={{
          cursor: `url(${rocketHoverCursor}) 16 16, pointer`,
          imageRendering: 'pixelated',
          filter: uiMode === 'orbital' ? 'none' : 'grayscale(1)',
        }}
      >
        Orbital
      </button>

      {/* Static Button */}
      <button
        onClick={() => setUIMode('static')}
        className={`
          w-28 h-9 text-xs sm:w-36 sm:h-12 sm:text-lg flex items-center justify-center
          rounded-none border-2 font-mono font-medium uppercase tracking-wider
          transition-all duration-300 shadow-lg
          ${uiMode === 'static'
            ? 'bg-green-600/50 border-green-400 text-green-300'
            : 'bg-gray-800 border-gray-500 text-gray-400'
          }
          hover:bg-green-500/30 hover:border-green-300 hover:text-green-200
          hover:scale-105 active:scale-95
        `}
        style={{
          cursor: `url(${rocketHoverCursor}) 16 16, pointer`,
          imageRendering: 'pixelated',
          filter: uiMode === 'static' ? 'none' : 'grayscale(1)',
        }}
      >
        Static
      </button>

      {/* New (constellation) Button */}
      <button
        onClick={() => setUIMode('new')}
        className={`
          w-28 h-9 text-xs sm:w-36 sm:h-12 sm:text-lg flex items-center justify-center
          rounded-none border-2 font-mono font-medium uppercase tracking-wider
          transition-all duration-300 shadow-lg
          ${uiMode === 'new'
            ? 'bg-violet-600/50 border-violet-400 text-violet-300'
            : 'bg-gray-800 border-gray-500 text-gray-400'
          }
          hover:bg-violet-500/30 hover:border-violet-300 hover:text-violet-200
          hover:scale-105 active:scale-95
        `}
        style={{
          cursor: `url(${rocketHoverCursor}) 16 16, pointer`,
          imageRendering: 'pixelated',
          filter: uiMode === 'new' ? 'none' : 'grayscale(1)',
        }}
      >
        New
      </button>
    </div>
  );
};

export default UIToggle;
