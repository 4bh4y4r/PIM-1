import { useState } from "react";
import Navigation from "@/components/Navigation";
import SearchForm from "@/components/search/SearchForm";
import SearchResults from "@/components/search/SearchResults";
import NoResults from "@/components/search/NoResults";

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

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: "1",
      fullName: "John Doe",
      dateOfBirth: "1990-05-15",
      gender: "Male",
      nationalId: "123456789",
      city: "New York",
      phone: "(555) 123-4567",
      email: "john.doe@email.com",
    },
    {
      id: "2",
      fullName: "Jane Smith",
      dateOfBirth: "1985-08-22",
      gender: "Female",
      nationalId: "987654321",
      city: "Los Angeles",
      phone: "(555) 987-6543",
      email: "jane.smith@email.com",
    },
    {
      id: "3",
      fullName: "Michael Johnson",
      dateOfBirth: "1992-12-03",
      gender: "Male",
      nationalId: "456789123",
      city: "Chicago",
      phone: "(555) 456-7890",
      email: "m.johnson@email.com",
    },
  ];

  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = () => {
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      let filteredResults = mockResults;
      
      if (searchTerm.trim()) {
        filteredResults = mockResults.filter(person =>
          person.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          person.nationalId.includes(searchTerm) ||
          person.phone.includes(searchTerm)
        );
      }

      if (filterBy !== "all") {
        filteredResults = filteredResults.filter(person =>
          person.gender.toLowerCase() === filterBy.toLowerCase()
        );
      }

      setResults(filteredResults);
      setIsSearching(false);
    }, 800);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilterBy("all");
    setResults([]);
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