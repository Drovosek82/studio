'use server';
/**
 * @fileOverview A Genkit flow for generating personalized ESP32/ESP8266 firmware (.ino file).
 * Supports four modes: 
 * 1. Bridge: BMS -> ESP32 -> Server (Cloud or Local Hub via BLE & Wi-Fi) - ESP32 only
 * 2. Display: Server -> ESP32/ESP8266 -> OLED/LCD Screen (via Wi-Fi)
 * 3. Local Server: BMS -> ESP32 -> Local Web UI (Single device standalone) - ESP32 only
 * 4. Hub: Multiple Bridges -> ESP32 -> Central Local Dashboard (Central Hub for closed systems)
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateEsp32FirmwareInputSchema = z.object({
  mode: z.enum(['bridge', 'display', 'local_server', 'hub']).default('bridge').describe('Operation mode of the device.'),
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
GOAL: Act as a gateway between JBD BMS and Server.
1. Connect to Wi-Fi.
2. Connect to BMS "{{{bmsIdentifier}}}" via BLE.
3. Every 10s, read data (0x03 command) and POST JSON to "{{{serverUrl}}}".
4. Handle radio coexistence for single-antenna chips.
{{#if (neq displayType "none")}}
5. Also display current Voltage, Current and SoC on the local display.
{{/if}}

{{else if (eq mode "display")}}
GOAL: Act as a Remote Dashboard Screen.
1. Connect to Wi-Fi.
2. Every 5s, perform an HTTP GET request to "{{{serverUrl}}}".
3. Expect a JSON response with system-wide aggregated telemetry.
4. Output the data to the display.

{{else if (eq mode "local_server")}}
GOAL: Act as a Standalone Local Server (Single Device).
1. Connect to BMS "{{{bmsIdentifier}}}" via BLE.
2. Host a simple Web UI at "/" for this specific battery.
3. Serve a "/data" endpoint for AJAX updates.

{{else if (eq mode "hub")}}
GOAL: Act as a CENTRAL HUB for Multiple Devices in a closed system.
1. Create a WebServer (using WebServer.h).
2. Host a Central Dashboard at "/" that can display multiple batteries.
3. Create a POST endpoint "/api/update" that other ESP32 "Bridges" can send data to.
4. Store the data from different Bridges (identified by deviceId) in a simple array or map.
5. The Web UI should dynamically list all reporting bridges.
6. Serve a "/api/data" endpoint for the UI to fetch all device states.
7. Print the Hub's IP address clearly to Serial and Display (if available).
{{/if}}

{{#if (neq displayType "none")}}
UI SETUP (Local Display):
{{#if (eq displayType "ssd1306")}}
- Use Adafruit_SSD1306 library (I2C).
{{else if (eq displayType "sh1106")}}
- Use U8g2 library (I2C).
{{else if (eq displayType "lcd1602")}}
- Use LiquidCrystal_I2C library (0x27).
{{else if (eq displayType "custom")}}
- Use appropriate libraries for: {{{customDisplayDescription}}}.
{{/if}}
{{/if}}

Requirements:
- Use standard Arduino libraries.
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