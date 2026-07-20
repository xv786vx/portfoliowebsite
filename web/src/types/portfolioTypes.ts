export interface Link {
  label: string;
  url: string;
  icon?: string;
}

export interface ContactMethod {
  type: string;
  value: string;
  label: string;
}

export interface PortfolioNodeData {
  id: string;
  label: string;
  description: string;
  extended_desc: string | string[]; // Array form is joined with spaces; split across lines only for editability.
  // Link rows — the profile node uses `links`, the contact node `contact_methods`,
  // and individual project/experience nodes use `link` / `live_demo`.
  links?: Link[];
  contact_methods?: ContactMethod[];
  link?: string;
  live_demo?: string;
  // Shown on the card body: a tech-tag row.
  technologies?: string[];
}
