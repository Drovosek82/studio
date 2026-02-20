'use server';
/**
 * @fileOverview A Genkit flow for generating personalized ESP32 firmware (.ino file) 
 * configured to connect to JBD BMS via Bluetooth (BLE) and report to the cloud.
 * Now includes support for different ESP32 models to handle radio coexistence.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateEsp32FirmwareInputSchema = z.object({
  ssid: z.string().describe('The Wi-Fi network SSID.'),
  password: z.string().describe('The Wi-Fi network password.'),
  deviceId: z.string().describe('A unique identifier for the ESP32 device.'),
  bmsIdentifier: z.string().describe('The Bluetooth name or MAC address of the JBD BMS.'),
  espModel: z.enum(['esp32c3', 'esp32s3', 'esp32']).default('esp32c3').describe('The specific ESP32 model to optimize radio usage.'),
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
  prompt: `You are an expert at generating firmware for a "BMS Cloud Bridge" using {{{espModel}}}.

IMPORTANT RADIO COEXISTENCE RULES:
The target hardware is {{{espModel}}}. 
- If espModel is "esp32c3", it has a single antenna/radio. You MUST implement a "time-sharing" approach: scan/read BLE, then disconnect or pause BLE activity before sending Wi-Fi data to prevent radio crashes. Use stable intervals.
- If espModel is "esp32s3" or "esp32", handle dual-core capabilities to run BLE and Wi-Fi on different cores if possible.

Generate a complete Arduino .ino file:
1. **Wi-Fi**: Connect to SSID "{{{ssid}}}" with password "{{{password}}}".
2. **BMS BLE Connection**:
   - Scan for and connect to "{{{bmsIdentifier}}}".
   - Use Service UUID "FF00" and Characteristic UUIDs "FF01" (Notify/Read) and "FF02" (Write).
   - Protocol: Send 0xDD 0xA5 0x03 0x00 0xFF 0xFD 0x77.
3. **Data Reporting**:
   - Every 10 seconds, send an HTTP POST to "{{{serverUrl}}}".
   - JSON Payload includes deviceId: "{{{deviceId}}}", voltage, current, soc, temperatures, cellVoltages, and protectionStatus.
4. **Resilience**: Auto-reconnect Wi-Fi and BLE.

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
