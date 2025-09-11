import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, Search } from "lucide-react";

const StatsCards = () => {
  const stats = [
    {
      title: "Total Records",
      value: "1,247",
      change: "+12% from last month",
      icon: Users,
    },
    {
      title: "New This Week",
      value: "23",
      change: "+3 from last week",
      icon: Plus,
    },
    {
      title: "Active Searches",
      value: "89",
      change: "Today's activity",
      icon: Search,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => {
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