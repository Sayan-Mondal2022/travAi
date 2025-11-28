"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  // IMAGE SLIDER STATE
  const images = [
    "/images/travel-bg.jpg",
    "/images/travel-bg1.jpg",
    "/images/travel-bg2.jpg",
    "/images/travel-bg3.jpg",
    "/images/travel-bg4.jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto switch images every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Manual Switch
  const goNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const goPrev = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push("/");
  };

  return (
    <section className="login-wrapper fade-in">
      <div className="login-container">

        {/* LEFT PANEL */}
        <div className="left-panel slide-up">

          {/* CLICKABLE LOGO → HOME */}
          <Link href="/" className="logo center-logo">
            TravAi
          </Link>

          <p className="tagline center-tagline">
            Navigate, Plan & Explore Effortlessly.
          </p>

          <h2 className="title center-title">Journey Begins</h2>

          <form onSubmit={handleSubmit} className="login-form">

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group password-wrapper">
              <label>Password</label>

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </span>
            </div>

            <div className="options">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="forgot-link">
                Forgot Password?
              </a>
            </div>

            {/* LOGIN BUTTON */}
            <button type="submit" className="login-btn">
              Log In
            </button>

            {/* LOGIN — OR — SIGN UP */}
            <div className="or-container">
              <span className="or-line"></span>
              <span className="or-text">or</span>
              <span className="or-line"></span>
            </div>

            <Link href="/register" className="signup-btn">
              Sign Up
            </Link>
          </form>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel slide-right">

          <div className="image-area fade-slider">
            <Image
              key={currentIndex}
              src={images[currentIndex]}
              fill
              alt="Travel"
              className="bg-image"
            />
          </div>

          {/* SLIDER ARROWS */}
          <button className="slider-btn left-arrow" onClick={goPrev}>‹</button>
          <button className="slider-btn right-arrow" onClick={goNext}>›</button>

          <div className="bottom-caption">
            <h2>Escape the Ordinary, Embrace the Journey!</h2>
            <button className="cta-btn">Experience the world your way!</button>
          </div>
        </div>
      </div>
    </section>
  );
}