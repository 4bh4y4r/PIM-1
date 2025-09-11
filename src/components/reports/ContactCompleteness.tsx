import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin } from "lucide-react";

const ContactCompleteness = () => {
  const contactStats = [
    {
      title: "Contact Information",
      icon: Phone,
      complete: "1,089",
      incomplete: "158",
      completionRate: "87%",
    },
    {
      title: "Email Addresses",
      icon: Mail,
      complete: "1,156",
      incomplete: "91",
      completionRate: "93%",
    },
    {
      title: "Physical Addresses",
      icon: MapPin,
      complete: "1,023",
      incomplete: "224",
      completionRate: "82%",
    },
  ];

  return (
    <Card className="shadow-elegant mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Phone className="h-5 w-5 mr-2" />
          Data Completeness Report
        </CardTitle>
        <CardDescription>
          Overview of contact information completeness across all records
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center p-4 border rounded-lg">
                <Icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">{stat.title}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Complete:</span>
                    <span className="font-medium text-success">{stat.complete}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Incomplete:</span>
                    <span className="font-medium text-destructive">{stat.incomplete}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <Badge variant="default" className="text-xs">
                      {stat.completionRate} Complete
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactCompleteness;