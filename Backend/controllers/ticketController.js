import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import Ticket from "../models/ticket.js";
import TicketTimeCount from "../models/ticketTimeCount.js";
import Client from "../models/client.js";
import { Op } from "sequelize";
import sequelize from "../config/database.js";

// Time slots in order
const TIME_SLOTS = [
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

// Priority mapping based on user type
const PRIORITY_MAP = {
  Admin: 0, // Highest priority
  VIP: 1,
  Aged: 2,
  Sadhu: 3,
  Civilian: 4, // Lowest priority
};

// Helper function to find next available slot
const findNextAvailableSlot = async (date, time, ticketCount) => {
  let currentIndex = TIME_SLOTS.indexOf(time);
  if (currentIndex === -1) currentIndex = 0;

  for (let i = currentIndex; i < TIME_SLOTS.length; i++) {
    const slotTime = TIME_SLOTS[i];
    const slot = await TicketTimeCount.findOne({
      where: {
        darshan_date: date,
        darshan_time: slotTime,
      },
    });

    const available = slot ? slot.max_capacity - slot.ticket_count : 100;
    if (available >= ticketCount) {
      return {
        date,
        time: slotTime,
        isRescheduled: i > currentIndex,
      };
    }
  }

  // If no slots available today, try next day
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);
  return findNextAvailableSlot(
    nextDate.toISOString().split("T")[0],
    TIME_SLOTS[0],
    ticketCount
  );
};

// Helper function to convert time format
function convertTimeTo24Hour(timeStr) {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");

  if (hours === "12") hours = "00";
  if (modifier === "PM") hours = parseInt(hours, 10) + 12;

  return `${hours}:${minutes}:00`;
}

// Helper function to generate QR code
async function generateQRCode(ticketData, client) {
  const qrData = JSON.stringify({
    ticket_id: ticketData.ticket_id,
    client_id: ticketData.client_id,
    client_name: client.name,
    darshan_date: ticketData.darshan_date,
    darshan_time: ticketData.darshan_time,
    tickets_purchased: ticketData.tickets_purchased,
    tickets_remaining: ticketData.tickets_remaining,
    user_type: client.userType,
    expiry_time: ticketData.expiry_time.toISOString(),
  });

  return await QRCode.toDataURL(qrData);
}

