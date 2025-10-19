import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalRecords: number;
  newThisWeek: number;
  activeSearches: number;
  totalSearches: number;
}

const StatsCards = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token found:', !!token);
        console.log('Token length:', token ? token.length : 0);
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/search/dashboard`, {
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
          throw new Error(`Failed to fetch dashboard stats: ${response.status} ${response.statusText}`);
        }

        const responseText = await response.text();
        console.log('Dashboard API Response:', responseText);
        
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('Parsed dashboard data:', data);
        } catch (parseError) {
          console.error('Response was not JSON:', responseText);
          throw new Error('Server response was not in JSON format. Please check if the server is running.');
        }

        if (!data.dashboardStats) {
          console.error('No dashboard stats in response:', data);
          throw new Error('Invalid response format: missing dashboard stats data');
        }

        console.log('Setting dashboard stats:', data.dashboardStats);
        setStats(data.dashboardStats);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2"></div>
              <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="font-medium">Failed to load dashboard statistics</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="mb-8">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p className="font-medium">No dashboard data available</p>
              <p className="text-sm mt-1">Unable to load dashboard statistics</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Records",
      value: stats.totalRecords.toLocaleString(),
      change: "+12% from last month",
      icon: Users,
    },
    {
      title: "New This Week",
      value: stats.newThisWeek.toLocaleString(),
      change: "+3 from last week",
      icon: Plus,
    },
    {
      title: "Active Searches",
      value: stats.activeSearches.toLocaleString(),
      change: "Today's activity",
      icon: Search,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;