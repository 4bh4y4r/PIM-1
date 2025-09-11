import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Mail } from "lucide-react";

interface ContactSectionProps {
  formData: {
    phone: string;
    email: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

const ContactSection = ({ formData, handleInputChange }: ContactSectionProps) => {
  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Enter phone number"
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email address"
              className="pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;