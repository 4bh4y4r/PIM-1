import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

interface AddressSectionProps {
  formData: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

const AddressSection = ({ formData, handleInputChange }: AddressSectionProps) => {
  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <MapPin className="h-5 w-5 mr-2" />
        Address
      </h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="street">Street Address</Label>
          <Input
            id="street"
            value={formData.street}
            onChange={(e) => handleInputChange("street", e.target.value)}
            placeholder="Enter street address"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              placeholder="Enter city"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              placeholder="Enter state"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip">ZIP Code</Label>
            <Input
              id="zip"
              value={formData.zip}
              onChange={(e) => handleInputChange("zip", e.target.value)}
              placeholder="Enter ZIP"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressSection;