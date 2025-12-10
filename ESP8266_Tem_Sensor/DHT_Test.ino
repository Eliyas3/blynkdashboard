/*************************************************************
  DHT Sensor Diagnostic Test for ESP8266
  
  This is a simple test to diagnose your DHT sensor issue.
  Upload this first to verify sensor is working.
 *************************************************************/

#include <DHT.h>

#define DHTPIN D4        // Data pin connected to D4
#define DHTTYPE DHT11    // Change to DHT22 if you have that sensor

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n╔═══════════════════════════════╗");
  Serial.println("║  DHT Sensor Diagnostic Test  ║");
  Serial.println("╚═══════════════════════════════╝\n");
  
  Serial.println("Initializing DHT sensor...");
  dht.begin();
  
  Serial.println("✅ Setup complete!\n");
  Serial.println("Reading sensor every 3 seconds...\n");
  
  delay(2000);  // Wait 2 seconds for sensor to stabilize
}

void loop() {
  Serial.println("─────────────────────────────");
  Serial.println("Reading DHT sensor...");
  
  // Read temperature
  float temperature = dht.readTemperature();
  
  // Read humidity
  float humidity = dht.readHumidity();
  
  // Check if readings are valid
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("❌ ERROR: Failed to read from DHT sensor!");
    Serial.println("\n🔍 Troubleshooting checklist:");
    Serial.println("   1. Check wiring:");
    Serial.println("      DHT VCC  → ESP8266 3.3V");
    Serial.println("      DHT GND  → ESP8266 GND");
    Serial.println("      DHT DATA → ESP8266 D4");
    Serial.println("   2. Make sure sensor type is correct:");
    Serial.println("      DHT11 or DHT22? (Line 11 in code)");
    Serial.println("   3. Try unplugging and re-plugging sensor");
    Serial.println("   4. Check if sensor is damaged");
  } else {
    // Success! Print readings
    Serial.println("✅ SUCCESS! Sensor is working!");
    Serial.print("🌡️  Temperature: ");
    Serial.print(temperature);
    Serial.println(" °C");
    
    Serial.print("💧 Humidity: ");
    Serial.print(humidity);
    Serial.println(" %");
  }
  
  delay(3000);  // Wait 3 seconds before next reading
}
