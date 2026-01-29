"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search, Bell, User } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6b6b]">
              <span className="text-lg font-bold text-white">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900">AnyBrand</span>
          </Link>

          {/* Desktop Navigation - anystarr.com style */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/products"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              品揃え
            </Link>
            <Link
              href="/guide"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Tips
            </Link>
            <Link
              href="/commissions"
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#ff6b6b] transition-colors hover:bg-[#ff6b6b]/10"
            >
              高報酬！
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              ダッシュボード
            </Link>
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden items-center gap-3 md:flex">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="商品を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm transition-all focus:w-64 focus:border-[#ff6b6b] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#ff6b6b]"
              />
            </div>

            {/* Notifications */}
            <button className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#ff6b6b]" />
            </button>

            {/* User Menu */}
            <button className="flex items-center gap-2 rounded-full border border-gray-200 py-1.5 pl-1.5 pr-3 transition-colors hover:bg-gray-50">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff6b6b]">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">クリエイター</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="メニュー"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t border-gray-100 py-4 md:hidden">
            {/* Mobile Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="商品を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-[#ff6b6b] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#ff6b6b]"
              />
            </div>

            <nav className="flex flex-col gap-1">
              <Link
                href="/products"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                品揃え
              </Link>
              <Link
                href="/guide"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Tips
              </Link>
              <Link
                href="/commissions"
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#ff6b6b] transition-colors hover:bg-[#ff6b6b]/10"
                onClick={() => setIsMenuOpen(false)}
              >
                高報酬！
              </Link>
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                ダッシュボード
              </Link>
              <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
                <button className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#ff6b6b]" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff6b6b]">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">クリエイター</span>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
