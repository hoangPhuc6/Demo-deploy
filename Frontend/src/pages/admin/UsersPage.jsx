import { useEffect, useState } from "react";
import { Users, Search, Ban, Unlock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Topbar from "../../components/layout/Topbar";
import Loader, { EmptyState } from "../../components/ui/Loader";
import Pagination from "../../components/ui/Pagination";
import Modal from "../../components/ui/Modal";
import { StatusBadge } from "../../components/ui/Badge";
import { userApi } from "../../services/authService";
import { apiMessage } from "../../lib/api";
import { fmtDateTime } from "../../lib/utils";

const ROLES = [
  { value: "", label: "Tất cả vai trò" },
  { value: "customer", label: "Người dùng" },
  { value: "lab_staff", label: "Nhân viên" },
  { value: "system_admin", label: "Quản trị" },
];
const STATUSES = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "active", label: "Hoạt động" },
  { value: "blocked", label: "Bị khóa" },
  { value: "pending", label: "Chờ xác thực" },
];

export default function UsersPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", role: "", status: "" });
  const [page, setPage] = useState(1);
  const [blocking, setBlocking] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await userApi.list({
        ...(filters.search && { search: filters.search }),
        ...(filters.role && { role: filters.role }),
        ...(filters.status && { status: filters.status }),
        page,
        pageSize: 20,
      });
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

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const onUnblock = async (u) => {
    if (!confirm(`Mở khóa tài khoản ${u.username}?`)) return;
    try {
      await userApi.unblock(u.id);
      toast.success("Đã mở khóa");
      load();
    } catch (err) {
      toast.error(apiMessage(err));
    }
  };

  return (
    <>
      <Topbar
        title="Quản lý người dùng"
        subtitle="Xem, khóa và mở khóa tài khoản"
      />

      <div className="p-6 space-y-5">
        <form
          onSubmit={onSearch}
          className="card card-body grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
        >
          <div className="lg:col-span-2 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="input pl-9"
              placeholder="Tên, email..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
          <select
            className="input"
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary">
            <Search size={16} /> Tìm
          </button>
        </form>

        <div className="card">
          {loading ? (
            <Loader />
          ) : items.length === 0 ? (
            <EmptyState icon={Users} title="Không tìm thấy" />
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="font-medium text-slate-900">
                          {u.full_name || u.username}
                        </div>
                        <div className="text-xs text-slate-500">
                          @{u.username}
                        </div>
                      </td>
                      <td className="text-sm">{u.email}</td>
                      <td>
                        <StatusBadge status={u.role} />
                      </td>
                      <td>
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="text-xs text-slate-500">
                        {fmtDateTime(u.created_at)}
                      </td>
                      <td className="text-right">
                        {u.status === "blocked" ? (
                          <button
                            className="btn-ghost text-xs text-emerald-600"
                            onClick={() => onUnblock(u)}
                          >
                            <Unlock size={14} /> Mở khóa
                          </button>
                        ) : (
                          u.role !== "system_admin" && (
                            <button
                              className="btn-ghost text-xs text-red-600"
                              onClick={() => setBlocking(u)}
                            >
                              <Ban size={14} /> Khóa
                            </button>
                          )
                        )}
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

      {blocking && (
        <BlockUserModal
          user={blocking}
          onClose={() => setBlocking(null)}
          onDone={() => {
            setBlocking(null);
            load();
          }}
        />
      )}
    </>
  );
}

function BlockUserModal({ user: target, onClose, onDone }) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error("Vui lòng nhập lý do");
    setSaving(true);
    try {
      await userApi.block(target.id, reason.trim());
      toast.success("Đã khóa tài khoản");
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
      title={`Khóa tài khoản @${target.username}`}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-danger" disabled={saving} onClick={onSubmit}>
            {saving ? <Loader2 className="animate-spin" size={14} /> : null}
            Khóa tài khoản
          </button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <p className="text-sm text-slate-600">
          Tài khoản <strong>{target.full_name || target.username}</strong> sẽ bị
          chặn khỏi hệ thống.
        </p>
        <div>
          <label className="label">Lý do *</label>
          <textarea
            className="input"
            rows={3}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Vd: vi phạm nội quy sử dụng phòng lab..."
          />
        </div>
      </form>
    </Modal>
  );
}
