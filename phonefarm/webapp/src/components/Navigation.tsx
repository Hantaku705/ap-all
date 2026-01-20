"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { sections } from "@/data/report-data";

export default function Navigation() {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((s) => ({
        id: s.id,
        element: document.getElementById(s.id),
      }));

      for (const section of sectionElements.reverse()) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto hidden lg:block shadow-sm">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-sky-700">Phone Farm</h1>
        <p className="text-xs text-gray-500">Threat Intelligence</p>
      </div>

      {/* Page Navigation */}
      <div className="mb-6 flex flex-col gap-2">
        <span className="px-3 py-2 text-sm rounded-lg bg-sky-100 text-sky-700 font-medium text-center">
          レポート
        </span>
        <Link
          href="/setup-guide"
          className="px-3 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-100 text-center border border-gray-200"
        >
          セットアップガイド →
        </Link>
      </div>

      <div className="space-y-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className={`nav-link w-full text-left ${
              activeSection === section.id ? "active" : ""
            }`}
          >
            {section.title}
          </button>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p>Classification: Internal</p>
          <p>Date: 2026-01-20</p>
        </div>
      </div>
    </nav>
  );
}
