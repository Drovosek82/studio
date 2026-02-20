'use server';
/**
 * @fileOverview An AI agent for analyzing battery health and providing insights and recommendations in Ukrainian.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeBatteryHealthInputSchema = z.object({
  currentData: z.object({
    totalVoltage: z.number().describe('Current total voltage in Volts.'),
    totalCurrent: z.number().describe('Current total current in Amperes.'),
    temperature: z.number().describe('Current battery temperature in Celsius.'),
    stateOfCharge: z.number().describe('Current State of Charge in percentage (0-100).'),
    protectionStatus: z
      .string()
      .describe(
        'Current protection status (e.g., "Normal", "Overvoltage", "Overcharge", "Overtemp", "Undervoltage").'
      ),
    cellVoltages: z.array(z.number()).describe('Array of individual cell voltages in Volts.'),
  }),
  historicalData: z
    .array(
      z.object({
        timestamp: z.string().describe('Timestamp of the historical record (ISO 8601).'),
        totalVoltage: z.number().describe('Total voltage at the time of the record in Volts.'),
        totalCurrent: z.number().describe('Total current at the time of the record in Amperes.'),
        stateOfCharge: z.number().describe('State of Charge at the time of the record in percentage.'),
      })
    )
    .describe('Array of historical battery data records.'),
  batterySpecs: z.object({
    nominalVoltage: z.number().describe('Nominal voltage of the battery in Volts.'),
    maxVoltage: z.number().describe('Maximum safe voltage for the battery in Volts.'),
    minVoltage: z.number().describe('Minimum safe voltage for the battery in Volts.'),
    nominalCapacityAh: z.number().describe('Nominal capacity of the battery in Ampere-hours.'),
    cellCount: z.number().describe('Number of cells in the battery pack.'),
    isParallelConnected: z.boolean().describe('True if the battery is part of a parallel connection.'),
  }),
});
export type AnalyzeBatteryHealthInput = z.infer<typeof AnalyzeBatteryHealthInputSchema>;

const AnalyzeBatteryHealthOutputSchema = z.object({
  overallHealthSummary:
    z.string().describe('A concise, 1-2 sentence summary of the battery\'s overall health in Ukrainian.'),
  currentInsights:
    z.string().describe('Detailed analysis of the real-time data in Ukrainian.'),
  historicalAnalysis:
    z.string().describe('Analysis of trends observed in historical data in Ukrainian.'),
  recommendations: z.array(z.string()).describe('Specific, actionable recommendations in Ukrainian.'),
  alerts: z.array(z.string()).describe('Any critical alerts or urgent actions required in Ukrainian.'),
});
export type AnalyzeBatteryHealthOutput = z.infer<typeof AnalyzeBatteryHealthOutputSchema>;

export async function analyzeBatteryHealth(input: AnalyzeBatteryHealthInput): Promise<AnalyzeBatteryHealthOutput> {
  return analyzeBatteryHealthFlow(input);
}

const analyzeBatteryHealthPrompt = ai.definePrompt({
  name: 'analyzeBatteryHealthPrompt',
  input: { schema: AnalyzeBatteryHealthInputSchema },
  output: { schema: AnalyzeBatteryHealthOutputSchema },
  prompt: `Ви є експертом з аналізу здоров'я акумуляторів. Ваше завдання — проаналізувати надані дані акумулятора та надати вичерпну інформацію, підсумок його загального стану та дієві рекомендації.

ВАЖЛИВО: Ви повинні відповідати ВИКЛЮЧНО українською мовою.

Поточні дані акумулятора:
- Загальна напруга: {{{currentData.totalVoltage}}} V
- Загальний струм: {{{currentData.totalCurrent}}} A
- Температура: {{{currentData.temperature}}} °C
- Стан заряду (SoC): {{{currentData.stateOfCharge}}} %
- Статус захисту: {{{currentData.protectionStatus}}}
- Напруги комірок: {{{json currentData.cellVoltages}}}

Специфікації акумулятора:
- Номінальна напруга: {{{batterySpecs.nominalVoltage}}} V
- Максимальна напруга: {{{batterySpecs.maxVoltage}}} V
- Мінімальна напруга: {{{batterySpecs.minVoltage}}} V
- Номінальна ємність: {{{batterySpecs.nominalCapacityAh}}} Ah
- Кількість комірок: {{{batterySpecs.cellCount}}}

Історичні дані:
{{{json historicalData}}}

Надайте наступне українською мовою:
1. Загальний підсумок стану.
2. Детальний аналіз поточних показників та аномалій.
3. Історичний аналіз тенденцій (якщо дані доступні).
4. Конкретні рекомендації щодо обслуговування.
5. Критичні сповіщення (якщо є).`,
});

const analyzeBatteryHealthFlow = ai.defineFlow(
  {
    name: 'analyzeBatteryHealthFlow',
    inputSchema: AnalyzeBatteryHealthInputSchema,
    outputSchema: AnalyzeBatteryHealthOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeBatteryHealthPrompt(input);
    return output!;
  }
);
