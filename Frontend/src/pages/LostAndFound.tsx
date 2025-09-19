import React, { useState, useEffect } from "react";
import axios from "axios";

interface LostItem {
  id: number;
  title: string;
  description: string;
  status: "lost" | "found";
  reportedByEmail: string;
  reportedByPhone: string;
  image?: string;
  uploadedAt: string;
}

interface FormDataType {
  title: string;
  description: string;
  status: "lost" | "found";
}

interface ZoneHistory {
  last_zone: string | null;
  current_zone: string;
  enter_time: string;
  leave_time: string | null;
  duration_spent: number | null;
}

interface LocationTrackingData {
  client_id: string;
  history: ZoneHistory[];
}

const LostAndFound: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "lost-found" | "location-tracking"
  >("lost-found");

  // Lost & Found States
  const [items, setItems] = useState<LostItem[]>([]);
  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    description: "",
    status: "lost",
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Location Tracking States
  const [trackingMode, setTrackingMode] = useState<"own" | "other" | null>(
    null
  );
  const [searchInput, setSearchInput] = useState({ email: "", phone: "" });
  const [locationHistory, setLocationHistory] =
    useState<LocationTrackingData | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const BASE_URL = "http://localhost:3001/api/v1";

  // Fetch lost items
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${BASE_URL}/lost/get`);
      setItems(res.data.items || []);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to fetch items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch zone history
  const fetchZoneHistory = async () => {
    try {
      setTrackingLoading(true);
      setTrackingError(null);

      const token = localStorage.getItem("token");
      const requestData: any = {};

      if (trackingMode === "other") {
        if (searchInput.email) requestData.email = searchInput.email;
        if (searchInput.phone) requestData.phone = searchInput.phone;
      }

      const config: any = {
        method: "GET",
        url: `${BASE_URL}/zone/history`,
      };

      if (trackingMode === "own" && token) {
        config.headers = { Authorization: `Bearer ${token}` };
      } else if (trackingMode === "other") {
        config.method = "POST";
        config.data = requestData;
        if (token) {
          config.headers = { Authorization: `Bearer ${token}` };
        }
      }

      const res = await axios(config);
      setLocationHistory(res.data);
    } catch (err) {
      console.error("Error fetching zone history:", err);
      setTrackingError("Failed to fetch location history. Please try again.");
    } finally {
      setTrackingLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "lost-found") {
      fetchItems();
    }
  }, [activeTab]);

  // Handle input change for lost & found
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Handle image load error
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    console.warn("Failed to load image:", e.currentTarget.src);
    e.currentTarget.style.display = "none";
  };

  // Submit lost & found form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("status", formData.status);
    if (image) data.append("image", image);

    try {
      const token = localStorage.getItem("token");

      await axios.post(`${BASE_URL}/lost/upload`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setFormData({ title: "", description: "", status: "lost" });
      setImage(null);
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      await fetchItems();
    } catch (err) {
      console.error("Error adding item:", err);
      setError("Failed to add item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  // Reset tracking form
  const resetTrackingForm = () => {
    setTrackingMode(null);
    setSearchInput({ email: "", phone: "" });
    setLocationHistory(null);
    setTrackingError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-red-50 relative">
      {/* Temple-style Header */}
      <div className="relative bg-gradient-to-r from-orange-100 via-red-100 to-orange-100 py-16 mb-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-1/4 w-32 h-32 bg-orange-500 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-8 right-1/3 w-24 h-24 bg-red-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500"></div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500"></div>

        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-orange-600 mb-4 animate-pulse">
            🕉️ Temple Services 🕉️
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-4"></div>
          <p className="text-xl text-orange-700 font-medium tracking-wide">
            "हरे राम हरे राम, राम राम हरे हरे" - Divine Services for Devotees
          </p>
          <p className="text-lg text-orange-600 mt-2 opacity-80">
            Serving devotees at Mahakaleshwar Temple with compassion
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-200 overflow-hidden mb-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab("lost-found")}
              className={`flex-1 py-6 px-8 font-bold text-lg transition-all duration-300 ${
                activeTab === "lost-found"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                  : "bg-orange-50 text-orange-700 hover:bg-orange-100"
              }`}
            >
              🔍 Lost & Found Seva
            </button>
            <button
              onClick={() => setActiveTab("location-tracking")}
              className={`flex-1 py-6 px-8 font-bold text-lg transition-all duration-300 ${
                activeTab === "location-tracking"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                  : "bg-orange-50 text-orange-700 hover:bg-orange-100"
              }`}
            >
              📍 Location & Time Tracking
            </button>
          </div>
        </div>

        {/* Lost & Found Tab Content */}
        {activeTab === "lost-found" && (
          <>
            {/* Error */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg mb-8 shadow-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⚠️</span>
                  <p className="font-semibold">{error}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-200 overflow-hidden mb-12">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
                <h2 className="text-3xl font-bold text-white text-center">
                  ✨ Add New Item ✨
                </h2>
                <p className="text-orange-100 text-center mt-2">
                  Help fellow devotees find their lost belongings
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-orange-700 font-semibold mb-2 text-lg">
                        📝 Item Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter item title (e.g., Mobile Phone, Wallet)"
                        className="w-full p-4 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 text-gray-800 bg-orange-50"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-orange-700 font-semibold mb-2 text-lg">
                        📜 Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the item in detail (color, brand, features)"
                        className="w-full p-4 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 text-gray-800 bg-orange-50 resize-none"
                        rows={4}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-orange-700 font-semibold mb-2 text-lg">
                        📸 Upload Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full p-4 border-2 border-orange-200 rounded-xl focus:border-orange-500 transition-all duration-300 bg-orange-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-orange-700 font-semibold mb-2 text-lg">
                        🏷️ Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full p-4 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 text-gray-800 bg-orange-50"
                        disabled={loading}
                      >
                        <option value="lost">🔍 Lost Item</option>
                        <option value="found">✨ Found Item</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 px-12 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-w-48"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Processing...
                      </div>
                    ) : (
                      <span className="flex items-center justify-center">
                        🙏 Add to Seva List
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-xl border-2 border-orange-100 overflow-hidden hover:shadow-2xl hover:border-orange-300 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {item.image && (
                    <div className="relative">
                      <img
                        src={`http://localhost:3001/uploads/${item.image}`}
                        alt={item.title}
                        className="w-full h-64 object-contain bg-gradient-to-b from-orange-50 to-red-50"
                        onError={handleImageError}
                      />
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                            item.status === "lost"
                              ? "bg-red-500 text-white"
                              : "bg-green-500 text-white"
                          }`}
                        >
                          {item.status === "lost" ? "🔍 Lost" : "✨ Found"}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="text-center mb-4">
                      <h3 className="text-2xl font-bold text-orange-700 mb-2">
                        {item.title}
                      </h3>
                      <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto"></div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-orange-50 p-4 rounded-xl">
                        <p className="text-gray-700 text-center leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-orange-100 to-red-100 p-4 rounded-xl text-orange-800 text-center">
                        <p className="font-semibold">📌 Reported By:</p>
                        <p>{item.reportedByEmail}</p>
                        <p>{item.reportedByPhone}</p>
                      </div>
                      <div className="text-center pt-4 border-t border-orange-200">
                        <p className="text-sm text-orange-600 font-medium">
                          Added:{" "}
                          {new Date(item.uploadedAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {items.length === 0 && !loading && !error && (
              <div className="text-center py-20">
                <div className="text-8xl mb-6 animate-bounce">🕉️</div>
                <h3 className="text-4xl font-bold text-orange-600 mb-4">
                  No Items Listed Yet
                </h3>
                <p className="text-xl text-orange-500 mb-6">
                  Be the first devotee to contribute to this noble seva!
                </p>
                <div className="text-lg text-orange-400">
                  "सेवा परमो धर्म:" - Service is the highest dharma
                </div>
              </div>
            )}
          </>
        )}

        {/* Location Tracking Tab Content */}
        {activeTab === "location-tracking" && (
          <>
            {trackingError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg mb-8 shadow-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⚠️</span>
                  <p className="font-semibold">{trackingError}</p>
                </div>
              </div>
            )}

            {!trackingMode && (
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-200 overflow-hidden mb-12">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
                  <h2 className="text-3xl font-bold text-white text-center">
                    🔮 Whose Location Do You Want to Track? 🔮
                  </h2>
                  <p className="text-orange-100 text-center mt-2">
                    Choose tracking mode for temple zone history
                  </p>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <button
                      onClick={() => setTrackingMode("own")}
                      className="bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 p-8 rounded-2xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="text-6xl mb-4">👤</div>
                      <h3 className="text-2xl font-bold text-orange-700 mb-2">
                        My Own Location
                      </h3>
                      <p className="text-orange-600">
                        View your personal temple zone history using your login
                      </p>
                    </button>

                    <button
                      onClick={() => setTrackingMode("other")}
                      className="bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 p-8 rounded-2xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="text-6xl mb-4">👥</div>
                      <h3 className="text-2xl font-bold text-orange-700 mb-2">
                        Someone Else's Location
                      </h3>
                      <p className="text-orange-600">
                        Search by email or phone number to find location history
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {trackingMode === "other" && !locationHistory && (
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-200 overflow-hidden mb-12">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
                  <h2 className="text-3xl font-bold text-white text-center">
                    🔍 Search Devotee Location 🔍
                  </h2>
                  <p className="text-orange-100 text-center mt-2">
                    Enter email or phone number to find location history
                  </p>
                </div>

                <div className="p-8">
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div>
                      <label className="block text-orange-700 font-semibold mb-2 text-lg">
                        📧 Email Address
                      </label>
                      <input
                        type="email"
                        value={searchInput.email}
                        onChange={(e) =>
                          setSearchInput({
                            ...searchInput,
                            email: e.target.value,
                            phone: "",
                          })
                        }
                        placeholder="Enter devotee's email address"
                        className="w-full p-4 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 text-gray-800 bg-orange-50"
                      />
                    </div>

                    <div className="text-center text-orange-500 font-semibold">
                      OR
                    </div>

                    <div>
                      <label className="block text-orange-700 font-semibold mb-2 text-lg">
                        📱 Phone Number
                      </label>
                      <input
                        type="tel"
                        value={searchInput.phone}
                        onChange={(e) =>
                          setSearchInput({
                            ...searchInput,
                            phone: e.target.value,
                            email: "",
                          })
                        }
                        placeholder="Enter devotee's phone number"
                        className="w-full p-4 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 text-gray-800 bg-orange-50"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={fetchZoneHistory}
                        disabled={
                          trackingLoading ||
                          (!searchInput.email && !searchInput.phone)
                        }
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 px-8 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {trackingLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                            Searching...
                          </div>
                        ) : (
                          "🔍 Search Location History"
                        )}
                      </button>

                      <button
                        onClick={resetTrackingForm}
                        className="px-8 py-4 border-2 border-orange-500 text-orange-500 rounded-full font-bold hover:bg-orange-50 transition-all duration-300"
                      >
                        🔙 Back
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {trackingMode === "own" && !locationHistory && (
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-200 overflow-hidden mb-12">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
                  <h2 className="text-3xl font-bold text-white text-center">
                    📍 Your Location History 📍
                  </h2>
                  <p className="text-orange-100 text-center mt-2">
                    View your personal temple zone tracking history
                  </p>
                </div>

                <div className="p-8 text-center">
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={fetchZoneHistory}
                      disabled={trackingLoading}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 px-12 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {trackingLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                          Loading...
                        </div>
                      ) : (
                        "📊 Load My History"
                      )}
                    </button>

                    <button
                      onClick={resetTrackingForm}
                      className="px-8 py-4 border-2 border-orange-500 text-orange-500 rounded-full font-bold hover:bg-orange-50 transition-all duration-300"
                    >
                      🔙 Back
                    </button>
                  </div>
                </div>
              </div>
            )}

            {locationHistory && (
              <>
                <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-200 overflow-hidden mb-8">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
                    <h2 className="text-3xl font-bold text-white text-center">
                      📍 Location History Results 📍
                    </h2>
                    <p className="text-orange-100 text-center mt-2">
                      Client ID: {locationHistory.client_id}
                    </p>
                  </div>

                  <div className="p-6">
                    <button
                      onClick={resetTrackingForm}
                      className="mb-6 px-6 py-3 border-2 border-orange-500 text-orange-500 rounded-full font-bold hover:bg-orange-50 transition-all duration-300"
                    >
                      🔙 New Search
                    </button>
                  </div>
                </div>

                <div className="space-y-6 pb-16">
                  {locationHistory.history.map((record, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl shadow-xl border-2 border-orange-100 overflow-hidden hover:shadow-2xl hover:border-orange-300 transition-all duration-300"
                    >
                      <div className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Zone Information */}
                          <div className="bg-gradient-to-r from-orange-100 to-red-100 p-6 rounded-xl">
                            <h3 className="text-xl font-bold text-orange-700 mb-4 text-center">
                              🏛️ Zone Information
                            </h3>
                            <div className="space-y-3">
                              {record.last_zone && (
                                <div className="bg-white p-3 rounded-lg">
                                  <p className="text-sm text-orange-600 font-medium">
                                    Previous Zone:
                                  </p>
                                  <p className="text-lg font-bold text-gray-800">
                                    {record.last_zone}
                                  </p>
                                </div>
                              )}
                              <div className="bg-white p-3 rounded-lg">
                                <p className="text-sm text-orange-600 font-medium">
                                  Current Zone:
                                </p>
                                <p className="text-lg font-bold text-gray-800">
                                  {record.current_zone}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Time Information */}
                          <div className="bg-gradient-to-r from-orange-100 to-red-100 p-6 rounded-xl">
                            <h3 className="text-xl font-bold text-orange-700 mb-4 text-center">
                              ⏰ Time Details
                            </h3>
                            <div className="space-y-3">
                              <div className="bg-white p-3 rounded-lg">
                                <p className="text-sm text-orange-600 font-medium">
                                  Enter Time:
                                </p>
                                <p className="text-lg font-bold text-gray-800">
                                  {record.enter_time}
                                </p>
                              </div>
                              {record.leave_time && (
                                <div className="bg-white p-3 rounded-lg">
                                  <p className="text-sm text-orange-600 font-medium">
                                    Leave Time:
                                  </p>
                                  <p className="text-lg font-bold text-gray-800">
                                    {record.leave_time}
                                  </p>
                                </div>
                              )}
                              {!record.leave_time && (
                                <div className="bg-green-100 p-3 rounded-lg border-2 border-green-300">
                                  <p className="text-sm text-green-600 font-medium">
                                    Status:
                                  </p>
                                  <p className="text-lg font-bold text-green-800">
                                    Currently Present
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Duration Information */}
                          <div className="bg-gradient-to-r from-orange-100 to-red-100 p-6 rounded-xl">
                            <h3 className="text-xl font-bold text-orange-700 mb-4 text-center">
                              ⏳ Duration Spent
                            </h3>
                            <div className="text-center">
                              {record.duration_spent ? (
                                <div className="bg-white p-6 rounded-lg">
                                  <div className="text-4xl font-bold text-orange-600 mb-2">
                                    {formatDuration(record.duration_spent)}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    Total time in this zone
                                  </p>
                                </div>
                              ) : (
                                <div className="bg-blue-100 p-6 rounded-lg border-2 border-blue-300">
                                  <div className="text-2xl font-bold text-blue-600 mb-2">
                                    🔄 Still Present
                                  </div>
                                  <p className="text-sm text-blue-600">
                                    Currently in this zone
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Movement Flow Indicator */}
                        <div className="mt-6 pt-6 border-t border-orange-200">
                          <div className="flex items-center justify-center space-x-4">
                            {record.last_zone && (
                              <>
                                <div className="bg-orange-200 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                                  {record.last_zone}
                                </div>
                                <div className="text-orange-500 text-2xl">
                                  →
                                </div>
                              </>
                            )}
                            <div className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                              {record.current_zone}
                            </div>
                            {record.leave_time && (
                              <>
                                <div className="text-orange-500 text-2xl">
                                  →
                                </div>
                                <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-full text-sm font-medium">
                                  Next Zone
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {locationHistory.history.length === 0 && (
                  <div className="text-center py-20">
                    <div className="text-8xl mb-6 animate-bounce">🕉️</div>
                    <h3 className="text-4xl font-bold text-orange-600 mb-4">
                      No Location History Found
                    </h3>
                    <p className="text-xl text-orange-500 mb-6">
                      This devotee hasn't visited any tracked zones yet
                    </p>
                    <div className="text-lg text-orange-400">
                      "आओ और दर्शन करें" - Come and have darshan
                    </div>
                  </div>
                )}
              </>
            )}

            {!trackingMode && !locationHistory && (
              <div className="text-center py-20">
                <div className="text-8xl mb-6 animate-bounce">📍</div>
                <h3 className="text-4xl font-bold text-orange-600 mb-4">
                  Temple Location Tracking
                </h3>
                <p className="text-xl text-orange-500 mb-6">
                  Track devotee movements across different temple zones
                </p>
                <div className="text-lg text-orange-400">
                  "सर्वे भवन्तु सुखिनः" - May all beings be happy
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LostAndFound;
