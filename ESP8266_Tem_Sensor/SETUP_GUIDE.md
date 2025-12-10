# ESP8266 Temperature Sensor - Quick Setup Guide

## 📋 What You Have

- **Device Name**: Tem
- **Device ID**: `fxwQ4WiGdw4rQOeeOb0C`
- **Virtual Pin**: V0
- **Sensor Type**: Temperature
- **Board**: ESP8266 (NodeMCU, Wemos D1, etc.)

---

## 🚀 Step-by-Step Upload Instructions

### **Step 1: Install Required Library**

1. Open **Arduino IDE**
2. Go to **Tools → Manage Libraries** (Ctrl+Shift+I)
3. Search: `ArduinoWebsockets`
4. Install **"ArduinoWebsockets by Gil Maimon"**

---

### **Step 2: Configure Board**

1. Connect ESP8266 to your computer via USB
2. In Arduino IDE:
   - **Tools → Board → ESP8266 Boards → NodeMCU 1.0 (ESP-12E Module)**
     - Or select your specific ESP8266 board model
   - **Tools → Upload Speed → 115200**
   - **Tools → Port → COM3** (or your ESP8266's port)

---

### **Step 3: Update WiFi Credentials**

Open `ESP8266_Tem_Sensor.ino` and update **lines 21-22**:

```cpp
const char* ssid = "Your_WiFi_Name";        // Your actual WiFi name
const char* password = "Your_WiFi_Password"; // Your actual WiFi password
```

**Example:**
```cpp
const char* ssid = "MyHome_WiFi";
const char* password = "mypassword123";
```

---

### **Step 4: Verify Server IP**

The code is already set to your computer's IP:
```cpp
const char* SERVER_IP = "10.35.138.153";
```

✅ This is correct! No change needed.

---

### **Step 5: Upload Code**

1. Click the **Upload** button (→) in Arduino IDE
2. Wait for "Done uploading" message
3. If you see errors:
   - Check that correct board is selected
   - Check that correct port is selected
   - Make sure ESP8266 is properly connected

---

### **Step 6: Open Serial Monitor**

1. Click **Serial Monitor** (magnifying glass icon) or press Ctrl+Shift+M
2. Set baud rate to **115200** (bottom-right dropdown)

**You should see:**
```
╔═══════════════════════════════════════╗
║  Blynk Dashboard - ESP8266 Client    ║
║  Device: Tem (Temperature)            ║
╚═══════════════════════════════════════╝

📡 Connecting to WiFi: MyHome_WiFi
.........
✅ WiFi Connected!
📍 IP Address: 192.168.1.xxx

🔌 Connecting to WebSocket: ws://10.35.138.153:8080
✅ WebSocket Connected!
📤 Sent device identification
📤 Sent: {"deviceId":"fxwQ4WiGdw4rQOeeOb0C","V0":28.5} (28.5°C)
📤 Sent: {"deviceId":"fxwQ4WiGdw4rQOeeOb0C","V0":31.2} (31.2°C)
```

---

### **Step 7: Check Your Dashboard** 🎉

1. Open browser: `http://localhost:5173`
2. Your **"Tem"** gauge should now show **LIVE temperature data!**
3. Values update every 2 seconds
4. Temperature range: 20-35°C (simulated for now)

---

## 🌡️ Using a Real Temperature Sensor

The code currently sends **simulated** temperature (20-35°C). To use a real sensor:

### **Option A: DHT22/DHT11 Sensor**

1. **Install DHT library**:
   - Tools → Manage Libraries → Search "DHT sensor library" by Adafruit
   - Also install "Adafruit Unified Sensor"

2. **Connect DHT sensor**:
   - VCC → 3.3V
   - GND → GND
   - DATA → D4 (GPIO2)

3. **Add library at top of sketch**:
```cpp
#include <DHT.h>
```

4. **In setup(), add**:
```cpp
void setup() {
  // ... existing code ...
  
  dht.begin();  // Add this line
}
```

5. **Replace line 124 in `sendSensorData()`**:
```cpp
// Comment out or delete:
// float temperature = random(200, 350) / 10.0;

// Add instead:
#define DHTPIN D4
#define DHTTYPE DHT22  // or DHT11
DHT dht(DHTPIN, DHTTYPE);

float temperature = dht.readTemperature();
if (isnan(temperature)) {
  Serial.println("Failed to read sensor!");
  return;
}
```

### **Option B: DS18B20 Digital Sensor**

1. **Install libraries**:
   - OneWire
   - DallasTemperature

2. **Connect sensor**:
   - VCC → 3.3V
   - GND → GND  
   - DATA → D4 (with 4.7kΩ pull-up resistor to 3.3V)

3. **Use the DS18B20 code in comments (lines 140-148)**

---

## ❓ Troubleshooting

**WiFi won't connect:**
- Double-check SSID and password (case-sensitive!)
- Make sure you're using 2.4GHz WiFi (ESP8266 doesn't support 5GHz)
- Try moving ESP8266 closer to router

**WebSocket connection fails:**
- Ensure `npm run server` is running
- Verify computer IP is `10.35.138.153` (run `ipconfig`)
- Both ESP8266 and computer must be on same WiFi network
- Check Windows Firewall isn't blocking port 8080

**Dashboard shows 0:**
- Check Serial Monitor - is ESP8266 sending data?
- Refresh browser page
- Check server terminal for incoming messages

**Upload fails:**
- Try a different USB cable
- Press and hold FLASH button on ESP8266 during upload
- Try lowering upload speed to 9600

---

## 📊 Current Status

✅ **Dashboard**: Running on http://localhost:5173  
✅ **WebSocket Server**: Running on port 8080  
✅ **Device ID**: fxwQ4WiGdw4rQOeeOb0C configured  
✅ **Virtual Pin**: V0 ready  
✅ **Computer IP**: 10.35.138.153  

**You're all set! Upload the code and watch your dashboard come alive!** 🚀
