import * as React from 'react';

interface SearchContextType {
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;
  searchResults: SearchResult[];
  setSearchResults: (results: SearchResult[]) => void;
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
}

interface SearchResult {
  id: string;
  type: 'property' | 'tenant' | 'prospect' | 'task' | 'workOrder' | 'serviceProvider' | 'manager';
  title: string;
  subtitle?: string;
  path: string;
  icon?: React.ReactNode;
}

const SearchContext = React.createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [globalSearchTerm, setGlobalSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const value = React.useMemo(() => ({
    globalSearchTerm,
    setGlobalSearchTerm,
    searchResults,
    setSearchResults,
    isSearching,
    setIsSearching,
  }), [globalSearchTerm, searchResults, isSearching]);

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = React.useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

export type { SearchResult };
