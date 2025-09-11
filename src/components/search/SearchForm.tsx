import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon, Filter } from "lucide-react";

interface SearchFormProps {
  searchTerm: string;
  filterBy: string;
  isSearching: boolean;
  onSearchTermChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

const SearchForm = ({
  searchTerm,
  filterBy,
  isSearching,
  onSearchTermChange,
  onFilterChange,
  onSearch,
  onClear
}: SearchFormProps) => {
  return (
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
                onChange={(e) => onSearchTermChange(e.target.value)}
                placeholder="Search by name, email, national ID, or phone..."
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="filterBy">Filter by Gender</Label>
            <Select value={filterBy} onValueChange={onFilterChange}>
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
          <Button onClick={onSearch} disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
          <Button variant="outline" onClick={onClear}>
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchForm;