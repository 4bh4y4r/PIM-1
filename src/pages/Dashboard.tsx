import Navigation from "@/components/Navigation";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import StatsCards from "@/components/dashboard/StatsCards";
import QuickActions from "@/components/dashboard/QuickActions";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection />
        <StatsCards />
        <QuickActions />
      </main>
    </div>
  );
};

export default Dashboard;