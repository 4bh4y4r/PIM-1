import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const RecentActivity = () => {
  const activities = [
    { label: "New Records", value: "23" },
    { label: "Updates Made", value: "156" },
    { label: "Searches Performed", value: "89" },
    { label: "Reports Generated", value: "12" },
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