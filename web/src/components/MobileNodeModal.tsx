import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSkillTreeStore } from '../store/skillTreeStore';
import { NodeCardContent } from './NodeInfoCard';

/** Full-screen node details for the locked mobile layout, with an ✕ close
 *  button centered at the bottom. */
const MobileNodeModal: React.FC = () => {
  const { focusedNodeId, nodes, clearFocus } = useSkillTreeStore();
  const node = focusedNodeId ? nodes.find((n) => n.id === focusedNodeId) : null;
  const data = node?.portfolioData ?? null;

  return (
    <AnimatePresence>
      {node && data && (
        <motion.div
          key={node.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex flex-col bg-[#0d0f13]"
        >
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 pt-8 pb-28">
            <NodeCardContent node={node} data={data} />
          </div>

          {/* Close button, centered at the bottom — plain ASCII, no chrome */}
          <div className="absolute inset-x-0 bottom-8 flex justify-center">
            <button
              type="button"
              onClick={clearFocus}
              aria-label="Close"
              className="font-mono text-2xl tracking-widest text-neutral-400 hover:text-white transition-colors"
            >
              [ X ]
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileNodeModal;
