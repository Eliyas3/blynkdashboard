# Antigravity Drive: Blynk 2.0 & ESP32 Step-by-Step Guide

This guide will walk you through setting up a complete IoT project using the Blynk 2.0 platform and an ESP32 microcontroller. We will create a device that simulates "Field Strength" data and displays it on a web dashboard.

---

## Part 1: Blynk Console Configuration

### 1. Create a New Template
1. Log in to your [Blynk.Console](https://blynk.cloud/).
2. Navigate to the **Templates** icon (second from the top left) and click **+ New Template**.
3. Fill in the requested details:
    *   **Name**: `Antigravity_Drive`
    *   **Hardware**: `ESP32`
    *   **Connection Type**: `WiFi`
    *   **Description**: (Optional) "Field Strength Simulation"
4. Click **Done**.

### 2. Configure the Datastream
1. Click on the **Datastreams** tab within your new template.
2. Click **+ New Datastream** and select **Virtual Pin**.
3. Configure it as follows:
    *   **Name**: `Field Strength`
    *   **Pin**: `V0`
    *   **Data Type**: `Double` (or `Integer` depending on preference, Float is recommended for precision)
    *   **Units**: None (or custom)
    *   **Min**: `0`
    *   **Max**: `100`
    *   **Default Value**: `0`
4. Click **Create**.

### 3. Build the Web Dashboard
1. Click on the **Web Dashboard** tab.
2. In the **Widget Box** (left panel), find the **Gauge** widget and drag it onto the dashboard canvas.
3. Hover over the added Gauge widget and click the **Settings (Gear)** icon.
4. Set the dashboard configuration:
    *   **Title**: `Field Strength`
    *   **Datastream**: Select `Field Strength (V0)`
    *   **Min/Max**: Ensure it is set to `0` / `100`.
5. Click **Save** to close the widget settings.
6. **Important**: Click **Save** in the top right corner of the main window to save the entire Template.

### 4. Create the Device
1. Go to the **Search** (Magnifying glass) or **My Devices** (Home) tab.
2. Click **+ New Device**.
3. Choose **From Template**.
4. Select `Antigravity_Drive` from the list.
5. Click **Create**.
6. **Copy Credentials**: A code box will appear with your `BLYNK_TEMPLATE_ID`, `BLYNK_TEMPLATE_NAME`, and `BLYNK_AUTH_TOKEN`. **Copy these lines**; you will need them for the Arduino sketch.

---

## Part 2: Arduino IDE Setup

### 1. Install Libraries
You need the official Blynk library to compile the code.
1. Open the Arduino IDE.
2. Go to **Sketch** -> **Include Library** -> **Manage Libraries...**
3. In the Library Manager search bar, type `Blynk`.
4. Find **Blynk** by *Volodymyr Shymanskyy* and click **Install**.

### 2. Prepare the Code
1. Open the file `Blynk_Antigravity_Drive.ino` provided with this guide.
2. Locate the top section under `// Template ID...`:
   ```cpp
   #define BLYNK_TEMPLATE_ID   "TMPLxxxxxx"
   #define BLYNK_TEMPLATE_NAME "Antigravity Drive"
   #define BLYNK_AUTH_TOKEN    "YourAuthToken"
   ```
3. Replace these three lines with the code you copied from the **Device Info** screen in the Blynk Console.

4. Locate the WiFi credentials section:
   ```cpp
   char ssid[] = "YourNetworkName";
   char pass[] = "YourPassword";
   ```
5. detailed Replace `YourNetworkName` with your WiFi SSID and `YourPassword` with your WiFi password.

---

## Part 3: Deploy and Test

1. Connect your ESP32 board to your computer via USB.
2. Select the correct **Board** (e.g., *DOIT ESP32 DEVKIT V1*) and **Port** in the Arduino IDE Tools menu.
3. Click the **Upload** (Right Arrow) button.
4. Once uploaded, open the **Serial Monitor** (set baud rate to `115200`).
5. You should see the ESP32 connecting to WiFi and then to the Blynk cloud.
    *   *Success Message*: `Ready (ping: ...ms)`.
6. Open your **Blynk Web Dashboard**. You should see the Gauge widget updating every 5 seconds with a new random value between 0 and 100.
