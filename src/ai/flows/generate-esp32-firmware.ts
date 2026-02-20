'use server';
/**
 * @fileOverview A Genkit flow for generating personalized ESP32 firmware (.ino file) 
 * based on the actual JBD BMS serial protocol.
 *
 * - generateEsp32Firmware - A function that handles the firmware generation process.
 * - GenerateEsp32FirmwareInput - The input type for the generateEsp32Firmware function.
 * - GenerateEsp32FirmwareOutput - The return type for the generateEsp32Firmware function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateEsp32FirmwareInputSchema = z.object({
  ssid: z.string().describe('The Wi-Fi network SSID.'),
  password: z.string().describe('The Wi-Fi network password.'),
  deviceId: z.string().describe('A unique identifier for the ESP32 device.'),
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
  prompt: `You are an expert at generating ESP32 firmware (.ino files) for JBD BMS monitoring using the official serial protocol.
Generate a complete Arduino-compatible .ino file for an ESP32-C3 Super Mini.

The firmware MUST implement the following JBD BMS protocol specifications:
1.  **UART Settings**: 9600 baud, 8N1.
2.  **Packet Structure**: 0xDD [CMD] 0x00 [REG] [LEN] [DATA] [CRC_H] [CRC_L] 0x77.
3.  **CRC Calculation**: CRC = 0x10000 - sum of bytes from index 1 to (len-4).
4.  **Commands**:
    - Basic Info (Reg 0x03): Request packet [0xDD, 0xA5, 0x00, 0x03, 0xFF, 0xFD, 0x77].
    - Cell Voltages (Reg 0x04): Request packet [0xDD, 0xA5, 0x00, 0x04, 0xFF, 0xFC, 0x77].
5.  **Data Parsing (Reg 0x03)**:
    - Total Voltage: (byte[4]<<8 | byte[5]) * 0.01V.
    - Current: (int16_t)(byte[6]<<8 | byte[7]) * 0.01A.
    - SoC: byte[21] (%).
    - Temp: (byte[25]<<8 | byte[26]) / 10.0 - 273.15 (°C).

The generated code should:
- Connect to Wi-Fi using SSID "{{{ssid}}}" and password "{{{password}}}".
- Use DEVICE_ID "{{{deviceId}}}".
- Use Serial for debug and Serial1 (or SoftwareSerial if hardware UART is busy) for BMS communication at 9600 baud.
- Periodically (every 2s) request 0x03 and 0x04 registers.
- Print formatted JSON or clear text to Serial for monitoring.
- Include a robust 'calculateCRC' function.
- Include error handling for timed-out responses or invalid CRC.

Output only the raw .ino file content inside the "firmwareContent" field of the JSON object.`,
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
