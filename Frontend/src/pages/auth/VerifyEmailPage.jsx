import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "./AuthLayout";
import { authApi } from "../../services/authService";
import { apiMessage } from "../../lib/api";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(params.get("email") || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.verifyEmail(email.trim(), otp.trim());
      toast.success("Xác thực email thành công");
      navigate("/login");
    } catch (err) {
      toast.error(apiMessage(err, "Mã OTP không hợp lệ"));
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (!email.trim()) return toast.error("Nhập email trước");
    setResending(true);
    try {
      await authApi.resendVerification(email.trim());
      toast.success("Đã gửi lại mã OTP");
    } catch (err) {
      toast.error(apiMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Xác thực email"
      subtitle="Nhập mã OTP đã gửi đến hộp thư của bạn"
      footer={
        <>
          Đã xác thực rồi?{" "}
          <Link
            to="/login"
            className="text-brand-600 font-semibold hover:underline"
          >
            Đăng nhập
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Mã OTP</label>
          <input
            className="input tracking-[0.4em] text-center text-lg font-semibold"
            placeholder="------"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            maxLength={6}
            required
          />
        </div>

        <button
          disabled={loading}
          className="btn-primary w-full py-2.5"
          type="submit"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : null}
          Xác thực
        </button>

        <button
          type="button"
          onClick={onResend}
          disabled={resending}
          className="btn-ghost w-full text-sm"
        >
          {resending ? "Đang gửi..." : "Gửi lại mã OTP"}
        </button>
      </form>
    </AuthLayout>
  );
}
