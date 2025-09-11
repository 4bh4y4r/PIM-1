import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { BarChart3, Users, TrendingUp, Calendar, MapPin, Phone, Mail, UserCheck } from "lucide-react";

const Reports = () => {
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

  const contactStats = [
    {
      title: "Contact Information",
      icon: Phone,
      complete: "1,089",
      incomplete: "158",
      completionRate: "87%",
    },
    {
      title: "Email Addresses",
      icon: Mail,
      complete: "1,156",
      incomplete: "91",
      completionRate: "93%",
    },
    {
      title: "Physical Addresses",
      icon: MapPin,
      complete: "1,023",
      incomplete: "224",
      completionRate: "82%",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">System Reports</h1>
          <p className="text-muted-foreground">Overview of system statistics and data insights.</p>
        </div>

        {/* Summary Statistics */}
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

        {/* Demographic Breakdown */}
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

        {/* Contact Information Completeness */}
        <Card className="shadow-elegant mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Data Completeness Report
            </CardTitle>
            <CardDescription>
              Overview of contact information completeness across all records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contactStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <Icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-2">{stat.title}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Complete:</span>
                        <span className="font-medium text-success">{stat.complete}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Incomplete:</span>
                        <span className="font-medium text-destructive">{stat.incomplete}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <Badge variant="default" className="text-xs">
                          {stat.completionRate} Complete
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Summary */}
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
              <div>
                <div className="text-2xl font-bold text-primary">23</div>
                <div className="text-sm text-muted-foreground">New Records</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">156</div>
                <div className="text-sm text-muted-foreground">Updates Made</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">89</div>
                <div className="text-sm text-muted-foreground">Searches Performed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-sm text-muted-foreground">Reports Generated</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Reports;