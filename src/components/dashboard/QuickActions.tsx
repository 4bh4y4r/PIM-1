import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, BarChart3 } from "lucide-react";

const QuickActions = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Add New Person",
      description: "Register a new person in the system",
      icon: Plus,
      action: () => navigate("/add-person"),
      color: "bg-primary hover:bg-primary-hover",
    },
    {
      title: "Search Records",
      description: "Find and view existing person records",
      icon: Search,
      action: () => navigate("/search"),
      color: "bg-accent hover:bg-accent/80",
    },
    {
      title: "View Reports",
      description: "Access system reports and statistics",
      icon: BarChart3,
      action: () => navigate("/reports"),
      color: "bg-secondary hover:bg-secondary/80",
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card key={index} className="shadow-card hover:shadow-elegant transition-shadow cursor-pointer" onClick={action.action}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;