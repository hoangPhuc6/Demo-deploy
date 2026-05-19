import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Monitor,
  CalendarClock,
  AlertTriangle,
  Users,
  BarChart3,
  LogOut,
  CircuitBoard,
  ListChecks,
  Inbox,
} from "lucide-react";
import clsx from "clsx";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../services/authService";
import toast from "react-hot-toast";

const NAV = [
  {
    to: "/",
    label: "Tổng quan",
    icon: LayoutDashboard,
    roles: ["customer", "lab_staff", "system_admin"],
  },
  {
    to: "/lab-rooms",
    label: "Phòng lab",
    icon: Building2,
    roles: ["customer", "lab_staff", "system_admin"],
  },
  {
    to: "/workstations",
    label: "Máy trạm",
    icon: Monitor,
    roles: ["customer", "lab_staff", "system_admin"],
  },
  {
    to: "/reservations/my",
    label: "Đặt chỗ của tôi",
    icon: CalendarClock,
    roles: ["customer", "lab_staff", "system_admin"],
  },
  {
    to: "/reservations/queue",
    label: "Hàng chờ duyệt",
    icon: Inbox,
    roles: ["lab_staff", "system_admin"],
  },
  {
    to: "/incidents",
    label: "Sự cố",
    icon: AlertTriangle,
    roles: ["customer", "lab_staff", "system_admin"],
  },
  { to: "/users", label: "Người dùng", icon: Users, roles: ["system_admin"] },
  {
    to: "/reports",
    label: "Báo cáo",
    icon: BarChart3,
    roles: ["system_admin"],
  },
];

export default function Sidebar() {
  const { user, clear } = useAuthStore();
  const navigate = useNavigate();

  const items = NAV.filter((item) => item.roles.includes(user?.role));

  const onLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore
    } finally {
      clear();
      toast.success("Đã đăng xuất");
      navigate("/login");
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="px-5 py-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-sm">
          <CircuitBoard size={20} />
        </div>
        <div>
          <div className="text-base font-bold text-slate-900 leading-tight">
            CLMS
          </div>
          <div className="text-xs text-slate-500 leading-tight">
            Lab Management
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              clsx("nav-link", isActive && "nav-link-active")
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
        >
          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center text-sm">
            {(user?.fullName || user?.username || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">
              {user?.fullName || user?.username}
            </div>
            <div className="text-xs text-slate-500 truncate">{user?.email}</div>
          </div>
        </NavLink>
        <button
          onClick={onLogout}
          className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600 rounded-lg transition"
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
