import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Mail, Lock, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import { useSelector } from "react-redux";
import { useGoogleLogin } from "@react-oauth/google";

export default function Register() {
  const navigate = useNavigate();
  const { handleRegister, handleGoogleLogin } = useAuth();
  const error = useSelector((state) => state.auth.error);

  // Google OAuth
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await handleGoogleLogin({
          credential: tokenResponse.access_token,
          profile: null,
        });
        navigate("/");
      } catch (err) {
        console.error("Google signup error:", err);
      }
    },
    onError: () => console.error("Google signup failed"),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
    },

    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, "Minimum 3 characters")
        .required("Username is required"),

      email: Yup.string()
        .email("Invalid email")
        .required("Email is required"),

      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),

    onSubmit: async (values) => {
      const { email, username, password } = values;
      try {
        await handleRegister({ email, password, username });
        navigate("/login");
      } catch (err) {
        // error displayed from Redux state, stay on register page
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
            Create Account
          </h1>

          <p className="text-gray-400 text-sm text-center mb-6">
            Create your account to continue
          </p>

          <form
            onSubmit={formik.handleSubmit}
            className="space-y-4"
          >

            {/* Username */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">
                Username
              </label>

              <div className="flex items-center bg-white/5 border border-purple-300/20 rounded-xl px-4">
                <User size={18} className="text-gray-400" />

                <input
                  type="text"
                  name="username"
                  placeholder="Enter username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-transparent px-3 py-3 outline-none text-white"
                />
              </div>

              {formik.touched.username &&
                formik.errors.username && (
                  <p className="text-red-400 text-xs mt-2">
                    {formik.errors.username}
                  </p>
                )}
            </div>

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
              <label className="text-sm text-gray-300 mb-2 block">
                Password
              </label>

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
              className="w-full mt-2 bg-purple-300 hover:bg-purple-200 text-black font-semibold py-3 rounded-xl transition"
            >
              Create Account
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
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition"
          >
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
            Already have an account?{" "}
            <Link
                to="/login"
                className="text-purple-300 hover:underline"
                >
                Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}