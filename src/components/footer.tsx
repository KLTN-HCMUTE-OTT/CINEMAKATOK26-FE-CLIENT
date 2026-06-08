"use client";

import Image from "next/image";
import { Facebook, Twitter, Github, Play } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-900 px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Logo and Social */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-red-500 text-xl font-bold">
                CINEMAKATOK
              </span>
              <span className="text-purple-400 text-xs">TV</span>
            </div>

            <p className="text-gray-400 text-sm mb-6">Connect with us</p>

            <div className="flex gap-3 mb-8">
              <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              <Github className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            </div>

            <div>
              <p className="text-gray-400 text-sm mb-4">
                Download Streamvid mobile app
              </p>
              <div className="flex flex-col gap-2">
                <Image
                  src="/app-store-badge.png"
                  alt="Download on App Store"
                  width={120}
                  height={40}
                />
                <Image
                  src="/google-play-badge.png"
                  alt="Get it on Google Play"
                  width={120}
                  height={40}
                />
              </div>
            </div>
          </div>

          {/* Must Watch Movies */}
          <div>
            <h3 className="text-white font-semibold mb-4">Must Watch Movies</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  DJ Tillu
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  The Great Empire
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  Love Story
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  The Reckless
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  Zombie World
                </a>
              </li>
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h3 className="text-white font-semibold mb-4">Genres</h3>
            <div className="grid grid-cols-2 gap-y-3">
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Romance
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Drama
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Family
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Comedy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Actions
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Adventure
                  </a>
                </li>
              </ul>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Horror
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Anime
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Thriller
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    History
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Sci-Fi
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-white font-semibold mb-4">Help</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  My Account
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  Customer Support
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Contact
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  Advertise
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  Jobs
                </a>
              </li>
            </ul>
          </div>

          {/* Jobs */}
          <div>
            <h3 className="text-white font-semibold mb-4">Jobs</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  View Plans
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  Devices
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  About Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            Copyright © 2025 StreamVid. All rights reserved
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-white text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-white text-sm">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
