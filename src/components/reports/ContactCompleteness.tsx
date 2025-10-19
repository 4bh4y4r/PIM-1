import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

interface ContactCompletenessData {
  total: number;
  phone: number;
  email: number;
  address: number;
}

const ContactCompleteness = () => {
  const [contactData, setContactData] = useState<ContactCompletenessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token found:', !!token);
        console.log('Token length:', token ? token.length : 0);
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/search/demographics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch contact data: ${response.status} ${response.statusText}`);
        }

        const responseText = await response.text();
        console.log('Contact API Response:', responseText);
        
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('Parsed contact data:', data);
        } catch (parseError) {
          console.error('Response was not JSON:', responseText);
          throw new Error('Server response was not in JSON format. Please check if the server is running.');
        }

        if (!data.demographics || !data.demographics.contactCompleteness) {
          console.error('No contact completeness in response:', data);
          throw new Error('Invalid response format: missing contact completeness data');
        }

        console.log('Setting contact data:', data.demographics.contactCompleteness);
        setContactData(data.demographics.contactCompleteness);
      } catch (err) {
        console.error('Error fetching contact data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch contact completeness data');
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();
  }, []);

  if (loading) {
    return (
      <Card className="shadow-elegant mb-8">
        <CardHeader>
          <div className="flex items-center">
            <div className="h-5 w-5 bg-muted animate-pulse rounded mr-2"></div>
            <div className="h-6 w-48 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="h-4 w-64 bg-muted animate-pulse rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className="h-8 w-8 mx-auto mb-3 bg-muted animate-pulse rounded"></div>
                <div className="h-5 w-24 mx-auto mb-2 bg-muted animate-pulse rounded"></div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                    <div className="h-4 w-8 bg-muted animate-pulse rounded"></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                    <div className="h-4 w-8 bg-muted animate-pulse rounded"></div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="h-5 w-20 mx-auto bg-muted animate-pulse rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
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
          <div className="text-center text-destructive">
            <p className="font-medium">Failed to load contact completeness data</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!contactData) {
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
          <div className="text-center text-muted-foreground">
            <p className="font-medium">No contact completeness data available</p>
            <p className="text-sm mt-1">Unable to load contact completeness statistics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const contactStats = [
    {
      title: "Phone Numbers",
      icon: Phone,
      complete: contactData.phone,
      incomplete: contactData.total - contactData.phone,
      completionRate: contactData.total > 0 ? `${Math.round((contactData.phone / contactData.total) * 100)}%` : "0%",
    },
    {
      title: "Email Addresses",
      icon: Mail,
      complete: contactData.email,
      incomplete: contactData.total - contactData.email,
      completionRate: contactData.total > 0 ? `${Math.round((contactData.email / contactData.total) * 100)}%` : "0%",
    },
    {
      title: "Physical Addresses",
      icon: MapPin,
      complete: contactData.address,
      incomplete: contactData.total - contactData.address,
      completionRate: contactData.total > 0 ? `${Math.round((contactData.address / contactData.total) * 100)}%` : "0%",
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
                    <span className="font-medium text-success">{stat.complete.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Incomplete:</span>
                    <span className="font-medium text-destructive">{stat.incomplete.toLocaleString()}</span>
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