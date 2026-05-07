import { deleteAllAppointments } from '../config/database.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await deleteAllAppointments();
    return res.status(200).json({ success: true, message: 'All appointments deleted' });
  } catch (error) {
    console.error('Error resetting appointments:', error);
    return res.status(500).json({ error: 'Database error', message: error.message });
  }
}
