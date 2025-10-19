import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";

interface DemographicData {
  gender: { Male: number; Female: number; Other: number };
  ageGroups: { '18-25': number; '26-35': number; '36-45': number; '46-55': number; '55+': number };
  topCities: Array<{ city: string; count: number }>;
}

const DemographicStats = () => {
  const [demographics, setDemographics] = useState<DemographicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDemographics = async () => {
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
          throw new Error(`Failed to fetch demographics: ${response.status} ${response.statusText}`);
        }

        const responseText = await response.text();
        console.log('Demographics API Response:', responseText);
        
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('Parsed demographics data:', data);
        } catch (parseError) {
          console.error('Response was not JSON:', responseText);
          throw new Error('Server response was not in JSON format. Please check if the server is running.');
        }

        if (!data.demographics) {
          console.error('No demographics in response:', data);
          throw new Error('Invalid response format: missing demographics data');
        }

        console.log('Setting demographics:', data.demographics);
        setDemographics(data.demographics);
      } catch (err) {
        console.error('Error fetching demographics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch demographic statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDemographics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="shadow-elegant">
            <CardHeader>
              <div className="flex items-center">
                <div className="h-5 w-5 bg-muted animate-pulse rounded mr-2"></div>
                <div className="h-5 w-20 bg-muted animate-pulse rounded"></div>
              </div>
              <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, statIndex) => (
                  <div key={statIndex} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-muted animate-pulse rounded-full"></div>
                      <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-8 bg-muted animate-pulse rounded"></div>
                      <div className="h-5 w-8 bg-muted animate-pulse rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <Card className="shadow-elegant">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="font-medium">Failed to load demographic statistics</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!demographics) {
    return (
      <div className="mb-8">
        <Card className="shadow-elegant">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p className="font-medium">No demographic data available</p>
              <p className="text-sm mt-1">Unable to load demographic statistics</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate totals and percentages
  const genderTotal = demographics.gender.Male + demographics.gender.Female + demographics.gender.Other;
  const ageTotal = Object.values(demographics.ageGroups).reduce((sum, count) => sum + count, 0);
  const cityTotal = demographics.topCities.reduce((sum, city) => sum + city.count, 0);

  const demographicStats = [
    {
      title: "By Gender",
      stats: [
        { label: "Male", value: demographics.gender.Male.toString(), percentage: genderTotal > 0 ? `${Math.round((demographics.gender.Male / genderTotal) * 100)}%` : "0%" },
        { label: "Female", value: demographics.gender.Female.toString(), percentage: genderTotal > 0 ? `${Math.round((demographics.gender.Female / genderTotal) * 100)}%` : "0%" },
        { label: "Other", value: demographics.gender.Other.toString(), percentage: genderTotal > 0 ? `${Math.round((demographics.gender.Other / genderTotal) * 100)}%` : "0%" },
      ],
    },
    {
      title: "By Age Group",
      stats: Object.entries(demographics.ageGroups).map(([ageGroup, count]) => ({
        label: ageGroup,
        value: count.toString(),
        percentage: ageTotal > 0 ? `${Math.round((count / ageTotal) * 100)}%` : "0%"
      })),
    },
    {
      title: "Top Cities",
      stats: demographics.topCities.map(city => ({
        label: city.city,
        value: city.count.toString(),
        percentage: cityTotal > 0 ? `${Math.round((city.count / cityTotal) * 100)}%` : "0%"
      })),
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {demographicStats.map((category, index) => (
        <Card key={index} className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              {category.title}
            </CardTitle>
            <CardDescription>Distribution breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {category.stats.map((stat, statIndex) => (
                <div key={statIndex} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium">{stat.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold">{stat.value}</span>
                    <Badge variant="outline" className="text-xs">
                      {stat.percentage}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DemographicStats;