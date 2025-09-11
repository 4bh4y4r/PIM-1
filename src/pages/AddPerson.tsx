import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import PersonalInfoSection from "@/components/forms/PersonalInfoSection";
import AddressSection from "@/components/forms/AddressSection";
import ContactSection from "@/components/forms/ContactSection";
import { User } from "lucide-react";

const AddPerson = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    nationalId: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.dateOfBirth || !formData.gender || !formData.nationalId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // In real app, this would submit to backend
    toast({
      title: "Success!",
      description: "Person record has been saved successfully.",
    });

    // Reset form
    setFormData({
      fullName: "",
      dateOfBirth: "",
      gender: "",
      nationalId: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      phone: "",
      email: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Add New Person</h1>
          <p className="text-muted-foreground">Enter the person's information below to create a new record.</p>
        </div>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </CardTitle>
            <CardDescription>
              All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <PersonalInfoSection
                formData={{
                  fullName: formData.fullName,
                  dateOfBirth: formData.dateOfBirth,
                  gender: formData.gender,
                  nationalId: formData.nationalId,
                }}
                handleInputChange={handleInputChange}
              />

              <AddressSection
                formData={{
                  street: formData.street,
                  city: formData.city,
                  state: formData.state,
                  zip: formData.zip,
                }}
                handleInputChange={handleInputChange}
              />

              <ContactSection
                formData={{
                  phone: formData.phone,
                  email: formData.email,
                }}
                handleInputChange={handleInputChange}
              />

              <div className="flex gap-4 pt-6">
                <Button type="submit" className="flex-1">
                  Save Person
                </Button>
                <Button type="button" variant="outline" className="flex-1">
                  Clear Form
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddPerson;