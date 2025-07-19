import React from 'react';
import type { PortfolioNodeData } from '../../types/portfolioTypes';
import rocketHoverCursor from '../../assets/cursor_hover32.png';

interface CategoryModalProps {
  nodeData: PortfolioNodeData;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ nodeData }) => {
  return (
    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
      {/* Extended Description */}
      <div className="mb-8">
        <p className="text-gray-300 text-lg leading-relaxed">{nodeData.extended_desc}</p>
      </div>

      {/* Category-specific content based on label */}
      {nodeData.label === 'Projects' && nodeData.featured_projects && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Featured Projects</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {nodeData.featured_projects.map((project, index) => (
              <div key={index} className="rounded-lg p-6 border border-gray-700">
                <h4 className="text-xl font-semibold text-white mb-3">{project.name}</h4>
                <p className="text-gray-300 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech, techIndex) => (
                    <span 
                      key={techIndex}
                      className="px-2 py-1 bg-blue-600/30 text-blue-300 rounded text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
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
                      className="text-green-400 hover:text-green-300 text-sm"
                      style={{
                        cursor: `url(${rocketHoverCursor}) 16 16, pointer`
                      }}
                    >
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {nodeData.label === 'Experience' && nodeData.positions && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Work Experience</h3>
          <div className="space-y-6">
            {nodeData.positions.map((position, index) => (
              <div key={index} className="rounded-lg p-6 border border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-xl font-semibold text-white">{position.title}</h4>
                    <p className="text-blue-400">{position.company}</p>
                  </div>
                  <span className="text-gray-400 text-sm">{position.duration}</span>
                </div>
                <p className="text-gray-300 mb-4">{position.description}</p>
                {position.technologies && (
                  <div className="flex flex-wrap gap-2">
                    {position.technologies.map((tech: string, techIndex: number) => (
                      <span 
                        key={techIndex}
                        className="px-2 py-1 bg-green-600/30 text-green-300 rounded text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {nodeData.label === 'Skills' && nodeData.categories && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Technical Skills</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {nodeData.categories.map((category, index) => (
              <div key={index} className="rounded-lg p-6 border border-gray-700">
                <h4 className="text-xl font-semibold text-white mb-4">{category.name}</h4>
                <div className="space-y-2">
                  {category.technologies.map((tech, techIndex) => (
                    <div key={techIndex} className="flex items-center justify-between">
                      <span className="text-gray-300">{tech.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400 text-sm">{tech.level}</span>
                        <span className="text-gray-500 text-xs">({tech.years}y)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {nodeData.label === 'Contact' && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Get In Touch</h3>
          
          {nodeData.contact_methods && (
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <div className="rounded-lg p-6 border border-gray-700">
                <h4 className="text-xl font-semibold text-white mb-4">Contact Methods</h4>
                <div className="space-y-3">
                  {nodeData.contact_methods.map((method, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-300">{method.label}</span>
                      <a 
                        href={method.type === 'email' ? `mailto:${method.value}` : method.value}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                        target={method.type === 'email' ? undefined : '_blank'}
                        rel={method.type === 'email' ? undefined : 'noopener noreferrer'}
                        style={{
                          cursor: `url(${rocketHoverCursor}) 16 16, pointer`
                        }}
                      >
                        {method.type === 'email' ? method.value : 'Visit'}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {nodeData.services && (
                <div className="rounded-lg p-6 border border-gray-700">
                  <h4 className="text-xl font-semibold text-white mb-4">Services</h4>
                  <div className="space-y-2">
                    {nodeData.services.map((service, index) => (
                      <div key={index} className="flex items-center">
                        <span className="text-green-400 mr-2">•</span>
                        <span className="text-gray-300">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {nodeData.availability && (
            <div className="rounded-lg p-6 border border-gray-700">
              <h4 className="text-xl font-semibold text-white mb-4">Availability</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h5 className="text-white font-medium mb-2">Status:</h5>
                  <p className="text-green-400">{nodeData.availability.status}</p>
                </div>
                <div>
                  <h5 className="text-white font-medium mb-2">Response Time:</h5>
                  <p className="text-gray-300">{nodeData.availability.response_time}</p>
                </div>
                <div>
                  <h5 className="text-white font-medium mb-2">Timezone:</h5>
                  <p className="text-gray-300">{nodeData.availability.timezone}</p>
                </div>
                <div>
                  <h5 className="text-white font-medium mb-2">Open to:</h5>
                  <div className="flex flex-wrap gap-2">
                    {nodeData.availability.types.map((type, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-green-600/30 text-green-300 rounded text-sm"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Statistics for any category */}
      {nodeData.stats && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Statistics</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(nodeData.stats).map(([key, value], index) => (
              <div key={index} className="rounded-lg p-4 border border-gray-700 text-center">
                <div className="text-2xl font-bold text-blue-400">{value}</div>
                <div className="text-gray-300 text-sm capitalize">{key.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryModal;
