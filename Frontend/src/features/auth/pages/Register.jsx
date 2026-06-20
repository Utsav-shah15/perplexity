import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Mail, Lock, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import { useSelector } from "react-redux";

export default function Register() {
  const navigate = useNavigate();
  const { handleRegister } = useAuth();
  const error = useSelector((state) => state.auth.error);


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

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="px-3 text-xs text-gray-400 uppercase">Or</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={() => {
                window.location.href = "http://localhost:3000/auth/google";
              }}
              className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium py-3 rounded-xl transition cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.091 14.974 0 12 0 7.354 0 3.307 2.68 1.285 6.6L5.266 9.765z"
                />
                <path
                  fill="#34A853"
                  d="M16.04 15.345c-1.07.727-2.42 1.164-4.04 1.164-2.927 0-5.418-1.982-6.309-4.654L1.71 14.936C3.727 18.91 7.854 21.6 12 21.6c3.273 0 6.046-1.09 8.055-2.945l-4.015-3.31z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.275c0-.818-.08-1.609-.218-2.373H12v4.51h6.473c-.273 1.482-1.127 2.736-2.427 3.59l4.018 3.31c2.355-2.173 3.727-5.382 3.727-8.727z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.69 11.855a7.02 7.02 0 010-2.09L1.71 6.827a11.968 11.968 0 000 10.346l3.98-3.318z"
                />
              </svg>
              Continue with Google
            </button>

          </form>


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