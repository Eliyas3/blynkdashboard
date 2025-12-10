# Blynk Dashboard - Complete Setup Guide

A local Blynk-like IoT dashboard that displays live sensor data from ESP32 over WiFi.

## 🌟 Features

- **Beautiful Dark UI** - Matches Blynk's professional interface
- **Live Data Updates** - Real-time sensor data via WebSocket
- **Local Network** - No cloud dependency, works on your WiFi
- **Multiple Widgets** - Gauge displays for Temperature, Humidity, etc.
- **ESP32 Compatible** - Direct WiFi connection to your dashboard

---

## 📋 Prerequisites

### For the Web Dashboard:
- Node.js installed (v14 or higher)
- A web browser (Chrome, Firefox, Safari, Edge)

### For ESP32:
- Arduino IDE installed
- ESP32 board support installed
- ArduinoWebsockets library by Gil Maimon

---

## 🚀 Quick Start

### Step 1: Start the WebSocket Server

Open a terminal in the `blynk-web-dashboard` folder and run:

```bash
npm run server
```

You should see:
```
╔════════════════════════════════════════╗
║   Blynk Dashboard WebSocket Server    ║
╠════════════════════════════════════════╣
║  🌐 Server: http://localhost:8080      ║
║  🔌 WebSocket: ws://localhost:8080     ║
╚════════════════════════════════════════╝

Waiting for connections...
```

### Step 2: Start the Web Dashboard

Open **another terminal** in the same folder and run:

```bash
npm run dev
```

Open your browser to: **http://localhost:5173**

You should see the dashboard with gauges (showing simulated data initially).

### Step 3: Find Your Computer's IP Address

You need this for the ESP32 to connect.

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (e.g., `192.168.1.100`)

**On Mac/Linux:**
```bash
ifconfig
```
Look for your WiFi interface's inet address.

### Step 4: Configure ESP32

1. Open `Blynk_Antigravity_Drive.ino` in Arduino IDE

2. Update these lines:
```cpp
const char* ssid = "YourNetworkName";       // Your WiFi name
const char* password = "YourPassword";      // Your WiFi password
const char* SERVER_IP = "192.168.1.100";    // Your computer's IP from Step 3
```

3. Install the required library:
   - Go to **Tools → Manage Libraries**
   - Search for "ArduinoWebsockets"
   - Install **ArduinoWebsockets by Gil Maimon**

4. Select your ESP32 board:
   - **Tools → Board → ESP32 Arduino → ESP32 Dev Module**

5. Select the correct port:
   - **Tools → Port → COMX** (Windows) or **/dev/ttyUSB0** (Mac/Linux)

6. Click the **Upload** button

### Step 5: Monitor the Connection

1. Open the Serial Monitor (Ctrl+Shift+M or Tools → Serial Monitor)
2. Set baud rate to **115200**
3. You should see:
```
✅ WiFi Connected!
📍 IP Address: 192.168.1.xxx
✅ WebSocket Connected!
📤 Sent: {"V0":28.5,"V1":62.3}
```

4. Check your **Web Dashboard** - the gauges should now show LIVE data from your ESP32!

5. Check the **Server Terminal** - you should see:
```
🤖 ESP32 device connected!
📡 Broadcasting sensor data to 1 clients: { V0: 28.5, V1: 62.3 }
```

---

## 🎨 Dashboard Features

### Current Widgets:
- **Temperature Gauge** (V0) - Range: 0-100°C
- **Humidity Gauge** (V1) - Range: 0-100%

### Color Coding:
- **Green** (0-33%) - Low values
- **Blue** (34-66%) - Medium values  
- **Red** (67-100%) - High values

### Time Selector:
- Live, 1h, 6h, 1d, 1w, 1m, 3mo, 6mo, 1y (UI only, for future features)

---

## 🔧 Customization

### Adding More Sensors:

**1. In Arduino Code (`Blynk_Antigravity_Drive.ino`):**
```cpp
void sendSensorData() {
  float temperature = random(200, 350) / 10.0;
  float humidity = random(300, 800) / 10.0;
  float pressure = random(900, 1100) / 10.0;  // NEW
  
  String jsonData = "{";
  jsonData += "\"V0\":" + String(temperature, 1) + ",";
  jsonData += "\"V1\":" + String(humidity, 1) + ",";
  jsonData += "\"V2\":" + String(pressure, 1);  // NEW
  jsonData += "}";
  
  client.send(jsonData);
}
```

**2. In Web App (`src/App.jsx`):**
```javascript
const [project] = useState({
  widgets: [
    { id: 'w1', type: 'Gauge', label: 'Temperature', pin: 'V0', min: 0, max: 100 },
    { id: 'w2', type: 'Gauge', label: 'Humidity', pin: 'V1', min: 0, max: 100 },
    { id: 'w3', type: 'Gauge', label: 'Pressure', pin: 'V2', min: 900, max: 1100 }  // NEW
  ]
});

const [datastreams, setDatastreams] = useState({
  V0: 0,
  V1: 0,
  V2: 0  // NEW
});
```

### Connecting Real Sensors:

Replace the `random()` calls with actual sensor readings:

**Example with DHT22 Temperature/Humidity Sensor:**
```cpp
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  // ... existing code ...
  dht.begin();
}

void sendSensorData() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  
  String jsonData = "{";
  jsonData += "\"V0\":" + String(temperature, 1) + ",";
  jsonData += "\"V1\":" + String(humidity, 1);
  jsonData += "}";
  
  client.send(jsonData);
}
```

---

## 🐛 Troubleshooting

### ESP32 won't connect to WiFi:
- Double-check SSID and password (case-sensitive!)
- Make sure ESP32 is in range of your router
- Some ESP32 boards only support 2.4GHz WiFi

### WebSocket connection fails:
- Make sure the server is running (`npm run server`)
- Verify the SERVER_IP matches your computer's IP
- Check that port 8080 isn't blocked by firewall
- ESP32 and computer must be on the SAME WiFi network

### Dashboard shows "0" values:
- Check if ESP32 is connected (Serial Monitor)
- Verify server is receiving data (server terminal)
- Refresh the web dashboard page

### Server won't start:
- Make sure port 8080 is not already in use
- Run `npm install` to ensure all dependencies are installed

---

## 📱 Network Architecture

```
ESP32 Device          WebSocket Server      Web Dashboard
    |                       |                      |
    | 1. Connect via WiFi  |                      |
    |--------------------->|                      |
    |                      |                      |
    | 2. Send sensor data  |                      |
    |--------------------->|                      |
    |                      | 3. Broadcast data    |
    |                      |--------------------->|
    |                      |                      |
    |                      |                      | 4. Display live
    |                      |                      |    on gauges
```

---

## 🎯 Project Structure

```
blynk-web-dashboard/
├── server.js              # WebSocket server
├── package.json           # Node.js dependencies
├── src/
│   ├── App.jsx           # Main React app with WebSocket client
│   ├── index.css         # Blynk-style dark theme
│   └── components/
│       ├── Sidebar.jsx
│       ├── DashboardCanvas.jsx
│       └── widgets/
│           └── GaugeWidget.jsx

Blynk_Antigravity_Drive/
└── Blynk_Antigravity_Drive.ino  # ESP32 WebSocket client
```

---

## 📄 License

Free to use for personal and educational projects.

## 🤝 Credits

Inspired by the Blynk IoT platform's beautiful interface.

---

**🎉 You now have a fully functional IoT dashboard running locally on your network!**
