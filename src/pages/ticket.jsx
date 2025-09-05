import React, { useState, useEffect } from "react";
import { Calendar, Users, CheckCircle, QrCode } from "lucide-react";

const UjjainYatraBooking = () => {
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

  // Time slots
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

  // Find next available slot
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

  // Handle booking
  const handleBooking = () => {
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

    const newTicket = {
      ticket_id: `UY${Date.now()}${Math.random()
        .toString(36)
        .substr(2, 5)
        .toUpperCase()}`,
      client_info: clientInfo,
      darshan_date: selectedDate,
      darshan_time: availableSlot,
      tickets_purchased: ticketCount,
      status: "booked",
      qr_code: `QR_${Date.now()}`,
      expiry_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      priority: ticketCount > 5 ? 2 : 4,
      booking_time: new Date().toLocaleString(),
    };

    // Update capacity
    setTimeSlotCapacity((prev) => ({
      ...prev,
      [availableSlot]: {
        ...prev[availableSlot],
        booked: prev[availableSlot].booked + ticketCount,
      },
    }));

    setBookedTickets((prev) => [...prev, newTicket]);

    // Animate success
    setAnimateSuccess(true);
    setTimeout(() => setAnimateSuccess(false), 3000);

    setShowBookingForm(false);
    setClientInfo({ name: "", email: "", phone: "" });
    setTicketCount(1);

    if (availableSlot !== selectedTime) {
      alert(
        `Your requested time ${selectedTime} was full. You've been allocated ${availableSlot} instead.`
      );
    }
  };

  // Slot status
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center mb-6">
              <Calendar className="w-8 h-8 text-orange-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-800">
                Book Your Darshan
              </h2>
            </div>

            {/* Date Selection */}
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

            {/* Time Slots */}
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
                          className={`w-2 h-2 rounded-full ${getSlotColor(
                            status
                          )}`}
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

            {/* Ticket Count */}
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
              disabled={!selectedDate || !selectedTime}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
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
                const percentage =
                  (booked / (capacity?.maxCapacity || 100)) * 100;

                return (
                  <div
                    key={slot}
                    className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-700">
                        {slot}
                      </span>
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
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBooking}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-medium hover:from-orange-700 hover:to-red-700"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Booked Tickets */}
        {bookedTickets.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center mb-6">
              <QrCode className="w-8 h-8 text-orange-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-800">
                Your Booked Tickets
              </h2>
            </div>

            <div className="grid gap-4">
              {bookedTickets.map((ticket, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-orange-100 to-red-100 p-6 rounded-xl border-l-4 border-orange-500 transform hover:scale-105 transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Ticket ID: {ticket.ticket_id}
                      </h3>
                      <p className="text-gray-700">
                        <strong>Name:</strong> {ticket.client_info.name}
                      </p>
                      <p className="text-gray-700">
                        <strong>Date:</strong> {ticket.darshan_date}
                      </p>
                      <p className="text-gray-700">
                        <strong>Time:</strong> {ticket.darshan_time}
                      </p>
                      <p className="text-gray-700">
                        <strong>Tickets:</strong> {ticket.tickets_purchased}
                      </p>
                      <p className="text-gray-700">
                        <strong>Status:</strong>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm ml-2">
                          {ticket.status.toUpperCase()}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                        <QrCode className="w-10 h-10 text-white" />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">QR Code</p>
                    </div>
                  </div>
                </div>
              ))}
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
