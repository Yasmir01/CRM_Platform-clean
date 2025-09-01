import { LocalStorageService } from './LocalStorageService';
import activityTracker from './ActivityTrackingService';

interface LeadScoringCriteria {
  id: string;
  name: string;
  category: 'demographic' | 'behavioral' | 'firmographic' | 'engagement' | 'financial' | 'custom';
  weight: number;
  scoringFunction: (value: any, context?: any) => number;
  description: string;
  isActive: boolean;
}

interface LeadScore {
  prospectId: string;
  totalScore: number;
  categoryScores: Record<string, number>;
  criteriaBehaviore: Array<{
    criteriaId: string;
    score: number;
    value: any;
    weight: number;
    explanation: string;
  }>;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  prediction: {
    conversionProbability: number;
    timeToConversion: number; // days
    lifetimeValue: number;
    churnRisk: number;
  };
  insights: string[];
  lastUpdated: string;
  trends: Array<{
    date: string;
    score: number;
    change: number;
  }>;
}

interface BehavioralPattern {
  prospectId: string;
  pattern: string;
  frequency: number;
  recency: number; // days since last occurrence
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  description: string;
}

interface LeadScoringConfig {
  scoringCriteria: LeadScoringCriteria[];
  weights: Record<string, number>;
  thresholds: {
    gradeA: number;
    gradeB: number;
    gradeC: number;
    gradeD: number;
  };
  aiSettings: {
    enablePredictiveScoring: boolean;
    enableBehavioralAnalysis: boolean;
    enableTrendAnalysis: boolean;
    modelConfidenceThreshold: number;
  };
}

export class AdvancedLeadScoringService {
  private scoringCriteria: LeadScoringCriteria[] = [];
  private leadScores: Map<string, LeadScore> = new Map();
  private behavioralPatterns: Map<string, BehavioralPattern[]> = new Map();
  private config: LeadScoringConfig;

  constructor() {
    this.config = this.loadConfig();
    this.initializeDefaultCriteria();
    this.loadScores();
  }

  /**
   * Calculate comprehensive lead score for a prospect
   */
  calculateLeadScore(prospectId: string, prospectData: any, options: {
    includeAI?: boolean;
    includeBehavioral?: boolean;
    forceBehaviorRefresh?: boolean;
  } = {}): LeadScore {
    const {
      includeAI = true,
      includeBehavioral = true,
      forceBehaviorRefresh = false
    } = options;

    let totalScore = 0;
    const categoryScores: Record<string, number> = {};
    const criteriaBreakdown: any[] = [];

    // Calculate base scores from criteria
    for (const criteria of this.scoringCriteria.filter(c => c.isActive)) {
      try {
        const value = this.extractCriteriaValue(prospectData, criteria);
        const rawScore = criteria.scoringFunction(value, prospectData);
        const weightedScore = rawScore * criteria.weight;

        totalScore += weightedScore;

        if (!categoryScores[criteria.category]) {
          categoryScores[criteria.category] = 0;
        }
        categoryScores[criteria.category] += weightedScore;

        criteriaBreakdown.push({
          criteriaId: criteria.id,
          score: rawScore,
          value,
          weight: criteria.weight,
          explanation: this.generateCriteriaExplanation(criteria, value, rawScore)
        });
      } catch (error) {
        console.error(`Error calculating score for criteria ${criteria.id}:`, error);
      }
    }

    // Add behavioral scoring
    if (includeBehavioral) {
      const behavioralScore = this.calculateBehavioralScore(prospectId, forceBehaviorRefresh);
      totalScore += behavioralScore.score;
      categoryScores.behavioral = behavioralScore.score;
      
      criteriaBreakdown.push({
        criteriaId: 'behavioral_analysis',
        score: behavioralScore.score,
        value: behavioralScore.patterns.length,
        weight: 1,
        explanation: `Behavioral analysis found ${behavioralScore.patterns.length} patterns`
      });
    }

    // Add AI-powered predictive scoring
    if (includeAI && this.config.aiSettings.enablePredictiveScoring) {
      const aiScore = this.calculateAIScore(prospectData, totalScore);
      totalScore += aiScore.adjustmentScore;
      
      criteriaBreakdown.push({
        criteriaId: 'ai_enhancement',
        score: aiScore.adjustmentScore,
        value: aiScore.confidence,
        weight: 1,
        explanation: `AI model adjustment with ${(aiScore.confidence * 100).toFixed(1)}% confidence`
      });
    }

    // Normalize score (0-100)
    totalScore = Math.max(0, Math.min(100, totalScore));

    // Calculate grade
    const grade = this.calculateGrade(totalScore);

    // Generate predictions
    const prediction = this.generatePredictions(prospectData, totalScore, categoryScores);

    // Generate insights
    const insights = this.generateInsights(prospectData, criteriaBreakdown, prediction);

    // Get historical trends
    const trends = this.getScoreTrends(prospectId);

    const leadScore: LeadScore = {
      prospectId,
      totalScore,
      categoryScores,
      criteriaBehaviore: criteriaBreakdown,
      grade,
      prediction,
      insights,
      lastUpdated: new Date().toISOString(),
      trends
    };

    // Store the score
    this.leadScores.set(prospectId, leadScore);
    this.saveScores();

    // Update trends
    this.updateScoreTrends(prospectId, totalScore);

    return leadScore;
  }

