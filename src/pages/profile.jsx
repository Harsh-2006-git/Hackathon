import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Shield,
  Home,
  Star,
  Crown,
  Sparkles,
} from "lucide-react";

const ProfilePage = () => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch("http://localhost:3001/api/v1/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const data = await res.json();
        if (data.success) {
          setClient(data.client);
        } else {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading || !client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex justify-center items-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-500 to-red-600 animate-spin">
            <div className="w-16 h-16 bg-white rounded-full m-2 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-orange-500 animate-pulse" />
            </div>
          </div>
          <p className="text-lg text-gray-600 font-medium">
            Loading your sacred profile...
          </p>
          <p className="text-sm text-gray-500 mt-2">🕉️ Please wait</p>
        </div>
      </div>
    );
  }

  const handleBackHome = () => {
    navigate("/");
  };

  const getDevoteeIcon = (level) => {
    switch (level) {
      case "Premium":
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case "Gold":
        return <Star className="w-5 h-5 text-yellow-600" />;
      default:
        return <Shield className="w-5 h-5 text-orange-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 relative overflow-hidden">
      {/* Background Patterns */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-8xl">🕉️</div>
        <div className="absolute top-32 right-20 text-6xl">🪔</div>
        <div className="absolute bottom-32 left-16 text-7xl">🏛️</div>
        <div className="absolute bottom-20 right-32 text-5xl">🌺</div>
        <div className="absolute top-1/2 left-1/4 text-6xl -translate-y-1/2">
          🙏
        </div>
      </div>

      <div className="relative z-10 flex justify-center items-center min-h-screen p-6">
        <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-3xl p-8 w-full max-w-2xl border border-orange-200/50 relative overflow-hidden">
          {/* Top Border */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500"></div>

          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="relative mx-auto mb-6">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 p-1 shadow-2xl">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-4xl font-bold text-transparent bg-clip-text ">
                  {client.name ? client.name.charAt(0).toUpperCase() : "?"}
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                {getDevoteeIcon(client.userType)}
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 animate-pulse scale-110"></div>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
              {client.name}
              <span className="text-2xl">🙏</span>
            </h1>
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full border border-orange-200">
                <span className="text-orange-700 font-semibold flex items-center gap-1">
                  {getDevoteeIcon(client.userType)}
                  {client.userType}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4 mb-8">
            {/* Contact */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-5 border border-orange-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-orange-600" />
                Contact Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                  <Phone className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-800 font-semibold">
                      {client.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                  <Mail className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800 font-semibold">
                      {client.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-5 border border-red-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Account Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      client.email_verified ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <div>
                    <p className="text-sm text-gray-500">Email Status</p>
                    <p className="text-gray-800 font-semibold">
                      {client.email_verified
                        ? "Verified ✅"
                        : "Not Verified ❌"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    ID
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Client ID</p>
                    <p className="text-gray-800 font-semibold">
                      #{client.client_id}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Membership */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-5 border border-yellow-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-yellow-600" />
                Membership Details
              </h3>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xl">
                  🗓️
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-gray-800 font-semibold">
                    {new Date(client.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleBackHome}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Return to Home
            </button>
            <button
              onClick={() => alert("Edit profile coming soon!")}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
            >
              <User className="w-5 h-5" />
              Edit Profile
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center border-t border-orange-200 pt-6">
            <p className="text-gray-600 font-medium flex items-center justify-center gap-2">
              <span className="text-xl">🕉️</span>
              May your path be blessed with divine grace
              <span className="text-xl">🕉️</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Temple Management System • Sacred & Secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
