import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Plus,
  Search,
  Filter,
  Users,
  MapPin,
  Edit,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import Topbar from "../../components/layout/Topbar";
import Loader, { EmptyState } from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import { StatusBadge } from "../../components/ui/Badge";
import { labRoomApi } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { apiMessage } from "../../lib/api";

const STATUSES = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "active", label: "Đang hoạt động" },
  { value: "maintenance", label: "Bảo trì" },
  { value: "decommissioned", label: "Đã ngừng" },
];

export default function LabRoomsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "system_admin";

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    minCapacity: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = {
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.minCapacity && { minCapacity: filters.minCapacity }),
        ...(filters.date &&
          filters.startTime &&
          filters.endTime && {
            date: filters.date,
            startTime: filters.startTime,
            endTime: filters.endTime,
          }),
      };
      const data = await labRoomApi.list(params);
      setRooms(data || []);
    } catch (err) {
      toast.error(apiMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmitFilter = (e) => {
    e.preventDefault();
    load();
  };

  const onDelete = async (room) => {
    if (!confirm(`Xóa phòng ${room.room_code}?`)) return;
    try {
      await labRoomApi.remove(room.id);
      toast.success("Đã xóa phòng");
      load();
    } catch (err) {
      toast.error(apiMessage(err));
    }
  };

  return (
    <>
      <Topbar
        title="Phòng lab"
        subtitle="Tìm và đặt phòng theo khung giờ phù hợp"
        actions={
          isAdmin ? (
            <button
              className="btn-primary"
              onClick={() => setEditing({ isNew: true })}
            >
              <Plus size={16} /> Thêm phòng
            </button>
          ) : null
        }
      />

      <div className="p-6 space-y-5">
        {/* Filters */}
        <form
          onSubmit={onSubmitFilter}
          className="card card-body grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3"
        >
          <div className="lg:col-span-2 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="input pl-9"
              placeholder="Tìm theo mã phòng, tên, vị trí..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
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
          <input
            className="input"
            type="number"
            min={1}
            placeholder="Sức chứa tối thiểu"
            value={filters.minCapacity}
            onChange={(e) =>
              setFilters({ ...filters, minCapacity: e.target.value })
            }
          />
          <input
            className="input"
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          />
          <div className="flex gap-2">
            <input
              className="input"
              type="time"
              value={filters.startTime}
              onChange={(e) =>
                setFilters({ ...filters, startTime: e.target.value })
              }
            />
            <input
              className="input"
              type="time"
              value={filters.endTime}
              onChange={(e) =>
                setFilters({ ...filters, endTime: e.target.value })
              }
            />
          </div>
          <div className="md:col-span-2 lg:col-span-6 flex gap-2 justify-end">
            <button type="submit" className="btn-primary">
              <Filter size={16} /> Áp dụng bộ lọc
            </button>
          </div>
        </form>

        {loading ? (
          <Loader />
        ) : rooms.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="Không tìm thấy phòng phù hợp"
            description="Thử nới lỏng bộ lọc hoặc kiểm tra khung giờ khác."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((r) => (
              <div
                key={r.id}
                className="card group hover:shadow-soft transition relative"
              >
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-slate-500 font-semibold tracking-wide">
                        {r.room_code}
                      </div>
                      <Link
                        to={`/lab-rooms/${r.id}`}
                        className="text-lg font-semibold text-slate-900 hover:text-brand-700"
                      >
                        {r.name}
                      </Link>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>

                  <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-400" />
                      <span className="truncate">
                        {r.location || "Chưa có vị trí"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-slate-400" />
                      <span>
                        {r.workstation_count}/{r.capacity} máy đăng ký
                      </span>
                    </div>
                  </div>

                  {r.description && (
                    <p className="mt-3 text-sm text-slate-500 line-clamp-2">
                      {r.description}
                    </p>
                  )}
                </div>
                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/lab-rooms/${r.id}`}
                    className="text-sm font-semibold text-brand-700 hover:underline"
                  >
                    Xem & đặt phòng →
                  </Link>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button
                        className="btn-ghost p-1.5"
                        onClick={() => setEditing({ isNew: false, ...r })}
                        title="Chỉnh sửa"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        className="btn-ghost p-1.5 hover:text-red-600"
                        onClick={() => onDelete(r)}
                        title="Xóa"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <LabRoomFormModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </>
  );
}

function LabRoomFormModal({ initial, onClose, onSaved }) {
  const isNew = initial.isNew;
  const [form, setForm] = useState({
    roomCode: initial.room_code || "",
    name: initial.name || "",
    location: initial.location || "",
    capacity: initial.capacity || 30,
    description: initial.description || "",
    status: initial.status || "active",
  });
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        await labRoomApi.create({
          roomCode: form.roomCode,
          name: form.name,
          location: form.location,
          capacity: parseInt(form.capacity, 10),
          description: form.description,
        });
        toast.success("Đã tạo phòng mới");
      } else {
        await labRoomApi.update(initial.id, {
          name: form.name,
          location: form.location,
          capacity: parseInt(form.capacity, 10),
          description: form.description,
          status: form.status,
        });
        toast.success("Đã cập nhật phòng");
      }
      onSaved();
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
      title={isNew ? "Thêm phòng lab" : `Chỉnh sửa ${initial.room_code}`}
      size="lg"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button
            className="btn-primary"
            onClick={onSubmit}
            disabled={saving}
            type="submit"
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </>
      }
    >
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        onSubmit={onSubmit}
      >
        {isNew && (
          <div>
            <label className="label">Mã phòng *</label>
            <input
              className="input"
              required
              value={form.roomCode}
              onChange={(e) => setForm({ ...form, roomCode: e.target.value })}
              placeholder="LAB-A101"
            />
          </div>
        )}
        <div className={isNew ? "" : "sm:col-span-2"}>
          <label className="label">Tên phòng *</label>
          <input
            className="input"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Vị trí</label>
          <input
            className="input"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Tòa A, tầng 1"
          />
        </div>
        <div>
          <label className="label">Sức chứa *</label>
          <input
            className="input"
            type="number"
            min={1}
            required
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          />
        </div>
        {!isNew && (
          <div>
            <label className="label">Trạng thái</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">Hoạt động</option>
              <option value="maintenance">Bảo trì</option>
              <option value="decommissioned">Ngừng sử dụng</option>
            </select>
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="label">Mô tả</label>
          <textarea
            className="input"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
      </form>
    </Modal>
  );
}
