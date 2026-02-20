
export interface ParameterDefinition {
  id: string;
  label: string;
  unit?: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  options?: string[];
  category?: string;
}

export interface BatteryData {
  id: string;
  name: string;
  totalVoltage: number;
  totalCurrent: number;
  temperatures: number[];
  stateOfCharge: number;
  protectionStatus: string;
  cellVoltages: number[];
  balancingCells: boolean[];
  lastUpdated: string;
  capacityAh: number;
  cycleCount: number;
  isChargeEnabled: boolean;
  isDischargeEnabled: boolean;
  isBalancingActive: boolean;
  balancingMode: 'charge' | 'always' | 'static';
  eeprom: Record<string, any>;
  // Поля для динамічного інтерфейсу від ШІ
  modelInsight?: {
    modelName: string;
    manufacturer: string;
    protocol: string;
    supportedTelemetry: ParameterDefinition[];
    supportedEepromParams: ParameterDefinition[];
  };
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
