
'use server';
/**
 * @fileOverview AI agent for identifying BMS models and generating dynamic UI/EEPROM schemas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ParameterDefinitionSchema = z.object({
  id: z.string(),
  label: z.string(),
  unit: z.string().optional(),
  type: z.enum(['number', 'string', 'boolean', 'select']),
  options: z.array(z.string()).optional(),
  category: z.string().optional(),
});

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
  // Нові поля для динамічного інтерфейсу
  supportedTelemetry: z.array(ParameterDefinitionSchema).describe('List of telemetry fields this BMS provides.'),
  supportedEepromParams: z.array(ParameterDefinitionSchema).describe('List of EEPROM registers/parameters available for configuration.'),
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

ВАЖЛИВО:
1. Проаналізуйте патерни імен (напр. "JBD-SP", "Daly-...", "ANT-BMS").
2. Визначте, які телеметричні дані зазвичай надає ця модель (напруга, струм, температури, опір тощо).
3. Сформуйте список параметрів EEPROM, які зазвичай доступні для налаштування в цій моделі (ліміти напруги, струму, затримки).
4. Якщо модель невідома, запропонуйте стандартний набір для JBD-сумісних пристроїв.

Надайте відповідь українською мовою.`,
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
