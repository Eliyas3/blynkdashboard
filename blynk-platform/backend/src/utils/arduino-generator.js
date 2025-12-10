function generateArduinoCode(device, hardwareType = 'ESP8266') {
    const code = `/*************************************************************
  Auto-Generated Code - Blynk IoT Platform
  
  Device: ${device.name}
  Auth Token: ${device.authToken}
  Hardware: ${hardwareType}
  
  Generated: ${new Date().toLocaleString()}
  
  Instructions:
  1. Install ArduinoWebsockets library
  2. Update WiFi credentials below
  3. Upload to your ${hardwareType}
  4. Open Serial Monitor (115200 baud)
 *************************************************************/

#include <${hardwareType === 'ESP32' ? 'WiFi' : 'ESP8266WiFi'}.h>
#include <ArduinoWebsockets.h>
#include <DHT.h>

using namespace websockets;

// ===== WiFi Configuration =====
const char* ssid = "YOUR_WIFI_NAME";        // ← Change this
const char* password = "YOUR_WIFI_PASSWORD"; // ← Change this

// ===== Server Configuration =====
const char* SERVER_IP = "YOUR_COMPUTER_IP";  // ← Change this (e.g., "192.168.1.100")
const int SERVER_PORT = 8080;

// ===== Device Configuration (Auto-Generated) =====
const char* AUTH_TOKEN = "${device.authToken}";
const char* DEVICE_NAME = "${device.name}";

// ===== Sensor Configuration =====
#define DHTPIN D4        // DHT sensor pin
#define DHTTYPE DHT11    // DHT11 or DHT22

DHT dht(DHTPIN, DHTTYPE);
WebsocketsClient client;

// ===== Timing =====
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 2000;  // Send every 2 seconds

void setup() {
  Serial.begin(115200);
  delay(100);
  
  Serial.println("\\n╔════════════════════════════╗");
  Serial.println("║  ${device.name}");
  Serial.println("╚════════════════════════════╝");
  
  // Initialize sensor
  dht.begin();
  delay(2000);
  Serial.println("✅ Sensor initialized");
  
  // Connect to WiFi
  connectWiFi();
  
  // Connect to WebSocket server
  connectWebSocket();
}

void connectWiFi() {
  Serial.print("\\n📡 WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\\n✅ Connected!");
    Serial.print("📍 IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\\n❌ Failed!");
    while(1);
  }
}

void connectWebSocket() {
  String wsUrl = String("ws://") + SERVER_IP + ":" + SERVER_PORT;
  Serial.print("\\n🔌 Server: ");
  Serial.println(wsUrl);
  
  if (client.connect(wsUrl.c_str())) {
    Serial.println("✅ Connected!");
    
    // Identify device
    String msg = "{\\"type\\":\\"device\\",\\"deviceId\\":\\"" + String(AUTH_TOKEN) + "\\"}";
    client.send(msg);
  } else {
    Serial.println("❌ Failed!");
  }
  
  client.onMessage([](WebsocketsMessage message) {
    Serial.print("📥 ");
    Serial.println(message.data());
  });
}

void loop() {
  // Check connection
  if (!client.available()) {
    Serial.println("⚠️  Reconnecting...");
    connectWebSocket();
    delay(5000);
    return;
  }
  
  client.poll();
  
  // Send sensor data periodically
  if (millis() - lastSendTime >= sendInterval) {
    sendSensorData();
    lastSendTime = millis();
  }
}

void sendSensorData() {
  // Read sensors
  float temperature = dht.readTemperature();  // °C
  float humidity = dht.readHumidity();        // %
  
  // Check if valid
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("❌ Sensor error!");
    return;
  }
  
  // Display readings
  Serial.println("───────────────");
  Serial.print("🌡️  ");
  Serial.print(temperature);
  Serial.println("°C");
  
  Serial.print("💧 ");
  Serial.print(humidity);
  Serial.println("%");
  
  // Send to server (V0=Temperature, V1=Humidity)
  String json = "{\\"deviceId\\":\\"" + String(AUTH_TOKEN) + "\\",";
  json += "\\"V0\\":" + String(temperature, 1) + ",";
  json += "\\"V1\\":" + String(humidity, 1);
  json += "}";
  
  client.send(json);
  Serial.print("📤 ");
  Serial.println(json);
}

/*************************************************************
  CUSTOMIZATION TIPS:
  
  1. For different sensors:
     - Replace dht.readTemperature() with your sensor code
     - Update pin definitions (DHTPIN)
  
  2. Add more virtual pins:
     - "V2": value2, "V3": value3, etc.
  
  3. Control outputs:
     - Listen for commands in onMessage callback
     - Parse JSON and control pins
  
  4. Change update interval:
     - Modify sendInterval (in milliseconds)
  
  Support: github.com/yourusername/blynk-platform
 *************************************************************/
`;

    return code;
}

module.exports = { generateArduinoCode };
