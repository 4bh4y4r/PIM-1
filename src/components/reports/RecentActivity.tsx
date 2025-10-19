import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";

interface ActivitySummary {
  newRecords: number;
  updatesMade: number;
  searchesPerformed: number;
  reportsGenerated: number;
}

const RecentActivity = () => {
  const [activityData, setActivityData] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token found:', !!token);
        console.log('Token length:', token ? token.length : 0);
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/activities/stats`, {
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
          throw new Error(`Failed to fetch activity data: ${response.status} ${response.statusText}`);
        }

        const responseText = await response.text();
        console.log('Activity API Response:', responseText);
        
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('Parsed activity data:', data);
        } catch (parseError) {
          console.error('Response was not JSON:', responseText);
          throw new Error('Server response was not in JSON format. Please check if the server is running.');
        }

        console.log('Full response data:', data);
        console.log('Stats object:', data.stats);
        
        if (!data.stats) {
          console.error('No stats in response:', data);
          throw new Error('Invalid response format: missing stats data');
        }

        // Check if we have the new structure or need to use the old structure
        if (data.stats.recentActivitySummary) {
          console.log('Using new activity summary structure');
          setActivityData(data.stats.recentActivitySummary);
        } else {
          console.log('Using fallback structure - creating activity summary from available data');
          // Create activity summary from available data
          const activitySummary = {
            newRecords: data.stats.byAction?.find((item: any) => item.action === 'CREATE')?.count || 0,
            updatesMade: data.stats.byAction?.find((item: any) => item.action === 'UPDATE')?.count || 0,
            searchesPerformed: 0, // Will be 0 if not tracked
            reportsGenerated: 0    // Will be 0 if not tracked
          };
          console.log('Created activity summary:', activitySummary);
          setActivityData(activitySummary);
        }
      } catch (err) {
        console.error('Error fetching activity data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch activity statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, []);

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center">
            <div className="h-5 w-5 bg-muted animate-pulse rounded mr-2"></div>
            <div className="h-6 w-48 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="h-4 w-64 bg-muted animate-pulse rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            {[...Array(4)].map((_, index) => (
              <div key={index}>
                <div className="h-8 w-12 bg-muted animate-pulse rounded mx-auto mb-2"></div>
                <div className="h-4 w-20 bg-muted animate-pulse rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Recent Activity Summary
          </CardTitle>
          <CardDescription>System activity over the past 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive">
            <p className="font-medium">Failed to load activity data</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activityData) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Recent Activity Summary
          </CardTitle>
          <CardDescription>System activity over the past 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <p className="font-medium">No activity data available</p>
            <p className="text-sm mt-1">Unable to load activity statistics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activities = [
    { label: "New Records", value: activityData.newRecords.toLocaleString() },
    { label: "Updates Made", value: activityData.updatesMade.toLocaleString() },
    { label: "Searches Performed", value: activityData.searchesPerformed.toLocaleString() },
    { label: "Reports Generated", value: activityData.reportsGenerated.toLocaleString() },
  ];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Recent Activity Summary
        </CardTitle>
        <CardDescription>System activity over the past 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          {activities.map((activity, index) => (
            <div key={index}>
              <div className="text-2xl font-bold text-primary">{activity.value}</div>
              <div className="text-sm text-muted-foreground">{activity.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;