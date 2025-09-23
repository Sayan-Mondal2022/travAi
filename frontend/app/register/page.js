"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Register Data:", formData);
    // TODO: Replace with your API call for registration
    router.push("/login"); // Redirect after register
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xlrounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Register</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              className="
              w-full mt-1 p-2 border rounded-2xl focus:ring focus:ring-blue-200
              outline-none border-none
              "
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="
              w-full mt-1 p-2 border rounded-2xl focus:ring focus:ring-blue-200
              outline-none border-none
              "
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="
              w-full mt-1 p-2 border rounded-2xl focus:ring focus:ring-blue-200
              outline-none border-none
              "
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="
              w-full mt-1 p-2 border rounded-2xl focus:ring focus:ring-blue-200
              outline-none border-none
              "
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded-2xl hover:bg-green-700 transition"
          >
            Register
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>

        {/* ✅ Home Link */}
        <p className="text-sm text-center mt-2">
          <Link href="/" className="text-gray-600 hover:underline">
                ⬅ Back to Home
        </Link>
        </p>
      </div>
    </section>
  );
}
