'use server';
/**
 * @fileOverview A Genkit flow for generating personalized ESP32 firmware (.ino file) 
 * based on the actual JBD BMS serial protocol with cloud reporting capabilities.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateEsp32FirmwareInputSchema = z.object({
  ssid: z.string().describe('The Wi-Fi network SSID.'),
  password: z.string().describe('The Wi-Fi network password.'),
  deviceId: z.string().describe('A unique identifier for the ESP32 device.'),
  serverUrl: z.string().optional().default('https://your-app.com/api/bms/update').describe('The API endpoint to send data to.'),
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
  prompt: `You are an expert at generating ESP32-C3 firmware (.ino files) for JBD BMS monitoring.
The goal is to create a "Cloud Bridge" that reads BMS data and sends it to a central server.

Generate a complete Arduino .ino file with these features:
1. **Wi-Fi Connection**: Connect to SSID "{{{ssid}}}" using password "{{{password}}}".
2. **JBD BMS Protocol**:
   - UART: 9600 baud, 8N1.
   - Request Reg 0x03 (Basic Info) and Reg 0x04 (Cell Voltages).
   - Parse: Total Voltage, Current, SoC, Temperatures, Protection Status, and individual cell voltages.
3. **Data Reporting**:
   - Every 5 seconds, format the parsed data as a JSON object.
   - Send an HTTP POST request to "{{{serverUrl}}}".
   - Include "deviceId": "{{{deviceId}}}" in the JSON payload.
4. **Hardware Specifics**:
   - Use ESP32-C3 Super Mini pinout. 
   - Use Hardware Serial (Serial1) for BMS on pins 20 (RX) and 21 (TX) if possible, or SoftwareSerial if needed.
5. **Error Handling**:
   - Reconnect Wi-Fi if lost.
   - Retry BMS request if CRC fails.
   - Print debug info to Serial (USB).

The JSON payload sent to the server should look like this:
{
  "deviceId": "{{{deviceId}}}",
  "totalVoltage": 52.45,
  "totalCurrent": 2.5,
  "soc": 85,
  "temps": [25.1, 26.0],
  "cells": [3.74, 3.75, ...],
  "protection": "Normal"
}

Output only the raw .ino file content inside the "firmwareContent" field.`,
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
