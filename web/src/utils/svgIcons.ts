// SVG icon paths for different node types
export const SVG_ICONS = {
  // Simple gear/settings icon
  gear: "M12 8.666c-1.838 0-3.333 1.496-3.333 3.334s1.495 3.333 3.333 3.333 3.333-1.495 3.333-3.333S13.838 8.666 12 8.666zM12 13.25c-.644 0-1.167-.523-1.167-1.167S11.356 10.917 12 10.917s1.167.522 1.167 1.166S12.644 13.25 12 13.25z M19.14 12.94c.04-.32.04-.64 0-.96l2.07-1.63c.18-.14.23-.41.12-.61l-1.95-3.37c-.12-.22-.39-.3-.61-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.49 0-.61.22L2.74 8.87c-.12.21-.07.47.12.61L4.93 11.1c-.04.32-.04.65 0 .96l-2.07 1.63c-.18.14-.23.41-.12.61l1.95 3.37c.12.22.39.3.61.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.04.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.49 0 .61-.22l1.95-3.37c.12-.21.07-.47-.12-.61L19.14 12.94z",

  // Project/folder icon
  project:
    "M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z",

  // Skills/tools icon
  tools:
    "M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z",

  // Experience/briefcase icon
  briefcase:
    "M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm6 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z",

  // Contact/phone icon
  contact:
    "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",

  // Default/generic icon
  default:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
};

// Convert SVG path to scaled path for Konva
export const scaleSVGPath = (
  path: string,
  scale: number,
  offsetX = 0,
  offsetY = 0
): string => {
  // This is a simple scaling - for more complex SVGs you might need a proper SVG parser
  return path.replace(/(\d+(?:\.\d+)?)/g, (match) => {
    const num = parseFloat(match);
    return (
      num * scale +
      (num === 12 ? offsetX : num === 12 ? offsetY : 0)
    ).toString();
  });
};

// Get icon path for a specific node type
export const getNodeIcon = (nodeId: string, level: number): string => {
  if (level === 0) return SVG_ICONS.default; // Center node

  // Map specific node IDs to icons
  const iconMap: Record<string, string> = {
    projects: SVG_ICONS.project,
    experience: SVG_ICONS.briefcase,
    skills: SVG_ICONS.tools,
    contact: SVG_ICONS.contact,
    "web-projects": SVG_ICONS.project,
    "mobile-projects": SVG_ICONS.project,
    frontend: SVG_ICONS.tools,
    backend: SVG_ICONS.tools,
    education: SVG_ICONS.briefcase,
  };

  return iconMap[nodeId] || SVG_ICONS.default;
};
