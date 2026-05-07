import { updateAppointmentStatus, deleteAppointment } from '../../config/database.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    if (req.method === 'PUT') {
      const { status } = req.body;
      if (!status) return res.status(400).json({ error: 'Missing status' });

      const validStatuses = ['Pendiente', 'Confirmada', 'Cancelada'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }

      const updated = await updateAppointmentStatus(id, status);
      if (!updated) return res.status(404).json({ error: 'Appointment not found' });
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const deleted = await deleteAppointment(id);
      if (!deleted) return res.status(404).json({ error: 'Appointment not found' });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in appointment handler:', error);
    return res.status(500).json({ error: 'Database error', message: error.message });
  }
}
