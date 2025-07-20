import React from 'react';
import type { PortfolioNodeData } from '../../types/portfolioTypes';

interface ExperienceModalProps {
  nodeData: PortfolioNodeData;
}

interface ProjectType {
  name: string;
  description: string;
  duration?: string;
  technologies?: string[];
}

// Reusable section wrapper component
const Section: React.FC<{ title: string; className?: string; children: React.ReactNode }> = ({ 
  title, 
  className = "mb-8", 
  children 
}) => (
  <div className={className}>
    <h4 className="text-xl font-semibold text-white mb-4 font-pixelify">{title}</h4>
    {children}
  </div>
);

// Project card component
const ProjectCard: React.FC<{ project: ProjectType; index: number }> = ({ project, index }) => (
  <div key={index} className="rounded-none p-6 border-2 border-gray-600 bg-gray-900/20 hover:border-gray-500 transition-all duration-200">
    <div className="flex justify-between items-start mb-3">
      <h5 className="text-lg font-semibold text-white">{project.name}</h5>
      {project.duration && (
        <span className="text-gray-400 text-sm bg-gray-800 px-2 py-1 rounded">
          {project.duration}
        </span>
      )}
    </div>
    <p className="text-gray-300 mb-3">{project.description}</p>
  </div>
);

// Achievement item component
const AchievementItem: React.FC<{ achievement: string; index: number }> = ({ achievement, index }) => (
  <div key={index} className="flex items-start">
    <span className="text-green-400 mr-3 mt-1">🏆</span>
    <span className="text-gray-300 leading-relaxed">{achievement}</span>
  </div>
);

// Technology badge component
const TechBadge: React.FC<{ tech: string; index: number }> = ({ tech, index }) => (
  <span 
    key={index}
    className="px-4 py-2 bg-blue-600/30 text-blue-300 rounded-none border border-blue-600/50 hover:bg-blue-500/40 hover:border-blue-400 hover:text-white transition-all duration-200 text-sm font-medium font-mono"
  >
    {tech}
  </span>
);

// Skill item component
const SkillItem: React.FC<{ skill: string; index: number }> = ({ skill, index }) => (
  <div key={index} className="flex items-center">
    <span className="text-green-400 mr-2">🎯</span>
    <span className="text-gray-300">{skill}</span>
  </div>
);

const ExperienceModal: React.FC<ExperienceModalProps> = ({ nodeData }) => {
  const isIndividualExperience = nodeData.id.startsWith('experience_') && 
                                nodeData.positions && 
                                nodeData.positions.length === 1;

  const hasProjects = nodeData.projects && nodeData.projects.length > 0;
  const hasSkillsGained = nodeData.skills_gained && nodeData.skills_gained.length > 0;

  return (
    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
      {/* Extended Description */}
      <div className="mb-8">
        <p className="text-gray-300 text-lg leading-relaxed">{nodeData.extended_desc}</p>
      </div>

      {/* Individual Experience Content */}
      {isIndividualExperience && nodeData.positions && (
        <>
          {/* Notable Projects Section */}
          {hasProjects && (
            <Section title="Notable Projects">
              <div className="grid gap-6 md:grid-cols-1">
                {nodeData.projects!.map((project, index) => (
                  <ProjectCard key={index} project={project} index={index} />
                ))}
              </div>
            </Section>
          )}

          {/* Position Details */}
          {nodeData.positions.map((position, index) => (
            <div key={index} className="mb-8">
              {/* Key Achievements */}
              {position.achievements && position.achievements.length > 0 && (
                <Section title="Key Achievements">
                  <div className="space-y-3">
                    {position.achievements.map((achievement, achIndex) => (
                      <AchievementItem key={achIndex} achievement={achievement} index={achIndex} />
                    ))}
                  </div>
                </Section>
              )}

              {/* Technologies Used */}
              {position.technologies && position.technologies.length > 0 && (
                <Section title="Technologies Used">
                  <div className="flex flex-wrap gap-3">
                    {position.technologies.map((tech: string, techIndex: number) => (
                      <TechBadge key={techIndex} tech={tech} index={techIndex} />
                    ))}
                  </div>
                </Section>
              )}
            </div>
          ))}
        </>
      )}

      {/* Skills Developed Section */}
      {hasSkillsGained && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 font-pixelify">Skills Developed</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {nodeData.skills_gained!.map((skill, index) => (
              <SkillItem key={index} skill={skill} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceModal;
