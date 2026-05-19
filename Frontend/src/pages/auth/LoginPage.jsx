import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "./AuthLayout";
import { authApi } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { apiMessage } from "../../lib/api";
import { normalizeUser } from "../../lib/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuthStore();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login(identifier.trim(), password);
      setSession({
        accessToken: data.accessToken,
        user: normalizeUser(data.user),
      });
      toast.success("Đăng nhập thành công");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(apiMessage(err, "Đăng nhập thất bại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Đăng nhập với tài khoản CLMS của bạn để tiếp tục"
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-brand-600 font-semibold hover:underline"
          >
            Đăng ký ngay
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="label">Email hoặc tên đăng nhập</label>
          <input
            className="input"
            placeholder="admin hoặc admin@example.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div>
          <div className="flex justify-between items-baseline">
            <label className="label">Mật khẩu</label>
            <Link
              to="/forgot-password"
              className="text-xs text-brand-600 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <input
              className="input pr-10"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : null}
          Đăng nhập
        </button>
      </form>

      <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-3.5 text-xs text-slate-500 bg-slate-50/60">
        <div className="font-semibold text-slate-700 mb-1">Tài khoản demo</div>
        <ul className="space-y-0.5">
          <li>
            <code>admin</code> / <code>Admin@1234</code> — Quản trị
          </li>
          <li>
            <code>staff1</code> / <code>Test@1234</code> — Nhân viên
          </li>
          <li>
            <code>student1</code> / <code>Test@1234</code> — Người dùng
          </li>
        </ul>
      </div>
    </AuthLayout>
  );
}
