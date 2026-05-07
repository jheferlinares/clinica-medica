import { getAppointments, createAppointment } from '../config/database.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get all appointments or filter by query params
        const { status, date } = req.query;
        const filters = {};
        
        if (status) filters.status = status;
        if (date) filters.date = date;
        
        const appointments = await getAppointments(filters);
        return res.status(200).json(appointments);

      case 'POST':
        // Create new appointment
        const appointmentData = req.body;
        
        // Validate required fields
        const requiredFields = ['patientName', 'patientEmail', 'patientPhone', 'service', 'date', 'time'];
        for (const field of requiredFields) {
          if (!appointmentData[field]) {
            return res.status(400).json({ error: `Missing required field: ${field}` });
          }
        }
        
        const newAppointment = await createAppointment(appointmentData);
        return res.status(201).json(newAppointment);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Database error',
      message: error.message 
    });
  }
}