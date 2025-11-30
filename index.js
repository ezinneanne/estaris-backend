const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// ----------------------------------------
// MOCK DATABASES
// ----------------------------------------
const appointments = [];       // Barber bookings
const foodOrders = [];         // Restaurant orders
const reservations = [];       // Restaurant reservations

// -------------------------------------------------------
// ✂️ BARBING TOOL: Check Availability
// -------------------------------------------------------
app.post('/checkAvailability', (req, res) => {
  const toolCall = req.body?.message?.toolCalls?.[0];
  if (!toolCall) {
    return res.status(400).json({ error: "Invalid tool call payload" });
  }

  const isAvailable = Math.random() > 0.2; // Mock 80% availability

  return res.json({
    results: [
      {
        toolCallId: toolCall.id,
        result: isAvailable ? "available" : "unavailable"
      }
    ]
  });
});

// -------------------------------------------------------
// ✂️ BARBING TOOL: Book Appointment
// -------------------------------------------------------
app.post('/bookAppointment', (req, res) => {
  const toolCall = req.body?.message?.toolCalls?.[0];
  if (!toolCall) {
    return res.status(400).json({ error: "Invalid tool call payload" });
  }

  const args = toolCall.function.arguments;

  const newAppt = {
    id: 'REF-' + Math.floor(Math.random() * 10000),
    name: args.name,
    time: args.dateTime,
    service: args.service
  };

  appointments.push(newAppt);
  console.log("New Barber Booking:", newAppt);

  return res.json({
    results: [
      {
        toolCallId: toolCall.id,
        result: `Appointment confirmed! Reference ID: ${newAppt.id}`
      }
    ]
  });
});

// -------------------------------------------------------
// ✂️ BARBING TOOL: Get Services List
// -------------------------------------------------------
app.post('/getServicesList', (req, res) => {
  return res.json({
    results: [
      {
        toolCallId: req.body.message.toolCalls[0].id,
        result: "Haircut ($30), Beard Trim ($15), Full Grooming ($40)"
      }
    ]
  });
});

// =======================================================================
// 🍽️ RESTAURANT FEATURE: BOOK ORDER
// =======================================================================
app.post('/book_order', (req, res) => {
  const toolCall = req.body?.message?.toolCalls?.[0];
  if (!toolCall) {
    return res.status(400).json({ error: "Invalid tool call structure" });
  }

  const args = toolCall.function.arguments;

  const order = {
    id: 'ORDER-' + Math.floor(Math.random() * 100000),
    name: args.name,
    email: args.email,
    phone: args.phone,
    address: args.address,
    food_details: args.food_details,
    dietary_concerns: args.dietary_concerns || "None"
  };

  foodOrders.push(order);
  console.log("New Food Order:", order);

  return res.json({
    results: [
      {
        toolCallId: toolCall.id,
        result: `Order placed successfully! Order ID: ${order.id}`
      }
    ]
  });
});

// =======================================================================
// 🍽️ RESTAURANT FEATURE: BOOK RESERVATION
// =======================================================================
app.post('/book_reservation', (req, res) => {
  const toolCall = req.body?.message?.toolCalls?.[0];
  if (!toolCall) {
    return res.status(400).json({ error: "Invalid tool call structure" });
  }

  const args = toolCall.function.arguments;

  const reservation = {
    id: 'RSV-' + Math.floor(Math.random() * 100000),
    name: args.name,
    email: args.email,
    phone: args.phone,
    date: args.date,
    time: args.time,
    number_of_guests: args.number_of_guests,
    dietary_concerns: args.dietary_concerns || "None"
  };

  reservations.push(reservation);
  console.log("New Reservation:", reservation);

  return res.json({
    results: [
      {
        toolCallId: toolCall.id,
        result: `Reservation confirmed! Reservation ID: ${reservation.id}`
      }
    ]
  });
});

// -------------------------------------------------------
// HEALTH CHECK
// -------------------------------------------------------
app.get('/', (req, res) => res.send('Vapi Barber + Restaurant Backend Running!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
