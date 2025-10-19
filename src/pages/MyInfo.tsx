import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Edit, 
  Trash2, 
  Search, 
  Plus,
  User,
  Calendar,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  tags: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const MyInfo = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Person>>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalRecords: 0,
    lastSubmission: null as string | null
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMyRecords();
  }, []);

  const fetchMyRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/persons`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch records: ${response.statusText}`);
      }

      const data = await response.json();
      const myRecords = data.persons || [];
      setPersons(myRecords);
      
      // Calculate stats
      setStats({
        totalRecords: myRecords.length,
        lastSubmission: myRecords.length > 0 
          ? myRecords.sort((a: Person, b: Person) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0].createdAt 
          : null
      });
    } catch (err) {
      console.error('Error fetching records:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (person: Person) => {
    navigate(`/info-form/${person.id}`);
  };

  const handleUpdate = async () => {
    if (!editingPerson) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/persons/${editingPerson.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to update record');
      }

      toast({
        title: "Success",
        description: "Record updated successfully.",
      });

      setIsEditDialogOpen(false);
      fetchMyRecords(); // Refresh the list
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update record.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (personId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/persons/${personId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete record');
      }

      toast({
        title: "Success",
        description: "Record deleted successfully.",
      });

      fetchMyRecords(); // Refresh the list
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete record.",
        variant: "destructive",
      });
    }
  };

  const filteredPersons = persons.filter(person =>
    person.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.phone.includes(searchTerm)
  );

  const deriveCategories = (p: Person) => {
    const categories: string[] = [];
    if (p.firstName || p.lastName || p.dateOfBirth || p.email || p.phone) categories.push('Personal');
    // Identification from notes if present
    if (p.notes && (/National ID:\s*\S+/.test(p.notes) || /Passport/i.test(p.notes) || /PAN/i.test(p.notes) || /Aadhaar/i.test(p.notes) || /Ration/i.test(p.notes))) {
      categories.push('Identification');
    }
    if (p.address && p.address.trim() !== ',' && p.address.trim() !== ', ,') categories.push('Address');
    if (p.notes && (/Education:\s*\S+/.test(p.notes) || /Occupation:\s*\S+/.test(p.notes))) categories.push('Education');
    if (p.notes && (/Income:\s*\S+/.test(p.notes) || /IFSC/i.test(p.notes))) categories.push('Financial');
    if (p.notes && (/Health Info:\s*\S+/.test(p.notes) || /Allergies/i.test(p.notes) || /Medical/i.test(p.notes))) categories.push('Health');
    // Fallback to tags if present
    if (p.tags) {
      const tagList = p.tags.split(',').map(t => t.trim()).filter(Boolean);
      for (const t of tagList) if (!categories.includes(t)) categories.push(t);
    }
    return Array.from(new Set(categories));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your records...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-center text-destructive">
                <p className="font-medium">Failed to load your records</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
                <Button onClick={fetchMyRecords} className="mt-4">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Information</h1>
          <p className="text-muted-foreground">Manage your submitted records and view your activity.</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRecords}</div>
              <p className="text-xs text-muted-foreground">Records submitted</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Submission</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.lastSubmission 
                  ? new Date(stats.lastSubmission).toLocaleDateString()
                  : 'None'
                }
              </div>
              <p className="text-xs text-muted-foreground">Most recent record</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.location.href = '/add-person'}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Record
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                My Records ({filteredPersons.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search my records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPersons.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell className="font-medium">
                        {person.firstName} {person.lastName}
                      </TableCell>
                      <TableCell>{person.email || '-'}</TableCell>
                      <TableCell>{person.phone || '-'}</TableCell>
                      <TableCell>
                        {person.dateOfBirth ? new Date(person.dateOfBirth).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {deriveCategories(person).length > 0 ? (
                            deriveCategories(person).map((cat, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {cat}
                              </Badge>
                            ))
                          ) : (
                            <span>-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(person.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(person)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the record for {person.firstName} {person.lastName}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(person.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredPersons.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No records found.</p>
                <Button 
                  onClick={() => window.location.href = '/add-person'}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Record
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MyInfo;
