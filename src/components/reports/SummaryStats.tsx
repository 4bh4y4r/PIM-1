import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Calendar, UserCheck } from "lucide-react";

const SummaryStats = () => {
  const summaryStats = [
    {
      title: "Total Records",
      value: "1,247",
      change: "+12%",
      changeType: "increase",
      icon: Users,
      description: "Total people in system",
    },
    {
      title: "New This Month",
      value: "89",
      change: "+23%",
      changeType: "increase",
      icon: TrendingUp,
      description: "Records added this month",
    },
    {
      title: "Active Records",
      value: "1,198",
      change: "96%",
      changeType: "neutral",
      icon: UserCheck,
      description: "Complete profile records",
    },
    {
      title: "Incomplete Records",
      value: "49",
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