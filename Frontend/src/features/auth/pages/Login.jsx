import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import { useSelector } from "react-redux";
import { useGoogleLogin } from "@react-oauth/google";

export default function Login() {
  const { handleLogin, handleGoogleLogin } = useAuth();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const error = useSelector((state) => state.auth.error);

  // Google OAuth — pass access_token to backend which fetches userinfo
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await handleGoogleLogin({
          credential: tokenResponse.access_token,
          profile: null,
        });
        navigate("/");
      } catch (err) {
        console.error("Google login error:", err);
      }
    },
    onError: () => console.error("Google login failed"),
  });

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },

    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email")
        .required("Email is required"),

      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),

    onSubmit: async (values) => {
      const { email, password } = values;
      try {
        await handleLogin({ email, password });
        navigate("/");
      } catch (err) {
        // error is handled in useAuth, stay on login page
      }
    },
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* Navbar */}
      <nav className="border-b border-white/10 px-6 py-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-200 to-purple-300 bg-clip-text text-transparent">
          Aura AI
        </h1>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">

        <div className="w-full max-w-sm bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">

          <h1 className="text-3xl font-bold text-center mb-2">
            Welcome back
          </h1>

          <p className="text-gray-400 text-sm text-center mb-6">
            Enter your credentials to access your workspace
          </p>

          <form
            onSubmit={formik.handleSubmit}
            className="space-y-4"
          >

            {/* Email */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">
                Email Address
              </label>

              <div className="flex items-center bg-white/5 border border-purple-300/20 rounded-xl px-4">
                <Mail size={18} className="text-gray-400" />

                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-transparent px-3 py-3 outline-none text-white"
                />
              </div>

              {formik.touched.email &&
                formik.errors.email && (
                  <p className="text-red-400 text-xs mt-2">
                    {formik.errors.email}
                  </p>
                )}
            </div>

            {/* Password */}
            <div>

              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-300">
                  Password
                </label>

                <p className="text-xs text-purple-300 hover:underline cursor-pointer">
                  Forgot password?
                </p>
              </div>

              <div className="flex items-center bg-white/5 border border-purple-300/20 rounded-xl px-4">
                <Lock size={18} className="text-gray-400" />

                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-transparent px-3 py-3 outline-none text-white"
                />
              </div>

              {formik.touched.password &&
                formik.errors.password && (
                  <p className="text-red-400 text-xs mt-2">
                    {formik.errors.password}
                  </p>
                )}
            </div>

            {/* Server Error */}
            {error && (
              <p className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-xl py-2.5 px-4">
                {error}
              </p>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full mt-2 bg-purple-300 hover:bg-purple-200 disabled:opacity-60 text-black font-semibold py-3 rounded-xl transition"
            >
              {formik.isSubmitting ? "Signing in..." : "Sign in"}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-xs">or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google Button */}
          <button
            onClick={() => googleLogin()}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition"
          >
            {/* Google Icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Footer */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Don’t have an account?{" "}
            <Link
                to="/register"
                className="text-purple-300 hover:underline"
              >
                Create account
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}