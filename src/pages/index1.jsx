import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";

const HomePage2 = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (window.innerWidth < 1024) {
      // mobile/tablet only
      const handleScroll = () => {
        const cards = document.querySelectorAll(".service-card");
        const scrollTop = window.scrollY;

        cards.forEach((card, idx) => {
          const offsetTop = card.offsetTop;
          if (scrollTop + window.innerHeight / 2 > offsetTop) {
            card.style.transform = `translateY(-${
              (scrollTop + window.innerHeight / 2 - offsetTop) * 0.1
            }px)`;
            card.style.zIndex = 100 - idx; // make top card above previous
          } else {
            card.style.transform = "translateY(0)";
            card.style.zIndex = 1;
          }
        });
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const services = [
    {
      title: "Priority Ticketing System",
      description:
        "Book your yatra tickets with priority allocation and time slots",
      icon: "🎫",
      features: ["Time-slot booking", "VIP priority", "Real-time availability"],
    },
    {
      title: "Urban Mobility & Planning",
      description:
        "Optimized routes for pilgrims with shuttle & vehicle planning",
      icon: "🛣️",
      features: [
        "Shuttle scheduling",
        "Traffic-aware routes",
        "Smart junction management",
      ],
    },
    {
      title: "Routes & Maps",
      description:
        "Interactive maps to navigate temples, ghats, and nearby facilities",
      icon: "🗺️",
      features: [
        "Temple & ghat navigation",
        "Parking info",
        "Shortest path guidance",
      ],
    },
    {
      title: "Crowd Detection & Alerts",
      description: "Monitor crowd density in temples & ghats for safety",
      icon: "📊",
      features: [
        "Real-time heatmaps",
        "Density alerts",
        "Prevent overcrowding",
      ],
    },
    {
      title: "Live Darshan",
      description: "Watch temple ceremonies from anywhere with HD streaming",
      icon: "📹",
      features: [
        "Multiple camera views",
        "24/7 streaming",
        "Mobile-friendly access",
      ],
    },
    {
      title: "AI-based Lost & Found",
      description:
        "Locate lost items with AI-powered tracking and notifications",
      icon: "🔍",
      features: ["Item registration", "AI image matching", "Real-time alerts"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 text-gray-800 leading-relaxed font-sans">
      {/* Header */}
      {/* Header */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-xl border-b border-orange-100"
            : "bg-white/90 backdrop-blur-sm shadow-lg"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3 text-2xl font-bold text-orange-800 hover:scale-105 transition-transform duration-300">
            <div className="text-3xl">🕉</div>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Ujjain Yatra
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:block">
            <ul className="flex gap-8">
              {[
                { name: "Home", path: "/" },
                { name: "Services", path: "/services" },
                { name: "About", path: "/about" },
                { name: "Book", path: "/book" },
                { name: "Darshan", path: "/darshan" },
                { name: "Contact", path: "/contact" },
              ].map((item) => (
                <li key={item.name}>
                  <a
                    href={item.path}
                    className="font-semibold text-gray-700 transition-all duration-300 hover:text-orange-600 relative group px-2 py-1"
                  >
                    {item.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300 group-hover:w-full rounded-full"></span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Side (Profile Dropdown + CTA) */}
          <div className="hidden lg:flex items-center gap-6">
            {/* CTA */}
            <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105">
              Book Yatra
            </button>

            {/* Profile Dropdown */}
            <div className="relative group">
              <button className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl">
                🧑‍💻
              </button>

              <div className="absolute right-0 mt-3 w-44 bg-white rounded-xl shadow-xl border border-orange-100 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 z-50">
                <ul className="p-2">
                  <li>
                    <a
                      href="/profile"
                      className="block px-4 py-2 rounded-lg hover:bg-orange-50 text-gray-700"
                    >
                      👤 Profile
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        window.location.href = "/login";
                      }}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-orange-50 text-gray-700"
                    >
                      🚪 Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-orange-100 transition-colors duration-300"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-orange-600" />
            ) : (
              <Menu className="w-6 h-6 text-orange-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-16 right-4 w-60 bg-white rounded-xl shadow-2xl border border-orange-100 z-50">
            <ul className="flex flex-col gap-3 px-4 py-4">
              {[
                { name: "Home", path: "/" },
                { name: "Services", path: "/services" },
                { name: "About", path: "/about" },
                { name: "Book", path: "/book" },
                { name: "Darshan", path: "/darshan" },
                { name: "Contact", path: "/contact" },
              ].map((item) => (
                <li key={item.name}>
                  <a
                    href={item.path}
                    className="block font-semibold text-gray-700 hover:text-orange-600 px-2 py-1 rounded-lg hover:bg-orange-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                </li>
              ))}

              {/* Profile + Logout in Mobile */}
              <li className="border-t border-orange-100 pt-3">
                <a
                  href="/profile"
                  className="block px-2 py-2 rounded-lg hover:bg-orange-50 text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  👤 Profile
                </a>
              </li>
              <li>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                  }}
                  className="w-full text-left px-2 py-2 rounded-lg hover:bg-orange-50 text-gray-700"
                >
                  🚪 Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center text-center text-white px-4 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-110 transition-transform duration-20000 hover:scale-105"
          style={{
            backgroundImage:
              'url("https://img.freepik.com/premium-photo/indian-historical-temple-painting-watercolor-effect_181203-26134.jpg")',
          }}
        ></div>

        {/* Animated Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-orange-900/30 to-black/70"></div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-orange-300/30 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl px-4 animate-fadeInUp">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-2xl bg-gradient-to-r from-orange-200 to-yellow-200 bg-clip-text text-transparent">
            Welcome to Ujjain Yatra
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-6 drop-shadow-lg font-light">
            Begin Your Sacred Journey to the Holy City
          </p>
          <p className="text-base md:text-lg mb-8 max-w-3xl mx-auto opacity-90">
            Experience divine blessings at Mahakaleshwar Jyotirlinga and immerse
            yourself in centuries of spiritual heritage
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white border-2 border-orange-500 rounded-full font-bold text-base transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 transform">
              Start Your Journey
            </button>
            <button className="px-6 py-3 bg-transparent text-white border-2 border-white rounded-full font-bold text-base transition-all duration-300 hover:bg-white/20 hover:-translate-y-2 transform backdrop-blur-sm">
              Watch Live Darshan
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        {/* Services Section */}
        <section className="mb-20 relative">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Our Sacred Services
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete spiritual experience with personalized care and devotion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={service.title}
                className="service-card bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl text-center transition-transform duration-500 group border border-orange-100 cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s`, zIndex: 1 }}
                onClick={() => {
                  if (service.title === "Routes & Maps") {
                    window.location.href = "/map.html"; // works now
                  }
                  if (service.title === "Crowd Detection & Alerts") {
                    window.location.href = "/camera.html"; // works now
                  }
                  if (service.title === "Live Darshan") {
                    navigate("/live-darshan"); // works now
                  }
                  if (service.title === "AI-based Lost & Found") {
                    navigate("/lostFound"); // works now
                  }
                  if (service.title === "Priority Ticketing System") {
                    navigate("/ticket"); // works now
                  }
                }}
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-orange-800 group-hover:text-orange-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <div className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-center gap-2 text-sm text-gray-500"
                    >
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              About Ujjain Yatra
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-10 shadow-xl border border-orange-100">
              <h3 className="text-3xl font-bold mb-6 text-orange-800">
                Our Mission
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We are dedicated to facilitating meaningful spiritual journeys
                to the sacred city of Ujjain. With over a decade of experience,
                we ensure every devotee experiences the divine grace of
                Mahakaleshwar and the rich cultural heritage of this holy city.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    10+
                  </div>
                  <div className="text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    50K+
                  </div>
                  <div className="text-gray-600">Happy Pilgrims</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-10 shadow-xl">
              <h3 className="text-3xl font-bold mb-6 text-orange-800">
                Why Choose Us?
              </h3>
              <div className="space-y-4">
                {[
                  "Expert knowledge of temple traditions",
                  "Comfortable and clean accommodations",
                  "24/7 customer support",
                  "Authentic spiritual experiences",
                  "Affordable and transparent pricing",
                ].map((point, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Notice Section */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-10 text-white text-center shadow-2xl">
            <h2 className="text-4xl font-bold mb-6">🔔 Important Updates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3">Simhastha Kumbh 2028</h3>
                <p>
                  Book early for the grand spiritual gathering. Limited
                  accommodations available.
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3">
                  Special Darshan Timings
                </h3>
                <p>
                  Extended hours during Shravan month. Check our live updates
                  for real-time information.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 pt-20 pb-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-2xl font-bold">
                <span className="text-3xl">🕉</span>
                Ujjain Yatra
              </div>
              <p className="text-gray-300 leading-relaxed">
                Your trusted partner for spiritual journeys to the sacred city
                of Ujjain. Experience divine blessings with comfort and
                devotion.
              </p>
              <div className="flex gap-4">
                {[
                  { icon: Facebook, color: "hover:text-blue-400" },
                  { icon: Twitter, color: "hover:text-sky-400" },
                  { icon: Instagram, color: "hover:text-pink-400" },
                  { icon: Youtube, color: "hover:text-red-400" },
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className={`w-12 h-12 bg-white/10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/20 hover:-translate-y-1 ${social.color}`}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-xl font-bold mb-6 relative">
                Our Services
                <span className="block w-12 h-0.5 bg-orange-400 mt-2 rounded"></span>
              </h3>
              <ul className="space-y-3">
                {[
                  "Temple Darshan Tours",
                  "Accommodation Booking",
                  "Transportation Services",
                  "Puja Arrangements",
                  "Group Package Tours",
                  "Live Darshan Streaming",
                ].map((service, idx) => (
                  <li key={idx}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-orange-300 transition-colors duration-300 flex items-center gap-2"
                    >
                      <span className="w-1 h-1 bg-orange-400 rounded-full"></span>
                      {service}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-bold mb-6 relative">
                Contact Information
                <span className="block w-12 h-0.5 bg-orange-400 mt-2 rounded"></span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300">Near Mahakaleshwar Temple</p>
                    <p className="text-gray-300">
                      Ujjain, Madhya Pradesh 456001
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300">+91 98765 43210</p>
                    <p className="text-gray-300">+91 87654 32109</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <p className="text-gray-300">info@ujjainyatra.com</p>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <p className="text-gray-300">24/7 Customer Support</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-6 relative">
                Quick Links
                <span className="block w-12 h-0.5 bg-orange-400 mt-2 rounded"></span>
              </h3>
              <ul className="space-y-3">
                {[
                  "About Ujjain",
                  "Temple Timings",
                  "Festival Calendar",
                  "Travel Guide",
                  "Photo Gallery",
                  "Customer Reviews",
                  "Terms & Conditions",
                  "Privacy Policy",
                ].map((link, idx) => (
                  <li key={idx}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-orange-300 transition-colors duration-300 flex items-center gap-2"
                    >
                      <span className="w-1 h-1 bg-orange-400 rounded-full"></span>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-12">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-3">Stay Connected</h3>
              <p className="text-gray-300">
                Get updates on temple events, festivals, and special offers
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105">
                Subscribe
              </button>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-white/20 pt-8 text-center">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-300">
                &copy; 2024 Ujjain Yatra. All rights reserved. Made with ❤️ for
                devotees
              </p>
              <div className="flex gap-6 text-sm text-gray-400">
                <a href="#" className="hover:text-orange-300 transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-orange-300 transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-orange-300 transition-colors">
                  Sitemap
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Live Darshan Button */}
      <a
        href="/live-darshan"
        className="hidden sm:flex fixed bottom-6 right-6 z-50 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-4 rounded-full shadow-2xl transition-all duration-300 animate-pulse items-center gap-3 font-semibold"
      >
        <span className="w-3 h-3 bg-white rounded-full animate-ping"></span>
        <span>🔴 Live Darshan</span>
      </a>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Custom gradient text */
        .gradient-text {
          background: linear-gradient(135deg, #ea580c, #dc2626);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
};

export default HomePage2;
