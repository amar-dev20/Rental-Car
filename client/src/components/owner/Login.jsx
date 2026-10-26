import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Login = () => {
  const {
    setShowLogin,
    axios,
    setToken,
    fetchUser,
  } = useAppContext();

  const navigate = useNavigate();

  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      const { data } = await axios.post(
        `/api/user/${state}`,
        {
          ...(state === "register" ? { name } : {}),
          email,
          password,
        }
      );

      if (!data.success) {
        toast.error(data.message || "Authentication failed");
        return;
      }

      if (!data.token) {
        toast.error("Token was not returned by the server");
        return;
      }

      // Save token and update Axios header immediately
      setToken(data.token);

      // Fetch logged-in user's information
      await fetchUser();

      // Close login modal
      setShowLogin(false);

      // Navigate after successful login
      navigate("/");

      toast.success(
        state === "login"
          ? "Login successful"
          : "Account created successfully"
      );
    } catch (error) {
      console.error("Authentication error:", {
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });

      toast.error(
        error.response?.data?.message ||
          "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => setShowLogin(false)}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
    >
      <form
        onClick={(event) => event.stopPropagation()}
        onSubmit={onSubmitHandler}
        className="w-80 rounded-lg border border-gray-200 bg-white p-8 py-12 text-sm text-gray-500 shadow-xl sm:w-[352px]"
      >
        <p className="text-center text-2xl font-medium">
          <span className="text-indigo-500">User</span>{" "}
          {state === "login" ? "Login" : "Sign Up"}
        </p>

        {state === "register" && (
          <div className="mt-4">
            <label htmlFor="login-name" className="block">
              Name
            </label>

            <input
              id="login-name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-200 p-2 outline-indigo-500"
            />
          </div>
        )}

        <div className="mt-4">
          <label htmlFor="login-email" className="block">
            Email
          </label>

          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-1 w-full rounded border border-gray-200 p-2 outline-indigo-500"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="login-password" className="block">
            Password
          </label>

          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-1 w-full rounded border border-gray-200 p-2 outline-indigo-500"
          />
        </div>

        <p className="mt-4">
          {state === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}

          <button
            type="button"
            onClick={() => {
              setState((previousState) =>
                previousState === "login" ? "register" : "login"
              );
            }}
            className="cursor-pointer text-indigo-500"
          >
            {state === "login" ? "Sign up" : "Login"}
          </button>
        </p>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full cursor-pointer rounded-md bg-indigo-500 py-2 text-white transition-all hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Please wait..."
            : state === "login"
              ? "Login"
              : "Create Account"}
        </button>
      </form>
    </div>
  );
};

export default Login;