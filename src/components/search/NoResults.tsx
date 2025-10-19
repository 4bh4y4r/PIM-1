import { Card, CardContent } from "@/components/ui/card";
import { Search as SearchIcon } from "lucide-react";

interface NoResultsProps {
  searchTerm: string;
  isSearching: boolean;
}

const NoResults = ({ searchTerm, isSearching }: NoResultsProps) => {
  if (isSearching) return null;

  return (
    <Card className="shadow-card">
      <CardContent className="text-center py-8">
        <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
        <p className="text-muted-foreground">
          No records match your search criteria. Try adjusting your search terms or filters.
        </p>
      </CardContent>
    </Card>
  );
};

export default NoResults;