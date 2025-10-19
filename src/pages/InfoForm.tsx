import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  User, 
  Home, 
  FileText, 
  Briefcase, 
  DollarSign, 
  Heart, 
  Upload,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const InfoForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["personal"]);
  
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchRecordData(id);
    }
  }, [id]);
  
  const fetchRecordData = async (recordId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/persons/${recordId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch record data');
      }
      
      const data = await response.json();
      
      // Parse address and notes fields
      let street = '', city = '', state = '', zip = '';
      if (data.address) {
        const addressParts = data.address.split(',');
        street = addressParts[0]?.trim() || '';
        city = addressParts[1]?.trim() || '';
        const stateZip = addressParts[2]?.trim().split(' ') || [];
        state = stateZip[0] || '';
        zip = stateZip[1] || '';
      }
      
      // Parse notes field
      let gender = '', nationalId = '', education = '', occupation = '', income = '', healthInfo = '';
      let aadhaarNumber = '', panNumber = '', passportNumber = '', rationCardNumber = '';
      let employer = '', bankAccount = '', ifscCode = '', taxFilingStatus = '';
      let bloodGroup = '', allergies = '', medicalConditions = '';
      if (data.notes) {
        const notes = data.notes;
        gender = notes.match(/Gender: (.*?)(?:\n|$)/)?.[1] || '';
        nationalId = notes.match(/National ID: (.*?)(?:\n|$)/)?.[1] || '';
        education = notes.match(/Education: (.*?)(?:\n|$)/)?.[1] || '';
        occupation = notes.match(/Occupation: (.*?)(?:\n|$)/)?.[1] || '';
        income = notes.match(/Income: (.*?)(?:\n|$)/)?.[1] || '';
        healthInfo = notes.match(/Health Info: (.*?)(?:\n|$)/)?.[1] || '';
        aadhaarNumber = notes.match(/Aadhaar Number: (.*?)(?:\n|$)/)?.[1] || '';
        panNumber = notes.match(/PAN Number: (.*?)(?:\n|$)/)?.[1] || '';
        passportNumber = notes.match(/Passport Number: (.*?)(?:\n|$)/)?.[1] || '';
        rationCardNumber = notes.match(/Ration Card Number: (.*?)(?:\n|$)/)?.[1] || '';
        employer = notes.match(/Employer: (.*?)(?:\n|$)/)?.[1] || '';
        bankAccount = notes.match(/Bank Account: (.*?)(?:\n|$)/)?.[1] || '';
        ifscCode = notes.match(/IFSC Code: (.*?)(?:\n|$)/)?.[1] || '';
        taxFilingStatus = notes.match(/Tax Filing Status: (.*?)(?:\n|$)/)?.[1] || '';
        bloodGroup = notes.match(/Blood Group: (.*?)(?:\n|$)/)?.[1] || '';
        allergies = notes.match(/Allergies: (.*?)(?:\n|$)/)?.[1] || '';
        medicalConditions = notes.match(/Medical Conditions: ([\s\S]*?)(?:\n\s*$|$)/)?.[1]?.trim() || '';
      }
      
      setFormData(prev => ({
        ...prev,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        dateOfBirth: data.dateOfBirth ? String(data.dateOfBirth).split('T')[0] : '',
        gender,
        email: data.email || '',
        phone: data.phone || '',
        nationalId,
        aadhaarNumber,
        panNumber,
        passportNumber,
        rationCardNumber,
        street,
        city,
        state,
        zip,
        education,
        occupation,
        employer,
        bankAccount,
        ifscCode,
        taxFilingStatus,
        income,
        healthInfo,
        bloodGroup,
        allergies,
        medicalConditions,
        // keep documents array defined to avoid render crash
        documents: prev.documents || []
      }));
      
    } catch (error) {
      console.error('Error fetching record:', error);
      toast({
        title: 'Error',
        description: 'Failed to load record data. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  const [formData, setFormData] = useState({
    // Personal details
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    phone: "",
    
    // Identification documents
    aadhaarNumber: "",
    panNumber: "",
    passportNumber: "",
    rationCardNumber: "",
    nationalId: "",
    
    // Address info
    street: "",
    city: "",
    state: "",
    zip: "",
    
    // Education & employment
    education: "",
    occupation: "",
    employer: "",
    
    // Financial/tax details
    bankAccount: "",
    ifscCode: "",
    taxFilingStatus: "",
    
    // Health details
    bloodGroup: "",
    allergies: "",
    medicalConditions: "",
    
    // Document uploads
    documents: [] as File[],
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...newFiles]
      }));
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields in the Personal Details section.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to add information.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
      
      // Derive categories based on filled sections
      const categories: string[] = [];
      // Personal
      if (
        formData.firstName ||
        formData.lastName ||
        formData.dateOfBirth ||
        formData.gender ||
        formData.email ||
        formData.phone
      ) {
        categories.push('Personal');
      }
      // Identification
      if (
        formData.aadhaarNumber ||
        formData.panNumber ||
        formData.passportNumber ||
        formData.rationCardNumber ||
        formData.nationalId
      ) {
        categories.push('Identification');
      }
      // Address
      if (formData.street || formData.city || formData.state || formData.zip) {
        categories.push('Address');
      }
      // Education & Employment
      if (formData.education || formData.occupation || formData.employer) {
        categories.push('Education');
      }
      // Financial/Tax
      if (formData.bankAccount || formData.ifscCode || formData.taxFilingStatus) {
        categories.push('Financial');
      }
      // Health
      if (formData.bloodGroup || formData.allergies || formData.medicalConditions) {
        categories.push('Health');
      }
      // Documents
      if (formData.documents && formData.documents.length > 0) {
        categories.push('Documents');
      }

      // Ensure at least Personal if nothing detected
      if (categories.length === 0) {
        categories.push('Personal');
      }

      // Also explicitly add Identification if any identification inputs are filled
      if (
        formData.aadhaarNumber ||
        formData.panNumber ||
        formData.passportNumber ||
        formData.rationCardNumber ||
        formData.nationalId
      ) {
        if (!categories.includes('Identification')) categories.push('Identification');
      }

      // Format the data to match the expected API format
      const personData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        phone: formData.phone,
        email: formData.email,
        address: `${formData.street || ''}, ${formData.city || ''}, ${formData.state || ''} ${formData.zip || ''}`.trim(),
        notes: `
          Gender: ${formData.gender || ''}
          National ID: ${formData.nationalId || ''}
          Education: ${formData.education || ''}
          Occupation: ${formData.occupation || ''}
          Employer: ${formData.employer || ''}
          Income: ${formData.income || ''}
          Bank Account: ${formData.bankAccount || ''}
          IFSC Code: ${formData.ifscCode || ''}
          Tax Filing Status: ${formData.taxFilingStatus || ''}
          Aadhaar Number: ${formData.aadhaarNumber || ''}
          PAN Number: ${formData.panNumber || ''}
          Passport Number: ${formData.passportNumber || ''}
          Ration Card Number: ${formData.rationCardNumber || ''}
          Blood Group: ${formData.bloodGroup || ''}
          Allergies: ${formData.allergies || ''}
          Medical Conditions: ${formData.medicalConditions || ''}
          Health Info: ${formData.healthInfo || ''}
        `.trim(),
        tags: categories.join(', ')
      };
      
      // Set the API endpoint and method based on whether we're editing or creating
      const url = isEditMode 
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/persons/${id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/persons`;
        
      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(personData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to save information');
      }
      
      const data = await response.json();
      
      toast({
        title: "Success!",
        description: "Information has been saved successfully.",
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error saving information:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Navigation />
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{isEditMode ? 'Edit Information' : 'Add New Information'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Accordion type="multiple" value={expandedSections} className="w-full">
                {/* Personal Details Section */}
                <AccordionItem value="personal">
                  <AccordionTrigger onClick={() => toggleSection("personal")} className="py-4">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <span>Personal Details</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                        <Input 
                          id="firstName" 
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                        <Input 
                          id="lastName" 
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input 
                          id="dateOfBirth" 
                          type="date" 
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select 
                          value={formData.gender} 
                          onValueChange={(value) => handleInputChange("gender", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Identification Documents Section */}
                <AccordionItem value="identification">
                  <AccordionTrigger onClick={() => toggleSection("identification")} className="py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <span>Identification Documents</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                        <Input 
                          id="aadhaarNumber" 
                          value={formData.aadhaarNumber}
                          onChange={(e) => handleInputChange("aadhaarNumber", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="panNumber">PAN Number</Label>
                        <Input 
                          id="panNumber" 
                          value={formData.panNumber}
                          onChange={(e) => handleInputChange("panNumber", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="passportNumber">Passport Number</Label>
                        <Input 
                          id="passportNumber" 
                          value={formData.passportNumber}
                          onChange={(e) => handleInputChange("passportNumber", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rationCardNumber">Ration Card Number</Label>
                        <Input 
                          id="rationCardNumber" 
                          value={formData.rationCardNumber}
                          onChange={(e) => handleInputChange("rationCardNumber", e.target.value)}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Address Section */}
                <AccordionItem value="address">
                  <AccordionTrigger onClick={() => toggleSection("address")} className="py-4">
                    <div className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      <span>Address Information</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input 
                          id="street" 
                          value={formData.street}
                          onChange={(e) => handleInputChange("street", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input 
                          id="city" 
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input 
                          id="state" 
                          value={formData.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input 
                          id="zip" 
                          value={formData.zip}
                          onChange={(e) => handleInputChange("zip", e.target.value)}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Education & Employment Section */}
                <AccordionItem value="education">
                  <AccordionTrigger onClick={() => toggleSection("education")} className="py-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      <span>Education & Employment</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <Label htmlFor="education">Education</Label>
                        <Input 
                          id="education" 
                          value={formData.education}
                          onChange={(e) => handleInputChange("education", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input 
                          id="occupation" 
                          value={formData.occupation}
                          onChange={(e) => handleInputChange("occupation", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employer">Employer</Label>
                        <Input 
                          id="employer" 
                          value={formData.employer}
                          onChange={(e) => handleInputChange("employer", e.target.value)}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Financial Section */}
                <AccordionItem value="financial">
                  <AccordionTrigger onClick={() => toggleSection("financial")} className="py-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      <span>Financial/Tax Details</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <Label htmlFor="bankAccount">Bank Account Number</Label>
                        <Input 
                          id="bankAccount" 
                          value={formData.bankAccount}
                          onChange={(e) => handleInputChange("bankAccount", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ifscCode">IFSC Code</Label>
                        <Input 
                          id="ifscCode" 
                          value={formData.ifscCode}
                          onChange={(e) => handleInputChange("ifscCode", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="taxFilingStatus">Tax Filing Status</Label>
                        <Select 
                          value={formData.taxFilingStatus} 
                          onValueChange={(value) => handleInputChange("taxFilingStatus", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="huf">HUF</SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                            <SelectItem value="firm">Firm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Health Section */}
                <AccordionItem value="health">
                  <AccordionTrigger onClick={() => toggleSection("health")} className="py-4">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      <span>Health Details</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <Label htmlFor="bloodGroup">Blood Group</Label>
                        <Select 
                          value={formData.bloodGroup} 
                          onValueChange={(value) => handleInputChange("bloodGroup", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="allergies">Allergies</Label>
                        <Input 
                          id="allergies" 
                          value={formData.allergies}
                          onChange={(e) => handleInputChange("allergies", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="medicalConditions">Medical Conditions</Label>
                        <Textarea 
                          id="medicalConditions" 
                          value={formData.medicalConditions}
                          onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Document Uploads Section (hide for admins) */}
                {(() => {
                  const user = localStorage.getItem('user');
                  const isAdmin = user && JSON.parse(user).role === 'ADMIN';
                  return !isAdmin ? (
                    <AccordionItem value="documents">
                      <AccordionTrigger onClick={() => toggleSection("documents")} className="py-4">
                        <div className="flex items-center gap-2">
                          <Upload className="h-5 w-5" />
                          <span>Document Uploads</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 mb-6">
                          <div className="space-y-2">
                            <Label htmlFor="documents">Upload Documents (PDF, JPG)</Label>
                            <Input 
                              id="documents" 
                              type="file" 
                              multiple
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleFileChange}
                              className="cursor-pointer"
                            />
                          </div>
                          {formData.documents && formData.documents.length > 0 && (
                            <div className="space-y-2">
                              <Label>Uploaded Files</Label>
                              <ul className="list-disc pl-5">
                                {formData.documents.map((file, index) => (
                                  <li key={index} className="text-sm">
                                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ) : null;
                })()}
              </Accordion>

              <div className="flex justify-end mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Information"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InfoForm;