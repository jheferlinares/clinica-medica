# 🏥 Clínica Médica - Sistema de Citas

Sistema completo de landing page y gestión de citas médicas con MongoDB, desplegado como monorepo en Vercel.

## ✨ Características

### Frontend (React + Vite)
- ✅ Landing page profesional con animaciones
- ✅ Formulario de citas en línea
- ✅ Consulta de precios de servicios
- ✅ Diseño responsive y centrado en móviles
- ✅ Iconos con emojis (sin librerías externas)
- ✅ Efectos de scroll animados
- ✅ Formulario que envía datos a MongoDB

### Backend (Vercel API Routes)
- ✅ API Serverless Functions
- ✅ Conexión directa a MongoDB Atlas
- ✅ CRUD de citas médicas
- ✅ Estadísticas en tiempo real
- ✅ Validación de datos
- ✅ CORS configurado

### Base de Datos (MongoDB Atlas)
- ✅ Conexión segura con SSL
- ✅ Pooling de conexiones para serverless
- ✅ Datos persistentes en la nube
- ✅ Escalabilidad automática

## 🚀 Comenzar Ahora Mismo

### 1. Instalar dependencias
```bash
npm install
```

### 2. Inicializar base de datos
```bash
npm run init-db
```

### 3. Iniciar la aplicación
```bash
npm run dev
```

### 4. Abrir en navegador
- **URL**: http://localhost:5173
- **La aplicación funcionará automáticamente** con:
  - ✅ **PostgreSQL en Render** (si está activa)
  - ✅ **LocalStorage** como fallback (si PostgreSQL no está disponible)

## ⚡ Configuración con PostgreSQL (Render)

### **Base de datos configurada:**
- ✅ **URL**: `postgresql://clinica_user:****@dpg-d7ud1td0lvsc73cfc210-a.virginia-postgres.render.com/clinica_medica_uagv`
- ✅ **Host**: Render.com (Virginia)
- ✅ **Database**: `clinica_medica_uagv`
- ✅ **User**: `clinica_user`

### **Características:**
- 🆓 **Gratis** para empezar
- ⚡ **Rápida** y confiable
- ☁️ **En la nube** (accesible desde cualquier lugar)
- 🔄 **Modo fallback automático** a localStorage

## 🎯 Para probar PostgreSQL
```bash
# Probar conexión a PostgreSQL en Render
npm run test-pg

# Iniciar todo (base de datos + aplicación)
npm run dev:full
```

## 📁 Estructura del Proyecto (Monorepo Vercel)

```
clinica-medica/
├── src/                    # Frontend React (Vite)
│   ├── App.jsx            # Landing page principal
│   ├── App.css            # Estilos principales
│   ├── index.css          # Estilos globales
│   └── main.jsx           # Punto de entrada
├── api/                    # Vercel API Routes (Serverless Functions)
│   ├── appointments.js    # Endpoint de citas
│   ├── stats.js           # Endpoint de estadísticas
│   └── health.js          # Health check
├── public/                # Assets estáticos
├── .env                   # Variables de entorno (local)
├── .env.local             # Configuración desarrollo
├── .env.production        # Configuración producción
├── vercel.json            # Configuración Vercel
├── package.json           # Dependencias y scripts
├── seed-db.js             # Script para sembrar datos
├── test-api.js            # Script para probar API
└── README.md              # Esta documentación
```

## 🌐 URLs de la Aplicación

| Componente | URL | Descripción |
|-----------|-----|-------------|
| Frontend | http://localhost:5173 | Landing page principal |
| Doctor View | http://localhost:5173/doctor | Panel médico (contraseña: `clinica123`) |
| Backend API | http://localhost:5000 | Servidor API |
| API Health | http://localhost:5000/api/health | Verificar estado |

## 🔧 Comandos Disponibles

