'use server';
/**
 * @fileOverview A Genkit flow for generating personalized ESP32/ESP8266 firmware (.ino file).
 * Supports three modes: 
 * 1. Bridge: BMS -> ESP32 -> Cloud (via BLE & Wi-Fi) - ESP32 only
 * 2. Display: Cloud -> ESP32/ESP8266 -> OLED/LCD Screen (via Wi-Fi)
 * 3. Local Server: BMS -> ESP32 -> Local Web UI (via BLE & Wi-Fi AP/Station) - ESP32 only
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateEsp32FirmwareInputSchema = z.object({
  mode: z.enum(['bridge', 'display', 'local_server']).default('bridge').describe('Operation mode of the device.'),
  displayType: z.enum(['none', 'ssd1306', 'sh1106', 'lcd1602', 'custom']).default('none').describe('Type of display connected.'),
  customDisplayDescription: z.string().optional().describe('Description of a non-standard display if "custom" is selected.'),
  ssid: z.string().describe('The Wi-Fi network SSID.'),
  password: z.string().describe('The Wi-Fi network password.'),
  deviceId: z.string().describe('A unique identifier for the device.'),
  bmsIdentifier: z.string().optional().describe('The Bluetooth name of the JBD BMS (required for bridge and local_server mode).'),
  espModel: z.enum(['esp32c3', 'esp32s3', 'esp32', 'esp8266']).default('esp32c3').describe('The specific MCU model.'),
  serverUrl: z.string().describe('The API endpoint or local address info.'),
});
export type GenerateEsp32FirmwareInput = z.infer<typeof GenerateEsp32FirmwareInputSchema>;

const GenerateEsp32FirmwareOutputSchema = z.object({
  firmwareContent: z.string().describe('The generated firmware content as an .ino file.'),
});
export type GenerateEsp32FirmwareOutput = z.infer<typeof GenerateEsp32FirmwareOutputSchema>;

export async function generateEsp32Firmware(input: GenerateEsp32FirmwareInput): Promise<GenerateEsp32FirmwareOutput> {
  return generateEsp32FirmwareFlow(input);
}

const generateFirmwarePrompt = ai.definePrompt({
  name: 'generateEsp32FirmwarePrompt',
  input: { schema: GenerateEsp32FirmwareInputSchema },
  output: { schema: GenerateEsp32FirmwareOutputSchema },
  prompt: `You are an expert at generating Arduino firmware for {{{espModel}}}.

MCU: {{{espModel}}}
MODE: {{{mode}}}
DISPLAY: {{{displayType}}}
{{#if (eq displayType "custom")}}
CUSTOM DISPLAY INFO: {{{customDisplayDescription}}}
{{/if}}

{{#if (eq mode "bridge")}}
GOAL: Act as a gateway between JBD BMS and Cloud.
1. Connect to Wi-Fi using appropriate libraries.
2. Connect to BMS "{{{bmsIdentifier}}}" via BLE.
3. Every 10s, read data (0x03 command) and POST JSON to "{{{serverUrl}}}".
4. Handle radio coexistence.
{{#if (neq displayType "none")}}
5. Also display current Voltage, Current and SoC on the display.
{{/if}}

{{else if (eq mode "display")}}
GOAL: Act as a Remote Dashboard Screen.
1. Connect to Wi-Fi.
2. Every 5s, perform an HTTP GET request to "{{{serverUrl}}}".
3. Expect a JSON response with: totalVoltage, totalCurrent, totalPower, and avgSoC.
4. Output the data to the Serial monitor and display.

{{else if (eq mode "local_server")}}
GOAL: Act as a Standalone Local Server for closed systems.
1. Connect to BMS "{{{bmsIdentifier}}}" via BLE.
2. Create a WebServer (using WebServer.h).
3. Host a simple, mobile-friendly HTML dashboard at "/" that updates via AJAX (fetch) every 2s.
4. Serve a "/data" endpoint that returns JSON with BMS telemetry (Voltage, Current, SoC, Cell voltages, Temps).
5. Ensure the UI looks professional with a dark theme (matching the current app's HSL(210, 34%, 10%)).
{{#if (neq displayType "none")}}
6. Also display current IP and basic telemetry on the local display.
{{/if}}
{{/if}}

{{#if (neq displayType "none")}}
UI SETUP (Local Display):
{{#if (eq displayType "ssd1306")}}
- Use Adafruit_SSD1306 library for 128x64 I2C OLED display.
{{else if (eq displayType "sh1106")}}
- Use U8g2 library (U8G2_SH1106_128X64_NONAME_F_HW_I2C) for 1.3" OLED.
{{else if (eq displayType "lcd1602")}}
- Use LiquidCrystal_I2C library for 16x2 character LCD at address 0x27.
{{else if (eq displayType "custom")}}
- Use appropriate libraries for: {{{customDisplayDescription}}}.
{{/if}}
{{/if}}

Requirements:
- Use standard Arduino libraries (WiFi/ESP8266WiFi, HTTPClient, ArduinoJson, WebServer).
- Note: ESP8266 does NOT support Bluetooth. If ESP8266 is used for 'local_server', explain the limitation in comments.
- Output ONLY raw .ino code.`,
});

const generateEsp32FirmwareFlow = ai.defineFlow(
  {
    name: 'generateEsp32FirmwareFlow',
    inputSchema: GenerateEsp32FirmwareInputSchema,
    outputSchema: GenerateEsp32FirmwareOutputSchema,
  },
  async (input) => {
    const { output } = await generateFirmwarePrompt(input);
    return output!;
  },
);
