// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Mock "databases"
const appointments = [];
const orders = [];
const reservations = [];

// Helper to get toolCallId safely
function getFirstToolCallId(req) {
  try {
    if (Array.isArray(req.body?.message?.toolCalls)) {
      return req.body.message.toolCalls[0]?.id ?? null;
    }
    if (req.body?.toolCallId) return req.body.toolCallId;
  } catch {}
  return null;
}

/* -----------------------------
   BARBER / BOOKING ENDPOINTS
   ----------------------------- */

// Check Availability
app.post("/checkAvailability", (req, res) => {
  const toolCallId = getFirstToolCallId(req);
  const isAvailable = Math.random() > 0.2;

  return res.json({
    results: [
      {
        toolCallId,
        result: isAvailable ? "available" : "unavailable"
      }
    ]
  });
});

// Book Appointment
app.post("/bookAppointment", (req, res) => {
  const tc = req.body?.message?.toolCalls?.[0];
  const args = tc?.function?.arguments ?? {};

  const newAppt = {
    id: "REF-" + Math.floor(Math.random() * 10000),
    name: args.name ?? "Unknown",
    time: args.dateTime ?? args.time ?? null,
    service: args.service ?? "General"
  };

  appointments.push(newAppt);

  return res.json({
    results: [
      {
        toolCallId: tc?.id ?? getFirstToolCallId(req),
        result: `Confirmed! Reference ID: ${newAppt.id}`
      }
    ]
  });
});

// Get Services List
app.post("/getServicesList", (req, res) => {
  return res.json({
    results: [
      {
        toolCallId: getFirstToolCallId(req),
        result: "Haircut ($30), Beard Trim ($15), Full Service ($40)"
      }
    ]
  });
});

/* -----------------------------
   RESTAURANT ENDPOINTS
   ----------------------------- */

// Book Order
app.post("/book_order", (req, res) => {
  const tc = req.body?.message?.toolCalls?.[0];
  const args = tc?.function?.arguments ?? {};

  if (!args.name || !args.email || !args.phone || !args.address || !args.food_details) {
    return res.status(400).json({
      results: [
        {
          toolCallId: tc?.id ?? getFirstToolCallId(req),
          result: { error: "Missing required fields for book_order" }
        }
      ]
    });
  }

  const order = {
    id: "ORD-" + Math.floor(Math.random() * 100000),
    ...args,
    createdAt: new Date().toISOString()
  };

  orders.push(order);

  return res.json({
    results: [
      {
        toolCallId: tc?.id ?? getFirstToolCallId(req),
        result: {
          message: `Order received. Reference: ${order.id}`,
          order_id: order.id
        }
      }
    ]
  });
});

// Book Reservation
app.post("/book_reservation", (req, res) => {
  const tc = req.body?.message?.toolCalls?.[0];
  const args = tc?.function?.arguments ?? {};

  if (!args.name || !args.phone || !args.date || !args.time || !args.number_of_guests) {
    return res.status(400).json({
      results: [
        {
          toolCallId: tc?.id ?? getFirstToolCallId(req),
          result: { error: "Missing required fields for book_reservation" }
        }
      ]
    });
  }

  const reservation = {
    id: "RESV-" + Math.floor(Math.random() * 100000),
    ...args,
    createdAt: new Date().toISOString()
  };

  reservations.push(reservation);

  return res.json({
    results: [
      {
        toolCallId: tc?.id ?? getFirstToolCallId(req),
        result: {
          message: `Reservation confirmed. Reference: ${reservation.id}`,
          reservation_id: reservation.id
        }
      }
    ]
  });
});

/* -----------------------------
   ROOT CHECK
   ----------------------------- */
app.get("/", (req, res) => res.send("Vapi Agent Backend is Running!"));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
