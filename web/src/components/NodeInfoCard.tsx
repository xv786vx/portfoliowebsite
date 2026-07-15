import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSkillTreeStore, type SkillNode } from '../store/skillTreeStore';
import type { PortfolioNodeData } from '../types/portfolioTypes';
import resumePdf from '../assets/firasaj_resume_august2025.pdf';

interface CardLink {
  label: string;
  url: string;
}

/** Build the link rows for a node from whichever URL fields it carries. */
export function buildLinks(data: PortfolioNodeData): CardLink[] {
  const out: CardLink[] = [];
  if (data.id === 'center' && data.links) {
    data.links.forEach((l) => out.push({ label: l.label, url: l.url }));
  } else if (data.id === 'contact' && data.contact_methods) {
    data.contact_methods.forEach((m) =>
      out.push({ label: m.label, url: m.type === 'email' ? `mailto:${m.value}` : m.value })
    );
  } else {
    if (data.link) out.push({ label: 'Repository / Website', url: data.link });
    if (data.live_demo) out.push({ label: 'Live Demo', url: data.live_demo });
  }
  return out;
}

export const LinkRow: React.FC<{ link: CardLink }> = ({ link }) => {
  const isResume = link.url === '#resume';
  const commonClass =
    'group flex items-center justify-between border-b border-white/10 py-2 text-sm ' +
    'text-neutral-300 hover:text-white transition-colors';

  const inner = (
    <>
      <span className="uppercase tracking-wider">{link.label}</span>
      <span className="text-neutral-500 group-hover:text-white transition-colors">→</span>
    </>
  );

  if (isResume) {
    return (
      <button
        type="button"
        onClick={() => window.open(resumePdf, '_blank', 'noopener,noreferrer')}
        className={commonClass + ' w-full text-left'}
      >
        {inner}
      </button>
    );
  }
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer" className={commonClass}>
      {inner}
    </a>
  );
};

/** Shared body content for a focused node — reused by the desktop panel and the
 *  mobile full-screen modal. */
export const NodeCardContent: React.FC<{ node: SkillNode; data: PortfolioNodeData }> = ({
  node,
  data,
}) => {
  const links = buildLinks(data);
  // Secondary meta shown on the subtitle row
  const meta = data.role || data.duration || `LEVEL ${node.level} NODE`;

  return (
    <>
      {/* Title */}
      <h2 className="font-serif uppercase text-white leading-none text-4xl mb-2 tracking-wide">
        {data.label}
      </h2>

      {/* Subtitle: description and meta stacked, each wrapping within the card */}
      <div className="border-b border-white/15 pb-2 mb-3">
        <p className="text-sm text-neutral-300 break-words">{data.description}</p>
        {meta && (
          <p className="mt-1 text-xs uppercase tracking-wider text-neutral-500 break-words">
            {meta}
          </p>
        )}
      </div>

      {/* Body blurb */}
      {data.extended_desc && (
        <p className="text-sm leading-relaxed text-neutral-400 mb-4">{data.extended_desc}</p>
      )}

      {/* Technologies (compact) */}
      {data.technologies && data.technologies.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-4">
          {data.technologies.map((t) => (
            <span key={t} className="text-xs uppercase tracking-wider text-neutral-500">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Links */}
      {links.length > 0 && (
        <div className="mt-2">
          {links.map((l) => (
            <LinkRow key={l.label + l.url} link={l} />
          ))}
        </div>
      )}
    </>
  );
};

const NodeInfoCard: React.FC = () => {
  const { focusedNodeId, nodes, clearFocus } = useSkillTreeStore();
  const node = focusedNodeId ? nodes.find((n) => n.id === focusedNodeId) : null;

  // Escape to dismiss
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clearFocus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [clearFocus]);

  const data = node?.portfolioData ?? null;

  return (
    <AnimatePresence>
      {node && data && (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, x: -30, y: '-50%' }}
          animate={{ opacity: 1, x: 0, y: '-50%' }}
          exit={{ opacity: 0, x: -30, y: '-50%' }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed left-10 top-1/2 z-50 w-[calc(25vw-40px)]"
        >
          <div className="max-h-[calc(100vh-80px)] overflow-y-auto border-l-2 border-white/70 bg-[#0d0f13]/85 backdrop-blur-sm px-6 py-5 shadow-2xl">
            {/* Back / dismiss */}
            <button
              type="button"
              onClick={clearFocus}
              className="mb-3 text-xs uppercase tracking-widest text-neutral-500 hover:text-white transition-colors"
            >
              [ ESC ] ← BACK
            </button>

            <NodeCardContent node={node} data={data} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NodeInfoCard;
