# **App Name**: BMS Monitor

## Core Features:

- Real-time Battery Monitoring: Display current voltage, current, temperature, State of Charge (SoC), and protection status for connected BMS units in real-time.
- Cell-Level Voltage Display: Show individual cell voltages to provide detailed battery health assessment and balance status.
- Historical Data Graphs: Visualize past battery performance and trends using interactive charts for key parameters like voltage, current, and SoC over time. History retains up to 500 records.
- Direct Bluetooth BMS Connection: Enable direct connection and data reception from compatible JBD/Xiaoxiang BMS devices via Web Bluetooth, supporting Chrome, Edge, and Opera browsers.
- ESP32 Gateway Configuration: Provide a user interface to easily set up Wi-Fi network details (SSID, password) and a unique Device ID for ESP32-C3 Super Mini gateways.
- Personalized Firmware Generation Tool: A generative AI tool that dynamically creates a customized ESP32 firmware (.ino file) incorporating user-defined Wi-Fi network and device settings for remote data transmission.
- Multi-Battery and Group Management: Allow users to add, monitor, and organize multiple BMS units, supporting parallel connections and custom grouping for a comprehensive overview.

## Style Guidelines:

- Primary color: A deep, professional blue (#2966A3), chosen to reflect reliability and technology, creating a focused monitoring experience.
- Background color: A very dark, subtle blue-grey (#192633), providing a clean, modern canvas suitable for a data-rich monitoring interface.
- Accent color: A vibrant cyan (#5EDEE0), used to highlight critical data, interactive elements, and signify activity or energy, offering a dynamic contrast.
- Body and headline font: 'Inter' (sans-serif), chosen for its modern, objective, and highly legible appearance, ideal for presenting technical data and configuration options.
- Use clear, concise, outline-style icons to represent battery states, connection methods, settings, and data visualizations for immediate recognition and usability.
- Implement a dashboard-centric layout with clearly demarcated sections for real-time data, historical graphs, and configuration settings, ensuring responsiveness across devices.
- Incorporate subtle and functional animations, particularly for data updates on graphs, status changes, and seamless transitions between different views, enhancing user engagement without distraction.