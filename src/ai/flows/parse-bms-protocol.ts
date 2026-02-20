'use server';
/**
 * @fileOverview AI agent for parsing raw JBD/Xiaoxiang BMS binary packets.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ParseBmsProtocolInputSchema = z.object({
  hexString: z.string().describe('The raw hexadecimal string from the BMS (e.g., DD03001B0E...)'),
  commandType: z.enum(['basic_info', 'cell_voltages', 'unknown']).default('unknown'),
});
export type ParseBmsProtocolInput = z.infer<typeof ParseBmsProtocolInputSchema>;

const ParseBmsProtocolOutputSchema = z.object({
  parsedData: z.record(z.any()).describe('The decoded data fields from the packet.'),
  interpretation: z.string().describe('Human-readable explanation of what this packet contains in Ukrainian.'),
  isValid: z.boolean().describe('Whether the packet format/checksum looks correct.'),
  detectedCommand: z.string().describe('The command byte/type identified by AI.'),
});
export type ParseBmsProtocolOutput = z.infer<typeof ParseBmsProtocolOutputSchema>;

export async function parseBmsProtocol(input: ParseBmsProtocolInput): Promise<ParseBmsProtocolOutput> {
  return parseBmsProtocolFlow(input);
}

const parseBmsProtocolPrompt = ai.definePrompt({
  name: 'parseBmsProtocolPrompt',
  input: { schema: ParseBmsProtocolInputSchema },
  output: { schema: ParseBmsProtocolOutputSchema },
  prompt: `Ви є експертом з бінарних протоколів BMS (зокрема JBD/Xiaoxiang/LithiumNext).
Ваше завдання — розпізнати та декодувати шістнадцятковий рядок (Hex), який прийшов від контролера.

Вхідний пакет: {{{hexString}}}
Тип (якщо вказано): {{{commandType}}}

Логіка JBD Protocol (для довідки):
- Початок: 0xDD
- Команда: 0x03 (Основна інфо) або 0x04 (Напруги комірок)
- Статус: 0x00 (Ок)
- Довжина: N байт
- Дані: ...
- Чексума: 2 байти
- Кінець: 0x77

При парсингу 0x03 (Basic Info):
- Байти 4-5: Напруга (Unit: 10mV)
- Байти 6-7: Струм (Unit: 10mA, зі знаком)
- Байт 21: SOC (%)
- Байт 23: Кількість NTC датчиків
- Байти 24+: Температури (0.1K, offset 273.1)

Надайте результат українською мовою. Поясніть, що саме ви знайшли в пакеті.`,
});

const parseBmsProtocolFlow = ai.defineFlow(
  {
    name: 'parseBmsProtocolFlow',
    inputSchema: ParseBmsProtocolInputSchema,
    outputSchema: ParseBmsProtocolOutputSchema,
  },
  async (input) => {
    const { output } = await parseBmsProtocolPrompt(input);
    return output!;
  }
);
