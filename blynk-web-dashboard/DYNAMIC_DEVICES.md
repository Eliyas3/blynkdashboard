# 🎉 Dynamic Device Management - Quick Start Guide

## ✨ What's New

Your dashboard now has **full dynamic device management** just like the real Blynk! You can:

- ✅ Click "+" to add new devices
- ✅ Enter custom device names
- ✅ Select sensor types (Temperature, Humidity, Pressure, etc.)
- ✅ Get unique device IDs automatically
- ✅ Copy Arduino code snippets instantly
- ✅ Delete devices you don't need
- ✅ Everything saves automatically (localStorage)

---

## 🚀 How to Use

### 1. **Add a New Device**

Click the **"+ New Device"** button or the **"+ Add Device"** card.

A modal will appear with a form:

- **Device Name**: Name your sensor (e.g., "Kitchen Temperature")
- **Sensor Type**: Select from Temperature, Humidity, Pressure, Light, Gas, Motion, or Custom
- **Widget Type**: Choose Gauge (Chart coming soon!)
- **Virtual Pin**: Select V0-V5

Click **"Create Device"** and you're done!

### 2. **Get Your Device ID**

After creating a device, a credentials modal automatically appears showing:

- **Device Name**
- **Unique Device ID** (20-character random string)
- **Virtual Pin**
- **Sensor Type**
- **Arduino Code Snippet** (auto-generated!)

Click the **"Copy"** button to copy the Arduino code.

### 3. **View Device Credentials Anytime**

Hover over any widget and click the **gear icon (⚙)** to view its credentials again.

### 4. **Delete a Device**

Hover over any widget and click the **trash icon (🗑️)** to remove it.

---

## 📱 For ESP32 Users

### Quick Setup:

1. **Create a device** on the dashboard
2. **Copy the Arduino code** from the credentials modal
3. **Paste it into your sketch**
4. **Update the sensor reading** part with your actual sensor code

### Example Arduino Code:

When you create a device called "Living Room Temp" with sensor type "temperature" on pin V0, you'll get:

```cpp
// Device: Living Room Temp
// Sensor: temperature
// Pin: V0

const char* deviceId = "xK9mP2nQ5vR8aB3dF7hJ";
const char* deviceName = "Living Room Temp";
const char* virtualPin = "V0";

// Add this to your sendSensorData() function:
String jsonData = "{";
jsonData += "\"deviceId\":\"" + String(deviceId) + "\",";
jsonData += "\"V0\":" + String(sensorValue, 1);
jsonData += "}";
client.send(jsonData);
```

**Important:** Replace `sensorValue` with your actual sensor reading!

### Full Example with DHT22:

```cpp
#include <WiFi.h>
#include <ArduinoWebsockets.h>
#include <DHT.h>

using namespace websockets;

// WiFi
const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";
const char* SERVER_IP = "10.35.138.153";  // Your computer's IP
const int SERVER_PORT = 8080;

// Device credentials (from dashboard)
const char* deviceId = "xK9mP2nQ5vR8aB3dF7hJ";
const char* virtualPin = "V0";

// DHT22 Sensor
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

WebsocketsClient client;

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected!");
  
  // Connect to WebSocket
  String wsUrl = String("ws://") + SERVER_IP + ":" + SERVER_PORT;
  client.connect(wsUrl.c_str());
  
  // Identify as device
  String msg = "{\"type\":\"device\",\"deviceId\":\"" + String(deviceId) + "\"}";
  client.send(msg);
}

void loop() {
  client.poll();
  
  // Read sensor
  float temperature = dht.readTemperature();
  
  if (!isnan(temperature)) {
    // Send to dashboard
    String jsonData = "{";
    jsonData += "\"deviceId\":\"" + String(deviceId) + "\",";
    jsonData += "\"V0\":" + String(temperature, 1);
    jsonData += "}";
    
    client.send(jsonData);
    Serial.println("Sent: " + jsonData);
  }
  
  delay(2000);
}
```

---

## 🎨 Dashboard Features

### Feature List:

- **Persistent Storage**: Widgets save automatically to localStorage
- **Unique IDs**: Each device gets a 20-character random ID
- **Sensor Types**: Pre-configured ranges for common sensors
- **Live Updates**: Real-time data display (2-second refresh)
- **Settings Access**: Click gear icon to view credentials
- **Easy Deletion**: Click trash icon to remove devices
- **Beautiful UI**: Dark theme with smooth animations

### Sensor Type Ranges:

| Sensor Type | Min | Max | Unit |
|------------|-----|-----|------|
| Temperature | -10 | 50 | °C |
| Humidity | 0 | 100 | % |
| Pressure | 980 | 1020 | hPa |
| Light | 0 | 1000 | lux |
| Gas | 0 | 1000 | ppm |
| Motion | 0 | 1 | bool |
| Custom | 0 | 100 | - |

---

## 💡 Tips & Tricks

1. **Multiple Sensors**: You can add multiple widgets, each with its own device ID
2. **Different Pins**: Use V0-V5 for different sensors
3. **Save Credentials**: Copy and save your device IDs somewhere safe!
4. **Simulation Mode**: Without ESP32 connected, gauges show simulated data
5. **Your Computer's IP**: Currently `10.35.138.153` - update in Arduino!

---

## 🔧 Troubleshooting

**Q: My widget disappeared after refresh!**  
A: This shouldn't happen - widgets are saved to localStorage. Try adding a new device.

**Q: How do I find my device ID again?**  
A: Hover over the widget and click the gear icon (⚙).

**Q: Can I edit a device name?**  
A: Currently no - delete and recreate it (takes 10 seconds).

**Q: The gauge shows 0**  
A: Either your ESP32 isn't sending data, or you're in simulation mode (check WebSocket connection).

---

## 📊 Your Computer's Network Info

**IP Address**: `10.35.138.153`  
**WebSocket Server**: `ws://10.35.138.153:8080`  
**Web Dashboard**: `http://localhost:5173`

Use this IP in your ESP32 Arduino code!

---

**🎉 You're all set! Start adding devices and see your IoT data come alive!**
