'use server';
/**
 * @fileOverview A Genkit flow for generating personalized ESP32 firmware (.ino file).
 * Supports two modes: 
 * 1. Bridge: BMS -> ESP32 -> Cloud (via BLE & Wi-Fi)
 * 2. Display: Cloud -> ESP32 -> OLED/LCD Screen (via Wi-Fi)
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateEsp32FirmwareInputSchema = z.object({
  mode: z.enum(['bridge', 'display']).default('bridge').describe('Operation mode of the ESP32 device.'),
  displayType: z.enum(['none', 'ssd1306', 'sh1106', 'lcd1602']).default('none').describe('Type of display connected to the ESP32.'),
  ssid: z.string().describe('The Wi-Fi network SSID.'),
  password: z.string().describe('The Wi-Fi network password.'),
  deviceId: z.string().describe('A unique identifier for the ESP32 device.'),
  bmsIdentifier: z.string().optional().describe('The Bluetooth name of the JBD BMS (required for bridge mode).'),
  espModel: z.enum(['esp32c3', 'esp32s3', 'esp32']).default('esp32c3').describe('The specific ESP32 model.'),
  serverUrl: z.string().describe('The API endpoint for data sync.'),
});
export type GenerateEsp32FirmwareInput = z.infer<typeof GenerateEsp32FirmwareInputSchema>;

const GenerateEsp32FirmwareOutputSchema = z.object({
  firmwareContent: z.string().describe('The generated ESP32 firmware content as an .ino file.'),
});
export type GenerateEsp32FirmwareOutput = z.infer<typeof GenerateEsp32FirmwareOutputSchema>;

export async function generateEsp32Firmware(input: GenerateEsp32FirmwareInput): Promise<GenerateEsp32FirmwareOutput> {
  return generateEsp32FirmwareFlow(input);
}

const generateFirmwarePrompt = ai.definePrompt({
  name: 'generateEsp32FirmwarePrompt',
  input: { schema: GenerateEsp32FirmwareInputSchema },
  output: { schema: GenerateEsp32FirmwareOutputSchema },
  prompt: `You are an expert at generating Arduino firmware for ESP32 (model: {{{espModel}}}).

MODE: {{{mode}}}
DISPLAY: {{{displayType}}}

{{#if (eq mode "bridge")}}
GOAL: Act as a gateway between JBD BMS and Cloud.
1. Connect to Wi-Fi "{{{ssid}}}" / "{{{password}}}".
2. Connect to BMS "{{{bmsIdentifier}}}" via BLE.
3. Every 10s, read data (0x03 command) and POST JSON to "{{{serverUrl}}}".
4. Handle radio coexistence for {{{espModel}}}.
{{else}}
GOAL: Act as a Remote Dashboard Screen.
1. Connect to Wi-Fi "{{{ssid}}}" / "{{{password}}}".
2. Every 5s, perform an HTTP GET request to "{{{serverUrl}}}".
3. Expect a JSON response with: totalVoltage, totalCurrent, totalPower, and avgSoC.
4. Output the data to the Serial monitor.
{{#if (eq displayType "ssd1306")}}
5. Use Adafruit_SSD1306 library for 128x64 I2C OLED display. Use default SDA/SCL.
{{/if}}
{{#if (eq displayType "sh1106")}}
5. Use U8g2 library (U8G2_SH1106_128X64_NONAME_F_HW_I2C) for 1.3" OLED.
{{/if}}
{{#if (eq displayType "lcd1602")}}
5. Use LiquidCrystal_I2C library for 16x2 character LCD at address 0x27.
{{/if}}
{{/if}}

Requirements:
- Use standard Arduino libraries (WiFi, HTTPClient, ArduinoJson).
- Include robust reconnect logic.
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
