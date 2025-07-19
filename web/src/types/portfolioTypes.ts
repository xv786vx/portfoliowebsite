export interface Link {
  label: string;
  url: string;
  icon?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  images?: string[];
  github?: string;
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
  achievements: string[];
  technologies: string[];
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
  institution: string;
  duration: string;
  gpa?: string;
  relevant_courses?: string[];
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
  };
  positions?: Position[];
  skills_gained?: string[];
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
}

export interface PortfolioData {
  [key: string]: PortfolioNodeData;
}
