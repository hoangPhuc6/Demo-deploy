import { Loader2 } from "lucide-react";

export default function Loader({ label = "Đang tải..." }) {
  return (
    <div className="flex items-center justify-center py-12 text-slate-500 gap-3">
      <Loader2 className="animate-spin" size={22} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({
  title = "Chưa có dữ liệu",
  description,
  icon: Icon,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-4">
          <Icon size={26} />
        </div>
      )}
      <h4 className="text-base font-semibold text-slate-800">{title}</h4>
      {description && (
        <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
