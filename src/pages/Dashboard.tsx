import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  FileText,
  BarChart,
  Download,
  Filter,
  FileUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Card view removed

interface InfoRecord {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  documentCount: number;
  data: Record<string, any>;
}

interface Stats {
  totalRecords: number;
  lastSubmission: string | null;
  documentsUploaded: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<InfoRecord[]>([]);
  const [stats, setStats] = useState<Stats>({ 
    totalRecords: 0, 
    lastSubmission: null,
    documentsUploaded: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<InfoRecord | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminStats, setAdminStats] = useState({
    totalRecords: 0,
    recordsLast7Days: 0,
    activeRecords: 0,
    inactiveRecords: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is admin (from stored user object)
    const user = localStorage.getItem('user');
    if (user) {
      const u = JSON.parse(user);
      setIsAdmin(u.role === 'ADMIN');
    } else {
      setIsAdmin(false);
    }
    
    fetchRecords();
  }, [window.location.pathname]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // For regular users, fetch all records
      const endpoint = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/persons`;
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Fetch records
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to fetch records: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check if data is an array, if not, handle it appropriately
      const dataArray = Array.isArray(data) ? data : data.persons || [];
      
      // Transform and parse notes into explicit fields for proper display/filtering
      const transformedData = dataArray.map((person: any) => {
        const notes: string = person.notes || '';
        const nationalId = notes.match(/National ID: (.*?)(?:\n|$)/)?.[1] || '';
        const education = notes.match(/Education: (.*?)(?:\n|$)/)?.[1] || '';
        const occupation = notes.match(/Occupation: (.*?)(?:\n|$)/)?.[1] || '';
        const income = notes.match(/Income: (.*?)(?:\n|$)/)?.[1] || '';
        const healthInfo = notes.match(/Health Info: ([\s\S]*?)(?:\n\s*$|$)/)?.[1]?.trim() || '';
        const aadhaarNumber = notes.match(/Aadhaar Number: (.*?)(?:\n|$)/)?.[1] || '';
        const panNumber = notes.match(/PAN Number: (.*?)(?:\n|$)/)?.[1] || '';
        const passportNumber = notes.match(/Passport Number: (.*?)(?:\n|$)/)?.[1] || '';
        const rationCardNumber = notes.match(/Ration Card Number: (.*?)(?:\n|$)/)?.[1] || '';
        const employer = notes.match(/Employer: (.*?)(?:\n|$)/)?.[1] || '';
        const bankAccount = notes.match(/Bank Account: (.*?)(?:\n|$)/)?.[1] || '';
        const ifscCode = notes.match(/IFSC Code: (.*?)(?:\n|$)/)?.[1] || '';
        const taxFilingStatus = notes.match(/Tax Filing Status: (.*?)(?:\n|$)/)?.[1] || '';

        return {
          id: person.id,
          title: `${person.firstName} ${person.lastName}`,
          category: person.tags || 'Personal',
          createdAt: person.createdAt,
          updatedAt: person.updatedAt,
          createdBy: person.createdBy,
          documentCount: 0,
          data: {
            ...person,
            category: person.tags || 'Personal',
            nationalId,
            education,
            occupation,
            income,
            healthInfo,
            aadhaarNumber,
            panNumber,
            passportNumber,
            rationCardNumber,
            employer,
            bankAccount,
            ifscCode,
            taxFilingStatus,
          }
        } as InfoRecord;
      });
      
      setRecords(transformedData);
      
      // Calculate stats
      const stats: Stats = {
        totalRecords: transformedData.length,
        lastSubmission: transformedData.length > 0 ? 
          [...transformedData].sort((a: InfoRecord, b: InfoRecord) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0].createdAt : null,
        documentsUploaded: transformedData.reduce((acc, record) => acc + record.documentCount, 0)
      };
      
      setStats(stats);
      
      // Calculate admin-specific stats
      if (isAdmin) {
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        
        const recordsLast7Days = transformedData.filter((record: InfoRecord) => 
          new Date(record.createdAt) >= sevenDaysAgo
        ).length;
        
        // For this example, we'll consider records created in the last 30 days as "active"
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        
        const activeRecords = transformedData.filter((record: InfoRecord) => 
          new Date(record.createdAt) >= thirtyDaysAgo
        ).length;
        
        const inactiveRecords = transformedData.length - activeRecords;
        
        setAdminStats({
          totalRecords: transformedData.length,
          recordsLast7Days,
          activeRecords,
          inactiveRecords
        });
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError('Failed to load records. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record: InfoRecord) => {
    setViewingRecord(record);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (record: InfoRecord) => {
    navigate(`/edit-info/${record.id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/persons/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete record');
      }

      // Update the local state
      setRecords(records.filter(r => r.id !== id));
      
      toast({
        title: "Success",
        description: "Record deleted successfully",
      });
      
      // Refresh data
      fetchRecords();
    } catch (err) {
      console.error('Error deleting record:', err);
      toast({
        title: "Error",
        description: "Failed to delete record. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadRecord = (id: string) => {
    const record = records.find(r => r.id === id);
    if (!record) return;
    
    // Create a JSON blob from the record data
    const jsonData = JSON.stringify(record.data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.title.replace(/\s+/g, '_')}_data.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "Download Started",
      description: `${record.title} data is being downloaded.`,
    });
  };

  const handleDownload = (record: InfoRecord) => {
    // Create a JSON blob and download it
    const dataStr = JSON.stringify(record.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.title.replace(/\s+/g, '_')}_${record.category}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Record downloaded successfully",
    });
  };

  // Filter records based on search term, categories, and date
  const filteredRecords = records.filter(record => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      record.title.toLowerCase().includes(searchTermLower) ||
      record.category.toLowerCase().includes(searchTermLower) ||
      Object.values(record.data).some(
        value => typeof value === 'string' && value.toLowerCase().includes(searchTermLower)
      );
    
    // Category filter
    let matchesCategory = categoryFilter === 'all';
    
    if (categoryFilter === 'Personal') {
      matchesCategory = record.category === 'Personal' || 
        (record.data && (record.data.firstName || record.data.lastName || record.data.gender));
    } else if (categoryFilter === 'Address') {
      matchesCategory = record.category === 'Address' || 
        (record.data && record.data.address);
    } else if (categoryFilter === 'Identification') {
      matchesCategory = record.category.includes('Identification') || 
        (record.data && (
          record.data.nationalId ||
          record.data.aadhaarNumber ||
          record.data.panNumber ||
          record.data.passportNumber ||
          record.data.rationCardNumber
        ));
    } else if (categoryFilter === 'Education') {
      matchesCategory = record.category === 'Education' || 
        (record.data && record.data.education);
    } else if (categoryFilter === 'Financial') {
      matchesCategory = record.category === 'Financial' || 
        (record.data && (record.data.income || record.data.occupation));
    } else if (categoryFilter === 'Health') {
      matchesCategory = record.category === 'Health' || 
        (record.data && record.data.healthInfo);
    }
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const recordDate = new Date(record.createdAt);
      const now = new Date();
      
      if (dateFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        matchesDate = recordDate >= today;
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        matchesDate = recordDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        matchesDate = recordDate >= monthAgo;
      }
    }
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">{isAdmin ? "Admin Dashboard" : "My Information"}</h1>
          <p className="text-muted-foreground">{isAdmin ? "View reports and statistics about all information records." : "Manage your information and view your activity."}</p>
        </div>

        {/* Summary Stats */}
        {isAdmin ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats.totalRecords}</div>
                <p className="text-xs text-muted-foreground">All records</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats.recordsLast7Days}</div>
                <p className="text-xs text-muted-foreground">New records</p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Records</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats.activeRecords}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactive Records</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats.inactiveRecords}</div>
                <p className="text-xs text-muted-foreground">Older than 30 days</p>
              </CardContent>
            </Card>
            
            {/* Additional admin-only charts or reports could go here */}
            <Card className="shadow-card col-span-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Reports</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-center p-6">
                  <h3 className="text-lg font-medium mb-2">Admin Dashboard</h3>
                  <p className="text-muted-foreground mb-4">
                    This dashboard shows reports and statistics about all information records in the system.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRecords}</div>
                <p className="text-xs text-muted-foreground">Information records</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.lastSubmission 
                    ? new Date(stats.lastSubmission).toLocaleDateString()
                    : 'None'
                  }
                </div>
                <p className="text-xs text-muted-foreground">Most recent update</p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <FileUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.documentsUploaded}</div>
                <p className="text-xs text-muted-foreground">Files uploaded</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Information Records - Only show for regular users */}
        {!isAdmin && (
          <Card className="shadow-card">
            <CardHeader className="border-b border-border/40 pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  My Information
                </CardTitle>
                <Button
                    variant="default" 
                    onClick={() => navigate('/info-form')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Info
                  </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 mt-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search information..."
                      className="pl-8 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Personal">Personal</SelectItem>
                        <SelectItem value="Address">Address</SelectItem>
                        <SelectItem value="Identification">Identification</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Financial">Financial</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="w-[180px]">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">Last 7 Days</SelectItem>
                        <SelectItem value="month">Last 30 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading records...</p>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-64 p-6 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No information found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || categoryFilter !== 'all' || dateFilter !== 'all' 
                      ? 'No records match your search criteria.' 
                      : 'You haven\'t added any information yet.'}
                  </p>
                  {!searchTerm && categoryFilter === 'all' && dateFilter === 'all' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => navigate('/info-form')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Info
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                      {filteredRecords.map((record) => (
                        <div key={record.id} className="p-6 border rounded-lg">
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{record.title}</h2>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEdit(record)}
                              >
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleView(record)}
                              >
                                <User className="h-4 w-4 mr-2" /> View
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 border-red-200 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the record "{record.title}".
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(record.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          
                          {(categoryFilter === 'all' || categoryFilter === 'Personal') && (
                            <div className="mb-4 p-4 border rounded-md">
                              <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><strong>First Name:</strong> {record.data?.firstName || 'N/A'}</div>
                                <div><strong>Last Name:</strong> {record.data?.lastName || 'N/A'}</div>
                                <div><strong>Email:</strong> {record.data?.email || 'N/A'}</div>
                                <div><strong>Phone:</strong> {record.data?.phone || 'N/A'}</div>
                                <div><strong>Gender:</strong> {record.data?.gender || 'N/A'}</div>
                                <div><strong>Date of Birth:</strong> {record.data?.dateOfBirth || 'N/A'}</div>
                              </div>
                            </div>
                          )}
                          
                          {(categoryFilter === 'all' || categoryFilter === 'Address') && (
                            <div className="mb-4 p-4 border rounded-md">
                              <h3 className="text-lg font-medium mb-2">Address Information</h3>
                              <div><strong>Address:</strong> {record.data?.address || 'N/A'}</div>
                            </div>
                          )}
                          
                          {(categoryFilter === 'all' || categoryFilter === 'Identification') && (
                            <div className="mb-4 p-4 border rounded-md">
                              <h3 className="text-lg font-medium mb-2">Identification Information</h3>
                              <div><strong>National ID:</strong> {record.data?.nationalId || 'N/A'}</div>
                            </div>
                          )}
                          
                          {(categoryFilter === 'all' || categoryFilter === 'Education') && (
                            <div className="mb-4 p-4 border rounded-md">
                              <h3 className="text-lg font-medium mb-2">Education Information</h3>
                              <div><strong>Education:</strong> {record.data?.education || 'N/A'}</div>
                            </div>
                          )}
                          
                          {(categoryFilter === 'all' || categoryFilter === 'Financial') && (
                            <div className="mb-4 p-4 border rounded-md">
                              <h3 className="text-lg font-medium mb-2">Financial Information</h3>
                              <div><strong>Occupation:</strong> {record.data?.occupation || 'N/A'}</div>
                              <div><strong>Income:</strong> {record.data?.income || 'N/A'}</div>
                            </div>
                          )}
                          
                          {(categoryFilter === 'all' || categoryFilter === 'Health') && (
                            <div className="mb-4 p-4 border rounded-md">
                              <h3 className="text-lg font-medium mb-2">Health Information</h3>
                              <div><strong>Health Info:</strong> {record.data?.healthInfo || 'N/A'}</div>
                            </div>
                          )}
                          
                          <div className="mt-4 text-sm text-muted-foreground">
                            Added on {new Date(record.createdAt).toLocaleDateString()} • 
                            Category: <Badge variant="outline">{record.category}</Badge>
                          </div>
                        </div>
                      ))}
                  </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{viewingRecord?.title}</DialogTitle>
            <DialogDescription>
              Category: {viewingRecord?.category} | Created: {viewingRecord?.createdAt && new Date(viewingRecord.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {viewingRecord && (
              <div className="space-y-4">
                {Object.entries(viewingRecord.data).map(([key, value]) => {
                  // Skip internal fields
                  if (['id', 'createdAt', 'updatedAt', 'createdBy'].includes(key)) return null;
                  
                  return (
                    <div key={key} className="grid grid-cols-3 gap-4">
                      <div className="text-sm font-medium text-right">{key.charAt(0).toUpperCase() + key.slice(1)}:</div>
                      <div className="col-span-2 text-sm">{value?.toString() || '-'}</div>
                    </div>
                  );
                })}
                
                {viewingRecord.documentCount > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-2">Documents ({viewingRecord.documentCount})</h4>
                    <p className="text-sm text-muted-foreground">Document viewing will be implemented in a future update.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => handleEdit(viewingRecord!)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="default" 
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;