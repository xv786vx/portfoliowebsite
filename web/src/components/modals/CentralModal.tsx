import React from 'react';
import type { PortfolioNodeData } from '../../types/portfolioTypes';
import rocketHoverCursor from '../../assets/cursor_hover32.png';

interface CentralModalProps {
  nodeData: PortfolioNodeData;
}

const CentralModal: React.FC<CentralModalProps> = ({ nodeData }) => {
  return (
    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
      {/* Extended Description */}
      <div className="mb-8">
        <p className="text-gray-300 text-lg leading-relaxed">{nodeData.extended_desc}</p>
      </div>

      {/* Personal Details */}
      {nodeData.details && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">About Me</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {nodeData.details.location && (
              <div className="rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-2">📍 Location</h4>
                <p className="text-gray-300">{nodeData.details.location}</p>
              </div>
            )}
            {nodeData.details.yearsExperience && (
              <div className="rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-2">💼 Experience</h4>
                <p className="text-gray-300">{nodeData.details.yearsExperience}</p>
              </div>
            )}
            {nodeData.details.availability && (
              <div className="rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-2">✅ Status</h4>
                <p className="text-green-400">{nodeData.details.availability}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Specialties */}
      {nodeData.details?.specialties && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Specialties</h3>
          <div className="grid gap-2 md:grid-cols-2">
            {nodeData.details.specialties.map((specialty, index) => (
              <div key={index} className="flex items-center">
                <span className="text-blue-400 mr-2">⭐</span>
                <span className="text-gray-300">{specialty}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {nodeData.links && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Links</h3>
          <div className="flex flex-wrap gap-4">
            {nodeData.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                style={{
                  cursor: `url(${rocketHoverCursor}) 16 16, pointer`
                }}
              >
                {link.icon && <span>{link.icon}</span>}
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CentralModal;
