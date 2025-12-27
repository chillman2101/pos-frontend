import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Lock, Mail, Store } from "lucide-react";
import { Button, Input } from "../components/common";
import useAuthStore from "../store/authStore";
import authApi from "../api/authApi";

// Validation schema
const loginSchema = yup
  .object({
    email: yup
      .string()
      .required("Email atau username wajib diisi")
      .min(3, "Minimal 3 karakter"),
    password: yup
      .string()
      .required("Password wajib diisi")
      .min(6, "Password minimal 6 karakter"),
  })
  .required();

const Login = () => {
  const navigate = useNavigate();
  const { setAuth, setLoading } = useAuthStore();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setError("");
      setLoading(true);

      // Call login API
      const response = await authApi.login({
        username: data.email, // Backend uses 'username' field
        password: data.password,
      });

      // Save auth data to store
      setAuth(response.data.user, response.data.token);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-soft mb-4">
            <Store className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            POS System
          </h1>
          <p className="text-neutral-600">Silakan login untuk melanjutkan</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-card shadow-soft border border-neutral-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email/Username Input */}
            <Input
              label="Email atau Username"
              type="text"
              placeholder="Masukkan email atau username"
              icon={<Mail className="w-5 h-5" />}
              error={errors.email?.message}
              {...register("email")}
            />

            {/* Password Input */}
            <Input
              label="Password"
              type="password"
              placeholder="Masukkan password"
              icon={<Lock className="w-5 h-5" />}
              error={errors.password?.message}
              {...register("password")}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
            >
              Login
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Lupa password?{" "}
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                Hubungi Admin
              </button>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-primary-50 rounded-lg p-4 border border-primary-200">
          <p className="text-xs font-semibold text-primary-900 mb-2">
            Login Credentials:
          </p>
          <div className="text-xs text-primary-800 space-y-1">
            <p>
              <span className="font-semibold">Username:</span> admin
            </p>
            <p>
              <span className="font-semibold">Password:</span> admin123
            </p>
          </div>
          <br />
          <div className="text-xs text-primary-800 space-y-1">
            <p>
              <span className="font-semibold">Username:</span> cashier1
            </p>
            <p>
              <span className="font-semibold">Password:</span> cashier123
            </p>
          </div>
          <br />
          <div className="text-xs text-primary-800 space-y-1">
            <p>
              <span className="font-semibold">Username:</span> manager1
            </p>
            <p>
              <span className="font-semibold">Password:</span> manager123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
