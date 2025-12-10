import React, { useState } from "react";

export default function Login() {
  const [mode, setMode] = useState<"LOGIN" | "SIGNUP">("LOGIN");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pass)) return "Must contain at least one uppercase letter";
    if (!/[0-9]/.test(pass)) return "Must contain at least one number";
    if (!/[!@#$%^&*]/.test(pass)) return "Must contain at least one symbol (!@#$%^&*)";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "SIGNUP") {
      const err = validatePassword(password);
      if (err) return setError(err);

      if (password !== confirmPass) {
        return setError("Passwords do not match");
      }
    }

    setLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 1200));
      alert(`${mode} successful`);
    } catch {
      setError("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-blue-600 text-center">
          PharmaTrade
        </h1>
        <p className="text-center text-gray-500 mb-6">
          {mode === "LOGIN" ? "Secure Portal Login" : "Create New Account"}
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "SIGNUP" && (
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
              placeholder="user@pharma.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
              placeholder="Password123!"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {mode === "SIGNUP" && (
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
                placeholder="Re-enter Password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-300"
          >
            {loading ? "Processing..." : mode === "LOGIN" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          {mode === "LOGIN" ? "Don’t have an account?" : "Already have an account?"}
          <button
            className="text-blue-600 font-semibold ml-2"
            onClick={() => {
              setMode(mode === "LOGIN" ? "SIGNUP" : "LOGIN");
              setError("");
            }}
          >
            {mode === "LOGIN" ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
