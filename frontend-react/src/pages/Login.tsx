import React, { useState } from "react";

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

  // Password Validation
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

    // SIGNUP VALIDATION
    if (mode === "SIGNUP") {
      const err = validatePassword(password);
      if (err) return setError(err);

      if (password !== confirmPass) {
        return setError("Passwords do not match");
      }

      // Retailer-specific validation
      if (role === "RETAILER") {
        if (!licenseNumber.trim()) {
          return setError("License Number is required for Retailers.");
        }
        if (!licenseFile) {
          return setError("You must upload a License/Approval PDF or Image.");
        }
      }
    }

    setLoading(true);

    try {
      // For Real Backend (multipart form)
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);

      if (mode === "SIGNUP") {
        formData.append("name", name);

        if (role === "RETAILER") {
          formData.append("license_number", licenseNumber);
          formData.append("license_file", licenseFile!);
        }
      }

      console.log("Form Submitted:", Object.fromEntries(formData));

      alert(`${mode} successful`);

    } catch {
      setError("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full">

        <h1 className="text-3xl font-bold text-blue-600 text-center">PharmaTrade</h1>
        <p className="text-center text-gray-500 mb-6">
          {mode === "LOGIN" ? "Secure Portal Login" : "Create New Account"}
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* SIGNUP ONLY: NAME FIELD */}
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

          {/* EMAIL */}
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

          {/* PASSWORD */}
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

          {/* CONFIRM PASSWORD */}
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

          {/* RETAILER-ONLY FIELDS */}
          {mode === "SIGNUP" && role === "RETAILER" && (
            <>
              {/* LICENSE NUMBER */}
              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">License Number</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter License Number"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                />
              </div>

              {/* LICENSE DOCUMENT UPLOAD */}
              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">
                  Upload License Document (PDF or Image)
                </label>

                <input
                  type="file"
                  accept=".pdf, .jpg, .jpeg, .png"
                  onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                  className="w-full border p-2 rounded bg-white"
                />

                {licenseFile && (
                  <p className="text-sm text-green-600 mt-1">
                    Uploaded: {licenseFile.name}
                  </p>
                )}
              </div>
            </>
          )}

          {/* ROLE TOGGLE */}
          <div className="mb-6">
            <p className="text-gray-700 font-medium mb-2">Select Role</p>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setRole("ADMIN")}
                className={`px-4 py-2 rounded-lg border transition 
                  ${role === "ADMIN" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                Admin
              </button>

              <button
                type="button"
                onClick={() => setRole("RETAILER")}
                className={`px-4 py-2 rounded-lg border transition 
                  ${role === "RETAILER" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                Retailer
              </button>
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-300"
          >
            {loading ? "Processing..." : mode === "LOGIN" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* TOGGLE LOGIN / SIGNUP */}
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
