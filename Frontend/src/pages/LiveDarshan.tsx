import React from "react";

const LiveDarshan = () => {
  const videoId = "DvmYJhKXzwY"; // Your live video ID

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-extrabold text-center mb-6">
          🔴 Live Darshan - Mahakaleshwar Jyotirlinga
        </h1>

        <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl mb-8">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="Live Darshan"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div className="mb-8 text-lg text-center max-w-4xl mx-auto leading-relaxed">
          <p className="mb-4">
            Experience the divine blessings of Lord Shiva from the sacred
            <strong> Mahakaleshwar Jyotirlinga Temple</strong> in Ujjain. This
            temple is one of the twelve Jyotirlingas and holds great spiritual
            importance in Hinduism. It is the only Jyotirlinga facing south
            (Dakshinamukhi), representing a unique form of Lord Shiva.
          </p>
        </div>
        <div className="text-center text-gray-300 text-sm">
          Powered by BhaktiLive & YouTube API | © {new Date().getFullYear()}{" "}
          Mahakaleshwar Darshan
        </div>
      </div>
    </div>
  );
};

export default LiveDarshan;
