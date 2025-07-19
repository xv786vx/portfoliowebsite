import React from 'react';
import type { PortfolioNodeData } from '../../types/portfolioTypes';
import rocketHoverCursor from '../../assets/cursor_hover32.png';

interface SkillModalProps {
  nodeData: PortfolioNodeData;
}

const SkillModal: React.FC<SkillModalProps> = ({ nodeData }) => {
  return (
    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
      {/* Extended Description */}
      <div className="mb-8">
        <p className="text-gray-300 text-lg leading-relaxed">{nodeData.extended_desc}</p>
      </div>

      {/* Expertise */}
      {nodeData.expertise && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Expertise Areas</h3>
          <div className="grid gap-2 md:grid-cols-2">
            {nodeData.expertise.map((area, index) => (
              <div key={index} className="flex items-center">
                <span className="text-blue-400 mr-2">💎</span>
                <span className="text-gray-300">{area}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Work */}
      {nodeData.recent_work && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Recent Work</h3>
          <div className="grid gap-3">
            {nodeData.recent_work.map((work, index) => (
              <div key={index} className="rounded-lg p-4 border border-gray-700">
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">🚀</span>
                  <span className="text-gray-300">{work}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technologies Deep Dive */}
      {nodeData.technologies_deep_dive && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Technology Deep Dive</h3>
          <div className="space-y-4">
            {Object.entries(nodeData.technologies_deep_dive).map(([tech, description], index) => (
              <div key={index} className="rounded-lg p-6 border border-gray-700">
                <h4 className="text-xl font-semibold text-white mb-3">{tech}</h4>
                <p className="text-gray-300">{description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Projects */}
      {nodeData.projects && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Related Projects</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {nodeData.projects.map((project, index) => (
              <div key={index} className="rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-semibold text-white mb-2">{project.name}</h4>
                <p className="text-gray-300 text-sm mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.technologies.map((tech, techIndex) => (
                    <span 
                      key={techIndex}
                      className="px-2 py-1 bg-blue-600/30 text-blue-300 rounded text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs"
                      style={{
                        cursor: `url(${rocketHoverCursor}) 16 16, pointer`
                      }}
                    >
                      GitHub
                    </a>
                  )}
                  {project.live_demo && (
                    <a
                      href={project.live_demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 text-xs"
                      style={{
                        cursor: `url(${rocketHoverCursor}) 16 16, pointer`
                      }}
                    >
                      Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {nodeData.formal_education && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Education</h3>
          <div className="space-y-4">
            {nodeData.formal_education.map((edu, index) => (
              <div key={index} className="rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{edu.degree}</h4>
                    <p className="text-blue-400">{edu.institution}</p>
                  </div>
                  <span className="text-gray-400 text-sm">{edu.duration}</span>
                </div>
                {edu.gpa && (
                  <p className="text-gray-300 text-sm">GPA: {edu.gpa}</p>
                )}
                {edu.relevant_courses && (
                  <div className="mt-2">
                    <p className="text-gray-400 text-sm mb-1">Relevant Courses:</p>
                    <div className="flex flex-wrap gap-1">
                      {edu.relevant_courses.map((course, courseIndex) => (
                        <span 
                          key={courseIndex}
                          className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded text-xs"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Continuous Learning */}
      {nodeData.continuous_learning && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Continuous Learning</h3>
          <div className="grid gap-2">
            {nodeData.continuous_learning.map((learning, index) => (
              <div key={index} className="flex items-center">
                <span className="text-orange-400 mr-2">📚</span>
                <span className="text-gray-300">{learning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {nodeData.links && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Resources</h3>
          <div className="flex flex-wrap gap-3">
            {nodeData.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
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

export default SkillModal;
