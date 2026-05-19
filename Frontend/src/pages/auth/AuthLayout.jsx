import { CircuitBoard } from "lucide-react";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white_0%,transparent_40%),radial-gradient(circle_at_80%_70%,white_0%,transparent_40%)]" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <CircuitBoard size={22} />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">CLMS</div>
              <div className="text-xs text-white/70 leading-tight">
                Computer Lab Management
              </div>
            </div>
          </div>

          <div className="space-y-5 max-w-md">
            <h2 className="text-3xl font-bold leading-tight">
              Quản lý phòng lab thông minh, gọn gàng và tức thời.
            </h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Đặt phòng, quản lý máy trạm, theo dõi sự cố và phân tích hiệu suất
              sử dụng — tất cả trong một nền tảng duy nhất.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-4">
              {[
                ["20+", "Phòng lab"],
                ["500+", "Máy trạm"],
                ["24/7", "Hỗ trợ"],
              ].map(([n, l]) => (
                <div
                  key={l}
                  className="rounded-xl bg-white/10 backdrop-blur px-4 py-3"
                >
                  <div className="text-xl font-bold">{n}</div>
                  <div className="text-xs text-white/70">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-white/60">
            © {new Date().getFullYear()} SE113 Group 10
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
              <CircuitBoard size={20} />
            </div>
            <div>
              <div className="font-bold text-lg">CLMS</div>
              <div className="text-xs text-slate-500">
                Computer Lab Management
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1.5">{subtitle}</p>
          )}

          <div className="mt-8">{children}</div>

          {footer && (
            <div className="mt-6 text-sm text-slate-500 text-center">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
