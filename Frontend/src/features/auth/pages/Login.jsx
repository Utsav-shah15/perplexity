import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import { useSelector } from "react-redux";

export default function Login() {
  const {handleLogin}=useAuth();
  const navigate = useNavigate();
  const user=useSelector(state=>state.auth.user);
  const loading=useSelector(state=>state.auth.loading);

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

    onSubmit: async(values) => {
      const {email,password}=values;
      await handleLogin({email,password});
      navigate("/")
    },
  });

  if(!loading && user){
     return naviagate("/")
  }

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

            {/* Button */}
            <button
              type="submit"
              className="w-full mt-2 bg-purple-300 hover:bg-purple-200 text-black font-semibold py-3 rounded-xl transition"
            >
              Sign in
            </button>

          </form>

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