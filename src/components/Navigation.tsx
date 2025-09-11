import { NavLink } from "react-router-dom";
import { Users, Plus, Search, BarChart3, User } from "lucide-react";

const Navigation = () => {
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: Users },
    { name: "Add Person", path: "/add-person", icon: Plus },
    { name: "Search", path: "/search", icon: Search },
    { name: "Reports", path: "/reports", icon: BarChart3 },
  ];

  return (
    <nav className="bg-navigation text-navigation-foreground shadow-elegant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <User className="h-8 w-8 mr-3" />
              <h1 className="text-xl font-bold">Personal Info System</h1>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`
                  }
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </NavLink>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button className="text-white/80 hover:text-white p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;