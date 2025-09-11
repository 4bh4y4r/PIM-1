import Navigation from "@/components/Navigation";
import SummaryStats from "@/components/reports/SummaryStats";
import DemographicStats from "@/components/reports/DemographicStats";
import ContactCompleteness from "@/components/reports/ContactCompleteness";
import RecentActivity from "@/components/reports/RecentActivity";

const Reports = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">System Reports</h1>
          <p className="text-muted-foreground">Overview of system statistics and data insights.</p>
        </div>

        <SummaryStats />
        <DemographicStats />
        <ContactCompleteness />
        <RecentActivity />
      </main>
    </div>
  );
};

export default Reports;