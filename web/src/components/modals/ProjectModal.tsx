import React from 'react';
import type { Project } from '../../types/portfolioTypes';
import rocketHoverCursor from '../../assets/cursor_hover32.png';

interface ProjectModalProps {
  nodeData: {
    id: string;
    label: string;
    description: string;
    extended_desc: string;
    // Individual project data
    technologies?: string[];
    link?: string;
    live_demo?: string;
    features?: string[];
    highlights?: string[];
    duration?: string;
    role?: string;
    images?: string[];
    // Collection of projects data
    featured_projects?: Project[];
    projects?: Project[];
    stats?: {
      totalProjects?: number;
      liveProjects?: number;
      githubStars?: number;
      contributions?: number;
      githubRepos?: number;
      hackathonWins?: number;
    };
  };
}

const ProjectModal: React.FC<ProjectModalProps> = ({ nodeData }) => {
  // Check if this is an individual project node (has technologies, features, etc.)
  const isIndividualProject = nodeData.technologies || nodeData.features || nodeData.duration || nodeData.role;

  const renderProjects = (projects: Project[]) => (
    <div className="grid gap-6 md:grid-cols-2">
      {projects.map((project, index) => (
        <div key={index} className="rounded-none p-6 border-2 border-gray-600 hover:border-gray-500 transition-all duration-200">
          <h4 className="text-xl font-semibold text-white mb-2">{project.name}</h4>
          <p className="text-gray-300 mb-4">{project.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies?.map((tech: string, techIndex: number) => (
              <span 
                key={techIndex}
                className="px-3 py-1 bg-blue-600/30 text-blue-300 rounded-none border border-blue-600/50 hover:bg-blue-500/40 hover:border-blue-400 hover:text-white transition-all duration-200 text-sm font-mono"
              >
                {tech}
              </span>
            ))}
          </div>

          {project.highlights && (
            <ul className="space-y-1 mb-4">
              {project.highlights.map((highlight: string, highlightIndex: number) => (
                <li key={highlightIndex} className="text-gray-300 text-sm flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  {highlight}
                </li>
              ))}
            </ul>
          )}

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
  );

  return (
    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
      {/* Extended Description */}
      <div className="mb-8">
        <p className="text-gray-300 text-lg leading-relaxed">{nodeData.extended_desc}</p>
      </div>

      {/* Individual Project Details */}
      {isIndividualProject && (
        <>
          {/* Project Metadata */}
          <div className="mb-8 grid gap-4 md:grid-cols-2">
            {nodeData.duration && (
              <div className="text-center p-4 rounded-none border-2 border-gray-600 transition-all duration-200">
                <div className="text-xl font-bold text-blue-400">{nodeData.duration}</div>
                <div className="text-gray-300 text-sm">Duration</div>
              </div>
            )}
            {nodeData.role && (
              <div className="text-center p-4 rounded-none border-2 border-gray-600 transition-all duration-200">
                <div className="text-xl font-bold text-green-400">{nodeData.role}</div>
                <div className="text-gray-300 text-sm">Role</div>
              </div>
            )}
          </div>

          {/* Technologies Used */}
          {nodeData.technologies && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Technologies Used</h3>
              <div className="flex flex-wrap gap-3">
                {nodeData.technologies.map((tech, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-blue-600/30 text-blue-300 rounded-none border hover:text-white transition-all duration-200 text-sm font-medium font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Features */}
          {nodeData.features && nodeData.features.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Key Features</h3>
              <ul className="space-y-3">
                {nodeData.features.map((feature, index) => (
                  <li key={index} className="text-gray-300 flex items-start">
                    <span className="text-green-400 mr-3 mt-1">🚀</span>
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Project Highlights */}
          {nodeData.highlights && nodeData.highlights.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Highlights</h3>
              <ul className="space-y-3">
                {nodeData.highlights.map((highlight, index) => (
                  <li key={index} className="text-gray-300 flex items-start">
                    <span className="text-yellow-400 mr-3 mt-1">⭐</span>
                    <span className="leading-relaxed">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Links */}
          {(nodeData.link || nodeData.live_demo) && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Links</h3>
              <div className="flex gap-4 flex-wrap">
                {nodeData.link && (
                  <a 
                    href={nodeData.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-blue-600/20 text-blue-300 rounded-none border-2 hover:bg-stone-600 transition-all duration-300 flex items-center gap-2 font-mono transform hover:scale-105"
                  >
                    <span>🔗</span>
                    Website / Repository
                  </a>
                )}
                {nodeData.live_demo && (
                  <a 
                    href={nodeData.live_demo} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-green-600/20 text-green-300 rounded-none border-2 hover:bg-stone-600 transition-all duration-300 flex items-center gap-2 font-mono transform hover:scale-105"
                  >
                    <span>🚀</span>
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Stats Section (for project collections) */}
      {nodeData.stats && !isIndividualProject && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Project Statistics</h3>
          <div className="grid gap-4 md:grid-cols-4">
            {nodeData.stats.totalProjects && (
              <div className="text-center p-4 rounded-none border-2 border-gray-600 hover:border-blue-500 hover:bg-blue-900/10 transition-all duration-200">
                <div className="text-2xl font-bold text-blue-400">{nodeData.stats.totalProjects}</div>
                <div className="text-gray-300 text-sm">Total Projects</div>
              </div>
            )}
            {nodeData.stats.liveProjects && (
              <div className="text-center p-4 rounded-none border-2 border-gray-600 hover:border-green-500 hover:bg-green-900/10 transition-all duration-200">
                <div className="text-2xl font-bold text-green-400">{nodeData.stats.liveProjects}</div>
                <div className="text-gray-300 text-sm">Live Projects</div>
              </div>
            )}
            {nodeData.stats.githubRepos && (
              <div className="text-center p-4 rounded-none border-2 border-gray-600 hover:border-purple-500 hover:bg-purple-900/10 transition-all duration-200">
                <div className="text-2xl font-bold text-purple-400">{nodeData.stats.githubRepos}</div>
                <div className="text-gray-300 text-sm">GitHub Repos</div>
              </div>
            )}
            {nodeData.stats.hackathonWins && (
              <div className="text-center p-4 rounded-none border-2 border-gray-600 hover:border-yellow-500 hover:bg-yellow-900/10 transition-all duration-200">
                <div className="text-2xl font-bold text-yellow-400">{nodeData.stats.hackathonWins}</div>
                <div className="text-gray-300 text-sm">Hackathon Wins</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Featured Projects */}
      {nodeData.featured_projects && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Featured Projects</h3>
          {renderProjects(nodeData.featured_projects)}
        </div>
      )}

      {/* Other Projects */}
      {nodeData.projects && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Projects</h3>
          {renderProjects(nodeData.projects)}
        </div>
      )}

      {/* Stats */}
      {nodeData.stats && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Statistics</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {nodeData.stats.totalProjects && (
              <div className="text-center p-4 border-2 border-gray-600 rounded-none hover:border-green-500 hover:bg-green-900/10 transition-all duration-200">
                <div className="text-3xl font-bold text-green-400">{nodeData.stats.totalProjects}</div>
                <div className="text-gray-300 text-sm">Total Projects</div>
              </div>
            )}
            {nodeData.stats.liveProjects && (
              <div className="text-center p-4 border-2 border-gray-600 rounded-none hover:border-blue-500 hover:bg-blue-900/10 transition-all duration-200">
                <div className="text-3xl font-bold text-blue-400">{nodeData.stats.liveProjects}</div>
                <div className="text-gray-300 text-sm">Live Projects</div>
              </div>
            )}
            {nodeData.stats.githubStars && (
              <div className="text-center p-4 border-2 border-gray-600 rounded-none hover:border-yellow-500 hover:bg-yellow-900/10 transition-all duration-200">
                <div className="text-3xl font-bold text-yellow-400">{nodeData.stats.githubStars}</div>
                <div className="text-gray-300 text-sm">GitHub Stars</div>
              </div>
            )}
            {nodeData.stats.contributions && (
              <div className="text-center p-4 border-2 border-gray-600 rounded-none hover:border-purple-500 hover:bg-purple-900/10 transition-all duration-200">
                <div className="text-3xl font-bold text-purple-400">{nodeData.stats.contributions}</div>
                <div className="text-gray-300 text-sm">Contributions</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectModal;
