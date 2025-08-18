import { LocalStorageService } from './LocalStorageService';

interface SearchableEntity {
  id: string;
  type: 'property' | 'tenant' | 'prospect' | 'contact' | 'workorder' | 'document' | 'communication' | 'campaign' | 'application';
  title: string;
  content: string;
  metadata: Record<string, any>;
  lastModified: string;
  tags: string[];
  searchableFields: string[];
}

interface SearchFilters {
  entityTypes?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  properties?: string[];
  tags?: string[];
  status?: string[];
  customFilters?: Record<string, any>;
}

interface SearchResult {
  entity: SearchableEntity;
  score: number;
  matchedFields: string[];
  highlights: Record<string, string>;
}

interface SearchSuggestion {
  text: string;
  type: 'entity' | 'field' | 'value';
  count: number;
}

export class EnhancedSearchService {
  private searchIndex: Map<string, SearchableEntity> = new Map();
  private fieldIndex: Map<string, Set<string>> = new Map();
  private recentSearches: string[] = [];
  private popularSearches: Map<string, number> = new Map();

  constructor() {
    this.loadSearchData();
    this.buildSearchIndex();
  }

  /**
   * Perform comprehensive search across all entities
   */
  search(query: string, filters: SearchFilters = {}, options: {
    fuzzy?: boolean;
    exactMatch?: boolean;
    limit?: number;
    sortBy?: 'relevance' | 'date' | 'title';
  } = {}): SearchResult[] {
    const {
      fuzzy = true,
      exactMatch = false,
      limit = 50,
      sortBy = 'relevance'
    } = options;

    if (!query.trim()) {
      return this.getRecentEntities(limit);
    }

    // Track search query
    this.trackSearch(query);

    // Normalize and prepare search terms
    const searchTerms = this.prepareSearchTerms(query, fuzzy);
    
    // Search through indexed entities
    const results: SearchResult[] = [];
    
    for (const [entityId, entity] of this.searchIndex) {
      // Apply entity type filters
      if (filters.entityTypes && !filters.entityTypes.includes(entity.type)) {
        continue;
      }

      // Apply date range filters
      if (filters.dateRange && !this.matchesDateRange(entity, filters.dateRange)) {
        continue;
      }

      // Apply custom filters
      if (!this.matchesCustomFilters(entity, filters)) {
        continue;
      }

      // Calculate search score
      const searchResult = this.calculateSearchScore(entity, searchTerms, exactMatch);
      
      if (searchResult.score > 0) {
        results.push(searchResult);
      }
    }

    // Sort results
    this.sortResults(results, sortBy);

    return results.slice(0, limit);
  }

  /**
   * Get search suggestions as user types
   */
  getSuggestions(partialQuery: string, limit: number = 10): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    const queryLower = partialQuery.toLowerCase();

    // Entity name suggestions
    for (const [_, entity] of this.searchIndex) {
      if (entity.title.toLowerCase().includes(queryLower)) {
        suggestions.push({
          text: entity.title,
          type: 'entity',
          count: 1
        });
      }
    }

    // Field-based suggestions
    for (const [field, entityIds] of this.fieldIndex) {
      if (field.toLowerCase().includes(queryLower)) {
        suggestions.push({
          text: field,
          type: 'field',
          count: entityIds.size
        });
      }
    }

    // Popular search suggestions
    for (const [search, count] of this.popularSearches) {
      if (search.toLowerCase().includes(queryLower)) {
        suggestions.push({
          text: search,
          type: 'value',
          count
        });
      }
    }

    // Remove duplicates and sort by relevance
    const uniqueSuggestions = Array.from(
      new Map(suggestions.map(s => [s.text, s])).values()
    );

    return uniqueSuggestions
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get recent searches for user
   */
  getRecentSearches(): string[] {
    return this.recentSearches.slice(0, 10);
  }