export const bookTicket = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { darshan_date, darshan_time, ticket_count = 1 } = req.body;
    const client_id = req.user.client_id;

    // Validate input
    if (
      !darshan_date ||
      !darshan_time ||
      ticket_count < 1 ||
      ticket_count > 10
    ) {
      await transaction.rollback();
      return res.status(400).json({
        error: "Valid date, time and ticket count (1-10) are required",
      });
    }

    // Check if time slot is valid
    if (!TIME_SLOTS.includes(darshan_time)) {
      await transaction.rollback();
      return res.status(400).json({ error: "Invalid time slot" });
    }

    // Get client details
    const client = await Client.findByPk(client_id, { transaction });
    const client2 = await Client.findByPk(client_id);
    const clientRole = client2.userType;
    const priority = PRIORITY_MAP[clientRole];
    if (!client) {
      await transaction.rollback();
      return res.status(404).json({ error: "Client not found" });
    }

    // Check availability
    const [timeSlot, created] = await TicketTimeCount.findOrCreate({
      where: {
        darshan_date,
        darshan_time,
      },
      defaults: {
        ticket_count: 0,
        max_capacity: 100,
      },
      transaction,
    });

    // Find next available slot if current is full
    let actualDate = darshan_date;
    let actualTime = darshan_time;
    let isRescheduled = false;

    if (timeSlot.max_capacity - timeSlot.ticket_count < ticket_count) {
      const nextSlot = await findNextAvailableSlot(
        darshan_date,
        darshan_time,
        ticket_count
      );
      actualDate = nextSlot.date;
      actualTime = nextSlot.time;
      isRescheduled = nextSlot.isRescheduled;
    }

    // Calculate expiry time (2 hours after darshan time)
    const expiry_time = new Date(
      `${actualDate}T${convertTimeTo24Hour(actualTime)}`
    );
    expiry_time.setHours(expiry_time.getHours() + 2);

    // Create ticket data
    const ticketData = {
      ticket_id: uuidv4(),
      client_id,
      darshan_date: actualDate,
      darshan_time: actualTime,
      expiry_time,
      priority: priority,
      tickets_purchased: ticket_count,
      tickets_remaining: ticket_count,
      status: "booked",
    };

    // Generate QR code
    ticketData.qr_code = await generateQRCode(ticketData, client);

    // Create ticket and update time slot count
    const ticket = await Ticket.create(ticketData, { transaction });
    await TicketTimeCount.increment("ticket_count", {
      by: ticket_count,
      where: {
        darshan_date: actualDate,
        darshan_time: actualTime,
      },
      transaction,
    });

    await transaction.commit();

    res.status(201).json({
      message: isRescheduled
        ? `Ticket rescheduled to ${actualDate} ${actualTime} due to high demand`
        : "Ticket booked successfully",
      ticket: {
        ...ticket.toJSON(),
        qr_code: ticketData.qr_code,
      },
      isRescheduled,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error booking ticket:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getTimeSlotAvailability = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    // Get all time slots for the date
    const slots = await TicketTimeCount.findAll({
      where: { darshan_date: date },
      attributes: ["darshan_time", "ticket_count", "max_capacity"],
    });

    // Merge with all possible time slots
    const result = TIME_SLOTS.map((time) => {
      const slot = slots.find((s) => s.darshan_time === time);
      return {
        darshan_time: time,
        available: slot ? slot.max_capacity - slot.ticket_count : 100,
        max_capacity: slot?.max_capacity || 100,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching time slots:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const scanTicket = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { ticket_id } = req.body;
    const scanner_id = req.user.client_id;

    // Validate ticket_id format (UUID)
    if (!validator.isUUID(ticket_id)) {
      await transaction.rollback();
      return res.status(400).json({ error: "Invalid ticket ID format" });
    }

    // Find the ticket with associated time slot and client info
    const ticket = await Ticket.findOne({
      where: {
        ticket_id,
        status: "booked",
        isExpired: false,
        tickets_remaining: { [Op.gt]: 0 },
      },
      include: [
        {
          model: TicketTimeCount,
          as: "time_slot",
          attributes: [
            "darshan_date",
            "darshan_time",
            "max_capacity",
            "ticket_count",
          ],
        },
        {
          model: Client,
          as: "client",
          attributes: ["client_id", "name", "userType"],
        },
      ],
      transaction,
    });

    if (!ticket) {
      await transaction.rollback();
      return res.status(404).json({
        error: "Valid ticket not found",
        details:
          "Ticket might be expired, already used, cancelled, or doesn't exist",
      });
    }

    // Check if ticket is valid for current date/time
    const now = new Date();
    if (new Date(ticket.expiry_time) < now) {
      await ticket.update({ isExpired: true }, { transaction });
      await transaction.rollback();
      return res.status(400).json({ error: "Ticket has expired" });
    }

    // Check if time slot is at capacity
    if (ticket.time_slot.ticket_count >= ticket.time_slot.max_capacity) {
      await transaction.rollback();
      return res
        .status(403)
        .json({ error: "This time slot is at full capacity" });
    }

    // Create scan log
    await ScanLog.create(
      {
        ticket_id,
        scanner_id,
        scan_time: now,
        client_id: ticket.client_id,
        user_type: ticket.client.userType,
      },
      { transaction }
    );

    // Decrement remaining count
    const updatedTicket = await ticket.decrement("tickets_remaining", {
      by: 1,
      transaction,
    });

    // Increment time slot count
    await TicketTimeCount.increment("ticket_count", {
      by: 1,
      where: {
        darshan_date: ticket.darshan_date,
        darshan_time: ticket.darshan_time,
      },
      transaction,
    });

    // Update status if no tickets remaining
    if (updatedTicket.tickets_remaining <= 0) {
      await updatedTicket.update({ status: "used" }, { transaction });
    }

    await transaction.commit();

    res.status(200).json({
      message: "Ticket scanned successfully",
      ticket: {
        id: updatedTicket.ticket_id,
        tickets_remaining: updatedTicket.tickets_remaining,
        status: updatedTicket.status,
        client_name: ticket.client.name,
        user_type: ticket.client.userType,
        time_slot: {
          date: ticket.darshan_date,
          time: ticket.darshan_time,
          current_count: ticket.time_slot.ticket_count + 1, // +1 because we incremented
          max_capacity: ticket.time_slot.max_capacity,
        },
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error scanning ticket:", error);
    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getClientTickets = async (req, res) => {
  try {
    const client_id = req.user.client_id;

    const tickets = await Ticket.findAll({
      where: { client_id },
      order: [
        ["darshan_date", "ASC"],
        ["darshan_time", "ASC"],
      ],
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["name", "userType"],
        },
        {
          model: TicketTimeCount,
          as: "time_slot",
          attributes: ["ticket_count", "max_capacity"],
        },
      ],
    });

    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const cancelTicket = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { ticket_id } = req.params;
    const client_id = req.user.client_id;

    // Find ticket with time slot info
    const ticket = await Ticket.findOne({
      where: {
        ticket_id,
        client_id,
        status: "booked",
        isExpired: false,
      },
      include: [
        {
          model: TicketTimeCount,
          as: "time_slot",
          attributes: ["darshan_date", "darshan_time"],
        },
      ],
      transaction,
    });

    if (!ticket) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ error: "Ticket not found or cannot be cancelled" });
    }

    // Update ticket status
    await ticket.update(
      {
        status: "cancelled",
        tickets_remaining: 0,
      },
      { transaction }
    );

    // Decrement count in time slot
    if (ticket.time_slot) {
      await TicketTimeCount.decrement("ticket_count", {
        by: ticket.tickets_purchased,
        where: {
          darshan_date: ticket.time_slot.darshan_date,
          darshan_time: ticket.time_slot.darshan_time,
        },
        transaction,
      });
    }

    await transaction.commit();
    res.status(200).json({ message: "Ticket cancelled successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error cancelling ticket:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const checkExpiredTickets = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const now = new Date();
    let expiredCount = 0;

    // Find all tickets that should be expired
    const ticketsToExpire = await Ticket.findAll({
      where: {
        expiry_time: { [Op.lt]: now },
        isExpired: false,
        status: "booked",
      },
      include: [
        {
          model: TicketTimeCount,
          as: "time_slot",
          attributes: ["darshan_date", "darshan_time"],
        },
      ],
      transaction,
    });

    // Process each ticket
    for (const ticket of ticketsToExpire) {
      // Mark ticket as expired
      await ticket.update(
        {
          isExpired: true,
          status: "cancelled",
          tickets_remaining: 0,
        },
        { transaction }
      );

      // Decrement count in time slot if available
      if (ticket.time_slot) {
        await TicketTimeCount.decrement("ticket_count", {
          by: ticket.tickets_purchased,
          where: {
            darshan_date: ticket.time_slot.darshan_date,
            darshan_time: ticket.time_slot.darshan_time,
          },
          transaction,
        });
      }

      expiredCount++;
    }

    await transaction.commit();
    res
      .status(200)
      .json({ message: `Marked ${expiredCount} tickets as expired` });
  } catch (error) {
    await transaction.rollback();
    console.error("Error checking expired tickets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
