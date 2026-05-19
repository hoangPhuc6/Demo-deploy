import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, pageSize, total, onChange }) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 20)));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-600">
      <div>
        Trang <span className="font-semibold text-slate-900">{page}</span> /{" "}
        {totalPages} • {total} bản ghi
      </div>
      <div className="flex gap-1">
        <button
          className="btn-ghost px-2"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          className="btn-ghost px-2"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
