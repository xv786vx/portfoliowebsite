import React from 'react';
import type { PortfolioNodeData } from '../../types/portfolioTypes';
import rocketHoverCursor from '../../assets/cursor_hover32.png';

interface SkillModalProps {
  nodeData: PortfolioNodeData;
}

const SkillModal: React.FC<SkillModalProps> = ({ nodeData }) => {
  // Check if this is an education node
  const isEducationNode = nodeData.id === 'skill_education' || nodeData.formal_education;

  return (
    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
      {/* Extended Description */}
      <div className="mb-8">
        <p className="text-gray-300 text-lg leading-relaxed">{nodeData.extended_desc}</p>
      </div>

      {/* Education Section */}
      {isEducationNode && nodeData.formal_education && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Education</h3>
          <div className="space-y-6">
            {nodeData.formal_education.map((education, index) => (
              <div key={index} className="rounded-none p-6 border-2 border-gray-600 bg-gray-900/20 hover:border-gray-500 transition-all duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-1">{education.degree}</h4>
                    {education.specialization && (
                      <p className="text-blue-400 mb-1">Specialization: {education.specialization}</p>
                    )}
                    <p className="text-green-400 font-medium">{education.institution}</p>
                    {education.location && (
                      <p className="text-gray-400 text-sm">{education.location}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 bg-gray-800 px-3 py-1 rounded-none border border-gray-600 text-sm">
                      {education.duration}
                    </span>
                    {education.status && (
                      <p className="text-yellow-400 text-sm mt-1">{education.status}</p>
                    )}
                  </div>
                </div>
                
                {/* Relevant Courses */}
                {education.relevant_courses && education.relevant_courses.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-white font-medium mb-3">Relevant Coursework:</h5>
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {education.relevant_courses.map((course, courseIndex) => (
                        <div key={courseIndex} className="flex items-center p-2 rounded bg-gray-800/50">
                          <span className="text-blue-400 mr-2">📚</span>
                          <span className="text-gray-300 text-sm">{course}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Organizations */}
                {education.organizations && education.organizations.length > 0 && (
                  <div>
                    <h5 className="text-white font-medium mb-3">Organizations:</h5>
                    <div className="flex flex-wrap gap-2">
                      {education.organizations.map((org, orgIndex) => (
                        <span 
                          key={orgIndex}
                          className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-none border border-purple-600/50 hover:bg-purple-500/40 hover:border-purple-400 hover:text-white transition-all duration-200 text-sm font-mono"
                        >
                          {org}
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
      {nodeData.continuous_learning && nodeData.continuous_learning.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Continuous Learning</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {nodeData.continuous_learning.map((item, index) => (
              <div key={index} className="flex items-center p-3 rounded-none border-2 border-gray-600 hover:border-gray-500 transition-all duration-200">
                <span className="text-yellow-400 mr-3">🌟</span>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
              <div key={index} className="rounded-none p-4 border-2 border-gray-600 hover:border-gray-500 transition-all duration-200">
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
              <div key={index} className="rounded-none p-6 border-2 border-gray-600 hover:border-gray-500 transition-all duration-200">
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
              <div key={index} className="rounded-none p-4 border-2 border-gray-600 hover:border-gray-500 transition-all duration-200">
                <h4 className="text-lg font-semibold text-white mb-2">{project.name}</h4>
                <p className="text-gray-300 text-sm mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.technologies && project.technologies.map((tech, techIndex) => (
                    <span 
                      key={techIndex}
                      className="px-2 py-1 bg-blue-600/30 text-blue-300 rounded-none border border-blue-600/50 hover:bg-blue-500/40 hover:border-blue-400 hover:text-white transition-all duration-200 text-xs font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-200 hover:bg-blue-900/20 px-2 py-1 rounded-none border border-transparent hover:border-blue-400/30 text-xs transition-all duration-200 font-mono"
                      style={{
                        cursor: `url(${rocketHoverCursor}) 16 16, pointer`
                      }}
                    >
                      Link
                    </a>
                  )}
                  {project.live_demo && (
                    <a
                      href={project.live_demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-200 hover:bg-green-900/20 px-2 py-1 rounded-none border border-transparent hover:border-green-400/30 text-xs transition-all duration-200 font-mono"
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
    </div>
  );
};

export default SkillModal;
