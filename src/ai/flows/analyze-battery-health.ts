'use server';
/**
 * @fileOverview An AI agent for analyzing battery health and providing insights and recommendations.
 *
 * - analyzeBatteryHealth - A function that handles the battery health analysis process.
 * - AnalyzeBatteryHealthInput - The input type for the analyzeBatteryHealth function.
 * - AnalyzeBatteryHealthOutput - The return type for the analyzeBatteryHealth function.
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
    z.string().describe('A concise, 1-2 sentence summary of the battery\'s overall health.'),
  currentInsights:
    z.string().describe('Detailed analysis of the real-time data, explaining any anomalies, potential issues with voltage, current, temperature, SoC, or cell balance.'),
  historicalAnalysis:
    z.string().describe('Analysis of trends observed in historical data, looking for degradation, inconsistent charging/discharging patterns, or unusual fluctuations.'),
  recommendations: z.array(z.string()).describe('Specific, actionable recommendations to maintain or improve battery health, optimize performance, or address identified issues.'),
  alerts: z.array(z.string()).describe('Any critical alerts or urgent actions required.'),
});
export type AnalyzeBatteryHealthOutput = z.infer<typeof AnalyzeBatteryHealthOutputSchema>;

export async function analyzeBatteryHealth(input: AnalyzeBatteryHealthInput): Promise<AnalyzeBatteryHealthOutput> {
  return analyzeBatteryHealthFlow(input);
}

const analyzeBatteryHealthPrompt = ai.definePrompt({
  name: 'analyzeBatteryHealthPrompt',
  input: { schema: AnalyzeBatteryHealthInputSchema },
  output: { schema: AnalyzeBatteryHealthOutputSchema },
  prompt: `You are an expert battery health analyst. Your task is to analyze the provided battery data (real-time and historical) and provide comprehensive insights, a summary of its overall health, and actionable recommendations.

Here is the current battery data:
- Total Voltage: {{{currentData.totalVoltage}}} V
- Total Current: {{{currentData.totalCurrent}}} A
- Temperature: {{{currentData.temperature}}} °C
- State of Charge (SoC): {{{currentData.stateOfCharge}}} %
- Protection Status: {{{currentData.protectionStatus}}}
- Cell Voltages: {{{json currentData.cellVoltages}}}

Here are the battery specifications:
- Nominal Voltage: {{{batterySpecs.nominalVoltage}}} V
- Maximum Voltage: {{{batterySpecs.maxVoltage}}} V
- Minimum Voltage: {{{batterySpecs.minVoltage}}} V
- Nominal Capacity: {{{batterySpecs.nominalCapacityAh}}} Ah
- Cell Count: {{{batterySpecs.cellCount}}}
- Parallel Connection: {{{batterySpecs.isParallelConnected}}}

Here is the historical data (up to 500 recent records). If the array is empty, state that no historical data is available:
{{{json historicalData}}}

Based on this data, provide the following:
1.  **Overall Health Summary**: A concise, 1-2 sentence summary of the battery's current health status.
2.  **Current Insights**: Detailed analysis of the real-time data, explaining any anomalies, potential issues with voltage, current, temperature, SoC, or cell balance. Compare current values to nominal/min/max specs.
3.  **Historical Analysis**: Discuss trends observed in the historical data. Look for degradation, inconsistent charging/discharging patterns, or unusual fluctuations over time. If no historical data is available, state this clearly.
4.  **Recommendations**: Provide clear, actionable advice to maintain or improve battery health, optimize performance, or address identified issues. Provide at least one recommendation.
5.  **Alerts**: List any critical warnings or urgent actions required. If no alerts are present, provide an empty array.

Your output must be a JSON object matching the following schema, including all specified fields. Pay close attention to data types and array formats. If any field's content is not applicable, provide an empty string or empty array as appropriate.`,
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
