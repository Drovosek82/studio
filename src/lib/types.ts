export interface BatteryData {
  id: string;
  name: string;
  totalVoltage: number;
  totalCurrent: number;
  temperature: number;
  stateOfCharge: number;
  protectionStatus: string;
  cellVoltages: number[];
  balancingCells: boolean[]; // Нове: статус балансування для кожної комірки
  lastUpdated: string;
  capacityAh: number;
  cycleCount: number;
  isChargeEnabled: boolean;
  isDischargeEnabled: boolean;
  isBalancingActive: boolean;
  balancingMode: 'charge' | 'always' | 'static'; // Нове: режими JBD
  eeprom: Record<string, number | string>;
}

export interface HistoricalRecord {
  timestamp: string;
  totalVoltage: number;
  totalCurrent: number;
  stateOfCharge: number;
}

export interface BatteryDevice {
  id: string;
  name: string;
  type: 'ESP32' | 'Bluetooth';
  status: 'Online' | 'Offline' | 'Connecting';
}

export interface EepromParam {
  id: string;
  name: string;
  value: number | string;
  unit: string;
  reg: string;
}
