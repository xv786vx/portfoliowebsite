import React, { useState } from 'react';
import type { PortfolioNodeData } from '../../types/portfolioTypes';
import rocketHoverCursor from '../../assets/cursor_hover32.png';
import resumePdf from '../../assets/firasaj_resume_august2025.pdf';

interface CentralModalProps {
  nodeData: PortfolioNodeData;
}

const CentralModal: React.FC<CentralModalProps> = ({ nodeData }) => {
  const [showResumeModal, setShowResumeModal] = useState(false);

  const handleResumeClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    if (url === '#resume') {
      setShowResumeModal(true);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
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
                <div className="rounded-none p-4 border-2 border-gray-600 hover:border-blue-500 hover:bg-blue-900/10 transition-all duration-200">
                  <h4 className="text-lg font-semibold text-white mb-2">📍 Location</h4>
                  <p className="text-gray-300">{nodeData.details.location}</p>
                </div>
              )}
              {nodeData.details.yearsExperience && (
                <div className="rounded-none p-4 border-2 border-gray-600 hover:border-green-500 hover:bg-green-900/10 transition-all duration-200">
                  <h4 className="text-lg font-semibold text-white mb-2">💼 Experience</h4>
                  <p className="text-gray-300">{nodeData.details.yearsExperience}</p>
                </div>
              )}
              {nodeData.details.availability && (
                <div className="rounded-none p-4 border-2 border-gray-600 hover:border-green-500 hover:bg-green-900/10 transition-all duration-200">
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
                  onClick={(e) => handleResumeClick(e, link.url)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-400 hover:scale-105 text-white rounded-none border-2 border-blue-400 transition-all duration-200 flex items-center gap-2 font-mono shadow-lg"
                  style={{
                    cursor: `url(${rocketHoverCursor}) 16 16, pointer`
                  }}
                >
                  {/* {link.icon && <span>{link.icon}</span>} */}
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resume Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border-2 border-gray-600 rounded-none w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b-2 border-gray-600">
              <h3 className="text-xl font-semibold text-white font-pixelify">Resume</h3>
              <button
                onClick={() => setShowResumeModal(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={resumePdf}
                className="w-full h-full border-0"
                title="Resume"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CentralModal;
