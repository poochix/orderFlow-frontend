import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LayoutDashboard, Package, Bot, LogOut, Users, ShieldCheck } from "lucide-react";

import { api } from "@/lib/axios";
import { logout } from "@/features/auth/authSlice";
import { type RootState } from "@/store/store";
import { Button } from "@/components/ui/button";

export default function DashboardLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout"); 
    } catch (error) {
      console.error("Logout failed on server", error);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  const navItems = [
   ...(user?.role !== 'staff' ? [{ name: "Dashboard", path: "/dashboard", icon: LayoutDashboard }] : []),
    { name: "Orders Pool", path: "/orders", icon: Package },
    { name: "AI Quick Parse", path: "/ai-parse", icon: Bot },
    // Show Customers to Admin and Manager roles
    ...(user?.role !== 'staff' ? [{ name: "Customers", path: "/customers", icon: Users }] : []),
    // 🚀 Conditionally render Team Management ONLY for Admins
    ...(user?.role === 'admin' ? [{ name: "Team", path: "/team", icon: ShieldCheck }] : []),
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 flex flex-col">
        <div className="mb-8 px-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">OrderFlow</h1>
          <p className="text-xs text-slate-500 capitalize">{user?.role} Portal</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-200 pt-4 dark:border-slate-800">
          <Button variant="ghost" className="w-full justify-start text-slate-600 dark:text-slate-400" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Dynamic Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}