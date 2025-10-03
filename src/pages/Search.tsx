import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import SearchForm from "@/components/search/SearchForm";
import SearchResults from "@/components/search/SearchResults";
import NoResults from "@/components/search/NoResults";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationalId: string;
  city: string;
  phone: string;
  email: string;
}

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/persons/search?term=${encodeURIComponent(searchTerm)}&filter=${filterBy}`, 
        {
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to search persons');
      }
      
      const data = await response.json();
      setResults(data);
      
    } catch (error) {
      toast({
        title: "Search Error",
        description: error instanceof Error ? error.message : "Failed to perform search",
        variant: "destructive"
      });
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  const handleClearSearch = () => {
    setSearchTerm("");
    setFilterBy("all");
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Search Records</h1>
          <p className="text-muted-foreground">Find and view person records in the system.</p>
        </div>

        <SearchForm
          searchTerm={searchTerm}
          filterBy={filterBy}
          isSearching={isSearching}
          onSearchTermChange={setSearchTerm}
          onFilterChange={setFilterBy}
          onSearch={handleSearch}
          onClear={handleClearSearch}
        />

        <SearchResults results={results} />
        
        <NoResults searchTerm={searchTerm} isSearching={isSearching} />
      </main>
    </div>
  );
};

export default Search;