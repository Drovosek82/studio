
'use server';
/**
 * @fileOverview A Genkit flow for generating personalized ESP32/ESP8266 firmware (.ino file).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateEsp32FirmwareInputSchema = z.object({
  mode: z.enum(['bridge', 'display', 'hub']).default('bridge'),
  displayType: z.enum(['none', 'ssd1306', 'sh1106', 'lcd1602', 'custom']).default('none'),
  customDisplayDescription: z.string().optional(),
  ssid: z.string(),
  password: z.string(),
  deviceId: z.string(),
  bmsIdentifier: z.string().optional(),
  espModel: z.enum(['esp32c3', 'esp32s3', 'esp32', 'esp8266']).default('esp32c3'),
  serverUrl: z.string(),
});
export type GenerateEsp32FirmwareInput = z.infer<typeof GenerateEsp32FirmwareInputSchema>;

const GenerateEsp32FirmwareOutputSchema = z.object({
  firmwareContent: z.string(),
});
export type GenerateEsp32FirmwareOutput = z.infer<typeof GenerateEsp32FirmwareOutputSchema>;

const PromptInputSchema = GenerateEsp32FirmwareInputSchema.extend({
  isBridge: z.boolean(),
  isDisplay: z.boolean(),
  isHub: z.boolean(),
  hasDisplay: z.boolean(),
  isCustomDisplay: z.boolean(),
});

const generateFirmwarePrompt = ai.definePrompt({
  name: 'generateEsp32FirmwarePrompt',
  input: { schema: PromptInputSchema },
  output: { schema: GenerateEsp32FirmwareOutputSchema },
  prompt: `You are an expert at generating Arduino firmware for {{{espModel}}}.

MCU: {{{espModel}}}
MODE: {{{mode}}}
DISPLAY: {{{displayType}}}
{{#if isCustomDisplay}}
CUSTOM DISPLAY INFO: {{{customDisplayDescription}}}
{{/if}}

{{#if isBridge}}
GOAL: Act as a gateway between JBD BMS and Server.
1. Connect to Wi-Fi.
2. Connect to BMS "{{{bmsIdentifier}}}" via BLE.
3. Every 10s, read data (0x03 command) and POST JSON to "{{{serverUrl}}}".
4. Handle radio coexistence for single-antenna chips.
{{#if hasDisplay}}
5. Also display current Voltage, Current and SoC on the local display.
{{/if}}

{{/if}}
{{#if isDisplay}}
GOAL: Act as a Remote Dashboard Screen.
1. Connect to Wi-Fi.
2. Every 5s, perform an HTTP GET request to "{{{serverUrl}}}".
3. Expect a JSON response with system-wide aggregated telemetry.
4. Output the data to the display.
{{/if}}

{{#if isHub}}
GOAL: Act as a CENTRAL HUB for Multiple Devices in a closed system.
1. Create a WebServer (using WebServer.h).
2. Host a Central Dashboard at "/" that can display multiple batteries.
3. Create a POST endpoint "/api/update" that other ESP32 "Bridges" can send data to.
4. Store the data from different Bridges (identified by deviceId) in a simple array or map.
5. The Web UI should dynamically list all reporting bridges.
6. Serve a "/api/data" endpoint for the UI to fetch all device states.
7. Print the Hub's IP address clearly to Serial and Display (if available).
{{/if}}

{{#if hasDisplay}}
UI SETUP (Local Display):
- Hardware: {{{displayType}}}
{{#if isCustomDisplay}}
- Info: {{{customDisplayDescription}}}
{{/if}}
{{/if}}

Requirements:
- Use standard Arduino libraries.
- Output ONLY raw .ino code.`,
});

export async function generateEsp32Firmware(input: GenerateEsp32FirmwareInput): Promise<GenerateEsp32FirmwareOutput> {
  const { output } = await generateFirmwarePrompt({
    ...input,
    isBridge: input.mode === 'bridge',
    isDisplay: input.mode === 'display',
    isHub: input.mode === 'hub',
    hasDisplay: input.displayType !== 'none',
    isCustomDisplay: input.displayType === 'custom',
  });
  return output!;
}