  /**
   * Get popular searches across all users
   */
  getPopularSearches(): Array<{ query: string; count: number }> {
    return Array.from(this.popularSearches.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Advanced search with complex queries
   */
  advancedSearch(searchQuery: {
    must?: string[];
    should?: string[];
    mustNot?: string[];
    filters: SearchFilters;
    fuzzy?: boolean;
  }): SearchResult[] {
    const results: SearchResult[] = [];

    for (const [_, entity] of this.searchIndex) {
      let score = 0;
      let matches = true;

      // Must clauses (all must match)
      if (searchQuery.must) {
        for (const mustTerm of searchQuery.must) {
          const termScore = this.getEntityScore(entity, mustTerm, searchQuery.fuzzy);
          if (termScore === 0) {
            matches = false;
            break;
          }
          score += termScore * 2; // Higher weight for must clauses
        }
      }

      if (!matches) continue;

      // Must not clauses (none should match)
      if (searchQuery.mustNot) {
        for (const mustNotTerm of searchQuery.mustNot) {
          if (this.getEntityScore(entity, mustNotTerm, searchQuery.fuzzy) > 0) {
            matches = false;
            break;
          }
        }
      }

      if (!matches) continue;

      // Should clauses (optional matches that boost score)
      if (searchQuery.should) {
        for (const shouldTerm of searchQuery.should) {
          score += this.getEntityScore(entity, shouldTerm, searchQuery.fuzzy);
        }
      }

      // Apply filters
      if (!this.matchesCustomFilters(entity, searchQuery.filters)) {
        continue;
      }

      if (score > 0) {
        results.push({
          entity,
          score,
          matchedFields: this.getMatchedFields(entity, searchQuery.must || searchQuery.should || []),
          highlights: this.generateHighlights(entity, searchQuery.must || searchQuery.should || [])
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Update search index when entities change
   */
  updateIndex(entity: any, type: SearchableEntity['type']): void {
    const searchableEntity = this.convertToSearchableEntity(entity, type);
    this.searchIndex.set(searchableEntity.id, searchableEntity);
    this.updateFieldIndex(searchableEntity);
    this.saveSearchData();
  }

  /**
   * Remove entity from search index
   */
  removeFromIndex(entityId: string): void {
    const entity = this.searchIndex.get(entityId);
    if (entity) {
      this.searchIndex.delete(entityId);
      this.removeFromFieldIndex(entity);
      this.saveSearchData();
    }
  }

  /**
   * Rebuild entire search index
   */
  rebuildIndex(): void {
    this.searchIndex.clear();
    this.fieldIndex.clear();
    this.buildSearchIndex();
  }

  private loadSearchData(): void {
    try {
      const searchData = LocalStorageService.getItem('search_index');
      if (searchData) {
        this.searchIndex = new Map(Object.entries(searchData.index || {}));
        this.fieldIndex = new Map(
          Object.entries(searchData.fieldIndex || {}).map(([key, value]) => [key, new Set(value as string[])])
        );
      }

      const recentSearches = LocalStorageService.getItem('recent_searches');
      if (recentSearches) {
        this.recentSearches = recentSearches;
      }

      const popularSearches = LocalStorageService.getItem('popular_searches');
      if (popularSearches) {
        this.popularSearches = new Map(Object.entries(popularSearches));
      }
    } catch (error) {
      console.error('Error loading search data:', error);
    }
  }

  private saveSearchData(): void {
    try {
      const searchData = {
        index: Object.fromEntries(this.searchIndex),
        fieldIndex: Object.fromEntries(
          Array.from(this.fieldIndex.entries()).map(([key, value]) => [key, Array.from(value)])
        )
      };

      LocalStorageService.setItem('search_index', searchData);
      LocalStorageService.setItem('recent_searches', this.recentSearches);
      LocalStorageService.setItem('popular_searches', Object.fromEntries(this.popularSearches));
    } catch (error) {
      console.error('Error saving search data:', error);
    }
  }

  private buildSearchIndex(): void {
    // Load all entities from localStorage and index them
    const entities = [
      ...this.loadEntitiesOfType('properties', 'property'),
      ...this.loadEntitiesOfType('tenants', 'tenant'),
      ...this.loadEntitiesOfType('prospects', 'prospect'),
      ...this.loadEntitiesOfType('contacts', 'contact'),
      ...this.loadEntitiesOfType('workOrders', 'workorder'),
      ...this.loadEntitiesOfType('documents', 'document'),
      ...this.loadEntitiesOfType('communications', 'communication'),
      ...this.loadEntitiesOfType('campaigns', 'campaign'),
      ...this.loadEntitiesOfType('applications', 'application')
    ];

    entities.forEach(entity => {
      this.searchIndex.set(entity.id, entity);
      this.updateFieldIndex(entity);
    });

    this.saveSearchData();
  }

  private loadEntitiesOfType(storageKey: string, type: SearchableEntity['type']): SearchableEntity[] {
    try {
      const data = LocalStorageService.getItem(storageKey) || [];
      return Array.isArray(data) ? data.map(item => this.convertToSearchableEntity(item, type)) : [];
    } catch (error) {
      console.error(`Error loading ${type} entities:`, error);
      return [];
    }
  }

  private convertToSearchableEntity(entity: any, type: SearchableEntity['type']): SearchableEntity {
    const baseFields = ['id', 'name', 'title', 'description', 'notes', 'tags'];
    let title = '';
    let content = '';
    let searchableFields: string[] = [];

    switch (type) {
      case 'property':
        title = entity.address || entity.name || `Property ${entity.id}`;
        content = [entity.address, entity.description, entity.amenities?.join(' '), entity.notes].filter(Boolean).join(' ');
        searchableFields = ['address', 'description', 'amenities', 'notes', 'propertyType', 'city', 'state'];
        break;

      case 'tenant':
        title = `${entity.firstName || ''} ${entity.lastName || ''}`.trim() || `Tenant ${entity.id}`;
        content = [entity.firstName, entity.lastName, entity.email, entity.phone, entity.notes].filter(Boolean).join(' ');
        searchableFields = ['firstName', 'lastName', 'email', 'phone', 'notes', 'occupation'];
        break;

      case 'prospect':
        title = `${entity.firstName || ''} ${entity.lastName || ''}`.trim() || `Prospect ${entity.id}`;
        content = [entity.firstName, entity.lastName, entity.email, entity.phone, entity.notes, entity.propertyInterest].filter(Boolean).join(' ');
        searchableFields = ['firstName', 'lastName', 'email', 'phone', 'notes', 'propertyInterest', 'source'];
        break;

      case 'workorder':
        title = entity.title || entity.description || `Work Order ${entity.id}`;
        content = [entity.title, entity.description, entity.category, entity.notes].filter(Boolean).join(' ');
        searchableFields = ['title', 'description', 'category', 'notes', 'priority', 'status'];
        break;

      case 'document':
        title = entity.name || `Document ${entity.id}`;
        content = [entity.name, entity.description, entity.category, entity.tags?.join(' ')].filter(Boolean).join(' ');
        searchableFields = ['name', 'description', 'category', 'tags'];
        break;

      default:
        title = entity.name || entity.title || `${type} ${entity.id}`;
        content = Object.values(entity).filter(value => typeof value === 'string').join(' ');
        searchableFields = Object.keys(entity).filter(key => typeof entity[key] === 'string');
    }

    return {
      id: entity.id,
      type,
      title,
      content: content.toLowerCase(),
      metadata: entity,
      lastModified: entity.dateModified || entity.lastModified || new Date().toISOString(),
      tags: entity.tags || [],
      searchableFields
    };
  }

  private prepareSearchTerms(query: string, fuzzy: boolean): string[] {
    const terms = query.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 0);

    if (fuzzy) {
      // Add fuzzy variations for each term
      const fuzzyTerms: string[] = [];
      terms.forEach(term => {
        fuzzyTerms.push(term);
        if (term.length > 4) {
          // Add partial matches
          fuzzyTerms.push(term.slice(0, -1));
          fuzzyTerms.push(term.slice(1));
        }
      });
      return fuzzyTerms;
    }

    return terms;
  }

  private calculateSearchScore(entity: SearchableEntity, searchTerms: string[], exactMatch: boolean): SearchResult {
    let totalScore = 0;
    const matchedFields: string[] = [];
    const highlights: Record<string, string> = {};

    // Score title matches higher
    const titleScore = this.getFieldScore(entity.title, searchTerms, exactMatch) * 3;
    if (titleScore > 0) {
      totalScore += titleScore;
      matchedFields.push('title');
      highlights.title = this.highlightMatches(entity.title, searchTerms);
    }

    // Score content matches
    const contentScore = this.getFieldScore(entity.content, searchTerms, exactMatch);
    if (contentScore > 0) {
      totalScore += contentScore;
      matchedFields.push('content');
    }

    // Score individual searchable fields
    entity.searchableFields.forEach(fieldName => {
      const fieldValue = String(entity.metadata[fieldName] || '').toLowerCase();
      const fieldScore = this.getFieldScore(fieldValue, searchTerms, exactMatch);
      if (fieldScore > 0) {
        totalScore += fieldScore * 1.5; // Boost specific field matches
        matchedFields.push(fieldName);
        highlights[fieldName] = this.highlightMatches(fieldValue, searchTerms);
      }
    });

    // Tag matches get high scores
    const tagMatches = entity.tags.filter(tag => 
      searchTerms.some(term => tag.toLowerCase().includes(term))
    );
    if (tagMatches.length > 0) {
      totalScore += tagMatches.length * 2;
      matchedFields.push('tags');
    }

    // Boost recent items
    const daysSinceModified = (Date.now() - new Date(entity.lastModified).getTime()) / (1000 * 60 * 60 * 24);
    const recencyBoost = Math.max(0, 1 - daysSinceModified / 365); // Boost recent items within a year
    totalScore += recencyBoost;

    return {
      entity,
      score: totalScore,
      matchedFields: Array.from(new Set(matchedFields)),
      highlights
    };
  }

  private getFieldScore(fieldValue: string, searchTerms: string[], exactMatch: boolean): number {
    let score = 0;
    
    searchTerms.forEach(term => {
      if (exactMatch) {
        if (fieldValue === term) score += 10;
        else if (fieldValue.includes(term)) score += 5;
      } else {
        if (fieldValue.includes(term)) {
          // Higher score for terms at the beginning
          const index = fieldValue.indexOf(term);
          const positionBoost = index === 0 ? 2 : (index < 10 ? 1.5 : 1);
          score += term.length * positionBoost;
        }
      }
    });

    return score;
  }

  private getEntityScore(entity: SearchableEntity, term: string, fuzzy?: boolean): number {
    const searchTerms = this.prepareSearchTerms(term, fuzzy || false);
    return this.calculateSearchScore(entity, searchTerms, !fuzzy).score;
  }

  private getMatchedFields(entity: SearchableEntity, terms: string[]): string[] {
    const matchedFields: string[] = [];
    const searchTerms = terms.flatMap(term => this.prepareSearchTerms(term, true));

    if (this.getFieldScore(entity.title, searchTerms, false) > 0) {
      matchedFields.push('title');
    }
    
    entity.searchableFields.forEach(field => {
      const fieldValue = String(entity.metadata[field] || '').toLowerCase();
      if (this.getFieldScore(fieldValue, searchTerms, false) > 0) {
        matchedFields.push(field);
      }
    });

    return matchedFields;
  }

  private generateHighlights(entity: SearchableEntity, terms: string[]): Record<string, string> {
    const highlights: Record<string, string> = {};
    const searchTerms = terms.flatMap(term => this.prepareSearchTerms(term, true));

    highlights.title = this.highlightMatches(entity.title, searchTerms);
    
    entity.searchableFields.forEach(field => {
      const fieldValue = String(entity.metadata[field] || '');
      if (fieldValue) {
        highlights[field] = this.highlightMatches(fieldValue, searchTerms);
      }
    });

    return highlights;
  }

  private highlightMatches(text: string, searchTerms: string[]): string {
    let highlighted = text;
    
    searchTerms.forEach(term => {
      if (term.length > 1) {
        const regex = new RegExp(`(${term})`, 'gi');
        highlighted = highlighted.replace(regex, '<mark>$1</mark>');
      }
    });

    return highlighted;
  }

  private sortResults(results: SearchResult[], sortBy: string): void {
    switch (sortBy) {
      case 'date':
        results.sort((a, b) => new Date(b.entity.lastModified).getTime() - new Date(a.entity.lastModified).getTime());
        break;
      case 'title':
        results.sort((a, b) => a.entity.title.localeCompare(b.entity.title));
        break;
      case 'relevance':
      default:
        results.sort((a, b) => b.score - a.score);
        break;
    }
  }

  private matchesDateRange(entity: SearchableEntity, dateRange: { start: string; end: string }): boolean {
    const entityDate = new Date(entity.lastModified);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    return entityDate >= startDate && entityDate <= endDate;
  }

  private matchesCustomFilters(entity: SearchableEntity, filters: SearchFilters): boolean {
    // Property filter
    if (filters.properties && filters.properties.length > 0) {
      const entityPropertyId = entity.metadata.propertyId || entity.metadata.property?.id;
      if (!entityPropertyId || !filters.properties.includes(entityPropertyId)) {
        return false;
      }
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => 
        entity.tags.some(entityTag => entityTag.toLowerCase().includes(tag.toLowerCase()))
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      const entityStatus = entity.metadata.status;
      if (!entityStatus || !filters.status.includes(entityStatus)) {
        return false;
      }
    }

    // Custom filters
    if (filters.customFilters) {
      for (const [key, value] of Object.entries(filters.customFilters)) {
        if (entity.metadata[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }

  private getRecentEntities(limit: number): SearchResult[] {
    return Array.from(this.searchIndex.values())
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, limit)
      .map(entity => ({
        entity,
        score: 1,
        matchedFields: [],
        highlights: {}
      }));
  }

  private trackSearch(query: string): void {
    // Add to recent searches
    this.recentSearches = [query, ...this.recentSearches.filter(q => q !== query)].slice(0, 20);
    
    // Track popularity
    const currentCount = this.popularSearches.get(query) || 0;
    this.popularSearches.set(query, currentCount + 1);
    
    // Save updated search data
    LocalStorageService.setItem('recent_searches', this.recentSearches);
    LocalStorageService.setItem('popular_searches', Object.fromEntries(this.popularSearches));
  }

  private updateFieldIndex(entity: SearchableEntity): void {
    entity.searchableFields.forEach(field => {
      if (!this.fieldIndex.has(field)) {
        this.fieldIndex.set(field, new Set());
      }
      this.fieldIndex.get(field)!.add(entity.id);
    });
  }

  private removeFromFieldIndex(entity: SearchableEntity): void {
    entity.searchableFields.forEach(field => {
      const entitySet = this.fieldIndex.get(field);
      if (entitySet) {
        entitySet.delete(entity.id);
        if (entitySet.size === 0) {
          this.fieldIndex.delete(field);
        }
      }
    });
  }
}

export const enhancedSearchService = new EnhancedSearchService();
