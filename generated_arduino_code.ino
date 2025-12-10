/*************************************************************
  ESP32 Live Sensor - Auto-Generated Code
  Auth Token: d1fu7qeeqzjft3
  Hardware: ESP32
  Generated: 10/12/2025, 8:55:37 am
*************************************************************/

#include <WiFi.h>
#include <ArduinoWebsockets.h>
#include <DHT.h>

using namespace websockets;

// WiFi - UPDATE THESE!
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
const char* SERVER_IP = "YOUR_COMPUTER_IP";  // e.g., "192.168.1.100"
const int SERVER_PORT = 8080;

// Device Config (Auto-Generated)
const char* AUTH_TOKEN = "d1fu7qeeqzjft3";

// Sensor
#define DHTPIN D4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);
WebsocketsClient client;

void setup() {
  Serial.begin(115200);
  dht.begin();
  delay(2000);
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected!");
  
  String wsUrl = String("ws://") + SERVER_IP + ":" + SERVER_PORT;
  if (client.connect(wsUrl.c_str())) {
    Serial.println("WebSocket connected!");
    client.send("{\"type\":\"device\",\"deviceId\":\"" + String(AUTH_TOKEN) + "\"}");
  }
}

void loop() {
  if (!client.available()) {
    delay(5000);
    return;
  }
  
  client.poll();
  
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  
  if (!isnan(temp) && !isnan(hum)) {
    String json = "{\"deviceId\":\"" + String(AUTH_TOKEN) + "\",\"V0\":" + String(temp, 1) + ",\"V1\":" + String(hum, 1) + "}";
    client.send(json);
    Serial.println(json);
  }
  
  delay(2000);
}

/* Upload this code to your ESP32 and watch your dashboard! */
