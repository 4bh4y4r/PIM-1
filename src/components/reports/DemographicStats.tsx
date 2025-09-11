import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

const DemographicStats = () => {
  const demographicStats = [
    {
      title: "By Gender",
      stats: [
        { label: "Male", value: "612", percentage: "49%" },
        { label: "Female", value: "598", percentage: "48%" },
        { label: "Other", value: "37", percentage: "3%" },
      ],
    },
    {
      title: "By Age Group",
      stats: [
        { label: "18-25", value: "234", percentage: "19%" },
        { label: "26-35", value: "412", percentage: "33%" },
        { label: "36-45", value: "287", percentage: "23%" },
        { label: "46-55", value: "198", percentage: "16%" },
        { label: "55+", value: "116", percentage: "9%" },
      ],
    },
    {
      title: "Top Cities",
      stats: [
        { label: "New York", value: "287", percentage: "23%" },
        { label: "Los Angeles", value: "156", percentage: "13%" },
        { label: "Chicago", value: "134", percentage: "11%" },
        { label: "Houston", value: "98", percentage: "8%" },
        { label: "Phoenix", value: "87", percentage: "7%" },
      ],
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