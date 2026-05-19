import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Monitor,
  CalendarClock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Topbar from "../components/layout/Topbar";
import Loader from "../components/ui/Loader";
import { StatusBadge } from "../components/ui/Badge";
import { useAuthStore } from "../store/authStore";
import {
  labRoomApi,
  workstationApi,
  reservationApi,
  incidentApi,
} from "../services/authService";
import { fmtDateTime } from "../lib/utils";

function StatCard({ label, value, hint, icon: Icon, tone = "brand" }) {
  const tones = {
    brand: "bg-brand-50 text-brand-700",
    green: "bg-emerald-50 text-emerald-700",
    yellow: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <div className="card card-body flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${tones[tone]}`}
      >
        <Icon size={22} />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
          {label}
        </div>
        <div className="text-2xl font-bold text-slate-900 leading-tight">
          {value}
        </div>
        {hint && <div className="text-xs text-slate-500 mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isStaff = user?.role === "lab_staff" || user?.role === "system_admin";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const requests = [
          labRoomApi.list({}),
          workstationApi.list({}),
          reservationApi.myReservations({ pageSize: 5 }),
        ];
        if (isStaff) {
          requests.push(reservationApi.queue({ pageSize: 5 }));
          requests.push(incidentApi.list({ status: "open", pageSize: 5 }));
        }
        const results = await Promise.all(requests);
        if (cancelled) return;
        const [rooms, workstations, mine, queue, openIncidents] = results;
        setData({
          rooms,
          workstations,
          mine,
          queue,
          openIncidents,
        });
      } catch (e) {
        // toast handled by interceptor
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isStaff]);

  if (loading || !data) {
    return (
      <>
        <Topbar title="Tổng quan" subtitle="Chào mừng quay trở lại CLMS" />
        <div className="p-6">
          <Loader />
        </div>
      </>
    );
  }

  const { rooms, workstations, mine, queue, openIncidents } = data;
  const availableWs = workstations.filter((w) => w.state === "available");
  const upcoming = (mine.data || [])
    .filter(
      (r) =>
        ["pending", "approved"].includes(r.status) &&
        new Date(r.end_time) > new Date(),
    )
    .slice(0, 5);

  return (
    <>
      <Topbar
        title={`Xin chào, ${user?.fullName || user?.username} 👋`}
        subtitle="Đây là bức tranh tổng quan về hệ thống lab hôm nay"
      />

      <div className="p-6 space-y-6">
        {/* Hero banner */}
        <div className="rounded-2xl bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-700 text-white p-6 sm:p-7 shadow-card flex items-center justify-between gap-6 flex-wrap">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Sparkles size={16} /> Bắt đầu nhanh
            </div>
            <h2 className="mt-1 text-2xl font-bold leading-tight">
              Đặt phòng hoặc máy trạm chỉ với vài cú click
            </h2>
            <p className="text-sm text-white/80 mt-1.5">
              Duyệt phòng còn trống theo khung giờ, hoặc chọn máy trạm phù hợp
              cấu hình.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/lab-rooms"
              className="bg-white text-brand-700 hover:bg-white/90 btn px-4"
            >
              Đặt phòng <ArrowRight size={16} />
            </Link>
            <Link
              to="/workstations"
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20 btn px-4"
            >
              Đặt máy trạm
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Building2}
            label="Phòng lab"
            value={rooms.length}
            hint={`${rooms.filter((r) => r.status === "active").length} đang hoạt động`}
            tone="brand"
          />
          <StatCard
            icon={Monitor}
            label="Máy trạm"
            value={workstations.length}
            hint={`${availableWs.length} sẵn sàng`}
            tone="green"
          />
          <StatCard
            icon={CalendarClock}
            label="Đặt chỗ của tôi"
            value={mine.metadata?.total ?? mine.data?.length ?? 0}
            hint={`${upcoming.length} sắp tới`}
            tone="yellow"
          />
          {isStaff ? (
            <StatCard
              icon={AlertTriangle}
              label="Sự cố mở"
              value={openIncidents?.metadata?.total ?? 0}
              hint={`${queue?.metadata?.total ?? 0} chờ duyệt`}
              tone="red"
            />
          ) : (
            <StatCard
              icon={AlertTriangle}
              label="Sự cố"
              value="—"
              hint="Báo sự cố nếu gặp vấn đề"
              tone="red"
            />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Upcoming reservations */}
          <div className="card lg:col-span-2">
            <div className="card-header">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Đặt chỗ sắp tới
                </h3>
                <p className="text-xs text-slate-500">
                  Lịch sử và lịch đặt gần nhất của bạn
                </p>
              </div>
              <Link
                to="/reservations/my"
                className="text-sm text-brand-600 hover:underline"
              >
                Xem tất cả
              </Link>
            </div>
            <div className="card-body p-0">
              {upcoming.length === 0 ? (
                <div className="p-6 text-sm text-slate-500 text-center">
                  Bạn chưa có đặt chỗ nào sắp tới.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {upcoming.map((r) => (
                    <li
                      key={r.id}
                      className="p-4 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 truncate">
                          {r.resource_type === "lab_room"
                            ? `Phòng ${r.lab_room?.room_code} — ${r.lab_room?.name}`
                            : `Máy ${r.workstation?.station_code} (${r.workstation?.lab_room?.room_code})`}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {fmtDateTime(r.start_time)} →{" "}
                          {fmtDateTime(r.end_time)}
                        </div>
                      </div>
                      <StatusBadge status={r.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Quick lab rooms */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-slate-900">
                Phòng đang hoạt động
              </h3>
              <Link
                to="/lab-rooms"
                className="text-sm text-brand-600 hover:underline"
              >
                Xem
              </Link>
            </div>
            <div className="card-body p-0">
              <ul className="divide-y divide-slate-100">
                {rooms
                  .filter((r) => r.status === "active")
                  .slice(0, 6)
                  .map((r) => (
                    <li
                      key={r.id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 truncate">
                          {r.room_code}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {r.name} • {r.workstation_count}/{r.capacity} máy
                        </div>
                      </div>
                      <Link
                        to={`/lab-rooms/${r.id}`}
                        className="text-xs text-brand-600 hover:underline"
                      >
                        Chi tiết
                      </Link>
                    </li>
                  ))}
                {rooms.length === 0 && (
                  <li className="p-4 text-sm text-slate-500 text-center">
                    Chưa có phòng nào.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