  /**
   * Bulk calculate scores for multiple prospects
   */
  calculateBulkScores(prospects: any[]): Map<string, LeadScore> {
    const results = new Map<string, LeadScore>();

    prospects.forEach(prospect => {
      try {
        const score = this.calculateLeadScore(prospect.id, prospect);
        results.set(prospect.id, score);
      } catch (error) {
        console.error(`Error calculating score for prospect ${prospect.id}:`, error);
      }
    });

    return results;
  }

  /**
   * Get behavioral patterns for a prospect
   */
  getBehavioralPatterns(prospectId: string): BehavioralPattern[] {
    return this.behavioralPatterns.get(prospectId) || [];
  }

  /**
   * Analyze behavioral patterns for all prospects
   */
  analyzeBehavioralPatterns(prospectId?: string): BehavioralPattern[] {
    const activities = activityTracker.getActivities({
      entityType: prospectId ? 'prospect' : undefined,
      entityId: prospectId
    });

    const patterns: BehavioralPattern[] = [];

    // Website interaction patterns
    const websiteVisits = activities.filter(a => a.activityType === 'website_visit');
    if (websiteVisits.length > 0) {
      patterns.push(this.analyzeWebsitePattern(prospectId || '', websiteVisits));
    }

    // Email engagement patterns
    const emailInteractions = activities.filter(a => 
      a.activityType.includes('email') || a.activityType.includes('communication')
    );
    if (emailInteractions.length > 0) {
      patterns.push(this.analyzeEmailPattern(prospectId || '', emailInteractions));
    }

    // Property viewing patterns
    const propertyViews = activities.filter(a => a.activityType === 'property_view');
    if (propertyViews.length > 0) {
      patterns.push(this.analyzePropertyViewPattern(prospectId || '', propertyViews));
    }

    // Application submission patterns
    const applications = activities.filter(a => a.activityType === 'application_submit');
    if (applications.length > 0) {
      patterns.push(this.analyzeApplicationPattern(prospectId || '', applications));
    }

    if (prospectId) {
      this.behavioralPatterns.set(prospectId, patterns);
      this.saveBehavioralPatterns();
    }

    return patterns;
  }

