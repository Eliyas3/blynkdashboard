import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

const ProjectAuthModal = ({ isOpen, onClose, project }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !project) return null;

    const arduinoCode = `/*************************************************************
  ${project.name}
  Auth Token: ${project.authToken}
  Connection: ${project.connectionType}
  Generated: ${new Date().toLocaleString()}
*************************************************************/

#include <ESP8266WiFi.h>
#include <ArduinoWebsockets.h>

using namespace websockets;

// WiFi credentials - UPDATE THESE!
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
const char* SERVER_IP = "YOUR_COMPUTER_IP";  // e.g., "192.168.1.100"
const int SERVER_PORT = 8080;

// Project Auth Token
const char* AUTH_TOKEN = "${project.authToken}";

WebsocketsClient client;

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nConnected to WiFi!");
  
  // Connect to WebSocket
  String wsUrl = String("ws://") + SERVER_IP + ":" + SERVER_PORT;
  if (client.connect(wsUrl.c_str())) {
    Serial.println("WebSocket connected!");
    // Identify as ESP32 device
    client.send("{\\"type\\":\\"device\\",\\"name\\":\\"ESP32\\",\\"authToken\\":\\"" + String(AUTH_TOKEN) + "\\"}");
  }
}

void loop() {
  if (!client.available()) {
    delay(5000);
    return;
  }
  
  client.poll();
  
  // Send sensor data (example)
  float temp = random(0, 100);  // Replace with actual sensor reading
  float humidity = random(0, 100);  // Replace with actual sensor reading
  
  String json = "{\\"authToken\\":\\"" + String(AUTH_TOKEN) + "\\",\\"V0\\":" + String(temp) + ",\\"V1\\":" + String(humidity) + "}";
  client.send(json);
  Serial.println(json);
  
  delay(2000);  // Send every 2 seconds
}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(arduinoCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content credentials-modal">
                <div className="modal-header">
                    <h2>Project Saved!</h2>
                    <button className="btn-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="credentials-content">
                    <div className="credential-item">
                        <label>Project Name</label>
                        <div className="credential-value">{project.name}</div>
                    </div>

                    <div className="credential-item">
                        <label>Auth Token</label>
                        <div className="device-id-box">
                            <div className="credential-value" style={{ flex: 1 }}>
                                {project.authToken}
                            </div>
                            <button className="btn-copy-inline" onClick={() => {
                                navigator.clipboard.writeText(project.authToken);
                            }}>
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="code-section">
                        <div className="code-header">
                            <label>ESP8266/ESP32 Code</label>
                            <button className="btn-copy" onClick={handleCopy}>
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied!' : 'Copy Code'}
                            </button>
                        </div>
                        <pre className="code-block">{arduinoCode}</pre>
                    </div>

                    <div className="info-box">
                        <strong>Setup Instructions:</strong>
                        <ol>
                            <li>Update WiFi credentials (<code>ssid</code>, <code>password</code>)</li>
                            <li>Update <code>SERVER_IP</code> with your computer's IP address</li>
                            <li>Install <code>ArduinoWebsockets</code> library</li>
                            <li>Upload to your ESP8266/ESP32</li>
                            <li>Open Serial Monitor (115200 baud) to see connection status</li>
                        </ol>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn-primary" onClick={onClose}>
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectAuthModal;
