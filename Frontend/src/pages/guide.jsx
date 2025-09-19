import React, { useEffect, useState } from "react";
import {
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaMapMarkerAlt,
} from "react-icons/fa";

const places = {
  temples: [
    { name: "Mahakaleshwar Temple", lat: 23.1827, lng: 75.7681 },
    { name: "Kal Bhairav Temple", lat: 23.1765, lng: 75.7849 },
    { name: "Harsiddhi Temple", lat: 23.181, lng: 75.7845 },
    { name: "Chintaman Ganesh Temple", lat: 23.192, lng: 75.785 },
  ],
  ghats: [
    { name: "Ram Ghat", lat: 23.182, lng: 75.769 },
    { name: "Bhartrihari Ghat", lat: 23.1805, lng: 75.77 },
  ],
  hospitals: [{ name: "Civil Hospital", lat: 23.183, lng: 75.776 }],
  police: [{ name: "Police Station Freeganj", lat: 23.185, lng: 75.782 }],
  parking: [
    { name: "Parking Lot 3", lat: 23.184, lng: 75.775 },
    { name: "Parking Lot 5", lat: 23.188, lng: 75.78 },
  ],
};

const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getSimpleDirection = (userLat, userLng, placeLat, placeLng) => {
  const latDiff = placeLat - userLat;
  const lngDiff = placeLng - userLng;

  let vertical = "";
  let horizontal = "";

  if (latDiff > 0.0003) vertical = "Forward";
  else if (latDiff < -0.0003) vertical = "Backward";

  if (lngDiff > 0.0003) horizontal = "Right";
  else if (lngDiff < -0.0003) horizontal = "Left";

  if (vertical && horizontal) return `${vertical} & ${horizontal}`;
  if (vertical) return vertical;
  if (horizontal) return horizontal;

  return "You have arrived!";
};

const directionIcon = (dir) => {
  if (dir.includes("Forward") && dir.includes("Right")) return "↗️";
  if (dir.includes("Forward") && dir.includes("Left")) return "↖️";
  if (dir === "Forward") return <FaArrowUp />;
  if (dir === "Backward") return <FaArrowDown />;
  if (dir === "Right") return <FaArrowRight />;
  if (dir === "Left") return <FaArrowLeft />;
  return "✔️";
};

const categories = ["Temples", "Ghats", "Police", "Hospitals", "Parking"];

const GuidePage = () => {
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [directions, setDirections] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Temples");

  useEffect(() => {
    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });

            const allPlaces = {
              Temples: places.temples,
              Ghats: places.ghats,
              Police: places.police,
              Hospitals: places.hospitals,
              Parking: places.parking,
            };

            const categoryPlaces = allPlaces[activeCategory] || [];

            const newDirections = categoryPlaces.map((place) => {
              const distance = getDistance(
                latitude,
                longitude,
                place.lat,
                place.lng
              );
              const direction = getSimpleDirection(
                latitude,
                longitude,
                place.lat,
                place.lng
              );
              return { ...place, distance: Math.round(distance), direction };
            });

            setDirections(newDirections);
          },
          (err) => console.error(err),
          { enableHighAccuracy: true }
        );
      }
    };

    updateLocation();
    const interval = setInterval(updateLocation, 1000);
    return () => clearInterval(interval);
  }, [activeCategory]);

  return (
    <div className="p-4 bg-gradient-to-b from-orange-50 to-orange-100 rounded-2xl shadow-lg h-[500px] overflow-y-auto">
      <h2 className="text-xl font-bold text-orange-800 mb-4 text-center">
        🕉 Ujjain Yatra Guide
      </h2>

      {/* Category Tabs */}
      <div className="flex justify-center space-x-2 mb-4 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-orange-700 border-orange-300 hover:bg-orange-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Directions */}
      {userLocation.lat && userLocation.lng ? (
        directions.length > 0 ? (
          <div className="flex flex-col gap-3">
            {directions.map((place, idx) => (
              <div
                key={idx}
                className="relative bg-orange-100 rounded-xl p-3 shadow-md border border-orange-200 flex flex-col"
              >
                <div className="absolute top-2 right-2 text-xl">
                  {directionIcon(place.direction)}
                </div>
                <h3 className="text-md font-semibold text-orange-700 mb-1 flex items-center gap-1">
                  <FaMapMarkerAlt /> {place.name}
                </h3>
                <p className="text-gray-700 text-sm mb-1">
                  Distance:{" "}
                  <span className="font-bold">{place.distance} m</span>
                </p>
                <p className="text-gray-800 text-sm">
                  Direction: {place.direction}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-700 mt-4">
            No places available in this category.
          </p>
        )
      ) : (
        <p className="text-center text-gray-700 mt-4">
          Fetching your location...
        </p>
      )}
    </div>
  );
};

export default GuidePage;