  /**
   * Get lead scoring recommendations
   */
  getRecommendations(prospectId: string): Array<{
    type: 'immediate' | 'short_term' | 'long_term';
    priority: 'high' | 'medium' | 'low';
    action: string;
    reason: string;
    expectedImpact: number;
  }> {
    const score = this.leadScores.get(prospectId);
    if (!score) return [];

    const recommendations = [];

    // High-scoring leads
    if (score.totalScore >= 80) {
      recommendations.push({
        type: 'immediate' as const,
        priority: 'high' as const,
        action: 'Schedule property viewing or personal consultation',
        reason: 'High lead score indicates strong conversion potential',
        expectedImpact: 25
      });
    }

    // Email engagement recommendations
    if (score.categoryScores.engagement < 15) {
      recommendations.push({
        type: 'short_term' as const,
        priority: 'medium' as const,
        action: 'Implement personalized email campaign',
        reason: 'Low engagement score suggests need for better communication',
        expectedImpact: 15
      });
    }

    // Behavioral pattern recommendations
    const patterns = this.getBehavioralPatterns(prospectId);
    const highEngagementPattern = patterns.find(p => p.pattern === 'high_engagement');
    if (highEngagementPattern) {
      recommendations.push({
        type: 'immediate' as const,
        priority: 'high' as const,
        action: 'Follow up within 24 hours',
        reason: 'Recent high engagement pattern detected',
        expectedImpact: 30
      });
    }

    // Financial qualification recommendations
    if (score.categoryScores.financial < 20) {
      recommendations.push({
        type: 'short_term' as const,
        priority: 'medium' as const,
        action: 'Conduct financial pre-qualification',
        reason: 'Financial score needs improvement for conversion',
        expectedImpact: 20
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Update scoring criteria configuration
   */
  updateScoringCriteria(criteria: LeadScoringCriteria[]): void {
    this.scoringCriteria = criteria;
    this.config.scoringCriteria = criteria;
    this.saveConfig();
    
    // Recalculate all scores
    this.recalculateAllScores();
  }

  /**
   * Get top performing prospects
   */
  getTopProspects(limit: number = 10, filters?: {
    minScore?: number;
    grade?: string[];
    category?: string;
  }): LeadScore[] {
    let scores = Array.from(this.leadScores.values());

    if (filters?.minScore) {
      scores = scores.filter(s => s.totalScore >= filters.minScore);
    }

    if (filters?.grade) {
      scores = scores.filter(s => filters.grade!.includes(s.grade));
    }

    return scores
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);
  }

  /**
   * Get scoring analytics
   */
  getScoringAnalytics(): {
    totalProspects: number;
    averageScore: number;
    gradeDistribution: Record<string, number>;
    categoryAverages: Record<string, number>;
    conversionPredictions: {
      high: number;
      medium: number;
      low: number;
    };
    trends: Array<{
      date: string;
      averageScore: number;
      totalProspects: number;
    }>;
  } {
    const scores = Array.from(this.leadScores.values());
    
    const totalProspects = scores.length;
    const averageScore = scores.reduce((sum, s) => sum + s.totalScore, 0) / totalProspects || 0;

    const gradeDistribution = scores.reduce((acc, score) => {
      acc[score.grade] = (acc[score.grade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryAverages = this.calculateCategoryAverages(scores);
    
    const conversionPredictions = this.calculateConversionPredictions(scores);

    const trends = this.calculateScoringTrends();

    return {
      totalProspects,
      averageScore,
      gradeDistribution,
      categoryAverages,
      conversionPredictions,
      trends
    };
  }

  private loadConfig(): LeadScoringConfig {
    try {
      const saved = LocalStorageService.getItem('lead_scoring_config');
      if (saved) {
        return saved;
      }
    } catch (error) {
      console.error('Error loading lead scoring config:', error);
    }

    return {
      scoringCriteria: [],
      weights: {
        demographic: 0.2,
        behavioral: 0.3,
        firmographic: 0.15,
        engagement: 0.25,
        financial: 0.1
      },
      thresholds: {
        gradeA: 80,
        gradeB: 65,
        gradeC: 50,
        gradeD: 35
      },
      aiSettings: {
        enablePredictiveScoring: true,
        enableBehavioralAnalysis: true,
        enableTrendAnalysis: true,
        modelConfidenceThreshold: 0.7
      }
    };
  }

  private saveConfig(): void {
    LocalStorageService.setItem('lead_scoring_config', this.config);
  }

  private loadScores(): void {
    try {
      const saved = LocalStorageService.getItem('lead_scores');
      if (saved && Array.isArray(saved)) {
        this.leadScores = new Map(saved.map((score: LeadScore) => [score.prospectId, score]));
      }
    } catch (error) {
      console.error('Error loading lead scores:', error);
    }
  }

  private saveScores(): void {
    try {
      const scoresArray = Array.from(this.leadScores.values());
      LocalStorageService.setItem('lead_scores', scoresArray);
    } catch (error) {
      console.error('Error saving lead scores:', error);
    }
  }

  private saveBehavioralPatterns(): void {
    try {
      const patternsObj = Object.fromEntries(this.behavioralPatterns);
      LocalStorageService.setItem('behavioral_patterns', patternsObj);
    } catch (error) {
      console.error('Error saving behavioral patterns:', error);
    }
  }

  private initializeDefaultCriteria(): void {
    if (this.scoringCriteria.length === 0) {
      this.scoringCriteria = [
        // Demographic Criteria
        {
          id: 'age_range',
          name: 'Age Range',
          category: 'demographic',
          weight: 5,
          scoringFunction: (age: number) => {
            if (age >= 25 && age <= 65) return 10;
            if (age >= 18 && age <= 75) return 7;
            return 3;
          },
          description: 'Score based on target age demographics',
          isActive: true
        },
        {
          id: 'income_level',
          name: 'Income Level',
          category: 'financial',
          weight: 15,
          scoringFunction: (income: number) => {
            if (income >= 80000) return 15;
            if (income >= 50000) return 12;
            if (income >= 30000) return 8;
            return 3;
          },
          description: 'Financial qualification based on annual income',
          isActive: true
        },
        {
          id: 'credit_score',
          name: 'Credit Score',
          category: 'financial',
          weight: 12,
          scoringFunction: (score: number) => {
            if (score >= 750) return 15;
            if (score >= 650) return 10;
            if (score >= 550) return 5;
            return 0;
          },
          description: 'Credit worthiness assessment',
          isActive: true
        },
        // Behavioral Criteria
        {
          id: 'website_engagement',
          name: 'Website Engagement',
          category: 'behavioral',
          weight: 8,
          scoringFunction: (visits: number) => {
            if (visits >= 10) return 12;
            if (visits >= 5) return 8;
            if (visits >= 2) return 5;
            return 2;
          },
          description: 'Level of website interaction and engagement',
          isActive: true
        },
        {
          id: 'email_engagement',
          name: 'Email Engagement',
          category: 'engagement',
          weight: 10,
          scoringFunction: (rate: number) => rate * 10,
          description: 'Email open and click-through rates',
          isActive: true
        },
        {
          id: 'response_time',
          name: 'Response Time',
          category: 'behavioral',
          weight: 6,
          scoringFunction: (hours: number) => {
            if (hours <= 4) return 10;
            if (hours <= 24) return 7;
            if (hours <= 72) return 4;
            return 1;
          },
          description: 'Speed of response to communications',
          isActive: true
        },
        // Engagement Criteria
        {
          id: 'property_views',
          name: 'Property Views',
          category: 'engagement',
          weight: 7,
          scoringFunction: (views: number) => Math.min(15, views * 2),
          description: 'Number of properties viewed or inquired about',
          isActive: true
        },
        {
          id: 'application_completeness',
          name: 'Application Completeness',
          category: 'engagement',
          weight: 10,
          scoringFunction: (percentage: number) => percentage / 5,
          description: 'Percentage of application fields completed',
          isActive: true
        }
      ];

      this.config.scoringCriteria = this.scoringCriteria;
      this.saveConfig();
    }
  }

  private extractCriteriaValue(prospectData: any, criteria: LeadScoringCriteria): any {
    switch (criteria.id) {
      case 'age_range':
        return prospectData.age || 0;
      case 'income_level':
        return prospectData.annualIncome || prospectData.income || 0;
      case 'credit_score':
        return prospectData.creditScore || 0;
      case 'website_engagement':
        return prospectData.websiteVisits || 0;
      case 'email_engagement':
        return prospectData.emailEngagementRate || 0;
      case 'response_time':
        return prospectData.averageResponseTime || 999;
      case 'property_views':
        return prospectData.propertyViews || 0;
      case 'application_completeness':
        return prospectData.applicationCompleteness || 0;
      default:
        return prospectData[criteria.id] || 0;
    }
  }

  private generateCriteriaExplanation(criteria: LeadScoringCriteria, value: any, score: number): string {
    return `${criteria.name}: ${value} → ${score.toFixed(1)} points (weight: ${criteria.weight})`;
  }

  private calculateBehavioralScore(prospectId: string, forceRefresh: boolean = false): {
    score: number;
    patterns: BehavioralPattern[];
  } {
    let patterns = this.behavioralPatterns.get(prospectId);
    
    if (!patterns || forceRefresh) {
      patterns = this.analyzeBehavioralPatterns(prospectId);
    }

    let behavioralScore = 0;

    patterns.forEach(pattern => {
      let patternScore = 0;
      
      switch (pattern.impact) {
        case 'positive':
          patternScore = pattern.frequency * pattern.confidence * 2;
          break;
        case 'negative':
          patternScore = -pattern.frequency * pattern.confidence;
          break;
        default:
          patternScore = 0;
      }

      // Apply recency bonus/penalty
      const recencyMultiplier = Math.max(0.1, 1 - (pattern.recency / 30));
      patternScore *= recencyMultiplier;

      behavioralScore += patternScore;
    });

    return {
      score: Math.max(0, Math.min(20, behavioralScore)),
      patterns
    };
  }

  private calculateAIScore(prospectData: any, baseScore: number): {
    adjustmentScore: number;
    confidence: number;
  } {
    // Simplified AI scoring - in a real implementation, this would use ML models
    let adjustmentScore = 0;
    let confidence = 0.8;

    // Look for combinations that historically convert well
    const hasHighIncomeAndGoodCredit = prospectData.income > 60000 && prospectData.creditScore > 700;
    const hasRecentEngagement = prospectData.lastActivityDate && 
      (new Date().getTime() - new Date(prospectData.lastActivityDate).getTime()) < 7 * 24 * 60 * 60 * 1000;

    if (hasHighIncomeAndGoodCredit && hasRecentEngagement) {
      adjustmentScore = 5;
      confidence = 0.9;
    } else if (hasHighIncomeAndGoodCredit) {
      adjustmentScore = 3;
      confidence = 0.85;
    } else if (hasRecentEngagement) {
      adjustmentScore = 2;
      confidence = 0.75;
    }

    return { adjustmentScore, confidence };
  }

  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= this.config.thresholds.gradeA) return 'A';
    if (score >= this.config.thresholds.gradeB) return 'B';
    if (score >= this.config.thresholds.gradeC) return 'C';
    if (score >= this.config.thresholds.gradeD) return 'D';
    return 'F';
  }

  private generatePredictions(prospectData: any, totalScore: number, categoryScores: Record<string, number>): {
    conversionProbability: number;
    timeToConversion: number;
    lifetimeValue: number;
    churnRisk: number;
  } {
    // Simplified prediction model
    const conversionProbability = Math.min(0.95, totalScore / 100);
    
    const timeToConversion = totalScore > 70 ? 
      Math.max(1, 30 - (totalScore - 70)) : 
      Math.min(90, 60 + (70 - totalScore));

    const lifetimeValue = (prospectData.income || 50000) * 0.12 * conversionProbability;
    
    const churnRisk = Math.max(0.05, 0.5 - (categoryScores.engagement || 0) / 40);

    return {
      conversionProbability,
      timeToConversion,
      lifetimeValue,
      churnRisk
    };
  }

  private generateInsights(prospectData: any, criteriaBreakdown: any[], prediction: any): string[] {
    const insights: string[] = [];

    // High-value insights
    if (prediction.conversionProbability > 0.8) {
      insights.push('🎯 High conversion probability - prioritize immediate follow-up');
    }

    if (prediction.lifetimeValue > 100000) {
      insights.push('💰 High lifetime value potential - consider premium service offering');
    }

    // Behavioral insights
    const engagementScore = criteriaBreakdown.find(c => c.criteriaId.includes('engagement'));
    if (engagementScore && engagementScore.score < 5) {
      insights.push('📧 Low engagement - consider personalized communication strategy');
    }

    // Financial insights
    const financialScores = criteriaBreakdown.filter(c => c.criteriaId.includes('financial') || c.criteriaId.includes('credit') || c.criteriaId.includes('income'));
    const avgFinancialScore = financialScores.reduce((sum, s) => sum + s.score, 0) / financialScores.length;
    
    if (avgFinancialScore > 12) {
      insights.push('✅ Strong financial profile - expedite application process');
    } else if (avgFinancialScore < 6) {
      insights.push('⚠️ Financial qualification needed - focus on pre-qualification');
    }

    // Timing insights
    if (prediction.timeToConversion < 14) {
      insights.push('⚡ Quick conversion expected - strike while interest is high');
    }

    return insights;
  }

  private getScoreTrends(prospectId: string): Array<{ date: string; score: number; change: number }> {
    // In a real implementation, this would load historical data
    const existingScore = this.leadScores.get(prospectId);
    if (!existingScore || !existingScore.trends) {
      return [];
    }
    return existingScore.trends.slice(-10); // Last 10 data points
  }

  private updateScoreTrends(prospectId: string, newScore: number): void {
    const existingScore = this.leadScores.get(prospectId);
    const trends = existingScore?.trends || [];
    
    const lastScore = trends.length > 0 ? trends[trends.length - 1].score : 0;
    const change = newScore - lastScore;

    trends.push({
      date: new Date().toISOString(),
      score: newScore,
      change
    });

    // Keep only last 30 data points
    if (trends.length > 30) {
      trends.splice(0, trends.length - 30);
    }
  }

  private recalculateAllScores(): void {
    try {
      const prospects = LocalStorageService.getItem('prospects') || [];
      prospects.forEach((prospect: any) => {
        this.calculateLeadScore(prospect.id, prospect);
      });
    } catch (error) {
      console.error('Error recalculating scores:', error);
    }
  }

  private analyzeWebsitePattern(prospectId: string, activities: any[]): BehavioralPattern {
    const frequency = activities.length;
    const lastVisit = Math.max(...activities.map(a => new Date(a.timestamp).getTime()));
    const recency = (Date.now() - lastVisit) / (1000 * 60 * 60 * 24);

    return {
      prospectId,
      pattern: frequency > 5 ? 'high_engagement' : 'moderate_engagement',
      frequency,
      recency,
      impact: frequency > 5 ? 'positive' : 'neutral',
      confidence: Math.min(1, frequency / 10),
      description: `${frequency} website visits, last visit ${Math.round(recency)} days ago`
    };
  }

  private analyzeEmailPattern(prospectId: string, activities: any[]): BehavioralPattern {
    const openRate = activities.filter(a => a.activityType.includes('open')).length / activities.length;
    const frequency = activities.length;
    const recency = 0; // Simplified

    return {
      prospectId,
      pattern: openRate > 0.3 ? 'engaged_communicator' : 'low_engagement',
      frequency,
      recency,
      impact: openRate > 0.3 ? 'positive' : 'negative',
      confidence: 0.8,
      description: `${(openRate * 100).toFixed(1)}% email engagement rate`
    };
  }

  private analyzePropertyViewPattern(prospectId: string, activities: any[]): BehavioralPattern {
    const frequency = activities.length;
    const recency = 0; // Simplified

    return {
      prospectId,
      pattern: frequency > 3 ? 'serious_buyer' : 'casual_browser',
      frequency,
      recency,
      impact: frequency > 3 ? 'positive' : 'neutral',
      confidence: 0.7,
      description: `Viewed ${frequency} properties`
    };
  }

  private analyzeApplicationPattern(prospectId: string, activities: any[]): BehavioralPattern {
    const frequency = activities.length;
    const hasCompleteApplication = activities.some(a => a.metadata?.status === 'completed');

    return {
      prospectId,
      pattern: hasCompleteApplication ? 'application_submitted' : 'application_started',
      frequency,
      recency: 0,
      impact: hasCompleteApplication ? 'positive' : 'neutral',
      confidence: 0.9,
      description: hasCompleteApplication ? 'Completed application' : 'Started application process'
    };
  }

  private calculateCategoryAverages(scores: LeadScore[]): Record<string, number> {
    const categories = ['demographic', 'behavioral', 'firmographic', 'engagement', 'financial'];
    const averages: Record<string, number> = {};

    categories.forEach(category => {
      const categoryScores = scores.map(s => s.categoryScores[category] || 0);
      averages[category] = categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length || 0;
    });

    return averages;
  }

  private calculateConversionPredictions(scores: LeadScore[]): { high: number; medium: number; low: number } {
    return {
      high: scores.filter(s => s.prediction.conversionProbability > 0.7).length,
      medium: scores.filter(s => s.prediction.conversionProbability > 0.4 && s.prediction.conversionProbability <= 0.7).length,
      low: scores.filter(s => s.prediction.conversionProbability <= 0.4).length
    };
  }

  private calculateScoringTrends(): Array<{ date: string; averageScore: number; totalProspects: number }> {
    // Simplified trend calculation
    const now = new Date();
    const trends = [];

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        averageScore: 65 + Math.random() * 20, // Simulated data
        totalProspects: Math.floor(50 + Math.random() * 100)
      });
    }

    return trends;
  }
}

export const advancedLeadScoringService = new AdvancedLeadScoringService();
