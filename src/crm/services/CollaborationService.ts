import { LocalStorageService } from './LocalStorageService';
import activityTracker from './ActivityTrackingService';

interface CollaborationSession {
  id: string;
  documentId: string;
  entityId: string;
  entityType: string;
  title: string;
  participants: Participant[];
  activeUsers: ActiveUser[];
  comments: Comment[];
  annotations: Annotation[];
  sharedCursor: CursorPosition[];
  createdAt: string;
  lastActivity: string;
  status: 'active' | 'paused' | 'ended';
  permissions: {
    canEdit: string[];
    canComment: string[];
    canView: string[];
  };
}

interface Participant {
  userId: string;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  role: 'owner' | 'editor' | 'commenter' | 'viewer';
  joinedAt: string;
  lastSeen: string;
  isOnline: boolean;
}

interface ActiveUser {
  userId: string;
  userName: string;
  userColor: string;
  cursor: CursorPosition;
  selection?: TextSelection;
  lastActivity: string;
}

interface CursorPosition {
  x: number;
  y: number;
  elementId?: string;
  timestamp: string;
}

interface TextSelection {
  start: number;
  end: number;
  text: string;
  elementId: string;
}

interface Comment {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  position: {
    x: number;
    y: number;
    elementId?: string;
    page?: number;
  };
  thread: CommentReply[];
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
  mentions: string[];
  reactions: CommentReaction[];
  tags: string[];
}

interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  mentions: string[];
  reactions: CommentReaction[];
}

interface CommentReaction {
  userId: string;
  userName: string;
  type: 'like' | 'love' | 'laugh' | 'angry' | 'sad' | 'wow';
  timestamp: string;
}

interface Annotation {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  type: 'highlight' | 'strikethrough' | 'underline' | 'circle' | 'arrow' | 'rectangle' | 'freehand';
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    points?: Array<{ x: number; y: number }>;
    elementId?: string;
    page?: number;
  };
  style: {
    color: string;
    strokeWidth: number;
    opacity: number;
    dashArray?: number[];
  };
  content?: string;
  createdAt: string;
  updatedAt: string;
}

interface CollaborationNotification {
  id: string;
  sessionId: string;
  type: 'user_joined' | 'user_left' | 'comment_added' | 'comment_resolved' | 'annotation_added' | 'mention' | 'document_updated';
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  read: boolean;
  metadata?: Record<string, any>;
}

interface PresenceUpdate {
  sessionId: string;
  userId: string;
  userName: string;
  userColor: string;
  cursor?: CursorPosition;
  selection?: TextSelection;
  activity: 'viewing' | 'editing' | 'commenting' | 'annotating' | 'idle';
  timestamp: string;
}

