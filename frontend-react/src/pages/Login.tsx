import React, { useState } from "react";
import axios from "axios";

export default function Login() {
  const [mode, setMode] = useState<"LOGIN" | "SIGNUP">("LOGIN");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "RETAILER">("RETAILER");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseFile, setLicenseFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Password validation (Signup Only)
  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pass)) return "Must contain an uppercase letter";
    if (!/[0-9]/.test(pass)) return "Must contain a number";
    if (!/[!@#$%^&*]/.test(pass)) return "Must contain a symbol (!@#$%^&*)";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // ---------------- SIGNUP VALIDATION ----------------
    if (mode === "SIGNUP") {
      const err = validatePassword(password);
      if (err) return setError(err);

      if (password !== confirmPass)
        return setError("Passwords do not match");

      if (!licenseNumber.trim())
        return setError("License Number is required");

      if (!licenseFile)
        return setError("Upload License Document");
    }

    setLoading(true);

    try {
      // ---------------- LOGIN ----------------
      if (mode === "LOGIN") {
        const res = await axios.post("http://localhost:8080/login", {
          email,
          password,
          role, // Admin or Retailer login
        });

        const user = res.data.user;

        // Retailer must be approved
        if (user.role === "RETAILER" && user.is_approved !== "YES") {
          setError("Your account is not yet approved by admin.");
          setLoading(false);
          return;
        }

        // Save login
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(user));

        // REDIRECT BASED ON ROLE
        if (user.role === "ADMIN") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/retailer";
        }
      }

      // ---------------- SIGNUP (Retailer Only) ----------------
      else {
        const form = new FormData();
        form.append("name", name);
        form.append("email", email);
        form.append("password", password);
        form.append("role", "RETAILER");
        form.append("license_number", licenseNumber);
        form.append("license_file", licenseFile!);

        await axios.post("http://localhost:8080/signup", form);

        alert("Signup successful! Wait for admin approval.");
        setMode("LOGIN");
      }

    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong.");
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
          {mode === "LOGIN" ? "Secure Portal Login" : "Retailer Registration"}
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* SIGNUP FIELDS */}
          {mode === "SIGNUP" && (
            <>
              <div className="mb-4">
                <label className="font-medium">Full Name</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </>
          )}

          {/* EMAIL */}
          <div className="mb-4">
            <label className="font-medium">Email</label>
            <input
              type="email"
              className="w-full border p-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-4">
            <label className="font-medium">Password</label>
            <input
              type="password"
              className="w-full border p-2 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* CONFIRM PASSWORD */}
          {mode === "SIGNUP" && (
            <div className="mb-4">
              <label className="font-medium">Confirm Password</label>
              <input
                type="password"
                className="w-full border p-2 rounded"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
              />
            </div>
          )}

          {/* LOGIN ROLE TOGGLE */}
          {mode === "LOGIN" && (
            <div className="mb-6">
              <p className="font-medium mb-2">Login as</p>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRole("ADMIN")}
                  className={`px-4 py-2 rounded-lg border ${
                    role === "ADMIN" ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                >
                  Admin
                </button>

                <button
                  type="button"
                  onClick={() => setRole("RETAILER")}
                  className={`px-4 py-2 rounded-lg border ${
                    role === "RETAILER" ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                >
                  Retailer
                </button>
              </div>
            </div>
          )}

          {/* SIGNUP (Retailer Only) */}
          {mode === "SIGNUP" && (
            <>
              <div className="mb-4">
                <label className="font-medium">License Number</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="font-medium">Upload License Document</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    setLicenseFile(e.target.files?.[0] || null)
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
            </>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg mt-2"
          >
            {loading
              ? "Processing..."
              : mode === "LOGIN"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        {/* SWITCH LOGIN / SIGNUP */}
        <p className="text-center mt-4 text-gray-700">
          {mode === "LOGIN" ? "Don't have an account?" : "Already registered?"}

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
