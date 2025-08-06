import { Link, useLocation } from "react-router-dom";
import { FileText, GitCompare } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/formatter",
      label: "JSON格式化",
      icon: FileText,
    },
    {
      path: "/diff",
      label: "JSON对比",
      icon: GitCompare,
    },
  ];

  return (
    <nav className="bg-bj-bg-card border-b border-bj-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold text-bj-text-primary hover:text-bj-accent-blue transition-colors">
              JSON工具箱
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (location.pathname === "/" && item.path === "/formatter");
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-bj-accent-blue text-white shadow-sm"
                        : "text-bj-text-secondary hover:text-bj-text-primary hover:bg-bj-bg-secondary"
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;