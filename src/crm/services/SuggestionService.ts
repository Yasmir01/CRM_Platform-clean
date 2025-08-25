// Simple ID generation function
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
import {
  Suggestion,
  SuggestionVote,
  SuggestionCategory,
  SuggestionPriority,
  SuggestionStatus,
  VoteType,
  SuggestionFormData,
  SuggestionFilters,
  SuggestionStats,
  SuggestionNotification
} from '../types/SuggestionTypes';

class SuggestionService {
  private readonly STORAGE_KEY = 'crm_suggestions';
  private readonly VOTES_STORAGE_KEY = 'crm_suggestion_votes';
  private readonly NOTIFICATIONS_STORAGE_KEY = 'crm_suggestion_notifications';

  // Get all suggestions
  getAllSuggestions(): Suggestion[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const suggestions = JSON.parse(stored);
      return suggestions.map((suggestion: any) => ({
        ...suggestion,
        submittedAt: new Date(suggestion.submittedAt),
        lastUpdated: new Date(suggestion.lastUpdated),
        votes: suggestion.votes?.map((vote: any) => ({
          ...vote,
          votedAt: new Date(vote.votedAt)
        })) || []
      }));
    } catch (error) {
      console.error('Error loading suggestions:', error);
      return [];
    }
  }

  // Get suggestion by ID
  getSuggestionById(id: string): Suggestion | null {
    const suggestions = this.getAllSuggestions();
    return suggestions.find(s => s.id === id) || null;
  }

  // Create new suggestion
  createSuggestion(formData: SuggestionFormData, submittedBy: string, submittedByName: string): Suggestion {
    const suggestion: Suggestion = {
      id: uuidv4(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: SuggestionPriority.MEDIUM, // Default priority
      status: SuggestionStatus.NEW,
      submittedBy,
      submittedByName,
      submittedAt: new Date(),
      votes: [],
      voteCount: 0,
      upvotes: 0,
      downvotes: 0,
      tags: formData.tags || [],
      lastUpdated: new Date()
    };

    const suggestions = this.getAllSuggestions();
    suggestions.push(suggestion);
    this.saveSuggestions(suggestions);

    // Create notification for admins
    this.createNotification('new_suggestion', suggestion.id, suggestion.title, 
      `New suggestion "${suggestion.title}" submitted by ${submittedByName}`);

    return suggestion;
  }

  // Update suggestion (admin only)
  updateSuggestion(id: string, updates: Partial<Suggestion>, updatedBy: string): Suggestion | null {
    const suggestions = this.getAllSuggestions();
    const index = suggestions.findIndex(s => s.id === id);
    
    if (index === -1) return null;

    const oldStatus = suggestions[index].status;
    suggestions[index] = {
      ...suggestions[index],
      ...updates,
      lastUpdated: new Date(),
      updatedBy
    };

    this.saveSuggestions(suggestions);

    // Create notification if status changed
    if (updates.status && updates.status !== oldStatus) {
      this.createNotification('status_change', id, suggestions[index].title,
        `Suggestion status changed to: ${updates.status}`);
    }

    return suggestions[index];
  }

  // Delete suggestion (admin only)
  deleteSuggestion(id: string): boolean {
    const suggestions = this.getAllSuggestions();
    const index = suggestions.findIndex(s => s.id === id);
    
    if (index === -1) return false;

    suggestions.splice(index, 1);
    this.saveSuggestions(suggestions);

    // Remove associated votes
    this.removeVotesForSuggestion(id);

    return true;
  }

  // Vote on suggestion
  voteOnSuggestion(suggestionId: string, userId: string, userDisplayName: string, voteType: VoteType, comment?: string): boolean {
    try {
      // Remove existing vote by this user if any
      this.removeUserVote(suggestionId, userId);

      // Add new vote
      const vote: SuggestionVote = {
        id: uuidv4(),
        suggestionId,
        userId,
        userDisplayName,
        voteType,
        votedAt: new Date(),
        comment
      };

      // Update suggestion with new vote
      const suggestions = this.getAllSuggestions();
      const suggestionIndex = suggestions.findIndex(s => s.id === suggestionId);
      
      if (suggestionIndex === -1) return false;

      suggestions[suggestionIndex].votes.push(vote);
      this.updateVoteCounts(suggestions[suggestionIndex]);
      suggestions[suggestionIndex].lastUpdated = new Date();
      
      this.saveSuggestions(suggestions);

      // Create notification
      this.createNotification('new_vote', suggestionId, suggestions[suggestionIndex].title,
        `${userDisplayName} ${voteType === VoteType.UPVOTE ? 'upvoted' : 'downvoted'} your suggestion`);

      return true;
    } catch (error) {
      console.error('Error voting on suggestion:', error);
      return false;
    }
  }

  // Remove user's vote
  removeUserVote(suggestionId: string, userId: string): boolean {
    const suggestions = this.getAllSuggestions();
    const suggestionIndex = suggestions.findIndex(s => s.id === suggestionId);
    
    if (suggestionIndex === -1) return false;

    const suggestion = suggestions[suggestionIndex];
    const voteIndex = suggestion.votes.findIndex(v => v.userId === userId);
    
    if (voteIndex === -1) return false;

    suggestion.votes.splice(voteIndex, 1);
    this.updateVoteCounts(suggestion);
    suggestion.lastUpdated = new Date();
    
    this.saveSuggestions(suggestions);
    return true;
  }

  // Get user's vote for a suggestion
  getUserVote(suggestionId: string, userId: string): SuggestionVote | null {
    const suggestion = this.getSuggestionById(suggestionId);
    if (!suggestion) return null;

    return suggestion.votes.find(v => v.userId === userId) || null;
  }

  // Filter suggestions
  filterSuggestions(filters: SuggestionFilters): Suggestion[] {
    let suggestions = this.getAllSuggestions();

    if (filters.category?.length) {
      suggestions = suggestions.filter(s => filters.category!.includes(s.category));
    }

    if (filters.priority?.length) {
      suggestions = suggestions.filter(s => filters.priority!.includes(s.priority));
    }

    if (filters.status?.length) {
      suggestions = suggestions.filter(s => filters.status!.includes(s.status));
    }

    if (filters.submittedBy) {
      suggestions = suggestions.filter(s => s.submittedBy === filters.submittedBy);
    }

    if (filters.dateRange) {
      suggestions = suggestions.filter(s => 
        s.submittedAt >= filters.dateRange!.start && 
        s.submittedAt <= filters.dateRange!.end
      );
    }

    if (filters.tags?.length) {
      suggestions = suggestions.filter(s => 
        filters.tags!.some(tag => s.tags.includes(tag))
      );
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      suggestions = suggestions.filter(s => 
        s.title.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower) ||
        s.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return suggestions;
  }

  // Get suggestions sorted by various criteria
  getSuggestionsSorted(sortBy: 'votes' | 'date' | 'priority' | 'status' = 'votes', ascending = false): Suggestion[] {
    const suggestions = this.getAllSuggestions();

    return suggestions.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'votes':
          comparison = a.voteCount - b.voteCount;
          break;
        case 'date':
          comparison = a.submittedAt.getTime() - b.submittedAt.getTime();
          break;
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
                      (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return ascending ? comparison : -comparison;
    });
  }

  // Get suggestion statistics
  getSuggestionStats(): SuggestionStats {
    const suggestions = this.getAllSuggestions();
    
    const stats: SuggestionStats = {
      total: suggestions.length,
      byStatus: {} as Record<SuggestionStatus, number>,
      byCategory: {} as Record<SuggestionCategory, number>,
      byPriority: {} as Record<SuggestionPriority, number>,
      topVoted: [],
      recentSubmissions: [],
      averageVotes: 0,
      activeSubmitters: 0
    };

    // Initialize counters
    Object.values(SuggestionStatus).forEach(status => {
      stats.byStatus[status] = 0;
    });
    Object.values(SuggestionCategory).forEach(category => {
      stats.byCategory[category] = 0;
    });
    Object.values(SuggestionPriority).forEach(priority => {
      stats.byPriority[priority] = 0;
    });

    // Calculate stats
    const submitters = new Set<string>();
    let totalVotes = 0;

    suggestions.forEach(suggestion => {
      stats.byStatus[suggestion.status]++;
      stats.byCategory[suggestion.category]++;
      stats.byPriority[suggestion.priority]++;
      submitters.add(suggestion.submittedBy);
      totalVotes += suggestion.voteCount;
    });

    stats.averageVotes = suggestions.length > 0 ? totalVotes / suggestions.length : 0;
    stats.activeSubmitters = submitters.size;

    // Top voted (last 10)
    stats.topVoted = suggestions
      .sort((a, b) => b.voteCount - a.voteCount)
      .slice(0, 10);

    // Recent submissions (last 10)
    stats.recentSubmissions = suggestions
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
      .slice(0, 10);

    return stats;
  }

  // Notification methods
  createNotification(type: SuggestionNotification['type'], suggestionId: string, suggestionTitle: string, message: string, targetUserId?: string): void {
    const notifications = this.getNotifications();
    const notification: SuggestionNotification = {
      id: uuidv4(),
      type,
      suggestionId,
      suggestionTitle,
      message,
      createdAt: new Date(),
      read: false,
      targetUserId
    };

    notifications.push(notification);
    localStorage.setItem(this.NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  }

  getNotifications(userId?: string): SuggestionNotification[] {
    try {
      const stored = localStorage.getItem(this.NOTIFICATIONS_STORAGE_KEY);
      if (!stored) return [];
      
      let notifications = JSON.parse(stored).map((notification: any) => ({
        ...notification,
        createdAt: new Date(notification.createdAt)
      }));

      if (userId) {
        notifications = notifications.filter((n: SuggestionNotification) => 
          !n.targetUserId || n.targetUserId === userId
        );
      }

      return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  markNotificationAsRead(notificationId: string): boolean {
    try {
      const notifications = this.getNotifications();
      const notification = notifications.find(n => n.id === notificationId);
      
      if (!notification) return false;

      notification.read = true;
      localStorage.setItem(this.NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Private helper methods
  private saveSuggestions(suggestions: Suggestion[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(suggestions));
  }

  private updateVoteCounts(suggestion: Suggestion): void {
    suggestion.upvotes = suggestion.votes.filter(v => v.voteType === VoteType.UPVOTE).length;
    suggestion.downvotes = suggestion.votes.filter(v => v.voteType === VoteType.DOWNVOTE).length;
    suggestion.voteCount = suggestion.upvotes - suggestion.downvotes;
  }

  private removeVotesForSuggestion(suggestionId: string): void {
    // This would be more complex in a real database, but for localStorage it's handled by suggestion deletion
  }

  // Bulk operations
  bulkUpdateStatus(suggestionIds: string[], status: SuggestionStatus, updatedBy: string): boolean {
    try {
      const suggestions = this.getAllSuggestions();
      let updated = false;

      suggestions.forEach(suggestion => {
        if (suggestionIds.includes(suggestion.id)) {
          suggestion.status = status;
          suggestion.lastUpdated = new Date();
          suggestion.updatedBy = updatedBy;
          updated = true;
        }
      });

      if (updated) {
        this.saveSuggestions(suggestions);
      }

      return updated;
    } catch (error) {
      console.error('Error bulk updating suggestions:', error);
      return false;
    }
  }

  // Export suggestions (for reporting)
  exportSuggestions(filters?: SuggestionFilters): string {
    const suggestions = filters ? this.filterSuggestions(filters) : this.getAllSuggestions();
    
    const csvHeader = 'ID,Title,Description,Category,Priority,Status,Submitted By,Submitted At,Votes,Upvotes,Downvotes,Tags\n';
    const csvRows = suggestions.map(s => [
      s.id,
      `"${s.title.replace(/"/g, '""')}"`,
      `"${s.description.replace(/"/g, '""')}"`,
      s.category,
      s.priority,
      s.status,
      s.submittedByName,
      s.submittedAt.toISOString(),
      s.voteCount,
      s.upvotes,
      s.downvotes,
      `"${s.tags.join(', ')}"`
    ].join(','));

    return csvHeader + csvRows.join('\n');
  }
}

export const suggestionService = new SuggestionService();
export default SuggestionService;
