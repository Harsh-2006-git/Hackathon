import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Users,
  CheckCircle,
  QrCode,
  Ticket as TicketIcon,
  Clock,
  MapPin,
  Download,
  Eye,
  RefreshCw,
} from "lucide-react";

const UjjainYatraBooking = () => {
  const [activeTab, setActiveTab] = useState("book");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [ticketCount, setTicketCount] = useState(1);
  const [clientInfo, setClientInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [bookedTickets, setBookedTickets] = useState([]);
  const [timeSlotCapacity, setTimeSlotCapacity] = useState({});
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [animateSuccess, setAnimateSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const timeSlots = [
    "08:00 AM",
    "08:30 AM",
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
    "06:00 PM",
    "06:30 PM",
    "07:00 PM",
    "07:30 PM",
    "08:00 PM",
  ];

  const API = axios.create({
    baseURL: "http://localhost:3001/api/v1",
  });

  // Get JWT token from localStorage
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Initialize random slot capacity
  useEffect(() => {
    const initialCapacity = {};
    timeSlots.forEach((slot) => {
      initialCapacity[slot] = {
        booked: Math.floor(Math.random() * 50),
        maxCapacity: 100,
      };
    });
    setTimeSlotCapacity(initialCapacity);
  }, []);

  // Fetch tickets for logged-in client
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await API.get("/ticket/get", config);
      console.log("API Response:", res.data);

      if (res.data.tickets) {
        setBookedTickets(res.data.tickets);
      } else if (Array.isArray(res.data)) {
        setBookedTickets(res.data);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      if (error.response?.status === 404) {
        setBookedTickets([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getNextAvailableSlot = (requestedTime, requestedTickets) => {
    const currentIndex = timeSlots.indexOf(requestedTime);
    for (let i = currentIndex; i < timeSlots.length; i++) {
      const slot = timeSlots[i];
      const available =
        timeSlotCapacity[slot]?.maxCapacity -
        (timeSlotCapacity[slot]?.booked || 0);
      if (available >= requestedTickets) return slot;
    }
    return null;
  };

  const handleBooking = async () => {
    if (
      !selectedDate ||
      !selectedTime ||
      !clientInfo.name ||
      !clientInfo.email
    ) {
      alert("Please fill all required fields");
      return;
    }

    const availableSlot = getNextAvailableSlot(selectedTime, ticketCount);
    if (!availableSlot) {
      alert("No available slots for today. Please try another date.");
      return;
    }

    try {
      setLoading(true);
      const ticketData = {
        date: selectedDate,
        time: availableSlot,
        temples: "Mahakaleshwar",
        no_of_tickets: ticketCount,
      };

      const res = await API.post("/ticket/create", ticketData, config);

      setTimeSlotCapacity((prev) => ({
        ...prev,
        [availableSlot]: {
          ...prev[availableSlot],
          booked: prev[availableSlot].booked + ticketCount,
        },
      }));

      // Refresh tickets list
      await fetchTickets();

      setAnimateSuccess(true);
      setTimeout(() => setAnimateSuccess(false), 3000);

      setShowBookingForm(false);
      setClientInfo({ name: "", email: "", phone: "" });
      setTicketCount(1);
      setSelectedDate("");
      setSelectedTime("");

      // Switch to tickets tab
      setActiveTab("tickets");

      if (availableSlot !== selectedTime) {
        alert(
          `Requested time ${selectedTime} was full. You've been allocated ${availableSlot} instead.`
        );
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert(
        error.response?.data?.message || "Booking failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getSlotStatus = (slot) => {
    const capacity = timeSlotCapacity[slot];
    if (!capacity) return "available";
    const available = capacity.maxCapacity - capacity.booked;
    if (available === 0) return "full";
    if (available <= 10) return "filling";
    return "available";
  };

  const getSlotColor = (status) => {
    switch (status) {
      case "full":
        return "bg-red-500";
      case "filling":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const downloadTicket = (ticket) => {
    // Create a simple text version for download
    const ticketText = `
    UJJAIN YATRA - DARSHAN TICKET
    ════════════════════════════════
    
    Ticket ID: ${ticket.ticket_id}
    Temple: Mahakaleshwar Jyotirlinga
    
    Date: ${formatDate(ticket.date)}
    Time: ${ticket.time}
    Tickets: ${ticket.no_of_tickets}
    
    Visitor Details:
    Name: ${ticket.Client?.name || "N/A"}
    Phone: ${ticket.Client?.phone || "N/A"}
    Email: ${ticket.Client?.email || "N/A"}
    
    Booked on: ${new Date(ticket.created_at).toLocaleString("en-IN")}
    
    ════════════════════════════════
    Please carry this ticket and a valid ID
    `;

    const blob = new Blob([ticketText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ujjain-yatra-ticket-${ticket.ticket_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const BookingTab = () => (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Booking Form */}
      <div className="bg-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300">
        <div className="flex items-center mb-6">
          <Calendar className="w-8 h-8 text-orange-600 mr-3" />
          <h2 className="text-3xl font-bold text-gray-800">
            Book Your Darshan
          </h2>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full p-3 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-3">
            Select Time Slot
          </label>
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {timeSlots.map((slot) => {
              const status = getSlotStatus(slot);
              const capacity = timeSlotCapacity[slot];
              const available = capacity
                ? capacity.maxCapacity - capacity.booked
                : 100;
              return (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  disabled={status === "full"}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-300 ${
                    selectedTime === slot
                      ? "border-orange-500 bg-orange-100 text-orange-700"
                      : status === "full"
                      ? "border-red-300 bg-red-100 text-red-500 cursor-not-allowed opacity-60"
                      : "border-gray-300 hover:border-orange-400 hover:bg-orange-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{slot}</span>
                    <div
                      className={`w-2 h-2 rounded-full ${getSlotColor(status)}`}
                    ></div>
                  </div>
                  <div className="text-xs mt-1 text-gray-500">
                    {available}/100 left
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Number of Tickets
          </label>
          <select
            value={ticketCount}
            onChange={(e) => setTicketCount(Number(e.target.value))}
            className="w-full p-3 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          >
            {[...Array(10).keys()].map((num) => (
              <option key={num + 1} value={num + 1}>
                {num + 1} Ticket{num > 0 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowBookingForm(true)}
          disabled={!selectedDate || !selectedTime || loading}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin inline mr-2" />
          ) : null}
          Continue to Book Darshan
        </button>
      </div>

      {/* Availability Overview */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center mb-6">
          <Users className="w-8 h-8 text-orange-600 mr-3" />
          <h2 className="text-3xl font-bold text-gray-800">
            Today's Availability
          </h2>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {timeSlots.map((slot) => {
            const capacity = timeSlotCapacity[slot];
            const booked = capacity?.booked || 0;
            const available = (capacity?.maxCapacity || 100) - booked;
            const percentage = (booked / (capacity?.maxCapacity || 100)) * 100;
            return (
              <div
                key={slot}
                className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">{slot}</span>
                  <span className="text-sm text-gray-600">
                    {available}/100 available
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      percentage === 100
                        ? "bg-red-500"
                        : percentage > 80
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const TicketsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <TicketIcon className="w-8 h-8 text-orange-600 mr-3" />
          <h2 className="text-3xl font-bold text-gray-800">
            Your Booked Tickets
          </h2>
        </div>
        <button
          onClick={fetchTickets}
          disabled={loading}
          className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : bookedTickets.length > 0 ? (
        <div className="grid gap-6">
          {bookedTickets.map((ticket) => (
            <div
              key={ticket.ticket_id}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Ticket Design */}
              <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 p-6 text-white">
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 left-4 text-6xl">🕉</div>
                  <div className="absolute bottom-4 right-4 text-4xl">🏛️</div>
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">UJJAIN YATRA</h3>
                      <p className="text-orange-100">
                        Mahakaleshwar Darshan Ticket
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm opacity-75">Ticket ID</div>
                      <div className="text-lg font-mono font-bold">
                        {ticket.ticket_id}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <div>
                        <div className="text-xs opacity-75">Date</div>
                        <div className="font-semibold">
                          {new Date(ticket.date).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <div>
                        <div className="text-xs opacity-75">Time</div>
                        <div className="font-semibold">{ticket.time}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <div>
                        <div className="text-xs opacity-75">Tickets</div>
                        <div className="font-semibold">
                          {ticket.no_of_tickets}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Perforation effect */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-4 bg-white"
                  style={{
                    background: `radial-gradient(circle at 20px 0px, transparent 10px, white 10px),
                                   radial-gradient(circle at 40px 0px, transparent 10px, white 10px),
                                   radial-gradient(circle at 60px 0px, transparent 10px, white 10px),
                                   radial-gradient(circle at 80px 0px, transparent 10px, white 10px),
                                   radial-gradient(circle at 100px 0px, transparent 10px, white 10px),
                                   radial-gradient(circle at 120px 0px, transparent 10px, white 10px),
                                   radial-gradient(circle at 140px 0px, transparent 10px, white 10px),
                                   radial-gradient(circle at 160px 0px, transparent 10px, white 10px),
                                   radial-gradient(circle at 180px 0px, transparent 10px, white 10px),
                                   radial-gradient(circle at 200px 0px, transparent 10px, white 10px),
                                   white`,
                  }}
                ></div>
              </div>

              {/* Bottom section */}
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Visitor Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-600">Name:</span>{" "}
                        <span className="font-medium">
                          {ticket.Client?.name || "N/A"}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-600">Phone:</span>{" "}
                        <span className="font-medium">
                          {ticket.Client?.phone || "N/A"}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-600">Email:</span>{" "}
                        <span className="font-medium">
                          {ticket.Client?.email || "N/A"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="mb-4">
                      <h4 className="font-bold text-gray-800 mb-2 text-center flex items-center">
                        <QrCode className="w-4 h-4 mr-2" />
                        QR Code
                      </h4>
                      {ticket.qr_code ? (
                        <div
                          className="relative group cursor-pointer"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowQRModal(true);
                          }}
                        >
                          <img
                            src={ticket.qr_code}
                            alt="Ticket QR Code"
                            className="w-20 h-20 border-2 border-gray-300 rounded-lg group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <QrCode className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowQRModal(true);
                        }}
                        className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => downloadTicket(ticket)}
                        className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Booked on:{" "}
                    {new Date(ticket.created_at).toLocaleString("en-IN")}
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    CONFIRMED
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <TicketIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No tickets booked yet
          </h3>
          <p className="text-gray-500 mb-4">
            Book your first darshan ticket to see it here
          </p>
          <button
            onClick={() => setActiveTab("book")}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Book Now
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white p-6 shadow-2xl">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 animate-pulse">
            🕉 Ujjain Yatra - Darshan Booking
          </h1>
          <p className="text-orange-100 text-lg">
            Begin Your Sacred Journey to Mahakaleshwar Jyotirlinga
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Success Animation */}
        {animateSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center transform animate-bounce">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Booking Confirmed!
              </h3>
              <p className="text-gray-600">
                Your darshan ticket has been booked successfully
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex bg-white rounded-xl shadow-lg p-1">
            <button
              onClick={() => setActiveTab("book")}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold transition-all ${
                activeTab === "book"
                  ? "bg-orange-600 text-white shadow-md"
                  : "text-gray-600 hover:text-orange-600"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Book Ticket</span>
            </button>
            <button
              onClick={() => setActiveTab("tickets")}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold transition-all ${
                activeTab === "tickets"
                  ? "bg-orange-600 text-white shadow-md"
                  : "text-gray-600 hover:text-orange-600"
              }`}
            >
              <TicketIcon className="w-5 h-5" />
              <span>My Tickets</span>
              {bookedTickets.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px]">
                  {bookedTickets.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "book" ? <BookingTab /> : <TicketsTab />}

        {/* Booking Modal */}
        {showBookingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-slide-up">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Complete Your Booking
              </h3>

              <div className="space-y-4">
                <input
                  type="text"
                  value={clientInfo.name}
                  onChange={(e) =>
                    setClientInfo((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Full Name *"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
                <input
                  type="email"
                  value={clientInfo.email}
                  onChange={(e) =>
                    setClientInfo((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Email *"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
                <input
                  type="tel"
                  value={clientInfo.phone}
                  onChange={(e) =>
                    setClientInfo((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="Phone Number"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div className="bg-orange-50 p-4 rounded-lg mt-6">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Booking Summary
                </h4>
                <p className="text-sm text-gray-600">Date: {selectedDate}</p>
                <p className="text-sm text-gray-600">Time: {selectedTime}</p>
                <p className="text-sm text-gray-600">Tickets: {ticketCount}</p>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setShowBookingForm(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBooking}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin inline mr-2" />
                  ) : null}
                  {loading ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">QR Code</h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Ticket ID: {selectedTicket.ticket_id}
                </p>
                {selectedTicket.qr_code ? (
                  <img
                    src={selectedTicket.qr_code}
                    alt="QR Code"
                    className="w-64 h-64 mx-auto border-4 border-gray-200 rounded-lg"
                  />
                ) : (
                  <div className="w-64 h-64 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="font-semibold mb-2">
                  Scan this QR code at the temple entrance
                </p>
                <p>
                  {formatDate(selectedTicket.date)} at {selectedTicket.time}
                </p>
                <p>{selectedTicket.no_of_tickets} ticket(s)</p>
              </div>

              <button
                onClick={() => downloadTicket(selectedTicket)}
                className="mt-6 w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download Ticket</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-in-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UjjainYatraBooking;
