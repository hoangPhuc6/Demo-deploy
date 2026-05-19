import { useState } from "react";
import { Loader2, KeyRound, UserCog } from "lucide-react";
import toast from "react-hot-toast";
import Topbar from "../components/layout/Topbar";
import { StatusBadge } from "../components/ui/Badge";
import { useAuthStore } from "../store/authStore";
import { authApi, userApi } from "../services/authService";
import { apiMessage } from "../lib/api";
import { normalizeUser } from "../lib/auth";
import { fmtDateTime } from "../lib/utils";

export default function ProfilePage() {
  const { user, setUser, clear } = useAuthStore();
  const [profile, setProfile] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
  });
  const [pw, setPw] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const onSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await userApi.updateMe({
        fullName: profile.fullName,
        phone: profile.phone,
      });
      setUser(normalizeUser(updated));
      toast.success("Đã cập nhật hồ sơ");
    } catch (err) {
      toast.error(apiMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePw = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) {
      return toast.error("Mật khẩu xác nhận không khớp");
    }
    setSavingPw(true);
    try {
      await authApi.changePassword(pw.currentPassword, pw.newPassword);
      toast.success("Đổi mật khẩu thành công, vui lòng đăng nhập lại");
      clear();
      window.location.href = "/login";
    } catch (err) {
      toast.error(apiMessage(err));
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <>
      <Topbar title="Hồ sơ cá nhân" subtitle="Cập nhật thông tin và bảo mật" />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Identity card */}
        <div className="card card-body lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white text-xl font-bold flex items-center justify-center shadow-sm">
              {(user?.fullName || user?.username || "?")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-lg font-semibold text-slate-900 truncate">
                {user?.fullName || user?.username}
              </div>
              <div className="text-sm text-slate-500 truncate">
                {user?.email}
              </div>
              <div className="mt-1 flex gap-1.5 flex-wrap">
                <StatusBadge status={user?.role} />
                <StatusBadge status={user?.status} />
              </div>
            </div>
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Tên đăng nhập</dt>
              <dd className="font-medium text-slate-900">{user?.username}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Số điện thoại</dt>
              <dd className="font-medium text-slate-900">
                {user?.phone || "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Tham gia</dt>
              <dd className="font-medium text-slate-900">
                {fmtDateTime(user?.createdAt)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Edit forms */}
        <div className="lg:col-span-2 space-y-5">
          <form className="card" onSubmit={onSaveProfile}>
            <div className="card-header">
              <div className="flex items-center gap-2">
                <UserCog size={18} className="text-brand-600" />
                <h3 className="font-semibold text-slate-900">
                  Thông tin cá nhân
                </h3>
              </div>
            </div>
            <div className="card-body grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Họ và tên</label>
                <input
                  className="input"
                  value={profile.fullName}
                  onChange={(e) =>
                    setProfile({ ...profile, fullName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Số điện thoại</label>
                <input
                  className="input"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="px-5 py-3.5 border-t border-slate-100 flex justify-end">
              <button disabled={savingProfile} className="btn-primary">
                {savingProfile ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : null}
                Lưu thay đổi
              </button>
            </div>
          </form>

          <form className="card" onSubmit={onChangePw}>
            <div className="card-header">
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-brand-600" />
                <h3 className="font-semibold text-slate-900">Đổi mật khẩu</h3>
              </div>
            </div>
            <div className="card-body grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="label">Mật khẩu hiện tại</label>
                <input
                  className="input"
                  type="password"
                  value={pw.currentPassword}
                  onChange={(e) =>
                    setPw({ ...pw, currentPassword: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="label">Mật khẩu mới</label>
                <input
                  className="input"
                  type="password"
                  value={pw.newPassword}
                  onChange={(e) =>
                    setPw({ ...pw, newPassword: e.target.value })
                  }
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="label">Xác nhận mật khẩu</label>
                <input
                  className="input"
                  type="password"
                  value={pw.confirm}
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="px-5 py-3.5 border-t border-slate-100 flex justify-end">
              <button disabled={savingPw} className="btn-primary">
                {savingPw ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : null}
                Đổi mật khẩu
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
