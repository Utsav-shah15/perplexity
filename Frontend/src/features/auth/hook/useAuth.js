import { useDispatch } from "react-redux";
import { register, login, getMe, logout, googleLogin } from "../services/auth.api";
import { setUser, setError, setLoading } from "../authSlice";

export function useAuth() {
  const dispatch = useDispatch();

  async function handleRegister({ email, username, password }) {
    try {
      dispatch(setLoading(true));
      await register({ email, username, password });
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Registration failed"));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogin({ email, password }) {
    try {
      dispatch(setLoading(true));
      const data = await login({ email, password });
      dispatch(setUser(data.user));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Login failed"));
      throw err; // rethrow so Login.jsx knows not to navigate
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleGoogleLogin({ credential, profile }) {
    try {
      dispatch(setLoading(true));
      const data = await googleLogin({ credential, profile });
      dispatch(setUser(data.user));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Google login failed"));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogout() {
    try {
      dispatch(setLoading(true));
      await logout();
      dispatch(setUser(null));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Logout failed"));
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleGetMe() {
    try {
      dispatch(setLoading(true));
      const data = await getMe();
      dispatch(setUser(data.user));
    } catch (err) {
      // Not logged in — silently set user to null
      dispatch(setUser(null));
    } finally {
      dispatch(setLoading(false));
    }
  }

  return {
    handleRegister,
    handleLogin,
    handleGoogleLogin,
    handleLogout,
    handleGetMe,
  };
}