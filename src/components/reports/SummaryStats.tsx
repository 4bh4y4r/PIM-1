import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Calendar, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";

interface StatsData {
  totalPersons: number;
  recentPersons: number;
  activePersons: number;
  incompletePersons: number;
}

const SummaryStats = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/search/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }

        const responseText = await response.text();
        console.log('API Response:', responseText);
        
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('Parsed data:', data);
        } catch (parseError) {
          console.error('Response was not JSON:', responseText);
          throw new Error('Server response was not in JSON format. Please check if the server is running.');
        }

        if (!data.stats) {
          console.error('No stats in response:', data);
          throw new Error('Invalid response format: missing stats data');
        }

        console.log('Setting stats:', data.stats);
        setStats(data.stats);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
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
              <p className="font-medium">Failed to load statistics</p>
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
              <p className="font-medium">No statistics available</p>
              <p className="text-sm mt-1">Unable to load statistics data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summaryStats = [
    {
      title: "Total Records",
      value: (stats.totalPersons || 0).toLocaleString(),
      change: "+12%",
      changeType: "increase",
      icon: Users,
      description: "Total people in system",
    },
    {
      title: "New This Month",
      value: (stats.recentPersons || 0).toLocaleString(),
      change: "+23%",
      changeType: "increase",
      icon: TrendingUp,
      description: "Records added this month",
    },
    {
      title: "Active Records",
      value: (stats.activePersons || 0).toLocaleString(),
      change: stats.totalPersons ? `${Math.round((stats.activePersons / stats.totalPersons) * 100)}%` : "0%",
      changeType: "neutral",
      icon: UserCheck,
      description: "Complete profile records",
    },
    {
      title: "Incomplete Records",
      value: (stats.incompletePersons || 0).toLocaleString(),
      change: "-8%",
      changeType: "decrease",
      icon: Calendar,
      description: "Missing required fields",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {summaryStats.map((stat, index) => {
        const Icon = stat.icon;
        const isIncrease = stat.changeType === "increase";
        const isDecrease = stat.changeType === "decrease";
        
        return (
          <Card key={index} className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  variant={isIncrease ? "default" : isDecrease ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SummaryStats;