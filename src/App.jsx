import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [doctorPassword, setDoctorPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, cancelled: 0, today: 0 })
  
  // Landing page states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [activeService, setActiveService] = useState('general')
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [visibleSections, setVisibleSections] = useState({})
  
  const sectionRefs = useRef({})

  // Check URL for doctor view
  useEffect(() => {
    const path = window.location.pathname
    if (path === '/doctor') {
      setCurrentView('doctor')
    } else {
      setCurrentView('home')
    }
  }, [])

  // Load appointments for doctor view
  const loadAppointments = async () => {
    try {
      const response = await fetch('/api/appointments')
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
      // Fallback to localStorage
      const localAppointments = JSON.parse(localStorage.getItem('clinica_appointments') || '[]')
      setAppointments(localAppointments)
    }
  }

  // Load stats for doctor view
  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  // Handle doctor login
  const handleDoctorLogin = (e) => {
    e.preventDefault()
    if (doctorPassword === 'clinica123') {
      setIsAuthenticated(true)
      loadAppointments()
      loadStats()
    } else {
      alert('Contraseña incorrecta')
    }
  }

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      // For now, just update local state
      setAppointments(prev => prev.map(app => 
        app.id === appointmentId ? { ...app, status: newStatus } : app
      ))
      // In a real app, you'd make an API call to update the status
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const services = [
    { 
      id: 'general', 
      name: 'Consulta General', 
      price: '$50', 
      duration: '30 min',
      description: 'Evaluación médica completa para diagnóstico y tratamiento de enfermedades comunes.',
      details: [
        'Examen físico completo',
        'Diagnóstico y tratamiento',
        'Receta médica incluida',
        'Seguimiento por 7 días'
      ],
      doctor: 'Dr. Carlos Méndez',
      preparation: 'Traer estudios previos si los tiene'
    },
    { 
      id: 'pediatric', 
      name: 'Pediatría', 
      price: '$60', 
      duration: '45 min',
      description: 'Atención especializada para niños y adolescentes desde recién nacidos hasta 18 años.',
      details: [
        'Control de crecimiento y desarrollo',
        'Vacunación',
        'Nutrición infantil',
        'Atención de enfermedades comunes'
      ],
      doctor: 'Dra. Ana López',
      preparation: 'Traer cartilla de vacunación'
    },
    { 
      id: 'cardiology', 
      name: 'Cardiología', 
      price: '$80', 
      duration: '60 min',
      description: 'Diagnóstico y tratamiento de enfermedades del corazón y sistema cardiovascular.',
      details: [
        'Electrocardiograma',
        'Evaluación de presión arterial',
        'Estudio de colesterol',
        'Plan de prevención cardiovascular'
      ],
      doctor: 'Dra. María Rodríguez',
      preparation: 'Ayuno de 8 horas para estudios'
    },
    { 
      id: 'dermatology', 
      name: 'Dermatología', 
      price: '$70', 
      duration: '45 min',
      description: 'Diagnóstico y tratamiento de enfermedades de la piel, cabello y uñas.',
      details: [
        'Dermatoscopia digital',
        'Tratamiento de acné',
        'Detección de cáncer de piel',
        'Procedimientos estéticos'
      ],
      doctor: 'Dr. Roberto Sánchez',
      preparation: 'No aplicar cremas el día de la consulta'
    },
    { 
      id: 'orthopedics', 
      name: 'Ortopedia', 
      price: '$90', 
      duration: '60 min',
      description: 'Diagnóstico y tratamiento de problemas musculoesqueléticos y lesiones deportivas.',
      details: [
        'Evaluación de movilidad',
        'Radiografías (si se requieren)',
        'Plan de rehabilitación',
        'Infiltraciones guiadas'
      ],
      doctor: 'Dr. Javier Torres',
      preparation: 'Traer estudios de imagen previos'
    },
    { 
      id: 'nutrition', 
      name: 'Nutrición', 
      price: '$55', 
      duration: '45 min',
      description: 'Planificación alimentaria personalizada para mejorar la salud y bienestar.',
      details: [
        'Evaluación de composición corporal',
        'Plan alimenticio personalizado',
        'Seguimiento semanal',
        'Educación nutricional'
      ],
      doctor: 'Lic. Sofía Martínez',
      preparation: 'Registro de alimentación de 3 días'
    }
  ]

  const testimonials = [
    { name: 'María González', text: 'Excelente atención, el doctor fue muy profesional y resolvió mis dudas.', rating: 5 },
    { name: 'Carlos Rodríguez', text: 'Las instalaciones son modernas y el personal muy amable. Recomendado.', rating: 5 },
    { name: 'Ana Martínez', text: 'Puede conseguir cita el mismo día. Muy eficiente el sistema de reservas.', rating: 4 }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const selectedServiceInfo = services.find(s => s.id === formData.service)
      
      const appointmentData = {
        patientName: formData.name,
        patientEmail: formData.email,
        patientPhone: formData.phone,
        service: selectedServiceInfo?.name || formData.service,
        serviceId: formData.service,
        doctor: selectedServiceInfo?.doctor || 'Dr. Carlos Méndez',
        date: formData.date,
        time: formData.time,
        duration: selectedServiceInfo?.duration || '30 min',
        status: 'Pendiente',
        notes: formData.message,
        createdAt: new Date().toISOString(),
        localId: Date.now() // ID único para localStorage
      }
      
      // Intentar enviar a la API Route de Vercel
      try {
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointmentData)
        })
        
        if (response.ok) {
          // Éxito con MongoDB
          setIsSubmitted(true)
          setTimeout(() => setIsSubmitted(false), 3000)
          
          setFormData({
            name: '',
            email: '',
            phone: '',
            service: '',
            date: '',
            time: '',
            message: ''
          })
          
          alert('✅ ¡Cita agendada exitosamente en nuestra base de datos! Te contactaremos pronto para confirmar.')
          return
        }
      } catch (apiError) {
        console.log('API no disponible, usando modo local...')
      }
      
      // Modo fallback: guardar en localStorage
      const localAppointments = JSON.parse(localStorage.getItem('clinica_appointments') || '[]')
      localAppointments.push(appointmentData)
      localStorage.setItem('clinica_appointments', JSON.stringify(localAppointments))
      
  // Render doctor view
  if (currentView === 'doctor') {
    if (!isAuthenticated) {
      return (
        <div className="doctor-login-page">
          <div className="container">
            <div className="login-form">
              <h2>🏥 Panel Médico</h2>
              <p>Ingresa la contraseña para acceder al panel de control</p>
              <form onSubmit={handleDoctorLogin}>
                <div className="password-input">
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={doctorPassword}
                    onChange={(e) => setDoctorPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="login-button">
                  Ingresar
                </button>
              </form>
              <div className="password-hint">
                <small>Contraseña por defecto: clinica123</small>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="doctor-view-page">
        <div className="container">
          <header className="doctor-header">
            <h1>🏥 Panel de Control Médico</h1>
            <button 
              className="logout-button"
              onClick={() => {
                setIsAuthenticated(false)
                setDoctorPassword('')
                window.location.href = '/'
              }}
            >
              Cerrar Sesión
            </button>
          </header>

          {/* Stats Dashboard */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>{stats.total}</h3>
                <p>Total Citas</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{stats.confirmed}</h3>
                <p>Confirmadas</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>{stats.pending}</h3>
                <p>Pendientes</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <h3>{stats.cancelled}</h3>
                <p>Canceladas</p>
              </div>
            </div>
            <div className="stat-card today">
              <div className="stat-icon">📆</div>
              <div className="stat-content">
                <h3>{stats.today}</h3>
                <p>Citas Hoy</p>
              </div>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="appointments-section">
            <h2>📋 Lista de Citas</h2>
            <div className="appointments-table">
              <div className="table-header">
                <div>Paciente</div>
                <div>Servicio</div>
                <div>Fecha</div>
                <div>Hora</div>
                <div>Estado</div>
                <div>Acciones</div>
              </div>
              {appointments.map((appointment) => (
                <div key={appointment.id || appointment.patientName} className="table-row">
                  <div className="patient-info">
                    <strong>{appointment.patientName || appointment.patient_name}</strong>
                    <small>{appointment.patientEmail || appointment.patient_email}</small>
                  </div>
                  <div>{appointment.service}</div>
                  <div>{appointment.date || appointment.appointment_date}</div>
                  <div>{appointment.time || appointment.appointment_time}</div>
                  <div>
                    <span className={`status-badge status-${(appointment.status || 'Pendiente').toLowerCase()}`}>
                      {appointment.status || 'Pendiente'}
                    </span>
                  </div>
                  <div className="actions">
                    <button 
                      className="action-btn confirm"
                      onClick={() => updateAppointmentStatus(appointment.id || appointment.patientName, 'Confirmada')}
                    >
                      ✅
                    </button>
                    <button 
                      className="action-btn cancel"
                      onClick={() => updateAppointmentStatus(appointment.id || appointment.patientName, 'Cancelada')}
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

      setIsSubmitted(true)
      setTimeout(() => setIsSubmitted(false), 3000)
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        date: '',
        time: '',
        message: ''
      })
      
      alert('📝 ¡Cita guardada localmente! (MongoDB no disponible). Te contactaremos pronto.')
      
    } catch (error) {
      console.error('Error al agendar cita:', error)
      alert('❌ Error al agendar la cita. Por favor, intenta nuevamente o contacta por teléfono: +1 (555) 123-4567')
    }
  }

  const handleServiceClick = (service) => {
    setSelectedService(service)
    setShowServiceModal(true)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => ({
              ...prev,
              [entry.target.id]: true
            }))
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    const sections = ['services', 'pricing', 'appointment', 'testimonials', 'contact']
    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId)
      if (element) {
        sectionRefs.current[sectionId] = element
        observer.observe(element)
      }
    })

    return () => {
      sections.forEach(sectionId => {
        if (sectionRefs.current[sectionId]) {
          observer.unobserve(sectionRefs.current[sectionId])
        }
      })
    }
  }, [])

  const availableTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="logo">
            <span className="logo-icon">🏥</span>
            <h1>Clínica<span>Salud</span>Total</h1>
          </div>
          <nav className="nav">
            <a href="#services">Servicios</a>
            <a href="#pricing">Precios</a>
            <a href="#appointment">Citas</a>
            <a href="#contact">Contacto</a>
          </nav>
          <button className="cta-button">
            <span className="button-icon">📞</span>
            <span>Llamar ahora</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h2 className="hero-title">Cuidamos de tu salud con excelencia y calidez</h2>
            <p className="hero-subtitle">Más de 20 años de experiencia en atención médica integral. Consulta nuestros precios y agenda tu cita en línea.</p>
            <div className="hero-buttons">
              <a href="#appointment" className="primary-button">
                <span className="button-icon">📅</span>
                <span>Agendar Cita</span>
                <span className="button-arrow">→</span>
              </a>
              <a href="#pricing" className="secondary-button">
                <span>Ver Precios</span>
              </a>
            </div>
          </div>
          <div className="hero-image">
            <div className="doctor-image-container">
              <div className="doctor-image">
                <div className="doctor-placeholder">
                  <div className="doctor-avatar">
                    <span className="avatar-icon">👩‍⚕️</span>
                  </div>
                  <div className="doctor-badge">
                    <span className="badge-icon">🏆</span>
                  </div>
                </div>
                <div className="doctor-info">
                  <h4>Dra. María Rodríguez</h4>
                  <p>Cardióloga - 15 años de experiencia</p>
                  <div className="doctor-stats">
                    <div className="stat">
                      <span className="stat-icon">❤️</span>
                      <span>98%</span>
                      <small>Satisfacción</small>
                    </div>
                    <div className="stat">
                      <span className="stat-icon">👥</span>
                      <span>5,000+</span>
                      <small>Pacientes</small>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="floating-elements">
                <div className="floating-card floating-card-1">
                  <span className="card-icon">👥</span>
                  <h4>+5,000</h4>
                  <p>Pacientes atendidos</p>
                </div>
                <div className="floating-card floating-card-2">
                  <span className="card-icon">🏆</span>
                  <h4>98%</h4>
                  <p>Satisfacción</p>
                </div>
                <div className="floating-card floating-card-3">
                  <span className="card-icon">⏰</span>
                  <h4>24/7</h4>
                  <p>Emergencias</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section 
        id="services" 
        className={`services section-animate ${visibleSections.services ? 'section-visible' : ''}`}
      >
        <div className="container">
          <div className="section-header">
            <h2>Nuestros Servicios Médicos</h2>
            <p>Ofrecemos atención especializada en diversas áreas de la medicina</p>
          </div>
          <div className="services-grid">
            {services.map(service => (
              <div 
                key={service.id} 
                className={`service-card ${activeService === service.id ? 'active' : ''}`}
                onClick={() => setActiveService(service.id)}
              >
                <div className="service-icon">
                  <span className="icon-emoji">
                    {service.id === 'general' ? '🩺' : 
                     service.id === 'pediatric' ? '👶' :
                     service.id === 'cardiology' ? '❤️' :
                     service.id === 'dermatology' ? '🧴' :
                     service.id === 'orthopedics' ? '🦴' : '🍎'}
                  </span>
                </div>
                <h3>{service.name}</h3>
                <div className="service-details">
                  <span className="price">{service.price}</span>
                  <span className="duration">{service.duration}</span>
                </div>
                <button 
                  className="service-button"
                  onClick={() => handleServiceClick(service)}
                >
                  Más información
                  <span className="button-arrow">→</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section 
        id="pricing" 
        className={`pricing section-animate ${visibleSections.pricing ? 'section-visible' : ''}`}
      >
        <div className="container">
          <div className="section-header">
            <h2>Consulta Nuestros Precios</h2>
            <p>Transparencia en costos para tu tranquilidad</p>
          </div>
          <div className="pricing-table">
            <div className="table-header">
              <div>Servicio</div>
              <div>Precio</div>
              <div>Duración</div>
              <div>Incluye</div>
            </div>
            {services.map(service => (
              <div key={service.id} className="table-row">
                <div className="service-name">
                  <div className="service-icon-small">
                    <span className="icon-emoji-small">
                      {service.id === 'general' ? '🩺' : 
                       service.id === 'pediatric' ? '👶' :
                       service.id === 'cardiology' ? '❤️' :
                       service.id === 'dermatology' ? '🧴' :
                       service.id === 'orthopedics' ? '🦴' : '🍎'}
                    </span>
                  </div>
                  {service.name}
                </div>
                <div className="price-cell">{service.price}</div>
                <div>{service.duration}</div>
                <div>
                  <ul className="includes-list">
                    <li><span className="check-icon">✓</span> Consulta médica</li>
                    <li><span className="check-icon">✓</span> Diagnóstico</li>
                    <li><span className="check-icon">✓</span> Receta médica</li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appointment Form */}
      <section 
        id="appointment" 
        className={`appointment section-animate ${visibleSections.appointment ? 'section-visible' : ''}`}
      >
        <div className="container">
          <div className="appointment-wrapper">
            <div className="appointment-info">
              <h2>Agenda tu Cita en Línea</h2>
              <p>Completa el formulario y te confirmaremos tu cita en menos de 24 horas</p>
              
              <div className="info-cards">
                <div className="info-card">
                  <span className="info-icon">⏰</span>
                  <div>
                    <h4>Horario de Atención</h4>
                    <p>Lun-Vie: 8:00 - 20:00</p>
                    <p>Sáb: 9:00 - 14:00</p>
                  </div>
                </div>
                <div className="info-card">
                  <span className="info-icon">📞</span>
                  <div>
                    <h4>Teléfono de Emergencia</h4>
                    <p>+1 (555) 123-4567</p>
                    <p>Disponible 24/7</p>
                  </div>
                </div>
                <div className="info-card">
                  <span className="info-icon">📍</span>
                  <div>
                    <h4>Ubicación</h4>
                    <p>Av. Principal 123</p>
                    <p>Ciudad Médica</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="appointment-form">
              {isSubmitted ? (
                <div className="success-message">
                  <span className="success-icon">✅</span>
                  <h3>¡Cita Agendada!</h3>
                  <p>Te contactaremos pronto para confirmar los detalles.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Nombre Completo</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Ingresa tu nombre"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Teléfono</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Servicio</label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Selecciona un servicio</option>
                        {services.map(service => (
                          <option key={service.id} value={service.id}>
                            {service.name} - {service.price}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fecha</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Hora Preferida</label>
                    <div className="time-slots">
                      {availableTimes.map(time => (
                        <button
                          key={time}
                          type="button"
                          className={`time-slot ${formData.time === time ? 'selected' : ''}`}
                          onClick={() => setFormData(prev => ({ ...prev, time }))}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Mensaje (Opcional)</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Describe brevemente tu motivo de consulta..."
                      rows="3"
                    />
                  </div>

                  <button type="submit" className="submit-button">
                    <span className="submit-icon">📅</span>
                    <span>Confirmar Cita</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section 
        id="testimonials" 
        className={`testimonials section-animate ${visibleSections.testimonials ? 'section-visible' : ''}`}
      >
        <div className="container">
          <div className="section-header">
            <h2>Lo que dicen nuestros pacientes</h2>
            <p>Experiencias reales de quienes confían en nosotros</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i}
                      className={`star ${i < testimonial.rating ? 'filled' : ''}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4>{testimonial.name}</h4>
                    <p>Paciente satisfecho</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Modal */}
      {showServiceModal && selectedService && (
        <div className="modal-overlay" onClick={() => setShowServiceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowServiceModal(false)}>
              <span className="close-icon">×</span>
            </button>
            
            <div className="modal-header">
              <div className="service-icon-large">
                <span className="icon-emoji-large">
                  {selectedService.id === 'general' ? '🩺' : 
                   selectedService.id === 'pediatric' ? '👶' :
                   selectedService.id === 'cardiology' ? '❤️' :
                   selectedService.id === 'dermatology' ? '🧴' :
                   selectedService.id === 'orthopedics' ? '🦴' : '🍎'}
                </span>
              </div>
              <h2>{selectedService.name}</h2>
              <div className="service-price-large">{selectedService.price}</div>
            </div>
            
            <div className="modal-body">
              <p className="service-description">{selectedService.description}</p>
              
              <div className="service-details-section">
                <h4>¿Qué incluye?</h4>
                <ul className="service-details-list">
                  {selectedService.details.map((detail, index) => (
                    <li key={index}>
                      <span className="check-icon">✓</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="service-info-grid">
                <div className="info-item">
                  <h5>Duración</h5>
                  <p>{selectedService.duration}</p>
                </div>
                <div className="info-item">
                  <h5>Especialista</h5>
                  <p>{selectedService.doctor}</p>
                </div>
                <div className="info-item">
                  <h5>Preparación</h5>
                  <p>{selectedService.preparation}</p>
                </div>
              </div>
              
              <button 
                className="primary-button modal-button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, service: selectedService.id }))
                  setShowServiceModal(false)
                  document.getElementById('appointment')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <span className="button-icon">📅</span>
                <span>Agendar este servicio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="logo">
                <span className="logo-icon">🏥</span>
                <h3>Clínica<span>Salud</span>Total</h3>
              </div>
              <p>Comprometidos con tu salud y bienestar desde 2004.</p>
              <div className="social-links">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="social-icon">f</span>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="social-icon">𝕏</span>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="social-icon">📷</span>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="social-icon">in</span>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="social-icon">▶️</span>
                </a>
              </div>
            </div>

            <div className="footer-section">
              <h4>Contacto</h4>
              <p><span className="contact-icon">📍</span> Av. Principal 123, Ciudad Médica</p>
              <p><span className="contact-icon">📞</span> +1 (555) 123-4567</p>
              <p><span className="contact-icon">⏰</span> Lun-Vie: 8:00-20:00, Sáb: 9:00-14:00</p>
              <p>Emergencias 24/7: +1 (555) 987-6543</p>
            </div>

            <div className="footer-section">
              <h4>Certificaciones</h4>
              <p><span className="check-icon">✓</span> Certificación ISO 9001:2015</p>
              <p><span className="check-icon">✓</span> Acreditación Médica Nacional</p>
              <p><span className="check-icon">✓</span> Miembro de la Asociación Médica</p>
              <p><span className="check-icon">✓</span> Hospitales Aliados a Nivel Nacional</p>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2024 Clínica Salud Total. Todos los derechos reservados.</p>
            <div className="footer-links">
              <a href="#">Política de Privacidad</a>
              <a href="#">Términos de Servicio</a>
              <a href="#">Aviso Legal</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App