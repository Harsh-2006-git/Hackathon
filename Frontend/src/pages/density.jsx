import React, { useEffect, useState, useRef } from "react";
import jsQR from "jsqr";

const Dashboard = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);
  const [scanData, setScanData] = useState({ unique_code: "", zone_id: "" });
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" or "scanner"
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanInterval = useRef(null);

  // Fetch zone density data
  const fetchZoneData = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/v1/zone/density");
      const data = await response.json();
      setZones(data.zones || data || []);
    } catch (error) {
      console.error("Error fetching zone data:", error);
    }
  };

  // Handle zone scan
  const handleZoneScan = async (e) => {
    if (e) e.preventDefault();
    if (!scanData.unique_code || !scanData.zone_id) {
      setScanResult({ message: "Please enter both unique code and zone ID" });
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/v1/zone/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scanData),
      });

      const result = await response.json();
      setScanResult(result);

      if (response.ok) {
        fetchZoneData();
        setScanData({ unique_code: "", zone_id: "" });
        stopScanner();
      }
    } catch (error) {
      console.error("Error scanning zone:", error);
      setScanResult({ message: "Error scanning zone" });
    }
  };

  // Handle zone exit
  const handleZoneExit = async (unique_code) => {
    try {
      const response = await fetch("http://localhost:3001/api/v1/zone/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unique_code }),
      });

      const result = await response.json();
      setScanResult(result);

      if (response.ok) fetchZoneData();
    } catch (error) {
      console.error("Error exiting zone:", error);
      setScanResult({ message: "Error exiting zone" });
    }
  };

  // QR code detection
  const detectQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
      try {
        const parsed = JSON.parse(code.data);
        return parsed.unique_code || code.data;
      } catch {
        return code.data;
      }
    }
    return null;
  };

  // Start QR scanner
  const startScanner = async () => {
    setIsScanning(true);
    setScannerError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) videoRef.current.srcObject = stream;

      scanInterval.current = setInterval(() => {
        const qrCode = detectQRCode();
        if (qrCode) {
          setScanData((prev) => ({ ...prev, unique_code: qrCode }));
          setScanResult({ message: `✅ QR Code detected: ${qrCode}` });
        }
      }, 500);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setScannerError("Cannot access camera. Check permissions.");
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    setIsScanning(false);
    if (scanInterval.current) {
      clearInterval(scanInterval.current);
      scanInterval.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchZoneData();
      setLoading(false);
    };

    loadData();
    const intervalId = setInterval(fetchZoneData, 5000);

    return () => {
      clearInterval(intervalId);
      stopScanner();
    };
  }, []);

  const getDensityStatus = (density) => {
    if (density === 0) return { text: "Low", color: "bg-green-500" };
    if (density < 3) return { text: "Moderate", color: "bg-yellow-500" };
    return { text: "High", color: "bg-red-500" };
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
            🏛️ Zone Monitoring System 🏛️
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-4"></div>
          <p className="text-xl text-orange-700 font-medium tracking-wide">
            "सर्वे भवन्तु सुखिनः" - Temple Zone Management Dashboard
          </p>
          <p className="text-lg text-orange-600 mt-2 opacity-80">
            Real-time monitoring of devotee flow at Mahakaleshwar Temple
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-200 overflow-hidden mb-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex-1 py-6 px-8 font-bold text-lg transition-all duration-300 ${
                activeTab === "dashboard"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                  : "bg-orange-50 text-orange-700 hover:bg-orange-100"
              }`}
            >
              📊 Density Dashboard
            </button>
            <button
              onClick={() => setActiveTab("scanner")}
              className={`flex-1 py-6 px-8 font-bold text-lg transition-all duration-300 ${
                activeTab === "scanner"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                  : "bg-orange-50 text-orange-700 hover:bg-orange-100"
              }`}
            >
              📱 QR Scanner
            </button>
          </div>
        </div>

        {/* Dashboard Tab Content */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 pb-16">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Zone Map */}
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
                  <h2 className="text-3xl font-bold text-white text-center">
                    🗺️ Temple Zone Map 🗺️
                  </h2>
                  <p className="text-orange-100 text-center mt-2">
                    Interactive zone monitoring view
                  </p>
                </div>

                <div className="p-6">
                  <div className="relative">
                    <img
                      src="https://archive.org/download/ujjain_district_madhya_pradesh_election_2018_map/ujjain_district_madhya_pradesh_election_2018_map.jpg"
                      alt="Ujjain Map"
                      className="rounded-xl w-full border-2 border-orange-100"
                    />
                    <div className="absolute inset-0">
                      {zones.map((zone) => (
                        <div
                          key={zone.zone_id}
                          className={`absolute w-12 h-12 rounded-full text-white flex items-center justify-center font-bold cursor-pointer shadow-lg border-2 border-white transition-all duration-300 hover:scale-110 ${
                            getDensityStatus(zone.density).color
                          }`}
                          style={{
                            top: `${15 + zone.zone_id * 10}%`,
                            left: `${15 + zone.zone_id * 5}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                          onClick={() => setSelectedZone(zone)}
                        >
                          {zone.zone_id}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="mt-6 bg-orange-50 p-4 rounded-xl">
                    <h3 className="font-bold text-orange-700 mb-3 text-center">
                      Density Legend
                    </h3>
                    <div className="flex justify-center space-x-6">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-gray-700">
                          Low
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-gray-700">
                          Moderate
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-gray-700">
                          High
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zone List */}
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
                  <h2 className="text-3xl font-bold text-white text-center">
                    📈 Zone Overview 📈
                  </h2>
                  <p className="text-orange-100 text-center mt-2">
                    Real-time density monitoring
                  </p>
                </div>

                <div className="p-6">
                  {loading ? (
                    <div className="text-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                      <p className="text-orange-600 font-medium">
                        Loading zone data...
                      </p>
                    </div>
                  ) : zones.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="text-6xl mb-4">🕉️</div>
                      <p className="text-orange-600 font-medium">
                        No zones available
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {zones.map((zone) => {
                        const status = getDensityStatus(zone.density);
                        return (
                          <div
                            key={zone.zone_id}
                            className={`p-3 rounded-xl shadow-lg cursor-pointer border-l-4 ${status.color} bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all duration-300 transform hover:scale-[1.02]`}
                            onClick={() => setSelectedZone(zone)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-bold text-base text-orange-700">
                                  {zone.zone_name}
                                </h3>
                                <p className="text-xs text-orange-600">
                                  Zone ID:{" "}
                                  <span className="font-bold">
                                    {zone.zone_id}
                                  </span>
                                </p>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`px-3 py-1 text-xs font-bold rounded-full ${status.color} text-white shadow-md`}
                                >
                                  {status.text}
                                </span>
                                <p className="text-xl font-bold text-gray-700 mt-1">
                                  {zone.density}
                                </p>
                                <p className="text-xs text-gray-500">
                                  devotees
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scanner Tab Content */}
        {activeTab === "scanner" && (
          <div className="pb-16">
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
                <h2 className="text-3xl font-bold text-white text-center">
                  📱 QR Code Scanner 📱
                </h2>
                <p className="text-orange-100 text-center mt-2">
                  Scan devotee QR codes for zone tracking (Find your unique RFID
                  from profile section)
                </p>
              </div>

              <div className="p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* QR Scanner Section */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-orange-100 to-red-100 p-6 rounded-2xl">
                      <h3 className="text-xl font-bold text-orange-700 mb-4 text-center">
                        📷 Camera Scanner
                      </h3>

                      <div className="flex flex-col items-center">
                        <div className="relative w-80 h-60 bg-black rounded-xl overflow-hidden border-4 border-orange-200">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                          <canvas
                            ref={canvasRef}
                            width="640"
                            height="480"
                            className="hidden"
                          />

                          {/* Scanning Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="border-4 border-white border-dashed w-40 h-40 rounded-lg animate-pulse"></div>
                          </div>

                          {/* Status Indicator */}
                          <div className="absolute top-4 left-4">
                            <div
                              className={`w-4 h-4 rounded-full ${
                                isScanning
                                  ? "bg-green-400 animate-pulse"
                                  : "bg-red-400"
                              }`}
                            ></div>
                          </div>
                        </div>

                        <div className="mt-6 flex gap-4">
                          <button
                            onClick={isScanning ? stopScanner : startScanner}
                            className={`px-6 py-3 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                              isScanning
                                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg"
                                : "bg-green-500 hover:bg-green-600 text-white shadow-lg"
                            }`}
                          >
                            {isScanning
                              ? "🛑 Stop Scanner"
                              : "📷 Start Scanner"}
                          </button>
                        </div>

                        {scannerError && (
                          <div className="mt-4 p-3 rounded-lg bg-red-100 border-2 border-red-300 text-red-700 font-medium text-center">
                            ⚠️ {scannerError}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Manual Entry Form */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-orange-100 to-red-100 p-6 rounded-2xl">
                      <h3 className="text-xl font-bold text-orange-700 mb-4 text-center">
                        ✍️ Manual Entry
                      </h3>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-orange-700 font-semibold mb-2 text-lg">
                            🔢 Unique Code
                          </label>
                          <input
                            type="text"
                            value={scanData.unique_code}
                            onChange={(e) =>
                              setScanData((prev) => ({
                                ...prev,
                                unique_code: e.target.value,
                              }))
                            }
                            placeholder="Scan or enter unique devotee code"
                            className="w-full p-4 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 text-gray-800 bg-orange-50"
                          />
                        </div>

                        <div>
                          <label className="block text-orange-700 font-semibold mb-2 text-lg">
                            🏛️ Select Zone
                          </label>
                          <select
                            value={scanData.zone_id}
                            onChange={(e) =>
                              setScanData((prev) => ({
                                ...prev,
                                zone_id: e.target.value,
                              }))
                            }
                            className="w-full p-4 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 text-gray-800 bg-orange-50"
                          >
                            <option value="">-- Select Temple Zone --</option>
                            {zones.map((zone) => (
                              <option key={zone.zone_id} value={zone.zone_id}>
                                {zone.zone_name} (ID: {zone.zone_id})
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={handleZoneScan}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 px-8 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                        >
                          🙏 Submit Zone Entry
                        </button>
                      </div>
                    </div>

                    {/* Scan Result */}
                    {scanResult && (
                      <div
                        className={`p-4 rounded-xl font-medium text-center ${
                          scanResult.message.includes("✅")
                            ? "bg-green-100 border-2 border-green-300 text-green-700"
                            : scanResult.message.toLowerCase().includes("error")
                            ? "bg-red-100 border-2 border-red-300 text-red-700"
                            : "bg-blue-100 border-2 border-blue-300 text-blue-700"
                        }`}
                      >
                        {scanResult.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Zone Details Modal */}
      {selectedZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border-2 border-orange-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                  🏛️ {selectedZone.zone_name}
                </h2>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="text-white hover:text-orange-200 text-2xl font-bold transition-colors duration-300"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-4 rounded-xl text-center">
                  <p className="text-sm text-orange-600 font-medium">Zone ID</p>
                  <p className="text-2xl font-bold text-orange-800">
                    {selectedZone.zone_id}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl text-center">
                  <p className="text-sm text-red-600 font-medium">
                    Current Count
                  </p>
                  <p className="text-2xl font-bold text-red-800">
                    {selectedZone.density}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-100 to-red-100 p-4 rounded-xl text-center">
                <p className="text-sm text-orange-700 font-medium mb-2">
                  Density Status
                </p>
                <span
                  className={`px-4 py-2 rounded-full text-white font-bold ${
                    getDensityStatus(selectedZone.density).color
                  }`}
                >
                  {getDensityStatus(selectedZone.density).text}
                </span>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setScanData((prev) => ({
                      ...prev,
                      zone_id: selectedZone.zone_id,
                    }));
                    setSelectedZone(null);
                    setActiveTab("scanner");
                  }}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105"
                >
                  📱 Scan This Zone
                </button>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="px-6 py-3 border-2 border-orange-500 text-orange-500 rounded-full font-bold hover:bg-orange-50 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
