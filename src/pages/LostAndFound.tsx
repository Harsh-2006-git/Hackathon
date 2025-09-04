import React, { useState, useEffect } from "react";
import axios from "axios";

interface LostItem {
  item_id: number;
  itemName: string;
  description: string;
  locationFound: string;
  contactNumber: string;
  imageUrl?: string;
  status: "Lost" | "Found";
  created_at: string;
  updated_at: string;
}

interface FormDataType {
  itemName: string;
  description: string;
  locationFound: string;
  contactNumber: string;
  status: "Lost" | "Found";
}

const LostAndFound: React.FC = () => {
  const [items, setItems] = useState<LostItem[]>([]);
  const [formData, setFormData] = useState<FormDataType>({
    itemName: "",
    description: "",
    locationFound: "",
    contactNumber: "",
    status: "Lost",
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Base URL for your backend
  const BASE_URL = "http://localhost:3001";

  // Fetch items
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get<LostItem[]>(
        `${BASE_URL}/api/v1/lost-items/all`
      );
      setItems(res.data);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to fetch items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Handle input change
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

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append("itemName", formData.itemName);
    data.append("description", formData.description);
    data.append("locationFound", formData.locationFound);
    data.append("contactNumber", formData.contactNumber);
    data.append("status", formData.status);
    if (image) data.append("image", image);

    try {
      await axios.post(`${BASE_URL}/api/v1/lost-items/add`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Reset form and refresh items
      setFormData({
        itemName: "",
        description: "",
        locationFound: "",
        contactNumber: "",
        status: "Lost",
      });
      setImage(null);
      // Clear file input
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-red-50 relative">
      {/* Temple-style Header Background */}
      <div className="relative bg-gradient-to-r from-orange-100 via-red-100 to-orange-100 py-16 mb-12">
        {/* Decorative temple pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-1/4 w-32 h-32 bg-orange-500 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-8 right-1/3 w-24 h-24 bg-red-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        {/* Temple-style border */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500"></div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500"></div>

        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-orange-600 mb-4 animate-pulse">
            🕉️ Lost & Found Seva 🕉️
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-4"></div>
          <p className="text-xl text-orange-700 font-medium tracking-wide">
            "हरे राम हरे राम, राम राम हरे हरे" - Divine Service for Lost Items
          </p>
          <p className="text-lg text-orange-600 mt-2 opacity-80">
            Serving devotees at Mahakaleshwar Temple with compassion
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg mb-8 shadow-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <p className="font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-200 overflow-hidden mb-12">
          {/* Form Header */}
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
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-orange-700 font-semibold mb-2 text-lg">
                    📝 Item Name
                  </label>
                  <input
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    placeholder="Enter item name (e.g., Mobile Phone, Wallet)"
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
                    placeholder="Describe the item in detail (color, brand, distinctive features)"
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

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-orange-700 font-semibold mb-2 text-lg">
                    📍 Location
                  </label>
                  <input
                    type="text"
                    name="locationFound"
                    value={formData.locationFound}
                    onChange={handleChange}
                    placeholder="Where was it lost/found (e.g., Temple Premises, Parking Area)"
                    className="w-full p-4 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 text-gray-800 bg-orange-50"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-orange-700 font-semibold mb-2 text-lg">
                    📞 Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="Your contact number"
                    className="w-full p-4 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 text-gray-800 bg-orange-50"
                    required
                    disabled={loading}
                  />
                </div>

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
                    <option value="Lost">🔍 Lost Item</option>
                    <option value="Found">✨ Found Item</option>
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

        {/* Loading State */}
        {loading && !error && (
          <div className="text-center py-16">
            <div className="inline-block relative">
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-orange-500 border-opacity-75"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-t-4 border-orange-300 border-opacity-25"></div>
            </div>
            <p className="mt-6 text-orange-600 text-xl font-semibold">
              Loading with divine blessings...
            </p>
          </div>
        )}

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
          {items.map((item) => (
            <div
              key={item.item_id}
              className="bg-white rounded-2xl shadow-xl border-2 border-orange-100 overflow-hidden hover:shadow-2xl hover:border-orange-300 transition-all duration-300 transform hover:scale-[1.02]"
            >
              {item.imageUrl && (
                <div className="relative">
                  <img
                    src={`${BASE_URL}${item.imageUrl}`}
                    alt={item.itemName}
                    className="w-full h-64 object-contain bg-gradient-to-b from-orange-50 to-red-50"
                    onError={handleImageError}
                  />
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                        item.status === "Lost"
                          ? "bg-red-500 text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      {item.status === "Lost" ? "🔍 Lost" : "✨ Found"}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-orange-700 mb-2">
                    {item.itemName}
                  </h3>
                  <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto"></div>
                </div>

                <div className="space-y-4">
                  <div className="bg-orange-50 p-4 rounded-xl">
                    <p className="text-gray-700 text-center leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-orange-700 bg-gradient-to-r from-orange-100 to-red-100 p-3 rounded-xl">
                      <span className="text-xl mr-3">📍</span>
                      <span className="font-medium">{item.locationFound}</span>
                    </div>
                    <div className="flex items-center text-orange-700 bg-gradient-to-r from-orange-100 to-red-100 p-3 rounded-xl">
                      <span className="text-xl mr-3">📞</span>
                      <span className="font-medium">{item.contactNumber}</span>
                    </div>
                  </div>

                  {!item.imageUrl && (
                    <div className="text-center py-4">
                      <p
                        className={`text-lg font-bold ${
                          item.status === "Lost"
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {item.status === "Lost"
                          ? "🔍 Lost Item"
                          : "✨ Found Item"}
                      </p>
                    </div>
                  )}

                  <div className="text-center pt-4 border-t border-orange-200">
                    <p className="text-sm text-orange-600 font-medium">
                      Added:{" "}
                      {new Date(item.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
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
      </div>
    </div>
  );
};

export default LostAndFound;
