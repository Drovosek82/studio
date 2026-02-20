
'use server';
/**
 * @fileOverview AI agent for identifying BMS models based on names and data samples.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const IdentifyBmsInputSchema = z.object({
  deviceName: z.string().describe('The name of the device reported by Bluetooth or ESP32.'),
  dataSample: z.string().optional().describe('A hex sample from the device if available.'),
});
export type IdentifyBmsInput = z.infer<typeof IdentifyBmsInputSchema>;

const IdentifyBmsOutputSchema = z.object({
  modelName: z.string().describe('The identified model name.'),
  manufacturer: z.string().describe('Identified manufacturer.'),
  protocol: z.string().describe('The protocol used (e.g., JBD, Daly, Victron).'),
  capabilities: z.array(z.string()).describe('List of features this model supports.'),
  technicalNotes: z.string().describe('AI notes on how to best communicate with this model in Ukrainian.'),
  confidence: z.number().describe('AI confidence level (0-1).'),
});
export type IdentifyBmsOutput = z.infer<typeof IdentifyBmsOutputSchema>;

export async function identifyBmsModel(input: IdentifyBmsInput): Promise<IdentifyBmsOutput> {
  return identifyBmsFlow(input);
}

const identifyPrompt = ai.definePrompt({
  name: 'identifyBmsModelPrompt',
  input: { schema: IdentifyBmsInputSchema },
  output: { schema: IdentifyBmsOutputSchema },
  prompt: `Ви — експерт з ідентифікації заліза для систем зберігання енергії.
На основі імені пристрою та (опціонально) шістнадцяткового пакету даних, ви повинні визначити модель BMS.

Ім'я пристрою: {{{deviceName}}}
Зразок даних (Hex): {{{dataSample}}}

Проаналізуйте патерни імен (напр. "JBD-SP", "BMS-...", "Xiaoxiang") та структуру даних.
Надайте відповідь українською мовою. Опишіть технічні особливості цієї моделі.`,
});

const identifyBmsFlow = ai.defineFlow(
  {
    name: 'identifyBmsFlow',
    inputSchema: IdentifyBmsInputSchema,
    outputSchema: IdentifyBmsOutputSchema,
  },
  async (input) => {
    const { output } = await identifyPrompt(input);
    return output!;
  }
);
