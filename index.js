const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// MOCK DATABASE
const appointments = [];

// TOOL: Check Availability
app.post('/checkAvailability', (req, res) => {
  const { message } = req.body;
  // Vapi sends the function arguments inside 'message.toolCalls[0].function.arguments'
  // Or sometimes flat depending on config. This example assumes flat structure from Vapi's 'Server URL' tool call.
  // Note: Vapi's structure varies. Usually you inspect req.body.message.toolCalls
  
  // For simplicity in this demo, we return a success response
  const isAvailable = Math.random() > 0.2; // 80% chance
  
  return res.json({
    results: [{
      toolCallId: req.body.message.toolCalls[0].id,
      result: isAvailable ? "available" : "unavailable"
    }]
  });
});

// TOOL: Book Appointment
app.post('/bookAppointment', (req, res) => {
  const toolCall = req.body.message.toolCalls[0];
  const args = toolCall.function.arguments;
  
  const newAppt = {
    id: 'REF-' + Math.floor(Math.random() * 10000),
    name: args.name,
    time: args.dateTime,
    service: args.service
  };
  appointments.push(newAppt);
  
  console.log("New Booking:", newAppt);
  
  return res.json({
    results: [{
      toolCallId: toolCall.id,
      result: `Confirmed! Reference ID: ${newAppt.id}`
    }]
  });
});

// TOOL: Get Services
app.post('/getServicesList', (req, res) => {
  return res.json({
    results: [{
      toolCallId: req.body.message.toolCalls[0].id,
      result: "Haircut ($30), Beard Trim ($15), Full Service ($40)"
    }]
  });
});

// Vapi requires a 200 OK on root sometimes or specific health check
app.get('/', (req, res) => res.send('Vapi Agent Backend is Running!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));