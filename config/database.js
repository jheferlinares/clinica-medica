// Configuración de PostgreSQL para Render con modo fallback
import pg from 'pg';
const { Pool } = pg;

let pool = null;
let isConnected = false;

// Inicializar conexión
export async function initDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL no configurada. Usando modo localStorage.');
    return false;
  }

  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Necesario para Render
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // Probar conexión
    const client = await pool.connect();
    console.log('✅ PostgreSQL conectado a Render');
    
    // Crear tabla si no existe
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
    console.log('⚠️  Usando modo localStorage como fallback');
    isConnected = false;
    return false;
  }
}

// Probar la conexión
export async function testConnection() {
  return isConnected;
}

// Funciones con modo fallback a localStorage

// Obtener todas las citas
export async function getAppointments(filters = {}) {
  if (!isConnected || !pool) {
    // Modo fallback: localStorage
    const localAppointments = JSON.parse(localStorage.getItem('clinica_appointments') || '[]');
    
    // Aplicar filtros
    let filtered = localAppointments;
    const { status, date } = filters;
    
    if (status) {
      filtered = filtered.filter(app => app.status === status);
    }
    
    if (date) {
      filtered = filtered.filter(app => app.date === date);
    }
    
    return filtered.slice(0, 100); // Limitar a 100 como en PostgreSQL
  }
  
  try {
    const { status, date } = filters;
    let query = 'SELECT * FROM citas';
    const params = [];
    
    if (status || date) {
      query += ' WHERE';
      const conditions = [];
      
      if (status) {
        conditions.push(`status = $${params.length + 1}`);
        params.push(status);
      }
      
      if (date) {
        conditions.push(`appointment_date = $${params.length + 1}`);
        params.push(date);
      }
      
      query += ' ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY appointment_date, appointment_time LIMIT 100';
    
    const result = await pool.query(query, params);
    return result.rows;
    
  } catch (error) {
    console.error('Error obteniendo citas de PostgreSQL:', error);
    // Fallback a localStorage
    return JSON.parse(localStorage.getItem('clinica_appointments') || '[]');
  }
}

// Crear nueva cita
export async function createAppointment(appointmentData) {
  // Primero guardar en localStorage (siempre disponible)
  const localAppointments = JSON.parse(localStorage.getItem('clinica_appointments') || '[]');
  const localAppointment = {
    ...appointmentData,
    id: Date.now(), // ID temporal
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  localAppointments.push(localAppointment);
  localStorage.setItem('clinica_appointments', JSON.stringify(localAppointments));
  
  // Intentar guardar en PostgreSQL si está disponible
  if (isConnected && pool) {
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
      console.error('Error guardando en PostgreSQL (usando localStorage):', error.message);
    }
  }
  
  console.log('📝 Cita guardada en localStorage');
  return localAppointment;
}

// Obtener estadísticas
export async function getStats() {
  if (!isConnected || !pool) {
    // Modo fallback: localStorage
    const localAppointments = JSON.parse(localStorage.getItem('clinica_appointments') || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    return {
      total: localAppointments.length,
      confirmed: localAppointments.filter(app => app.status === 'Confirmada').length,
      pending: localAppointments.filter(app => app.status === 'Pendiente').length,
      cancelled: localAppointments.filter(app => app.status === 'Cancelada').length,
      today: localAppointments.filter(app => app.date === today).length
    };
  }
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const queries = [
      pool.query('SELECT COUNT(*) as total FROM citas'),
      pool.query("SELECT COUNT(*) as confirmed FROM citas WHERE status = 'Confirmada'"),
      pool.query("SELECT COUNT(*) as pending FROM citas WHERE status = 'Pendiente'"),
      pool.query("SELECT COUNT(*) as cancelled FROM citas WHERE status = 'Cancelada'"),
      pool.query('SELECT COUNT(*) as today FROM citas WHERE appointment_date = $1', [today])
    ];
    
    const results = await Promise.all(queries);
    
    return {
      total: parseInt(results[0].rows[0].total),
      confirmed: parseInt(results[1].rows[0].confirmed),
      pending: parseInt(results[2].rows[0].pending),
      cancelled: parseInt(results[3].rows[0].cancelled),
      today: parseInt(results[4].rows[0].today)
    };
    
  } catch (error) {
    console.error('Error obteniendo estadísticas de PostgreSQL:', error);
    // Fallback a localStorage
    const localAppointments = JSON.parse(localStorage.getItem('clinica_appointments') || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    return {
      total: localAppointments.length,
      confirmed: localAppointments.filter(app => app.status === 'Confirmada').length,
      pending: localAppointments.filter(app => app.status === 'Pendiente').length,
      cancelled: localAppointments.filter(app => app.status === 'Cancelada').length,
      today: localAppointments.filter(app => app.date === today).length
    };
  }
}

// Health check
export async function healthCheck() {
  if (!isConnected || !pool) {
    return { 
      status: 'OK', 
      database: 'LocalStorage (PostgreSQL no disponible)',
      message: 'Usando almacenamiento local como fallback'
    };
  }
  
  try {
    await pool.query('SELECT 1');
    return { 
      status: 'OK', 
      database: 'PostgreSQL (Render)',
      connected: true
    };
  } catch (error) {
    return { 
      status: 'ERROR', 
      database: 'Disconnected', 
      error: error.message,
      fallback: 'LocalStorage activado'
    };
  }
}

// Inicializar al cargar el módulo
initDatabase().then(connected => {
  if (connected) {
    console.log('🚀 PostgreSQL inicializado correctamente');
  } else {
    console.log('⚠️  PostgreSQL no disponible. Usando modo localStorage.');
  }
});

export default { initDatabase, testConnection, getAppointments, createAppointment, getStats, healthCheck };