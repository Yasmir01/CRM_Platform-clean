export interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: SuggestionCategory;
  priority: SuggestionPriority;
  status: SuggestionStatus;
  submittedBy: string;
  submittedByName: string;
  submittedAt: Date;
  votes: SuggestionVote[];
  voteCount: number;
  upvotes: number;
  downvotes: number;
  tags: string[];
  attachments?: SuggestionAttachment[];
  adminNotes?: string;
  implementationNotes?: string;
  estimatedEffort?: string;
  targetVersion?: string;
  lastUpdated: Date;
  updatedBy?: string;
}

export interface SuggestionVote {
  id: string;
  suggestionId: string;
  userId: string;
  userDisplayName: string;
  voteType: VoteType;
  votedAt: Date;
  comment?: string;
}

export interface SuggestionAttachment {
  id: string;
  filename: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedBy: string;
  description?: string;
}

export enum SuggestionCategory {
  FEATURE_REQUEST = 'feature_request',
  BUG_FIX = 'bug_fix',
  IMPROVEMENT = 'improvement',
  INTEGRATION = 'integration',
  PERFORMANCE = 'performance',
  UI_UX = 'ui_ux',
  AUTOMATION = 'automation',
  REPORTING = 'reporting',
  MOBILE = 'mobile',
  OTHER = 'other'
}

export enum SuggestionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum SuggestionStatus {
  NEW = 'new',
  UNDER_REVIEW = 'under_review',
  PLANNED = 'planned',
  IN_DEVELOPMENT = 'in_development',
  TESTING = 'testing',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  DUPLICATE = 'duplicate',
  ON_HOLD = 'on_hold'
}

export enum VoteType {
  UPVOTE = 'upvote',
  DOWNVOTE = 'downvote'
}

export interface SuggestionFilters {
  category?: SuggestionCategory[];
  priority?: SuggestionPriority[];
  status?: SuggestionStatus[];
  submittedBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  searchText?: string;
}

export interface SuggestionFormData {
  title: string;
  description: string;
  category: SuggestionCategory;
  tags: string[];
  attachments?: File[];
}

export interface SuggestionStats {
  total: number;
  byStatus: Record<SuggestionStatus, number>;
  byCategory: Record<SuggestionCategory, number>;
  byPriority: Record<SuggestionPriority, number>;
  topVoted: Suggestion[];
  recentSubmissions: Suggestion[];
  averageVotes: number;
  activeSubmitters: number;
}

export interface SuggestionNotification {
  id: string;
  type: 'new_suggestion' | 'status_change' | 'new_vote' | 'admin_response';
  suggestionId: string;
  suggestionTitle: string;
  message: string;
  createdAt: Date;
  read: boolean;
  targetUserId?: string;
}

export const CategoryLabels: Record<SuggestionCategory, string> = {
  [SuggestionCategory.FEATURE_REQUEST]: 'Feature Request',
  [SuggestionCategory.BUG_FIX]: 'Bug Fix',
  [SuggestionCategory.IMPROVEMENT]: 'Improvement',
  [SuggestionCategory.INTEGRATION]: 'Integration',
  [SuggestionCategory.PERFORMANCE]: 'Performance',
  [SuggestionCategory.UI_UX]: 'UI/UX',
  [SuggestionCategory.AUTOMATION]: 'Automation',
  [SuggestionCategory.REPORTING]: 'Reporting',
  [SuggestionCategory.MOBILE]: 'Mobile',
  [SuggestionCategory.OTHER]: 'Other'
};

export const PriorityLabels: Record<SuggestionPriority, string> = {
  [SuggestionPriority.LOW]: 'Low',
  [SuggestionPriority.MEDIUM]: 'Medium',
  [SuggestionPriority.HIGH]: 'High',
  [SuggestionPriority.CRITICAL]: 'Critical'
};

export const StatusLabels: Record<SuggestionStatus, string> = {
  [SuggestionStatus.NEW]: 'New',
  [SuggestionStatus.UNDER_REVIEW]: 'Under Review',
  [SuggestionStatus.PLANNED]: 'Planned',
  [SuggestionStatus.IN_DEVELOPMENT]: 'In Development',
  [SuggestionStatus.TESTING]: 'Testing',
  [SuggestionStatus.COMPLETED]: 'Completed',
  [SuggestionStatus.REJECTED]: 'Rejected',
  [SuggestionStatus.DUPLICATE]: 'Duplicate',
  [SuggestionStatus.ON_HOLD]: 'On Hold'
};
