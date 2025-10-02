/**
 * Help System Types
 * Shared types for the help and support system
 */

export interface HelpCategory {
  id: string;
  title: string;
  description: string;
  iconName: string; // Store icon name as string, map to component in React
  color: string;
  articleCount: number;
  popularTags: string[];
  featured?: boolean;
}

export interface HelpArticle {
  id: string;
  title: string;
  summary: string;
  content: string[];
  category: string;
  tags: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  readTime: string;
  helpful: number;
  lastUpdated: string;
  planRequired?: "Basic" | "Professional" | "Enterprise" | "Custom";
  superAdminOnly?: boolean;
}
