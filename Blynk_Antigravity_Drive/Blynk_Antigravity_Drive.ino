/*************************************************************
  Blynk Dashboard - Local WebSocket Client for ESP32
  
  This sketch connects to your LOCAL WebSocket server and sends
  simulated sensor data (Temperature & Humidity) that will appear
  live on your web dashboard.
  
  Setup:
  1. Install the ArduinoWebsockets library by Gil Maimon
     (Tools -> Manage Libraries -> Search "ArduinoWebsockets")
  2. Update your WiFi credentials below
  3. Update the SERVER_IP to your computer's local IP address
  4. Upload to ESP32
  5. Open Serial Monitor (115200 baud) to see connection status
 *************************************************************/

#include <WiFi.h>
#include <ArduinoWebsockets.h>

using namespace websockets;

// WiFi credentials
const char* ssid = "YourNetworkName";       // Replace with your WiFi SSID
const char* password = "YourPassword";      // Replace with your WiFi password

// WebSocket server details
const char* SERVER_IP = "192.168.1.100";    // Replace with your computer's IP address
const int SERVER_PORT = 8080;

WebsocketsClient client;

// Timing
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 2000;  // Send data every 2 seconds

void setup() {
  Serial.begin(115200);
  delay(100);
  
  Serial.println("\n\n╔══════════════════════════════════════╗");
  Serial.println("║  Blynk Dashboard - ESP32 Client     ║");
  Serial.println("╚══════════════════════════════════════╝\n");
  
  // Connect to WiFi
  Serial.print("📡 Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("📍 IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi Connection Failed!");
    Serial.println("⚠️  Please check your WiFi credentials and restart.");
    while(1); // Halt
  }
  
  // Connect to WebSocket server
  connectWebSocket();
}

void connectWebSocket() {
  String wsUrl = String("ws://") + SERVER_IP + ":" + SERVER_PORT;
  Serial.print("\n🔌 Connecting to WebSocket: ");
  Serial.println(wsUrl);
  
  bool connected = client.connect(wsUrl.c_str());
  
  if (connected) {
    Serial.println("✅ WebSocket Connected!");
    
    // Identify as ESP32 device
    String identifyMsg = "{\"type\":\"device\",\"name\":\"ESP32\"}";
    client.send(identifyMsg);
    Serial.println("📤 Sent device identification");
    
  } else {
    Serial.println("❌ WebSocket Connection Failed!");
    Serial.println("⚠️  Make sure the server is running:");
    Serial.println("   npm run server");
  }
  
  // Setup message handler
  client.onMessage([](WebsocketsMessage message) {
    Serial.print("📥 Received: ");
    Serial.println(message.data());
  });
}

void loop() {
  // Check if client is connected
  if (!client.available()) {
    Serial.println("⚠️  WebSocket disconnected. Reconnecting...");
    connectWebSocket();
    delay(5000);
    return;
  }
  
  // Poll for messages
  client.poll();
  
  // Send sensor data periodically
  if (millis() - lastSendTime >= sendInterval) {
    sendSensorData();
    lastSendTime = millis();
  }
}

void sendSensorData() {
  // Simulate sensor readings (Replace with real sensor code)
  float temperature = random(200, 350) / 10.0;  // 20.0 - 35.0°C
  float humidity = random(300, 800) / 10.0;     // 30.0 - 80.0%
  
  // Create JSON message
  String jsonData = "{";
  jsonData += "\"V0\":" + String(temperature, 1) + ",";
  jsonData += "\"V1\":" + String(humidity, 1);
  jsonData += "}";
  
  // Send to server
  client.send(jsonData);
  
  Serial.println("📤 Sent: " + jsonData);
}
