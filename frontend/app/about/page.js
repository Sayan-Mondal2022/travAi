// app/about/page.js
"use client";

import Navbar from "@/components/Navbar";
import Footer from "../pages/Footer";
import { Users, Globe, Target, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-[var(--bg)] py-22 px-6">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <section className="text-center">
          <h1 className="text-4xl font-bold text-[var(--text)] mb-4">About Us</h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            We are passionate about making travel planning simple, personalized, 
            and stress-free. Our mission is to help you explore the world with ease, 
            whether you&apos;re discovering new tourist attractions, finding the 
            perfect place to stay, or enjoying the best local food.
          </p>
        </section>

        {/* Who we are */}
        <section className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[var(--text)] mb-3 flex items-center">
                <Users className="w-6 h-6 text-[var(--primary)] mr-2" />
                Who We Are
              </h2>
              <p className="text-[var(--text-secondary)]">
                A dedicated team of developers, designers, and travel enthusiasts 
                who believe technology can make exploring the world more 
                accessible. We focus on combining real data with AI-driven insights 
                to create the best travel experiences for you.
              </p>
            </div>
            <div className="flex-1">
              <img
                src="/images/teamwork.svg"
                alt="Team working illustration"
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-3 flex items-center">
              <Target className="w-6 h-6 text-[var(--primary)] mr-2" />
              Our Mission
            </h2>
            <p className="text-[var(--text-secondary)]">
              To empower travelers with smarter planning tools, combining 
              personalized itineraries with real-time recommendations. 
              We aim to make every trip memorable, efficient, and enjoyable.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-3 flex items-center">
              <Globe className="w-6 h-6 text-[var(--primary)] mr-2" />
              Our Vision
            </h2>
            <p className="text-[var(--text-secondary)]">
              To become the world&apos;s most trusted AI-powered travel 
              companion, helping millions of travelers design journeys that 
              inspire, connect, and create lifelong memories.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-6 flex justify-center items-center">
            <Heart className="w-6 h-6 text-[var(--primary)] mr-2" />
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 border rounded-xl hover:shadow-md transition">
              <h3 className="font-semibold text-[var(--text)] mb-2">Innovation</h3>
              <p className="text-[var(--text-secondary)] text-sm">
                We embrace AI and modern technology to make travel smarter.
              </p>
            </div>
            <div className="p-4 border rounded-xl hover:shadow-md transition">
              <h3 className="font-semibold text-[var(--text)] mb-2">Simplicity</h3>
              <p className="text-[var(--text-secondary)] text-sm">
                We focus on creating simple, user-friendly experiences.
              </p>
            </div>
            <div className="p-4 border rounded-xl hover:shadow-md transition">
              <h3 className="font-semibold text-[var(--text)] mb-2">Trust</h3>
              <p className="text-[var(--text-secondary)] text-sm">
                We put transparency and reliability at the heart of everything.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
    <Footer/>
    </>
  );
}
