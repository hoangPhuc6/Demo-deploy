import { useAuthStore } from "../../store/authStore";
import { StatusBadge } from "../ui/Badge";

export default function Topbar({ title, subtitle, actions }) {
  const { user } = useAuthStore();
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        {user && (
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden md:block text-slate-600">
              Xin chào,{" "}
              <span className="font-semibold text-slate-900">
                {user.fullName || user.username}
              </span>
            </span>
            <StatusBadge status={user.role} />
          </div>
        )}
      </div>
    </div>
  );
}
