import { useState, useEffect } from "react";
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
  Eye,
  Filter
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

const ViewRecords = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Person>>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
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
        throw new Error(`Failed to fetch persons: ${response.statusText}`);
      }

      const data = await response.json();
      setPersons(data.persons || []);
    } catch (err) {
      console.error('Error fetching persons:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch persons');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setEditFormData({
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      phone: person.phone,
      address: person.address,
      dateOfBirth: person.dateOfBirth ? person.dateOfBirth.split('T')[0] : '',
      tags: person.tags,
      notes: person.notes,
    });
    setIsEditDialogOpen(true);
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
        throw new Error('Failed to update person');
      }

      toast({
        title: "Success",
        description: "Person record updated successfully.",
      });

      setIsEditDialogOpen(false);
      fetchPersons(); // Refresh the list
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update person record.",
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
        throw new Error('Failed to delete person');
      }

      toast({
        title: "Success",
        description: "Person record deleted successfully.",
      });

      fetchPersons(); // Refresh the list
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete person record.",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading records...</p>
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
                <p className="font-medium">Failed to load records</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
                <Button onClick={fetchPersons} className="mt-4">
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
          <h1 className="text-3xl font-bold text-foreground mb-2">View Records</h1>
          <p className="text-muted-foreground">Manage all person records in the system.</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                All Records ({filteredPersons.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button onClick={() => window.location.href = '/add-person'}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
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
                        {person.tags ? (
                          <div className="flex flex-wrap gap-1">
                            {person.tags.split(',').map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(person.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog open={isEditDialogOpen && editingPerson?.id === person.id} onOpenChange={setIsEditDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(person)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Edit Person Record</DialogTitle>
                                <DialogDescription>
                                  Update the information for {person.firstName} {person.lastName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                      id="firstName"
                                      value={editFormData.firstName || ''}
                                      onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                      id="lastName"
                                      value={editFormData.lastName || ''}
                                      onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                      id="email"
                                      type="email"
                                      value={editFormData.email || ''}
                                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                      id="phone"
                                      value={editFormData.phone || ''}
                                      onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="address">Address</Label>
                                  <Input
                                    id="address"
                                    value={editFormData.address || ''}
                                    onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                  <Input
                                    id="dateOfBirth"
                                    type="date"
                                    value={editFormData.dateOfBirth || ''}
                                    onChange={(e) => setEditFormData({...editFormData, dateOfBirth: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                                  <Input
                                    id="tags"
                                    value={editFormData.tags || ''}
                                    onChange={(e) => setEditFormData({...editFormData, tags: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="notes">Notes</Label>
                                  <Textarea
                                    id="notes"
                                    value={editFormData.notes || ''}
                                    onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                                    rows={3}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleUpdate}>
                                  Update Record
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
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
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ViewRecords;
