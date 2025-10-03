import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Database, Activity } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const AdminDashboard = () => {
  const { user } = useAuth();

  const adminStats = [
    {
      title: "Total Users",
      value: "0",
      description: "Registered users",
      icon: Users,
    },
    {
      title: "Admin Users",
      value: "1",
      description: "Admin accounts",
      icon: Shield,
    },
    {
      title: "Database Records",
      value: "0",
      description: "Total records",
      icon: Database,
    },
    {
      title: "System Status",
      value: "Active",
      description: "All systems operational",
      icon: Activity,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user?.email}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {adminStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Controls</CardTitle>
            <CardDescription>
              Manage system settings and user permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-semibold mb-2">User Management</h3>
                <p className="text-sm text-muted-foreground">
                  View and manage user accounts, roles, and permissions.
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-semibold mb-2">System Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Configure application settings and preferences.
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-semibold mb-2">Database Management</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor and manage database operations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
