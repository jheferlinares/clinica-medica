import { updateAppointmentStatus } from '../../config/database.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { id } = req.query;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: 'Missing id or status' });
    }

    const validStatuses = ['Pendiente', 'Confirmada', 'Cancelada'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updated = await updateAppointmentStatus(id, status);
    if (!updated) return res.status(404).json({ error: 'Appointment not found' });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return res.status(500).json({ error: 'Database error', message: error.message });
  }
}
