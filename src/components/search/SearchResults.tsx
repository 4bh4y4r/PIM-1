import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Eye } from "lucide-react";

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

interface SearchResultsProps {
  results: SearchResult[];
}

const SearchResults = ({ results }: SearchResultsProps) => {
  if (results.length === 0) return null;

  return (
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
  );
};

export default SearchResults;