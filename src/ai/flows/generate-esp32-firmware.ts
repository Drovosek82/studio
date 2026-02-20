'use server';
/**
 * @fileOverview A Genkit flow for generating personalized ESP32 firmware (.ino file).
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
  prompt: `You are an expert at generating ESP32 firmware (.ino files) for JBD BMS monitoring.
Generate a complete Arduino-compatible .ino file for an ESP32-C3 Super Mini.

The firmware should:
1.  Connect to a Wi-Fi network using the provided SSID and password.
2.  Define a DEVICE_ID constant using the provided device ID.
3.  Initialize Serial communication at 115200 baud.
4.  Include necessary libraries for Wi-Fi (WiFi.h) and simulate a 'JBD_BMS.h' library for Bluetooth communication with the BMS. Assume 'JBD_BMS.h' provides a class 'JBD_BMS' with methods like 'begin(String deviceName)', 'isConnected()', and 'readData()' which returns an object with 'voltage', 'current', 'temperature', and 'soc'.
5.  In the 'setup()' function:
    a. Initialize Serial.
    b. Start Wi-Fi connection. Print connection status to Serial.
    c. If Wi-Fi connects, print the ESP32's IP address.
    d. Initialize the 'JBD_BMS' object and attempt to connect to a device named "JBD-BMS" via Bluetooth. Print connection status to Serial.
6.  In the 'loop()' function:
    a. Create a static variable for 'lastDataReadTime' and update it every 2 seconds to control the print frequency.
    b. If the 'JBD_BMS' object is connected, read data using 'bms.readData()'.
    c. Print the DEVICE_ID and the received BMS data (voltage, current, temperature, soc) to the Serial monitor.
    d. If the 'JBD_BMS' is not connected, print an error message to Serial and attempt to reconnect every 10 seconds.

Here are the user-provided details:
Wi-Fi SSID: {{{ssid}}}
Wi-Fi Password: {{{password}}}
Device ID: {{{deviceId}}}

Output only the raw .ino file content, enclosed in a JSON object with the key "firmwareContent". Do not include any additional text or explanations outside of the JSON object.`,
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
