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
              <div key={index} className="rounded-none p-6 border-2 border-gray-600 hover:border-gray-500 transition-all duration-200">
                <h4 className="text-xl font-semibold text-white mb-3">{project.name}</h4>
                <p className="text-gray-300 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies && project.technologies.map((tech, techIndex) => (
                    <span 
                      key={techIndex}
                      className="px-2 py-1 bg-blue-600/30 text-blue-300 rounded-none border border-blue-600/50 hover:bg-blue-500/40 hover:border-blue-400 hover:text-white transition-all duration-200 text-sm font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3">
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-200 hover:bg-blue-900/20 px-2 py-1 rounded-none border border-transparent hover:border-blue-400/30 text-sm transition-all duration-200 font-mono"
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
                      className="text-green-400 hover:text-green-200 hover:bg-green-900/20 px-2 py-1 rounded-none border border-transparent hover:border-green-400/30 text-sm transition-all duration-200 font-mono"
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
              <div key={index} className="rounded-none p-6 border-2 border-gray-600 hover:border-gray-500 transition-all duration-200">
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
                        className="px-2 py-1 bg-green-600/30 text-green-300 rounded-none border border-green-600/50 hover:bg-green-500/40 hover:border-green-400 hover:text-white transition-all duration-200 text-sm font-mono"
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
          <div className="space-y-8">
            {nodeData.categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="rounded-none border-2 border-gray-600 p-6 hover:border-gray-500 transition-all duration-200">
                <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">
                    {categoryIndex === 0 && '💻'}
                    {categoryIndex === 1 && '🎨'}
                    {categoryIndex === 2 && '🔧'}
                    {categoryIndex === 3 && '🤖'}
                    {categoryIndex === 4 && '💾'}
                    {categoryIndex === 5 && '🛠️'}
                    {categoryIndex > 5 && '⚡'}
                  </span>
                  {category.name}
                </h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {category.technologies.map((tech, techIndex) => (
                    <div key={techIndex} className="p-4 rounded-none bg-gray-800/50 border-2 border-gray-600 hover:border-gray-500 transition-all duration-200">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="text-white font-medium">{tech.name}</h5>
                        <div className="flex items-center gap-2">
                          {/* Experience Years Badge */}
                          <span className="px-2 py-1 bg-blue-600/30 text-blue-300 rounded text-xs">
                            {tech.years}y
                          </span>
                          {/* Skill Level Badge */}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            tech.level === 'Advanced' ? 'bg-green-600/30 text-green-300' :
                            tech.level === 'Intermediate' ? 'bg-yellow-600/30 text-yellow-300' :
                            'bg-gray-600/30 text-gray-300'
                          }`}>
                            {tech.level}
                          </span>
                        </div>
                      </div>
                      
                      {/* Skill Level Progress Bar */}
                      <div className="w-full bg-gray-700 rounded-none h-2 mb-2">
                        <div 
                          className={`h-2 rounded-none ${
                            tech.level === 'Advanced' ? 'bg-green-500' :
                            tech.level === 'Intermediate' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`}
                          style={{
                            width: tech.level === 'Advanced' ? '90%' : 
                                   tech.level === 'Intermediate' ? '65%' : '35%'
                          }}
                        ></div>
                      </div>
                      
                      {/* Experience Context */}
                      <p className="text-gray-400 text-xs">
                        {tech.years === 1 ? '1 year' : `${tech.years} years`} of experience
                      </p>
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
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              {nodeData.contact_methods.map((method, index) => (
                <a
                  key={index}
                  href={method.type === 'email' ? `mailto:${method.value}` : method.value}
                  target={method.type === 'email' ? undefined : '_blank'}
                  rel={method.type === 'email' ? undefined : 'noopener noreferrer'}
                  className="rounded-none p-6 border-2 border-gray-600 hover:border-gray-300  transition-all duration-200 block"
                  style={{
                    cursor: `url(${rocketHoverCursor}) 16 16, pointer`
                  }}
                >
                  <h4 className="text-xl font-semibold text-white mb-3 text-center">{method.label}</h4>
                  <p className="text-gray-300 text-sm text-center">{method.value}</p>
                </a>
              ))}
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
              <div key={index} className="rounded-none p-4 border-2 border-gray-600 text-center hover:border-blue-500 hover:bg-blue-900/10 transition-all duration-200">
                <div className="text-2xl font-bold text-blue-400 font-mono">{value}</div>
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
