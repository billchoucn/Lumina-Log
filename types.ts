
export interface WorkLog {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
  tasks: TaskItem[];
  tags: string[];
  category: string;
  createdAt: number;
  updatedAt: number;
}

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface SummaryTemplate {
  id: string;
  name: string;
  description: string;
  structure: string; 
  isDefault?: boolean;
}

export interface AISummary {
  id: string;
  rangeType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  startDate: string;
  endDate: string;
  coreContent: string;
  outcomes: string[];
  pendingItems: string[];
  blockers: string;
  solutions: string;
  keywords: string[];
  rawMarkdown: string;
  templateId?: string;
  createdAt: number;
}

export interface UserSettings {
  siteTitle: string;
  siteLogo: string;
  userName: string;
  userAvatar: string;
}

export type ViewType = 'dashboard' | 'logs' | 'summaries' | 'settings' | 'editor' | 'summary-generator';
