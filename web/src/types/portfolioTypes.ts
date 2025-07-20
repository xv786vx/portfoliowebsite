export interface Link {
  label: string;
  url: string;
  icon?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies?: string[]; // Made optional for simplified projects view
  images?: string[];
  link?: string;
  live_demo?: string;
  highlights?: string[];
  duration?: string;
  role?: string;
  features?: string[];
}

export interface Position {
  title: string;
  company: string;
  duration: string;
  location: string;
  description: string;
  achievements?: string[]; // Made optional for simplified experience view
  technologies?: string[]; // Made optional for simplified experience view
}

export interface Technology {
  name: string;
  level: string;
  years: number;
}

export interface SkillCategory {
  name: string;
  technologies: Technology[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
}

export interface Education {
  degree: string;
  specialization?: string;
  institution: string;
  duration: string;
  location?: string;
  status?: string;
  gpa?: string;
  relevant_courses?: string[];
  organizations?: string[];
}

export interface ContactMethod {
  type: string;
  value: string;
  label: string;
  preferred?: boolean;
}

export interface Availability {
  status: string;
  types: string[];
  timezone: string;
  response_time: string;
}

export interface PortfolioNodeData {
  id: string;
  label: string;
  description: string;
  extended_desc: string;
  images?: string[];
  links?: Link[];
  link?: string; // For individual project/experience nodes
  details?: {
    location?: string;
    email?: string;
    availability?: string;
    yearsExperience?: string;
    specialties?: string[];
  };
  featured_projects?: Project[];
  stats?: {
    totalProjects?: number;
    liveProjects?: number;
    githubStars?: number;
    contributions?: number;
    githubRepos?: number; // Added for new simplified projects structure
    hackathonWins?: number; // Added for new simplified projects structure
  };
  positions?: Position[];
  skills_gained?: string[];
  summary?: {
    // Added for new simplified experience structure
    totalInternships?: number;
    technologiesLearned?: number;
    projectsCompleted?: number;
    skillsGained?: number;
  };
  categories?: SkillCategory[];
  certifications?: Certification[] | string[];
  contact_methods?: ContactMethod[];
  availability?: Availability;
  services?: string[];
  projects?: Project[];
  expertise?: string[];
  recent_work?: string[];
  technologies_deep_dive?: Record<string, string>;
  formal_education?: Education[];
  continuous_learning?: string[];
  // Individual project/experience node fields
  technologies?: string[];
  features?: string[];
  highlights?: string[];
  duration?: string;
  role?: string;
  live_demo?: string;
}

export interface PortfolioData {
  [key: string]: PortfolioNodeData;
}
