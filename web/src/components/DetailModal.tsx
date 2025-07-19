import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PortfolioNodeData } from '../types/portfolioTypes';
import CentralModal from './modals/CentralModal';
import CategoryModal from './modals/CategoryModal';
import SkillModal from './modals/SkillModal';
import ProjectModal from './modals/ProjectModal';
import ExperienceModal from './modals/ExperienceModal';

// Import cursor images
import rocketHoverCursor from '../assets/cursor_hover32.png';

interface DetailModalProps {
  isOpen: boolean;
  nodeData: PortfolioNodeData | null;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, nodeData, onClose }) => {
  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!nodeData) return null;

  // Determine which modal component to render based on node type/level
  const getModalContent = () => {
    // Central node (level 0)
    if (nodeData.id === 'center') {
      return <CentralModal nodeData={nodeData} />;
    }
    
    // Category nodes (level 1) 
    if (['projects', 'experience', 'skills', 'contact'].includes(nodeData.id)) {
      return <CategoryModal nodeData={nodeData} />;
    }
    
    // Project nodes - IDs starting with "project"
    if (nodeData.id.startsWith('project')) {
      return <ProjectModal nodeData={nodeData} />;
    }
    
    // Experience nodes - IDs starting with "experience"
    if (nodeData.id.startsWith('experience')) {
      return <ExperienceModal nodeData={nodeData} />;
    }
    
    // Skill nodes - IDs starting with "skill"
    if (nodeData.id.startsWith('skill')) {
      return <SkillModal nodeData={nodeData} />;
    }
    
    // Default fallback for other child nodes
    return <SkillModal nodeData={nodeData} />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
            className="bg-black/40 rounded-lg max-w-6xl h-[95%] w-full mx-4 overflow-hidden font-pixelify"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h2 className="text-3xl font-bold text-white font-pixelify">{nodeData.label}</h2>
                <p className="text-gray-400 mt-1">{nodeData.description}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2"
                style={{
                  cursor: `url(${rocketHoverCursor}) 16 16, pointer`
                }}
              >
                ✕
              </button>
            </div>

            {/* Dynamic Content */}
            {getModalContent()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DetailModal;