```bash
# Desarrollo
npm run dev:full          # Iniciar todo (frontend + backend)
npm run dev               # Solo frontend
npm run server            # Solo backend API

# Utilidades
npm run check             # Verificar estado del sistema
npm run start-mongodb     # Iniciar MongoDB (Windows)
npm run lint              # Linter de código

# Producción
npm run build             # Construir para producción
npm run preview           # Vista previa de producción
```

## 📊 API Endpoints (Vercel Serverless Functions)

### Citas
- `GET /api/appointments` - Obtener todas las citas (con filtros opcionales: `?status=Confirmada&date=2024-12-15`)
- `POST /api/appointments` - Crear nueva cita

### Estadísticas
- `GET /api/stats` - Obtener estadísticas en tiempo real (total, confirmadas, pendientes, canceladas, citas de hoy)

### Salud
- `GET /api/health` - Verificar estado del servidor y conexión a MongoDB

**Nota**: Todas las rutas están en `/api/*` y se sirven desde el mismo dominio en Vercel.

## 🎨 Características del Frontend

### Landing Page
- **Hero Section**: Imagen de doctora con estadísticas flotantes
- **Servicios**: 6 especialidades médicas con precios
- **Tabla de Precios**: Transparencia en costos
- **Formulario de Citas**: Agenda en línea con validación
- **Testimonios**: Experiencias de pacientes reales
- **Footer**: Contacto y redes sociales

### Vista de Doctor
- **Autenticación**: Contraseña protegida
- **Tabla de Citas**: Lista completa con filtros
- **Estadísticas**: Dashboard en tiempo real
- **Detalles**: Modal con información completa
- **Gestión de Estado**: Confirmar/Pendiente/Cancelar

## 🗄️ Estructura de la Base de Datos (MongoDB Atlas)

### Colección `appointments` (en base de datos `clinica-medica`)
```javascript
{
  _id: ObjectId,           // ID único generado por MongoDB
  patientName: String,     // Nombre del paciente (requerido)
  patientEmail: String,    // Email del paciente (requerido)
  patientPhone: String,    // Teléfono del paciente (requerido)
  service: String,         // Nombre del servicio (requerido)
  serviceId: String,       // ID del servicio (ej: 'general', 'cardiology')
  doctor: String,          // Nombre del doctor asignado
  date: String,            // Fecha de la cita YYYY-MM-DD (requerido)
  time: String,            // Hora de la cita HH:MM (requerido)
  duration: String,        // Duración (30 min, 45 min, 60 min)
  status: String,          // Estado: 'Pendiente', 'Confirmada', 'Cancelada'
  notes: String,           // Notas adicionales (opcional)
  createdAt: Date,         // Fecha de creación automática
  updatedAt: Date          // Fecha de última actualización automática
}
```

**Índices creados automáticamente:**
- `_id` (primary key)
- `date` + `time` (para ordenamiento)
- `status` (para filtros rápidos)

## 📱 Responsive Design

- **Mobile First**: Diseño centrado en móviles
- **Textos Centrados**: Todos los textos alineados al centro en móviles
- **Grid Flexible**: Layout que se adapta a cualquier pantalla
- **Touch Friendly**: Botones y elementos táctiles optimizados

## 🎯 Características Técnicas

### Frontend
- React 19 con Hooks
- React Router para navegación
- Lucide React para iconos
- CSS moderno con variables CSS
- Animaciones con CSS y Intersection Observer
- Formularios con validación

### Backend
- Express.js para servidor HTTP
- Mongoose para ODM de MongoDB
- CORS habilitado para desarrollo
- Manejo de errores centralizado
- Variables de entorno con dotenv

## 🔒 Seguridad

- **Contraseña por defecto**: `clinica123` (cambiar en producción)
- **Validación de datos**: En frontend y backend
- **CORS configurado**: Solo para desarrollo local
- **Variables de entorno**: Credenciales separadas del código

## 🚨 Solución de Problemas

