import { NavLink, useNavigate } from "react-router-dom";
import { Users, Plus, Search, BarChart3, User, LogOut, ArrowLeft, Eye, UserCircle, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

const Navigation = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setIsAdmin(userData.role === 'ADMIN');
      setUsername(userData.username || userData.email);
    }
  }, []);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: Users },
    { name: "Profile", path: "/profile", icon: Settings },
  ];

  if (!isAdmin) {
    navItems.splice(1, 0, { name: "Add Info", path: "/add-person", icon: Plus });
  }

  if (isAdmin) {
    navItems.push(
      { name: "Search", path: "/search", icon: Search },
      { name: "Reports", path: "/reports", icon: BarChart3 },
      { name: "View Records", path: "/view-records", icon: Eye },
      { name: "User Management", path: "/user-management", icon: User }
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <nav className="bg-navigation text-navigation-foreground shadow-elegant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack} 
              className="mr-2 text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold">Person Hub</h1>
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

          {/* User menu */}
          <div className="hidden md:flex items-center">
            <span className="text-sm mr-4">{username}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-white/80 hover:text-white hover:bg-white/10 flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
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