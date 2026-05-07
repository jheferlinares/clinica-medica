import pg from 'pg';
const { Pool } = pg;

let pool = null;
let isConnected = false;

// In-memory fallback (replaces localStorage which doesn't exist in Node.js)
let memoryStore = [];
let memoryIdCounter = 1;

export async function initDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL no configurada. Usando modo memoria.');
    return false;
  }

  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    const client = await pool.connect();
    console.log('✅ PostgreSQL conectado a Render');

    await client.query(`
      CREATE TABLE IF NOT EXISTS citas (
        id SERIAL PRIMARY KEY,
        patient_name VARCHAR(100) NOT NULL,
        patient_email VARCHAR(100) NOT NULL,
        patient_phone VARCHAR(20) NOT NULL,
        service VARCHAR(100) NOT NULL,
        service_id VARCHAR(50) NOT NULL,
        doctor VARCHAR(100) NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        duration VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'Pendiente',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tabla "citas" verificada/creada');
    client.release();
    isConnected = true;
    return true;

  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error.message);
    isConnected = false;
    return false;
  }
}

export async function testConnection() {
  return isConnected;
}

export async function getAppointments(filters = {}) {
  if (!isConnected || !pool) {
    let filtered = [...memoryStore];
    const { status, date } = filters;
    if (status) filtered = filtered.filter(app => app.status === status);
    if (date) filtered = filtered.filter(app => app.appointment_date === date);
    return filtered.slice(0, 100);
  }

  try {
    const { status, date } = filters;
    let query = 'SELECT * FROM citas';
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }
    if (date) {
      conditions.push(`appointment_date = $${params.length + 1}`);
      params.push(date);
    }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY appointment_date, appointment_time LIMIT 100';

    const result = await pool.query(query, params);
    return result.rows;

  } catch (error) {
    console.error('Error obteniendo citas de PostgreSQL:', error);
    return [...memoryStore];
  }
}

export async function createAppointment(appointmentData) {
  if (!isConnected || !pool) {
    const record = {
      ...appointmentData,
      id: memoryIdCounter++,
      appointment_date: appointmentData.date,
      appointment_time: appointmentData.time,
      patient_name: appointmentData.patientName,
      patient_email: appointmentData.patientEmail,
      patient_phone: appointmentData.patientPhone,
      service_id: appointmentData.serviceId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryStore.push(record);
    console.log('📝 Cita guardada en memoria');
    return record;
  }

  try {
    const query = `
      INSERT INTO citas (
        patient_name, patient_email, patient_phone,
        service, service_id, doctor,
        appointment_date, appointment_time, duration,
        status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const params = [
      appointmentData.patientName,
      appointmentData.patientEmail,
      appointmentData.patientPhone,
      appointmentData.service,
      appointmentData.serviceId,
      appointmentData.doctor,
      appointmentData.date,
      appointmentData.time,
      appointmentData.duration,
      appointmentData.status || 'Pendiente',
      appointmentData.notes || ''
    ];
    const result = await pool.query(query, params);
    console.log('✅ Cita guardada en PostgreSQL');
    return result.rows[0];

  } catch (error) {
    console.error('Error guardando en PostgreSQL:', error.message);
    throw error;
  }
}

export async function deleteAppointment(id) {
  if (!isConnected || !pool) {
    const idx = memoryStore.findIndex(app => app.id == id);
    if (idx !== -1) {
      memoryStore.splice(idx, 1);
      return true;
    }
    return false;
  }
  try {
    const result = await pool.query('DELETE FROM citas WHERE id = $1 RETURNING id', [id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error eliminando cita en PostgreSQL:', error.message);
    throw error;
  }
}

export async function deleteAllAppointments() {
  if (!isConnected || !pool) {
    memoryStore = [];
    return true;
  }
  try {
    await pool.query('DELETE FROM citas');
    return true;
  } catch (error) {
    console.error('Error eliminando todas las citas:', error.message);
    throw error;
  }
}

export async function updateAppointmentStatus(id, status) {
  if (!isConnected || !pool) {
    const idx = memoryStore.findIndex(app => app.id == id);
    if (idx !== -1) {
      memoryStore[idx].status = status;
      memoryStore[idx].updated_at = new Date().toISOString();
      return memoryStore[idx];
    }
    return null;
  }

  try {
    const result = await pool.query(
      `UPDATE citas SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error actualizando estado en PostgreSQL:', error.message);
    throw error;
  }
}

export async function getStats() {
  if (!isConnected || !pool) {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: memoryStore.length,
      confirmed: memoryStore.filter(app => app.status === 'Confirmada').length,
      pending: memoryStore.filter(app => app.status === 'Pendiente').length,
      cancelled: memoryStore.filter(app => app.status === 'Cancelada').length,
      today: memoryStore.filter(app => app.appointment_date === today).length
    };
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const results = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM citas'),
      pool.query("SELECT COUNT(*) as confirmed FROM citas WHERE status = 'Confirmada'"),
      pool.query("SELECT COUNT(*) as pending FROM citas WHERE status = 'Pendiente'"),
      pool.query("SELECT COUNT(*) as cancelled FROM citas WHERE status = 'Cancelada'"),
      pool.query('SELECT COUNT(*) as today FROM citas WHERE appointment_date = $1', [today])
    ]);
    return {
      total: parseInt(results[0].rows[0].total),
      confirmed: parseInt(results[1].rows[0].confirmed),
      pending: parseInt(results[2].rows[0].pending),
      cancelled: parseInt(results[3].rows[0].cancelled),
      today: parseInt(results[4].rows[0].today)
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas de PostgreSQL:', error);
    const today = new Date().toISOString().split('T')[0];
    return {
      total: memoryStore.length,
      confirmed: memoryStore.filter(app => app.status === 'Confirmada').length,
      pending: memoryStore.filter(app => app.status === 'Pendiente').length,
      cancelled: memoryStore.filter(app => app.status === 'Cancelada').length,
      today: memoryStore.filter(app => app.appointment_date === today).length
    };
  }
}

export async function healthCheck() {
  if (!isConnected || !pool) {
    return {
      status: 'OK',
      database: 'Memoria (PostgreSQL no disponible)',
      message: 'Usando almacenamiento en memoria como fallback'
    };
  }
  try {
    await pool.query('SELECT 1');
    return { status: 'OK', database: 'PostgreSQL (Render)', connected: true };
  } catch (error) {
    return { status: 'ERROR', database: 'Disconnected', error: error.message };
  }
}

initDatabase().then(connected => {
  console.log(connected ? '🚀 PostgreSQL inicializado correctamente' : '⚠️  PostgreSQL no disponible. Usando modo memoria.');
});

export default { initDatabase, testConnection, getAppointments, createAppointment, updateAppointmentStatus, deleteAppointment, deleteAllAppointments, getStats, healthCheck };
