/*************************************************************
  Blynk Dashboard - ESP8266 Multi-Sensor
  
  Simple Blynk-style code - ONE device ID sends all sensors
  
  Device: Tem (Temperature & Humidity)
  Auth Token: fxwQ4WiGdw4rQOeeOb0C
  
  Virtual Pins:
  - V0: Temperature (°C)
  - V1: Humidity (%)
 *************************************************************/

#include <ESP8266WiFi.h>
#include <ArduinoWebsockets.h>
#include <DHT.h>

using namespace websockets;

// ===== DHT Sensor =====
#define DHTPIN D4
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

// ===== WiFi Credentials =====
const char* ssid = "YourNetworkName";
const char* password = "YourPassword";

// ===== Server =====
const char* SERVER_IP = "10.35.138.153";
const int SERVER_PORT = 8080;

// ===== Device Credentials =====
const char* AUTH_TOKEN = "fxwQ4WiGdw4rQOeeOb0C";  // Single auth token for all sensors

WebsocketsClient client;

unsigned long lastSendTime = 0;
const unsigned long sendInterval = 2000;

void setup() {
  Serial.begin(115200);
  delay(100);
  
  Serial.println("\n╔═══════════════════════════╗");
  Serial.println("║  Blynk Dashboard Client  ║");
  Serial.println("╚═══════════════════════════╝");
  
  dht.begin();
  delay(2000);
  
  connectWiFi();
  connectWebSocket();
}

void connectWiFi() {
  Serial.print("\n📡 WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Connected!");
    Serial.print("📍 IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ Failed!");
    while(1);
  }
}

void connectWebSocket() {
  String wsUrl = String("ws://") + SERVER_IP + ":" + SERVER_PORT;
  Serial.print("\n🔌 Server: ");
  Serial.println(wsUrl);
  
  if (client.connect(wsUrl.c_str())) {
    Serial.println("✅ Connected!");
    client.send("{\"type\":\"device\",\"deviceId\":\"" + String(AUTH_TOKEN) + "\"}");
  } else {
    Serial.println("❌ Failed! Check server is running.");
  }
  
  client.onMessage([](WebsocketsMessage message) {
    Serial.print("📥 ");
    Serial.println(message.data());
  });
}

void loop() {
  if (!client.available()) {
    Serial.println("⚠️  Reconnecting...");
    connectWebSocket();
    delay(5000);
    return;
  }
  
  client.poll();
  
  if (millis() - lastSendTime >= sendInterval) {
    sendSensorData();
    lastSendTime = millis();
  }
}

void sendSensorData() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  
  if (isnan(temp) || isnan(hum)) {
    Serial.println("❌ Sensor error!");
    return;
  }
  
  Serial.println("───────────────");
  Serial.print("🌡️  ");
  Serial.print(temp);
  Serial.println("°C");
  
  Serial.print("💧 ");
  Serial.print(hum);
  Serial.println("%");
  
  // Send data for both pins using single device ID
  String json = "{\"deviceId\":\"" + String(AUTH_TOKEN) + "\",\"V0\":" + String(temp, 1) + ",\"V1\":" + String(hum, 1) + "}";
  client.send(json);
  
  Serial.print("📤 ");
  Serial.println(json);
}
