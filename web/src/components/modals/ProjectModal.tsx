import React from 'react';
import type { Project } from '../../types/portfolioTypes';
import rocketHoverCursor from '../../assets/cursor_hover32.png';

interface ProjectModalProps {
  nodeData: {
    label: string;
    description: string;
    extended_desc: string;
    featured_projects?: Project[];
    projects?: Project[];
    stats?: {
      totalProjects?: number;
      liveProjects?: number;
      githubStars?: number;
      contributions?: number;
    };
  };
}

const ProjectModal: React.FC<ProjectModalProps> = ({ nodeData }) => {
  const renderProjects = (projects: Project[]) => (
    <div className="grid gap-6 md:grid-cols-2">
      {projects.map((project, index) => (
        <div key={index} className="rounded-lg p-6 border border-gray-700">
          <h4 className="text-xl font-semibold text-white mb-2">{project.name}</h4>
          <p className="text-gray-300 mb-4">{project.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies?.map((tech: string, techIndex: number) => (
              <span 
                key={techIndex}
                className="px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full text-sm"
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
            {project.github && (
              <a 
                href={project.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm underline"
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
                className="text-green-400 hover:text-green-300 text-sm underline"
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
              <div className="text-center p-4 border border-gray-700 rounded-lg">
                <div className="text-3xl font-bold text-green-400">{nodeData.stats.totalProjects}</div>
                <div className="text-gray-300 text-sm">Total Projects</div>
              </div>
            )}
            {nodeData.stats.liveProjects && (
              <div className="text-center p-4 border border-gray-700 rounded-lg">
                <div className="text-3xl font-bold text-blue-400">{nodeData.stats.liveProjects}</div>
                <div className="text-gray-300 text-sm">Live Projects</div>
              </div>
            )}
            {nodeData.stats.githubStars && (
              <div className="text-center p-4 border border-gray-700 rounded-lg">
                <div className="text-3xl font-bold text-yellow-400">{nodeData.stats.githubStars}</div>
                <div className="text-gray-300 text-sm">GitHub Stars</div>
              </div>
            )}
            {nodeData.stats.contributions && (
              <div className="text-center p-4 border border-gray-700 rounded-lg">
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
