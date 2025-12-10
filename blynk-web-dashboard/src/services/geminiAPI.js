// Google Gemini API Service

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export class GeminiService {
  async chat(message, context = {}) {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const prompt = this.buildPrompt(message, context);

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates[0]?.content?.parts[0]?.text;

      return text || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  buildPrompt(message, context) {
    const { widgets = [], datastreams = {}, project = null, stats = {} } = context;

    let prompt = `You are an AI assistant for an IoT dashboard. Help the user with their sensor data and IoT projects.

CURRENT PROJECT:
${project ? `- Name: ${project.name}
- Description: ${project.description}
- Auth Token: ${project.authToken}
- Connection: ${project.connectionType}
- Widgets: ${project.widgets.length}` : 'No project selected'}

WIDGETS:
${widgets.map(w => `- ${w.label} (${w.type}) on pin ${w.pin}`).join('\n') || 'No widgets added yet'}

CURRENT SENSOR DATA:
${Object.entries(datastreams).map(([pin, value]) => {
      const widget = widgets.find(w => w.pin === pin);
      return `${pin}${widget ? ` (${widget.label})` : ''}: ${value}`;
    }).join('\n') || 'No data available'}

${stats.anomalies ? `\nRECENT ANOMALIES: ${stats.anomalies}` : ''}

USER QUESTION: ${message}

Provide a helpful, concise response. If asked to generate Arduino code, provide complete, working code for ESP8266/ESP32.`;

    return prompt;
  }

  generateArduinoCode(project) {
    // Detect sensor types from widget labels
    const hasTempSensor = project.widgets.some(w =>
      w.label.toLowerCase().includes('temp') ||
      w.label.toLowerCase().includes('tem')
    );
    const hasHumiditySensor = project.widgets.some(w =>
      w.label.toLowerCase().includes('hum') ||
      w.label.toLowerCase().includes('humidity')
    );
    const useDHT = hasTempSensor || hasHumiditySensor;

    const widgetReads = project.widgets.map(w => {
      const sensorRead = this.getSensorReadCode(w);
      return `  // Read ${w.label}
  float ${w.pin.toLowerCase()}_value = ${sensorRead};
  Serial.print("${w.pin} (${w.label}): ");
  Serial.println(${w.pin.toLowerCase()}_value);`;
    }).join('\n\n');

    const wsMessages = project.widgets.map(w => {
      return `  doc["${w.pin}"] = ${w.pin.toLowerCase()}_value;`;
    }).join('\n');

    const dhtInclude = useDHT ? `#include <DHT.h>

// DHT Sensor Configuration
#define DHTPIN D4        // GPIO pin connected to DHT sensor
#define DHTTYPE DHT11    // DHT11 or DHT22
DHT dht(DHTPIN, DHTTYPE);
` : '';

    const dhtInit = useDHT ? `  // Initialize DHT sensor
  dht.begin();
  Serial.println("DHT sensor initialized");
  ` : '';

    return `/*************************************************************
  ${project.name}
  
  Description: ${project.description}
  Auth Token: ${project.authToken}
  
  Widgets:
${project.widgets.map((w, i) => `  ${i + 1}. ${w.label} (${w.type}) - ${w.pin}`).join('\n')}
  
  Required Libraries:
  - ESP8266WiFi or WiFi (built-in)
  - WebSocketsClient
  - ArduinoJson${useDHT ? '\n  - DHT sensor library' : ''}
*************************************************************/

#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
${dhtInclude}
// WiFi credentials - CHANGE THESE!
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server IP - CHANGE THIS!
const char* server = "192.168.1.100";  // Your computer's local IP
const int port = 8080;

// Project Auth Token
const char* AUTH_TOKEN = "${project.authToken}";

WebSocketsClient webSocket;
unsigned long lastSend = 0;
const int sendInterval = 2000; // 2 seconds

void setup() {
  Serial.begin(115200);
  delay(10);

${dhtInit}
  // Connect to WiFi
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\\n✓ WiFi connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  // Connect to WebSocket
  webSocket.begin(server, port, "/");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void loop() {
  webSocket.loop();
  
  if (millis() - lastSend > sendInterval) {
    sendSensorData();
    lastSend = millis();
  }
}

void sendSensorData() {
  StaticJsonDocument<512> doc;
  
${widgetReads}

  // Create JSON
${wsMessages}
  
  String message;
  serializeJson(doc, message);
  
  Serial.println("Sending: " + message);
  webSocket.sendTXT(message);
}

void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("[WS] Disconnected");
      break;
      
    case WStype_CONNECTED:
      Serial.println("[WS] Connected!");
      webSocket.sendTXT("{\\"type\\":\\"esp\\",\\"authToken\\":\\"" + String(AUTH_TOKEN) + "\\"}");
      break;
      
    case WStype_TEXT:
      Serial.printf("[WS] Received: %s\\n", payload);
      break;
  }
}

/*************************************************************
  SENSOR FUNCTIONS - Modify based on your sensors
*************************************************************/
${this.getHelperFunctions(project, useDHT)}`;
  }

  getSensorReadCode(widget) {
    const label = widget.label.toLowerCase();

    // Temperature
    if (label.includes('temp') || label.includes('tem')) {
      return 'dht.readTemperature()';
    }

    // Humidity
    if (label.includes('hum') || label.includes('humidity')) {
      return 'dht.readHumidity()';
    }

    // Light/LDR
    if (label.includes('light') || label.includes('ldr')) {
      return 'analogRead(A0)';
    }

    // Motion/PIR
    if (label.includes('motion') || label.includes('pir')) {
      return 'digitalRead(D2)';
    }

    // Default
    return 'analogRead(A0)';
  }

  getHelperFunctions(project, useDHT) {
    let functions = '';

    if (useDHT) {
      functions += `
// DHT Sensor Wiring:
// - Data pin → D4
// - VCC → 3.3V
// - GND → GND
// - 10K resistor between VCC and Data
`;
    }

    functions += `
// Other sensor examples:
/*
// Light sensor (LDR)
int readLight() {
  return analogRead(A0);  // 0-1023
}

// Motion sensor (PIR)
bool readMotion() {
  return digitalRead(D2);  // 0 or 1
}
*/`;

    return functions;
  }
}

export default new GeminiService();
