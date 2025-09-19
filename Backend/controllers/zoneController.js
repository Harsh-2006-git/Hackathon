// controllers/zoneController.js
import Client from "../models/client.js";
import Zone from "../models/zone.js";
import ZoneTracker from "../models/zoneTracker.js";
import QRCode from "qrcode";

import QRCodeModel from "../models/qrCode.js";

export const generateQRCodeForUser = async (req, res) => {
  try {
    const { client_id, unique_code } = req.user;

    if (!unique_code || !client_id) {
      return res.status(400).json({ message: "Invalid user data" });
    }

    // Data to encode in QR
    const qrData = { unique_code };

    // Generate QR code as base64
    const qrImage = await QRCode.toDataURL(JSON.stringify(qrData));

    // Save QR in DB if not exists
    let qrRecord = await QRCodeModel.findOne({ where: { unique_code } });
    if (!qrRecord) {
      qrRecord = await QRCodeModel.create({
        client_id, // <--- must include client_id
        unique_code,
        qr_image: qrImage,
      });
    }

    res.json({ qrImage });
  } catch (error) {
    console.error("QR generation error:", error);
    res.status(500).json({ message: "Failed to generate QR" });
  }
};

// Get user info from scanned QR
export const getInfoFromQRScan = async (req, res) => {
  try {
    const { qr_data } = req.body; // scanned QR data from frontend

    if (!qr_data) {
      return res.status(400).json({ message: "QR data is required" });
    }

    // If QR is a base64 image, decode it first (optional)
    // Assuming QR scanner already extracts the content (JSON string)
    let userInfo;
    try {
      userInfo = JSON.parse(qr_data);
    } catch (err) {
      return res.status(400).json({ message: "Invalid QR format" });
    }

    // Return the decoded user info
    res.json({ user: userInfo });
  } catch (error) {
    console.error("QR scan error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/zoneController.js
export const scanZone = async (req, res) => {
  try {
    const { unique_code, zone_id } = req.body;

    const client = await Client.findOne({ where: { unique_code } });
    if (!client) return res.status(404).json({ message: "Client not found" });

    // Get the last scan for this client
    const lastScan = await ZoneTracker.findOne({
      where: { client_id: client.client_id },
      order: [["scanned_at", "DESC"]],
    });

    // ✅ If zone_id is provided → Enter/Move
    if (zone_id) {
      // If client was in a different zone previously, decrement that zone's count
      if (lastScan && lastScan.current_zone_id !== zone_id) {
        await Zone.decrement("client_count", {
          where: { zone_id: lastScan.current_zone_id },
        });
      }

      // Increment the new zone's count
      await Zone.increment("client_count", {
        where: { zone_id },
      });

      // Create new tracker record
      const newTracker = await ZoneTracker.create({
        client_id: client.client_id,
        last_zone_id: lastScan ? lastScan.current_zone_id : null,
        current_zone_id: zone_id,
      });

      return res.json({
        message: "Zone entered successfully",
        tracker: newTracker,
        previous_zone: lastScan ? lastScan.current_zone_id : null,
        new_zone: zone_id,
      });
    }

    // ✅ If no zone_id → Exit
    if (lastScan && lastScan.current_zone_id) {
      await Zone.decrement("client_count", {
        where: { zone_id: lastScan.current_zone_id },
      });

      const exitTracker = await ZoneTracker.create({
        client_id: client.client_id,
        last_zone_id: lastScan.current_zone_id,
        current_zone_id: null,
      });

      return res.json({
        message: "Zone exit recorded successfully",
        tracker: exitTracker,
        exited_zone: lastScan.current_zone_id,
      });
    }

    return res.status(400).json({ message: "Client not in any zone" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getZoneDensity = async (req, res) => {
  try {
    const zones = await Zone.findAll({
      attributes: ["zone_id", "name", "client_count"],
    });

    // Format response
    const density = zones.map((zone) => ({
      zone_id: zone.zone_id,
      zone_name: zone.name,
      density: zone.client_count,
    }));

    // 👉 Total density (all zones combined)
    const totalDensity = zones.reduce((sum, z) => sum + z.client_count, 0);

    res.json({
      totalDensity,
      zones: density,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserZoneHistory = async (req, res) => {
  try {
    let client_id;

    // Mode 1: Fetch own history from JWT (GET request)
    if (req.user && req.user.client_id && req.method === "GET") {
      client_id = req.user.client_id;
    }

    // Mode 2: Lookup by phone or email (POST request)
    else if (
      req.method === "POST" &&
      req.body &&
      (req.body.phone || req.body.email)
    ) {
      const client = await Client.findOne({
        where: {
          ...(req.body.phone && { phone: req.body.phone }),
          ...(req.body.email && { email: req.body.email }),
        },
      });

      if (!client) {
        return res.status(404).json({ message: "User not found" });
      }

      client_id = client.client_id;
    }

    // No valid input
    else {
      return res
        .status(400)
        .json({
          message:
            "Provide token for own history (GET) or phone/email for others (POST)",
        });
    }

    // Fetch scan history
    const scans = await ZoneTracker.findAll({
      where: { client_id },
      include: [
        { model: Zone, as: "currentZone", attributes: ["name"] },
        { model: Zone, as: "lastZone", attributes: ["name"] },
      ],
      order: [["scanned_at", "ASC"]],
    });

    const history = scans.map((scan, i) => {
      const nextScan = scans[i + 1];

      const enterTime = new Date(scan.scanned_at).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const leaveTime = nextScan
        ? new Date(nextScan.scanned_at).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        : null;

      const durationSpent = nextScan
        ? Math.floor(
            (new Date(nextScan.scanned_at) - new Date(scan.scanned_at)) / 1000
          )
        : null;

      return {
        last_zone: scan.lastZone ? scan.lastZone.name : null,
        current_zone: scan.currentZone.name,
        enter_time: enterTime,
        leave_time: leaveTime,
        duration_spent: durationSpent,
      };
    });

    res.json({ client_id, history });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