export class CollaborationService {
  private sessions: Map<string, CollaborationSession> = new Map();
  private notifications: Map<string, CollaborationNotification[]> = new Map();
  private websocket: WebSocket | null = null;
  private currentUser: Participant | null = null;
  private activeSessionId: string | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  // Event listeners
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.loadSessions();
    this.loadNotifications();
    this.initializeWebSocket();
    this.startHeartbeat();
  }

  /**
   * Start a collaboration session for a document
   */
  startSession(
    documentId: string,
    entityId: string,
    entityType: string,
    title: string,
    user: { userId: string; userEmail: string; userName: string; userAvatar?: string }
  ): CollaborationSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const owner: Participant = {
      ...user,
      role: 'owner',
      joinedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      isOnline: true
    };

    const session: CollaborationSession = {
      id: sessionId,
      documentId,
      entityId,
      entityType,
      title,
      participants: [owner],
      activeUsers: [],
      comments: [],
      annotations: [],
      sharedCursor: [],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      status: 'active',
      permissions: {
        canEdit: [user.userId],
        canComment: [user.userId],
        canView: [user.userId]
      }
    };

    this.sessions.set(sessionId, session);
    this.activeSessionId = sessionId;
    this.currentUser = owner;
    
    this.saveSessions();
    this.broadcastSessionUpdate(sessionId, 'session_started');
    
    // Track activity
    activityTracker.trackActivity({
      userId: user.userId,
      activityType: 'collaboration_started',
      entityType: 'collaboration_session',
      entityId: sessionId,
      metadata: { documentId, title }
    });

    return session;
  }

  /**
   * Join an existing collaboration session
   */
  joinSession(
    sessionId: string,
    user: { userId: string; userEmail: string; userName: string; userAvatar?: string },
    role: 'editor' | 'commenter' | 'viewer' = 'viewer'
  ): CollaborationSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Check if user is already a participant
    const existingParticipant = session.participants.find(p => p.userId === user.userId);
    
    if (existingParticipant) {
      existingParticipant.isOnline = true;
      existingParticipant.lastSeen = new Date().toISOString();
      this.currentUser = existingParticipant;
    } else {
      const participant: Participant = {
        ...user,
        role,
        joinedAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        isOnline: true
      };
      
      session.participants.push(participant);
      this.currentUser = participant;

      // Add to permissions
      if (role === 'editor') {
        session.permissions.canEdit.push(user.userId);
        session.permissions.canComment.push(user.userId);
      } else if (role === 'commenter') {
        session.permissions.canComment.push(user.userId);
      }
      session.permissions.canView.push(user.userId);
    }

    session.lastActivity = new Date().toISOString();
    this.activeSessionId = sessionId;
    
    this.saveSessions();
    this.broadcastSessionUpdate(sessionId, 'user_joined');
    
    // Send notification to other participants
    this.addNotification(sessionId, {
      type: 'user_joined',
      userId: user.userId,
      userName: user.userName,
      message: `${user.userName} joined the collaboration`,
      metadata: { role }
    });

    return session;
  }

  /**
   * Leave a collaboration session
   */
  leaveSession(sessionId: string, userId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Update participant status
    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.isOnline = false;
      participant.lastSeen = new Date().toISOString();
    }

    // Remove from active users
    session.activeUsers = session.activeUsers.filter(u => u.userId !== userId);
    
    session.lastActivity = new Date().toISOString();
    
    this.saveSessions();
    this.broadcastSessionUpdate(sessionId, 'user_left');
    
    // Send notification
    if (participant) {
      this.addNotification(sessionId, {
        type: 'user_left',
        userId,
        userName: participant.userName,
        message: `${participant.userName} left the collaboration`
      });
    }

    if (this.activeSessionId === sessionId && this.currentUser?.userId === userId) {
      this.activeSessionId = null;
      this.currentUser = null;
    }
  }

  /**
   * Add a comment to the session
   */
  addComment(
    sessionId: string,
    content: string,
    position: Comment['position'],
    mentions: string[] = [],
    tags: string[] = []
  ): Comment {
    const session = this.sessions.get(sessionId);
    if (!session || !this.currentUser) {
      throw new Error('Invalid session or user');
    }

    if (!session.permissions.canComment.includes(this.currentUser.userId)) {
      throw new Error('No permission to comment');
    }

    const comment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      userId: this.currentUser.userId,
      userName: this.currentUser.userName,
      userAvatar: this.currentUser.userAvatar,
      content,
      position,
      thread: [],
      resolved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mentions,
      reactions: [],
      tags
    };

    session.comments.push(comment);
    session.lastActivity = new Date().toISOString();
    
    this.saveSessions();
    this.broadcastSessionUpdate(sessionId, 'comment_added', { comment });
    
    // Send notifications to mentioned users
    mentions.forEach(mentionedUserId => {
      this.addNotification(sessionId, {
        type: 'mention',
        userId: this.currentUser!.userId,
        userName: this.currentUser!.userName,
        message: `${this.currentUser!.userName} mentioned you in a comment`,
        metadata: { commentId: comment.id, content: content.substring(0, 100) }
      });
    });

    // General comment notification
    this.addNotification(sessionId, {
      type: 'comment_added',
      userId: this.currentUser.userId,
      userName: this.currentUser.userName,
      message: `${this.currentUser.userName} added a comment`,
      metadata: { commentId: comment.id }
    });

    return comment;
  }

  /**
   * Reply to a comment
   */
  replyToComment(sessionId: string, commentId: string, content: string, mentions: string[] = []): CommentReply {
    const session = this.sessions.get(sessionId);
    if (!session || !this.currentUser) {
      throw new Error('Invalid session or user');
    }

    const comment = session.comments.find(c => c.id === commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    const reply: CommentReply = {
      id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.currentUser.userId,
      userName: this.currentUser.userName,
      userAvatar: this.currentUser.userAvatar,
      content,
      createdAt: new Date().toISOString(),
      mentions,
      reactions: []
    };

    comment.thread.push(reply);
    comment.updatedAt = new Date().toISOString();
    session.lastActivity = new Date().toISOString();
    
    this.saveSessions();
    this.broadcastSessionUpdate(sessionId, 'comment_replied', { commentId, reply });

    return reply;
  }

  /**
   * Add an annotation to the document
   */
  addAnnotation(
    sessionId: string,
    type: Annotation['type'],
    position: Annotation['position'],
    style: Annotation['style'],
    content?: string
  ): Annotation {
    const session = this.sessions.get(sessionId);
    if (!session || !this.currentUser) {
      throw new Error('Invalid session or user');
    }

    if (!session.permissions.canEdit.includes(this.currentUser.userId)) {
      throw new Error('No permission to annotate');
    }

    const annotation: Annotation = {
      id: `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      userId: this.currentUser.userId,
      userName: this.currentUser.userName,
      type,
      position,
      style,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    session.annotations.push(annotation);
    session.lastActivity = new Date().toISOString();
    
    this.saveSessions();
    this.broadcastSessionUpdate(sessionId, 'annotation_added', { annotation });
    
    this.addNotification(sessionId, {
      type: 'annotation_added',
      userId: this.currentUser.userId,
      userName: this.currentUser.userName,
      message: `${this.currentUser.userName} added an annotation`
    });

    return annotation;
  }

  /**
   * Update user presence (cursor position, selection, etc.)
   */
  updatePresence(presenceUpdate: Omit<PresenceUpdate, 'timestamp'>): void {
    const session = this.sessions.get(presenceUpdate.sessionId);
    if (!session || !this.currentUser) return;

    const update: PresenceUpdate = {
      ...presenceUpdate,
      timestamp: new Date().toISOString()
    };

    // Update active users list
    const existingUserIndex = session.activeUsers.findIndex(u => u.userId === presenceUpdate.userId);
    
    if (existingUserIndex >= 0) {
      session.activeUsers[existingUserIndex] = {
        ...session.activeUsers[existingUserIndex],
        cursor: update.cursor || session.activeUsers[existingUserIndex].cursor,
        selection: update.selection,
        lastActivity: update.timestamp
      };
    } else {
      session.activeUsers.push({
        userId: update.userId,
        userName: update.userName,
        userColor: update.userColor,
        cursor: update.cursor || { x: 0, y: 0, timestamp: update.timestamp },
        selection: update.selection,
        lastActivity: update.timestamp
      });
    }

    // Clean up inactive users (last activity > 5 minutes ago)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    session.activeUsers = session.activeUsers.filter(u => 
      new Date(u.lastActivity).getTime() > fiveMinutesAgo
    );

    this.broadcastPresenceUpdate(update);
  }

  /**
   * Resolve a comment
   */
  resolveComment(sessionId: string, commentId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || !this.currentUser) {
      throw new Error('Invalid session or user');
    }

    const comment = session.comments.find(c => c.id === commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    comment.resolved = true;
    comment.updatedAt = new Date().toISOString();
    session.lastActivity = new Date().toISOString();
    
    this.saveSessions();
    this.broadcastSessionUpdate(sessionId, 'comment_resolved', { commentId });
    
    this.addNotification(sessionId, {
      type: 'comment_resolved',
      userId: this.currentUser.userId,
      userName: this.currentUser.userName,
      message: `${this.currentUser.userName} resolved a comment`
    });
  }

  /**
   * Add reaction to comment
   */
  addCommentReaction(sessionId: string, commentId: string, replyId: string | null, reactionType: CommentReaction['type']): void {
    const session = this.sessions.get(sessionId);
    if (!session || !this.currentUser) return;

    const comment = session.comments.find(c => c.id === commentId);
    if (!comment) return;

    const target = replyId 
      ? comment.thread.find(r => r.id === replyId)
      : comment;
    
    if (!target) return;

    // Remove existing reaction from this user
    target.reactions = target.reactions.filter(r => r.userId !== this.currentUser!.userId);
    
    // Add new reaction
    target.reactions.push({
      userId: this.currentUser.userId,
      userName: this.currentUser.userName,
      type: reactionType,
      timestamp: new Date().toISOString()
    });

    this.saveSessions();
    this.broadcastSessionUpdate(sessionId, 'reaction_added', { commentId, replyId, reaction: target.reactions[target.reactions.length - 1] });
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): CollaborationSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all sessions for a user
   */
  getUserSessions(userId: string): CollaborationSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.participants.some(p => p.userId === userId))
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  }

  /**
   * Get notifications for a user
   */
  getUserNotifications(userId: string, sessionId?: string): CollaborationNotification[] {
    const userNotifications = this.notifications.get(userId) || [];
    
    if (sessionId) {
      return userNotifications.filter(n => n.sessionId === sessionId);
    }
    
    return userNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Mark notifications as read
   */
  markNotificationsAsRead(userId: string, notificationIds: string[]): void {
    const userNotifications = this.notifications.get(userId) || [];
    
    userNotifications.forEach(notification => {
      if (notificationIds.includes(notification.id)) {
        notification.read = true;
      }
    });
    
    this.saveNotifications();
    this.emit('notifications_updated', { userId, notifications: userNotifications });
  }

  /**
   * Event listener management
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  private broadcastSessionUpdate(sessionId: string, type: string, data?: any): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'session_update',
        sessionId,
        updateType: type,
        data,
        timestamp: new Date().toISOString()
      }));
    }
    
    // Emit local event
    this.emit('session_updated', { sessionId, type, data });
  }

  private broadcastPresenceUpdate(update: PresenceUpdate): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'presence_update',
        data: update
      }));
    }
    
    // Emit local event
    this.emit('presence_updated', update);
  }

  private addNotification(sessionId: string, notification: Omit<CollaborationNotification, 'id' | 'sessionId' | 'timestamp' | 'read'>): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const fullNotification: CollaborationNotification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    // Add notification to all participants except the sender
    session.participants.forEach(participant => {
      if (participant.userId !== notification.userId) {
        if (!this.notifications.has(participant.userId)) {
          this.notifications.set(participant.userId, []);
        }
        
        const userNotifications = this.notifications.get(participant.userId)!;
        userNotifications.unshift(fullNotification);
        
        // Keep only last 100 notifications per user
        if (userNotifications.length > 100) {
          userNotifications.splice(100);
        }
      }
    });

    this.saveNotifications();
    this.emit('notification_added', fullNotification);
  }

  private initializeWebSocket(): void {
    // In a real implementation, this would connect to a WebSocket server
    // For now, we'll simulate WebSocket behavior with localStorage events
    
    window.addEventListener('storage', (event) => {
      if (event.key === 'collaboration_updates') {
        try {
          const update = JSON.parse(event.newValue || '{}');
          this.handleWebSocketMessage(update);
        } catch (error) {
          console.error('Error parsing collaboration update:', error);
        }
      }
    });
  }

  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'session_update':
        this.emit('session_updated', message);
        break;
      case 'presence_update':
        this.emit('presence_updated', message.data);
        break;
      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.activeSessionId && this.currentUser) {
        this.updatePresence({
          sessionId: this.activeSessionId,
          userId: this.currentUser.userId,
          userName: this.currentUser.userName,
          userColor: this.getUserColor(this.currentUser.userId),
          activity: 'viewing'
        });
      }
    }, 30000); // Every 30 seconds
  }

  private getUserColor(userId: string): string {
    // Generate consistent color for user
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }

  private loadSessions(): void {
    try {
      const saved = LocalStorageService.getItem('collaboration_sessions');
      if (saved && Array.isArray(saved)) {
        this.sessions = new Map(saved.map((session: CollaborationSession) => [session.id, session]));
      }
    } catch (error) {
      console.error('Error loading collaboration sessions:', error);
    }
  }

  private saveSessions(): void {
    try {
      const sessionsArray = Array.from(this.sessions.values());
      LocalStorageService.setItem('collaboration_sessions', sessionsArray);
    } catch (error) {
      console.error('Error saving collaboration sessions:', error);
    }
  }

  private loadNotifications(): void {
    try {
      const saved = LocalStorageService.getItem('collaboration_notifications');
      if (saved) {
        this.notifications = new Map(Object.entries(saved));
      }
    } catch (error) {
      console.error('Error loading collaboration notifications:', error);
    }
  }

  private saveNotifications(): void {
    try {
      const notificationsObj = Object.fromEntries(this.notifications);
      LocalStorageService.setItem('collaboration_notifications', notificationsObj);
    } catch (error) {
      console.error('Error saving collaboration notifications:', error);
    }
  }

  /**
   * Clean up when service is destroyed
   */
  destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.websocket) {
      this.websocket.close();
    }
    
    if (this.activeSessionId && this.currentUser) {
      this.leaveSession(this.activeSessionId, this.currentUser.userId);
    }
  }
}

export const collaborationService = new CollaborationService();