### MongoDB no inicia
```bash
# Verificar instalación
mongod --version

# Crear carpeta de datos
mkdir C:\data\db  # Windows
sudo mkdir -p /data/db  # macOS/Linux

# Ejecutar como administrador
mongod --dbpath "C:\data\db"
```

### API no responde
```bash
# Verificar puerto
netstat -an | find ":5000"  # Windows
lsof -i :5000               # macOS/Linux

# Verificar logs
npm run server
```

### Frontend no carga
```bash
# Verificar dependencias
npm install

# Verificar puerto Vite
netstat -an | find ":5173"  # Windows
lsof -i :5173               # macOS/Linux
```

## 📈 Próximas Mejoras

1. **Autenticación JWT** para mayor seguridad
2. **Email de confirmación** automático
3. **Calendario interactivo** para selección de fechas
4. **Sistema de pagos** en línea
5. **Historial médico** de pacientes
6. **App móvil** con React Native

## 📄 Licencia

Este proyecto es para fines educativos y demostrativos.

## 👨‍⚕️ Créditos

Sistema desarrollado para gestión de clínicas médicas con tecnología moderna.

---

**¡Sistema listo para usar!** 🎉

Para más detalles, consulta `INSTRUCCIONES_MONGODB.md`
## 🚀 Despliegue en Vercel (Monorepo)

### Arquitectura Simplificada:
- **Frontend**: React estático (Vite)
- **Backend**: Vercel API Routes (Serverless Functions)
- **Base de datos**: MongoDB Atlas (Cloud)
- **Todo en un solo repositorio**: Monorepo simplificado

### Pasos para Desplegar:

#### 1. **Preparar el repositorio Git**
```bash
git init
git add .
git commit -m "Initial commit: Clínica Médica con MongoDB"
```

#### 2. **Crear cuenta en Vercel**
1. Ve a [Vercel.com](https://vercel.com) y crea una cuenta gratis
2. Conecta tu cuenta de GitHub/GitLab

#### 3. **Configurar MongoDB Atlas para producción**
1. En MongoDB Atlas, ve a "Network Access"
2. Agrega `0.0.0.0/0` para permitir todas las IPs (o las IPs de Vercel)
3. Copia tu connection string

#### 4. **Desplegar en Vercel**
1. En Vercel, haz clic en "New Project"
2. Importa tu repositorio Git
3. Vercel detectará automáticamente `vercel.json`
4. **IMPORTANTE**: Agrega la variable de entorno `MONGODB_URI` con tu connection string
5. Haz clic en "Deploy"

### Variables de Entorno en Vercel:
- `MONGODB_URI`: Tu connection string de MongoDB Atlas
- `NODE_ENV`: `production` (automático)

### URLs después del despliegue:
- **Frontend**: `https://tu-proyecto.vercel.app`
- **API Health**: `https://tu-proyecto.vercel.app/api/health`
- **API Appointments**: `https://tu-proyecto.vercel.app/api/appointments`
- **API Stats**: `https://tu-proyecto.vercel.app/api/stats`

### Ventajas de esta arquitectura:
- ✅ **Sin costos de servidor**: Serverless Functions son gratuitas para uso moderado
- ✅ **Escalabilidad automática**: Vercel escala automáticamente
- ✅ **CDN global**: Frontend servido desde edge locations
- ✅ **Monorepo simple**: Un solo repositorio, un solo despliegue
- ✅ **Sin configuración compleja**: Vercel maneja todo automáticamente

### Costos (Gratis para empezar):
- **Vercel**: 100GB/mes bandwidth gratis + 100GB-hours de Serverless Functions
- **MongoDB Atlas**: 512MB storage gratis (suficiente para miles de citas)

### Monitoreo:
- **Vercel Analytics**: Performance del frontend
- **Vercel Logs**: Logs de Serverless Functions
- **MongoDB Atlas Metrics**: Uso de base de datos

¡Sistema listo para producción con arquitectura moderna! 🏥🚀