import { useEffect, useState } from "react";
import { Inbox, Check, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Topbar from "../../components/layout/Topbar";
import Loader, { EmptyState } from "../../components/ui/Loader";
import Pagination from "../../components/ui/Pagination";
import Modal from "../../components/ui/Modal";
import { StatusBadge } from "../../components/ui/Badge";
import { reservationApi } from "../../services/authService";
import { apiMessage } from "../../lib/api";
import { fmtDateTime } from "../../lib/utils";

export default function ReservationQueuePage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rejecting, setRejecting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await reservationApi.queue({ page, pageSize: 20 });
      setItems(res.data || []);
      setMeta(res.metadata || { total: 0, page: 1, pageSize: 20 });
    } catch (err) {
      toast.error(apiMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const onApprove = async (r) => {
    try {
      await reservationApi.approve(r.id);
      toast.success("Đã duyệt");
      load();
    } catch (err) {
      toast.error(apiMessage(err));
    }
  };

  return (
    <>
      <Topbar
        title="Hàng chờ duyệt"
        subtitle="Xem xét và xử lý yêu cầu đặt phòng, máy"
      />

      <div className="p-6">
        <div className="card">
          {loading ? (
            <Loader />
          ) : items.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Hàng chờ trống"
              description="Hiện không có yêu cầu nào đang chờ duyệt."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Người gửi</th>
                    <th>Tài nguyên</th>
                    <th>Khung giờ</th>
                    <th>Thông tin thêm</th>
                    <th>Trạng thái</th>
                    <th className="text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="font-medium text-slate-900">
                          {r.user?.full_name || r.user?.username || "—"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {r.user?.email}
                        </div>
                      </td>
                      <td>
                        <div className="font-medium text-slate-900">
                          {r.resource_type === "lab_room"
                            ? `Phòng ${r.lab_room?.room_code}`
                            : `Máy ${r.workstation?.station_code}`}
                        </div>
                        <div className="text-xs text-slate-500">
                          {r.resource_type === "lab_room"
                            ? r.lab_room?.name
                            : r.workstation?.lab_room?.room_code}
                        </div>
                      </td>
                      <td className="text-sm">
                        <div>{fmtDateTime(r.start_time)}</div>
                        <div className="text-xs text-slate-500">
                          → {fmtDateTime(r.end_time)}
                        </div>
                      </td>
                      <td className="max-w-[200px]">
                        {r.resource_type === "lab_room" && (
                          <>
                            <div className="text-sm text-slate-700 truncate">
                              {r.purpose || "—"}
                            </div>
                            <div className="text-xs text-slate-500">
                              {r.expected_users || 1} người
                            </div>
                          </>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            className="btn bg-emerald-600 text-white hover:bg-emerald-700 text-xs px-3"
                            onClick={() => onApprove(r)}
                          >
                            <Check size={14} /> Duyệt
                          </button>
                          <button
                            className="btn-danger text-xs px-3"
                            onClick={() => setRejecting(r)}
                          >
                            <X size={14} /> Từ chối
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination
            page={meta.page}
            pageSize={meta.pageSize}
            total={meta.total}
            onChange={setPage}
          />
        </div>
      </div>

      {rejecting && (
        <RejectModal
          reservation={rejecting}
          onClose={() => setRejecting(null)}
          onDone={() => {
            setRejecting(null);
            load();
          }}
        />
      )}
    </>
  );
}

function RejectModal({ reservation, onClose, onDone }) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error("Vui lòng nhập lý do từ chối");
    setSaving(true);
    try {
      await reservationApi.reject(reservation.id, reason.trim());
      toast.success("Đã từ chối yêu cầu");
      onDone();
    } catch (err) {
      toast.error(apiMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Từ chối yêu cầu"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-danger" disabled={saving} onClick={onSubmit}>
            {saving ? <Loader2 className="animate-spin" size={14} /> : null}
            Từ chối
          </button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="text-sm text-slate-600">
          Yêu cầu #{reservation.id} của{" "}
          <strong>
            {reservation.user?.full_name || reservation.user?.username}
          </strong>
        </div>
        <div>
          <label className="label">Lý do từ chối *</label>
          <textarea
            className="input"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do từ chối..."
            required
          />
        </div>
      </form>
    </Modal>
  );
}
