// index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// MOCK DATABASES
const appointments = [];
const orders = [];
const reservations = [];

/**
 * Helper to safely read toolCallId from multiple possible Vapi shapes
 */
function getFirstToolCallId(req) {
  try {
    // Common paths
    if (req.body?.message?.toolCalls && Array.isArray(req.body.message.toolCalls)) {
      return req.body.message.toolCalls[0]?.id ?? null;
    }
    // fallback if structure is different
    if (req.body?.toolCallId) return req.body.toolCallId;
  } catch (e) {
    // ignore
  }
  return null;
}

/* -------------------------
   BARBER / Booking endpoints
   (existing)
   ------------------------- */

// TOOL: Check Availability (barbing)
app.post('/checkAvailability', (req, res) => {
  const toolCallId = getFirstToolCallId(req);
  // Demo logic: 80% available
  const isAvailable = Math.random() > 0.2;
  return res.json({
    results: [{
      toolCallId,
      result: isAvailable ? "available" : "unavailable"
    }]
  });
});

// TOOL: Book Appointment (barbing)
app.post('/bookAppointment', (req, res) => {
  const toolCall = req.body?.message?.toolCalls?.[0];
  const args = toolCall?.function?.arguments ?? {};
  const newAppt = {
    id: 'REF-' + Math.floor(Math.random() * 10000),
    name: args.name ?? 'Unknown',
    time: args.dateTime ?? args.time ?? null,
    service: args.service ?? 'General'
  };
  appointments.push(newAppt);
  console.log("New Booking:", newAppt);
  return res.json({
    results: [{
      toolCallId: toolCall?.id ?? getFirstToolCallId(req),
      result: `Confirmed! Reference ID: ${newAppt.id}`
    }]
  });
});

// TOOL: Get Services (barbing)
app.post('/getServicesList', (req, res) => {
  return res.json({
    results: [{
      toolCallId: getFirstToolCallId(req),
      result: "Haircut ($30), Beard Trim ($15), Full Service ($40)"
    }]
  });
});

/* -------------------------
   RESTAURANT endpoints (NEW)
   ------------------------- */

/**
 * TOOL: book_order
 * Expects function.arguments with:
 * { name, email, phone, address, food_details, dietary_concerns }
 */
app.post('/book_order', (req, res) => {
  const toolCall = req.body?.message?.toolCalls?.[0];
  const args = toolCall?.function?.arguments ?? {};

  if (!args?.food_details || !args?.name || !args?.email || !args?.phone || !args?.address) {
    // return an error result structure that Vapi can consume
    return res.status(400).json({
      results: [{
        toolCallId: toolCall?.id ?? getFirstToolCallId(req),
        result: { error: 'Missing required fields for book_order' }
      }]
    });
  }

  const order = {
    id: 'ORD-' + Math.floor(Math.random() * 100000),
    name: args.name,
    email: args.email,
    phone: args.phone,
    address: args.address,
    food_details: args.food_details,
    dietary_concerns: args.dietary_concerns ?? '',
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  console.log('New Food Order:', order);

  return res.json({
    results: [{
      toolCallId: toolCall?.id ?? getFirstToolCallId(req),
      result: {
        message: `Order received. Reference: ${order.id}`,
        order_id: order.id
      }
    }]
  });
});

/**
 * TOOL: book_reservation
 * Expects function.arguments with:
 * { date, name, time, email, phone, dietary_concerns, number_of_guests }
 */
app.post('/book_reservation', (req, res) => {
  const toolCall = req.body?.message?.toolCalls?.[0];
  const args = toolCall?.function?.arguments ?? {};

  if (!args?.name || !args?.phone || !args?.date || !args?.time || !args?.number_of_guests) {
    return res.status(400).json({
      results: [{
        toolCallId: toolCall?.id ?? getFirstToolCallId(req),
        result: { error: 'Missing required fields for book_reservation' }
      }]
    });
  }

  const reservation = {
    id: 'RESV-' + Math.floor(Math.random() * 100000),
    name: args.name,
    phone: args.phone,
    email: args.email ?? '',
    date: args.date,
    time: args.time,
    number_of_guests: args.number_of_guests,
    dietary_concerns: args.dietary_concerns ?? '',
    createdAt: new Date().toISOString()
  };
  reservations.push(reservation);
  console.log('New Reservation:', reservation);

  // In a real app you'd check availability and maybe return alternative slots
  return res.json({
    results: [{
      toolCallId: toolCall?.id ?? getFirstToolCallId(req),
      result: {
        message: `Reservation confirmed. Reference: ${reservation.id}`,
        reservation_id: reservation.id
      }
    }]
  });
});

/* -------------------------
   Health check & root
   ------------------------- */
app.get('/', (req, res) => res.send('Vapi Agent Backend is Running!'));

// Port from env or 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
