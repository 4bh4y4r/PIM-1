import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { Search as SearchIcon, Filter, User, Eye } from "lucide-react";

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

        {/* Search Form */}
        <Card className="shadow-elegant mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <SearchIcon className="h-5 w-5 mr-2" />
              Search Criteria
            </CardTitle>
            <CardDescription>
              Enter search terms and apply filters to find specific records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="searchTerm">Search Term</Label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="searchTerm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, national ID, or phone..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="filterBy">Filter by Gender</Label>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </Button>
              <Button variant="outline" onClick={handleClearSearch}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {results.length > 0 && (
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Search Results
                </span>
                <Badge variant="secondary">{results.length} records found</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Date of Birth</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>National ID</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((person) => (
                      <TableRow key={person.id}>
                        <TableCell className="font-medium">{person.fullName}</TableCell>
                        <TableCell>{person.dateOfBirth}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{person.gender}</Badge>
                        </TableCell>
                        <TableCell>{person.nationalId}</TableCell>
                        <TableCell>{person.city}</TableCell>
                        <TableCell>{person.phone}</TableCell>
                        <TableCell>{person.email}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Results Message */}
        {results.length === 0 && searchTerm && !isSearching && (
          <Card className="shadow-card">
            <CardContent className="text-center py-8">
              <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
              <p className="text-muted-foreground">
                No records match your search criteria. Try adjusting your search terms or filters.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Search;