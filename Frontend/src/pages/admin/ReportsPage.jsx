import { useState } from "react";
import { BarChart3, Filter, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import Topbar from "../../components/layout/Topbar";
import Loader from "../../components/ui/Loader";
import { reportApi, labRoomApi } from "../../services/authService";
import { apiMessage } from "../../lib/api";
import { useEffect } from "react";

export default function ReportsPage() {
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({
    startDate: getDefaultStart(),
    endDate: getDefaultEnd(),
    labRoomId: "",
  });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    labRoomApi.list({}).then((d) => setRooms(d || []));
  }, []);

  const generate = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const data = await reportApi.generate({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.labRoomId && { labRoomId: filters.labRoomId }),
      });
      setReport(data);
    } catch (err) {
      toast.error(apiMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Topbar
        title="Báo cáo thống kê"
        subtitle="Phân tích hiệu suất sử dụng phòng lab"
      />

      <div className="p-6 space-y-5">
        <form
          onSubmit={generate}
          className="card card-body grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <div>
            <label className="label">Ngày bắt đầu</label>
            <input
              type="date"
              className="input"
              required
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Ngày kết thúc</label>
            <input
              type="date"
              className="input"
              required
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Phòng (tùy chọn)</label>
            <select
              className="input"
              value={filters.labRoomId}
              onChange={(e) =>
                setFilters({ ...filters, labRoomId: e.target.value })
              }
            >
              <option value="">Tất cả</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.room_code} — {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              <Filter size={16} /> Tạo báo cáo
            </button>
          </div>
        </form>

        {loading && <Loader />}

        {report && !loading && (
          <div className="space-y-5">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {report.reservationSummary?.map((s) => (
                <SummaryCard
                  key={s.status}
                  label={STATUS_LABELS[s.status] || s.status}
                  value={s.count}
                />
              ))}
            </div>

            {/* Reservations by room */}
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold text-slate-900">
                  Đặt chỗ theo phòng
                </h3>
              </div>
              <div className="card-body p-0 overflow-x-auto">
                {report.reservationsByRoom?.length === 0 ? (
                  <div className="p-6 text-sm text-slate-500 text-center">
                    Không có dữ liệu.
                  </div>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Phòng</th>
                        <th>Tổng đặt</th>
                        <th>Đã duyệt</th>
                        <th>Từ chối</th>
                        <th>Đã hủy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.reservationsByRoom.map((r) => (
                        <tr key={r.id}>
                          <td>
                            <div className="font-medium text-slate-900">
                              {r.room_code}
                            </div>
                            <div className="text-xs text-slate-500">
                              {r.name}
                            </div>
                          </td>
                          <td className="font-semibold">
                            {r.total_reservations}
                          </td>
                          <td className="text-emerald-700">{r.approved}</td>
                          <td className="text-red-600">{r.rejected}</td>
                          <td className="text-slate-500">{r.cancelled}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Incident summary and categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold text-slate-900">
                    Sự cố theo trạng thái
                  </h3>
                </div>
                <div className="card-body">
                  {report.incidentSummary?.length === 0 ? (
                    <p className="text-sm text-slate-500">Không có dữ liệu.</p>
                  ) : (
                    <div className="space-y-2">
                      {report.incidentSummary.map((s) => (
                        <div
                          key={s.status}
                          className="flex items-center justify-between py-1.5 border-b border-slate-50"
                        >
                          <span className="text-sm text-slate-700">
                            {STATUS_LABELS[s.status] || s.status}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {s.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold text-slate-900">
                    Sự cố theo phân loại
                  </h3>
                </div>
                <div className="card-body">
                  {report.incidentsByCategory?.length === 0 ? (
                    <p className="text-sm text-slate-500">Không có dữ liệu.</p>
                  ) : (
                    <div className="space-y-2">
                      {report.incidentsByCategory.map((c) => (
                        <div
                          key={c.category}
                          className="flex items-center justify-between py-1.5 border-b border-slate-50"
                        >
                          <span className="text-sm text-slate-700">
                            {CATEGORY_LABELS[c.category] || c.category}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {c.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Peak hours */}
            {report.peakHours?.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <TrendingUp size={16} className="text-brand-600" />
                    Giờ cao điểm
                  </h3>
                </div>
                <div className="card-body">
                  <div className="flex items-end gap-1 h-40">
                    {report.peakHours.map((p) => {
                      const max = Math.max(
                        ...report.peakHours.map((x) => x.count),
                      );
                      const pct = (p.count / max) * 100;
                      return (
                        <div
                          key={p.hour}
                          className="flex-1 flex flex-col items-center gap-1"
                        >
                          <span className="text-[10px] text-slate-500 font-medium">
                            {p.count}
                          </span>
                          <div
                            className="w-full rounded-t bg-brand-500/80 transition-all"
                            style={{ height: `${Math.max(pct, 4)}%` }}
                          />
                          <span className="text-[10px] text-slate-500">
                            {String(p.hour).padStart(2, "0")}h
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Workstation failures */}
            {report.workstationFailures?.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold text-slate-900">
                    Máy trạm hay gặp sự cố
                  </h3>
                </div>
                <div className="card-body p-0 overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Máy</th>
                        <th>Phòng</th>
                        <th>Số sự cố</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.workstationFailures.map((w) => (
                        <tr key={w.id}>
                          <td className="font-medium text-slate-900">
                            {w.station_code}
                          </td>
                          <td className="text-sm">
                            {w.room_code} — {w.room_name}
                          </td>
                          <td className="font-semibold text-red-600">
                            {w.incident_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
        {label}
      </div>
      <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
    </div>
  );
}

const STATUS_LABELS = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  cancelled: "Đã hủy",
  completed: "Hoàn tất",
  open: "Mở",
  under_review: "Đang xử lý",
  resolved: "Đã xử lý",
  closed: "Đã đóng",
};

const CATEGORY_LABELS = {
  hardware: "Phần cứng",
  network: "Mạng",
  os: "Hệ điều hành",
  software: "Phần mềm",
};

function getDefaultStart() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

function getDefaultEnd() {
  return new Date().toISOString().slice(0, 10);
}
