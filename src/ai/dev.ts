import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-battery-health.ts';
import '@/ai/flows/generate-esp32-firmware.ts';
import '@/ai/flows/parse-bms-protocol.ts';
