# Blynk IoT Platform - Quick Start Guide

## 🚀 What's Been Built

You now have a **production-ready foundation** for a full-scale IoT platform:

### ✅ **Backend (Complete - Phase 1)**
- **PostgreSQL + TimescaleDB** database with complete schema
- **Express API Server** with security middleware
- **JWT Authentication** (register/login)
- **Device Management** CRUD API
- **Template & Datastream** configuration
- **MQTT Integration** for IoT devices
- **WebSocket Server** for real-time updates
- **Docker Compose** deployment

### 📊 **Architecture**

```
ESP32/ESP8266 Device
        ↓
   MQTT Broker (Mosquitto)
        ↓
   Backend Server (Node.js)
        ↓
  ┌──────┴──────┐
  ↓             ↓
Database    WebSocket
(TimescaleDB)    ↓
                Frontend
```

---

## 🛠️ Setup Instructions

### **Prerequisites**
- Node.js 18+
- PostgreSQL 14+ (or use Docker)
- Docker & Docker Compose (recommended)

### **Option 1: Docker (Recommended) - Complete Stack**

```bash
cd c:/Users/Dell/OneDrive/Desktop/Blynkdashb/blynk-platform

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

**Services Running:**
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379  
- **MQTT**: localhost:1883
- **Backend API**: localhost:3000
- **WebSocket**: localhost:8080

### **Option 2: Manual Setup**

#### 1. **Database Setup**

```bash
# Install PostgreSQL + TimescaleDB
# Windows: Download from https://www.timescale.com/downloads

# Create database
psql -U postgres
CREATE DATABASE blynk_iot;
\q

# Run schema
psql -U postgres -d blynk_iot -f backend/database/schema.sql
```

#### 2. **Backend Setup**

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env and update:
# - DATABASE_URL
# - JWT_SECRET
# - MQTT_BROKER_URL

# Start server
npm run dev
```

#### 3. **MQTT Broker (Mosquitto)**

```bash
# Windows: Download from https://mosquitto.org/download/
# Or use Docker:
docker run -d -p 1883:1883 -p 9001:9001 eclipse-mosquitto:2
```

---

## 📡 **API Endpoints**

### **Authentication**
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me (requires JWT)
```

### **Devices**
```
GET    /api/devices
POST   /api/devices
GET    /api/devices/:id
PUT    /api/devices/:id
DELETE /api/devices/:id
GET    /api/devices/:id/data?pin=V0&start=&end=
```

### **Templates**
```
GET  /api/templates
POST /api/templates
```

### **Datastreams**
```
GET  /api/datastreams/:templateId
POST /api/datastreams
```

---

## 🧪 **Testing the API**

### **1. Register User**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "name": "Test User"
  }'
```

### **2. Create Device**
```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My ESP32",
    "description": "Temperature sensor"
  }'
```

Response includes auth_token for ESP32!

### **3. Get Device Data**
```bash
curl http://localhost:3000/api/devices/DEVICE_ID/data?pin=V0 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📱 **ESP32/ESP8266 Integration**

Your devices connect via **MQTT**:

**Topics:**
- `devices/{AUTH_TOKEN}/data` - Send sensor data
- `devices/{AUTH_TOKEN}/status` - Device status
- `devices/{AUTH_TOKEN}/command` - Receive commands

**Message Format:**
```json
{
  "V0": 25.5,
  "V1": 60.2
}
```

The backend automatically:
1. Receives MQTT messages
2. Validates device auth token
3. Saves to TimescaleDB
4. Broadcasts to WebSocket clients

---

## 🌐 **What's Next**

### **Phase 2: Frontend (In Progress)**
- React dashboard with device management
- Real-time data visualization
- Widget drag-and-drop
- Template builder UI

### **Phase 3: Advanced Features**
- Automation rules engine
- Multi-channel notifications
- Analytics & reports
- Multi-tenancy

### **Phase 4: Deployment**
- Kubernetes setup
- SSL/TLS certificates  
- Load balancing
- Monitoring & logging

---

## 📂 **Project Structure**

```
blynk-platform/
├── backend/
│   ├── src/
│   │   ├── server.js           # Main Express app
│   │   ├── api/
│   │   │   ├── auth.js         # Authentication
│   │   │   ├── devices.js      # Device management
│   │   │   ├── templates.js    # Templates
│   │   │   └── datastreams.js  # Pin configuration
│   │   ├── database/
│   │   │   ├── schema.sql      # Complete DB schema
│   │   │   └── connection.js   # Pool management
│   │   ├── mqtt/
│   │   │   └── client.js       # MQTT integration
│   │   └── websocket/
│   │       └── server.js       # Real-time updates
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── frontend/                    # To be built
├── mosquitto/
│   └── mosquitto.conf
└── docker-compose.yml
```

---

## 🔧 **Troubleshooting**

**Database connection fails:**
```bash
# Check PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs postgres
```

**MQTT not connecting:**
```bash
# Test mosquitto
mosquitto_sub -h localhost -t devices/+/data -v
```

**Backend crashes:**
```bash
# Check logs
docker-compose logs backend

# Common: Missing .env file
cp .env.example .env
```

---

## 💡 **Default Credentials**

**Database:**
- User: `postgres`
- Password: `password123` (change in docker-compose.yml)

**Admin User** (created by schema.sql):
- Email: `admin@blynk.local`
- Password: `admin123`

---

## 🎯 **Development Roadmap**

- [x] Database schema & migrations
- [x] Authentication system
- [x] Device management API
- [x] MQTT broker integration
- [x] WebSocket real-time
- [x] Docker deployment
- [ ] Frontend dashboard (Phase 2)
- [ ] Automation rules (Phase 3)
- [ ] Notifications (Phase 3)
- [ ] Production deployment (Phase 4)

---

**🎉 The foundation is ready! Ready to build the frontend and complete features.**
