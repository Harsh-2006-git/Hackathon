import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as htmlToImage from "html-to-image";
import { saveAs } from "file-saver";
import {
  User,
  Calendar,
  Shield,
  Star,
  Crown,
  Sparkles,
  Home,
  Download,
  Radio,
  CreditCard,
} from "lucide-react";

const ProfileRfidPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [rfidData, setRfidData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const cardRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch("http://localhost:3001/api/v1/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          generateRfid(data.user);
        } else {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  const generateRfid = async (profileUser) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/v1/zone/generate", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRfidData(data);
      else setError(data.message || "Failed to generate RFID tag");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const downloadRfidCard = () => {
    if (!cardRef.current) return;

    // Add a slight delay to ensure all styles are properly rendered
    setTimeout(() => {
      htmlToImage
        .toPng(cardRef.current, {
          backgroundColor: "#fef3c7",
          quality: 1,
          pixelRatio: 3, // Higher resolution for better print quality
        })
        .then((dataUrl) => {
          saveAs(dataUrl, `${user.name.replace(/\s+/g, "_")}_rfid_card.png`);
        })
        .catch((err) => console.error("Download failed", err));
    }, 100);
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

  if (loading || !user)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 p-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-500 to-red-600 animate-spin">
            <div className="w-16 h-16 bg-white rounded-full m-2 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-orange-500 animate-pulse" />
            </div>
          </div>
          <p className="text-lg text-gray-600 font-medium">
            Loading your spiritual access card...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen py-10 px-4 md:px-10 lg:px-20 bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex flex-col md:flex-row justify-center items-start gap-10">
      {/* PROFILE LEFT */}
      <div className="flex-1 bg-white/95 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-orange-200/50 relative overflow-hidden transition-transform hover:scale-105 duration-300">
        <div className="text-center mb-8">
          <div className="relative mx-auto mb-6">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 p-1 shadow-xl">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-4xl font-bold text-transparent bg-clip-text ">
                {user.name ? user.name.charAt(0).toUpperCase() : "?"}
              </div>
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              {getDevoteeIcon(user.userType)}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            {user.name} <span className="text-2xl">🙏</span>
          </h1>
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            <div className="px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full border border-orange-200">
              <span className="text-orange-700 font-semibold flex items-center gap-1">
                {getDevoteeIcon(user.userType)}
                {user.userType}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" /> Contact Information
            </h3>
            <p className="mt-2">📞 {user.phone}</p>
            <p>📧 {user.email}</p>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-600" /> Member Since
            </h3>
            <p className="mt-2">
              {new Date(user.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* RFID RIGHT */}
      <div className="flex-1 flex flex-col items-center gap-6 w-full">
        {error && <p className="text-red-500">{error}</p>}

        {rfidData && (
          <div className="flex flex-col items-center gap-4 w-full max-w-md md:max-w-full">
            <div
              ref={cardRef}
              className="relative bg-gradient-to-br from-amber-200 via-orange-100 to-yellow-100 shadow-2xl rounded-xl p-6 w-full max-w-sm overflow-hidden border-2 border-amber-300"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(45deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.1) 10px, rgba(245, 158, 11, 0.1) 10px, rgba(245, 158, 11, 0.1) 20px)
                `,
                boxShadow:
                  "0 10px 30px rgba(0, 0, 0, 0.15), inset 0 0 50px rgba(255, 255, 255, 0.4)",
              }}
            >
              {/* Holographic Strip */}
              <div className="absolute top-4 left-0 right-0 h-6 bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-400 opacity-80"></div>

              {/* RFID Chip */}
              <div className="absolute top-12 right-6 w-12 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-md flex items-center justify-center shadow-inner">
                <div className="w-8 h-5 bg-gradient-to-r from-gray-500 to-gray-700 rounded-sm flex items-center justify-center">
                  <Radio className="w-3 h-3 text-gray-300" />
                </div>
              </div>

              {/* Card Logo */}

              {/* Card Number */}
              <div className="absolute top-16 left-4 text-xs font-mono text-gray-600 tracking-widest">
                ID: {user.id?.toString().padStart(8, "0") || "00000000"}
              </div>

              {/* Contactless Symbol */}
              <div className="absolute top-10 right-4 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border-2 border-gray-500 flex items-center justify-center mb-1">
                  <div className="w-5 h-5 rounded-full border border-gray-500"></div>
                </div>
                <span className="text-[8px] text-gray-500 font-semibold">
                  CONTACTLESS
                </span>
              </div>

              <div className="mt-20 mb-6">
                <h2 className="text-xl font-bold text-gray-800 text-center mb-1 uppercase tracking-wide">
                  Spiritual Access Card
                </h2>
                <p className="text-xs text-center text-gray-600 mb-6">
                  ConnectX Temple Access System
                </p>

                <div className="bg-white/80 rounded-lg p-4 shadow-inner mb-4">
                  <div className="text-gray-700 space-y-2">
                    <p className="flex items-center">
                      <span className="font-semibold text-sm w-16">Name:</span>
                      <span className="text-sm font-medium">
                        {rfidData.name || user.name}
                      </span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-semibold text-sm w-16">Type:</span>
                      <span className="text-sm font-medium bg-amber-100 px-2 py-1 rounded">
                        {user.userType}
                      </span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-semibold text-sm w-16">Valid:</span>
                      <span className="text-sm font-medium">2023-2025</span>
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="text-left">
                    <p className="text-[10px] text-gray-500 uppercase">
                      Member Since
                    </p>
                    <p className="text-xs font-semibold">
                      {new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <img
                      src={rfidData.qrImage}
                      alt="RFID QR Code"
                      className="w-20 h-20 object-contain rounded border border-gray-300 shadow-sm"
                    />
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase">
                      Issued By
                    </p>
                    <p className="text-xs font-semibold">ConnectX Admin</p>
                  </div>
                </div>
              </div>

              {/* Signature Strip */}
              <div className="absolute bottom-4 left-4 right-4 h-8 bg-gradient-to-r from-amber-500 to-amber-300 rounded-sm opacity-70"></div>

              {/* Security Pattern */}
              <div className="absolute bottom-12 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>

              <p className="absolute bottom-2 right-4 text-gray-500 text-[8px]">
                #{Math.random().toString(36).substring(2, 10).toUpperCase()}
              </p>
            </div>

            <button
              onClick={downloadRfidCard}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 mt-4 shadow-md"
            >
              <Download className="w-5 h-5" /> Download RFID Card
            </button>

            <div className="text-center text-sm text-gray-600 max-w-md mt-2">
              <CreditCard className="w-4 h-4 inline-block mr-1" />
              This digital card can be printed and used for temple access. Keep
              it secure.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileRfidPage;
