'use server';
/**
 * @fileOverview A Genkit flow for generating personalized ESP32 firmware (.ino file) 
 * configured to connect to JBD BMS via Bluetooth (BLE) and report to the cloud.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateEsp32FirmwareInputSchema = z.object({
  ssid: z.string().describe('The Wi-Fi network SSID.'),
  password: z.string().describe('The Wi-Fi network password.'),
  deviceId: z.string().describe('A unique identifier for the ESP32 device.'),
  bmsIdentifier: z.string().describe('The Bluetooth name or MAC address of the JBD BMS (e.g., "JBD-SP15S001").'),
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
  prompt: `You are an expert at generating ESP32-C3 firmware for a "BMS Cloud Bridge".
The device must connect to a JBD BMS via Bluetooth Low Energy (BLE) and relay data to a web server via Wi-Fi.

Generate a complete Arduino .ino file with these features:
1. **Wi-Fi**: Connect to SSID "{{{ssid}}}" with password "{{{password}}}".
2. **BMS BLE Connection**:
   - Scan for and connect to a BLE device named or with MAC "{{{bmsIdentifier}}}".
   - Use Service UUID "FF00" and Characteristic UUIDs "FF01" (Notify/Read) and "FF02" (Write).
   - Implement the JBD Master protocol: Send command 0xDD 0xA5 0x03 0x00 0xFF 0xFD 0x77 to request basic info.
3. **Data Reporting**:
   - Every 5-10 seconds, parse the BMS response.
   - Send an HTTP POST request to "{{{serverUrl}}}".
   - JSON Payload:
     {
       "deviceId": "{{{deviceId}}}",
       "name": "ESP32 Bridge ({{{bmsIdentifier}}})",
       "totalVoltage": 52.4,
       "totalCurrent": 2.5,
       "stateOfCharge": 85,
       "temperatures": [25.5, 26.0],
       "cellVoltages": [3.74, 3.75, ...],
       "protectionStatus": "Normal"
     }
4. **Auto-Reconnect**: 
   - If Wi-Fi is lost, reconnect.
   - If BLE connection drops, start scanning again.
5. **Debug**: Print status to Serial (USB) at 115200 baud.

Output ONLY the raw .ino file content in the "firmwareContent" field.`,
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
