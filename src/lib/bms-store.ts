
"use client";

import { useState, useEffect, useCallback } from 'react';
import { BatteryData, HistoricalRecord, BatteryDevice } from './types';

// Початкові демо-дані
const DEMO_DEVICES: BatteryDevice[] = [
  { id: 'BMS_01', name: 'Battery Pack A', type: 'ESP32', status: 'Online' },
  { id: 'BMS_02', name: 'Battery Pack B', type: 'ESP32', status: 'Online' }
];

// Допоміжні функції для створення мок-даних
const createMockBatteryData = (id: string, name: string): BatteryData => ({
  id,
  name,
  totalVoltage: 52.4,
  totalCurrent: 2.5,
  temperatures: [25.0, 26.2, 24.8],
  stateOfCharge: 85,
  protectionStatus: 'Нормально',
  cellVoltages: Array(14).fill(0).map(() => 3.742 + (Math.random() - 0.5) * 0.01),
  balancingCells: Array(14).fill(false),
  lastUpdated: new Date().toISOString(),
  capacityAh: 100,
  cycleCount: 42,
  isChargeEnabled: true,
  isDischargeEnabled: true,
  isBalancingActive: false,
  balancingMode: 'charge',
  eeprom: {
    design_cap: 100000,
    ntc_cnt: 3,
    cell_cnt: 14,
    bal_start: 3400,
    bal_window: 50,
    shunt_res: 100,
    covp: 4200,
    covp_rel: 4100,
    cuvp: 3000,
    cuvp_rel: 3200,
    chgoc: 5000,
    dsgoc: 10000,
    cap_100: 4150,
    cap_80: 4000,
    cap_60: 3850,
    cap_40: 3750,
    cap_20: 3650,
    cap_0: 3000
  }
});

const createMockHistory = (id: string): HistoricalRecord[] => 
  Array(50).fill(0).map((_, i) => ({
    timestamp: new Date(Date.now() - (50 - i) * 60000).toISOString(),
    totalVoltage: 52.0 + Math.random() * 0.8,
    totalCurrent: 1.0 + Math.random() * 5,
    stateOfCharge: 80 + (i / 50) * 5,
  }));

// Глобальні змінні
let globalRealTimeData: Record<string, BatteryData> = {};
let globalHistory: Record<string, HistoricalRecord[]> = {};
let globalIsDemoMode = true;
let globalDevices: BatteryDevice[] = [];

// Ініціалізація
if (globalIsDemoMode) {
  DEMO_DEVICES.forEach(dev => {
    globalDevices.push(dev);
    globalRealTimeData[dev.id] = createMockBatteryData(dev.id, dev.name);
    globalHistory[dev.id] = createMockHistory(dev.id);
  });
}

export function useBmsStore() {
  const [devices, setDevices] = useState<BatteryDevice[]>(globalDevices);
  const [activeDeviceId, setActiveDeviceId] = useState<string>('BMS_01');
  const [realTimeData, setRealTimeData] = useState<Record<string, BatteryData>>(globalRealTimeData);
  const [history, setHistory] = useState<Record<string, HistoricalRecord[]>>(globalHistory);
  const [isDemoMode, setIsDemoModeState] = useState(globalIsDemoMode);

  const setDemoMode = (val: boolean) => {
    globalIsDemoMode = val;
    setIsDemoModeState(val);
    
    if (!val) {
      globalDevices = [];
      globalRealTimeData = {};
      globalHistory = {};
      setDevices([]);
      setRealTimeData({});
      setHistory({});
    } else {
      globalDevices = [];
      const initialData: Record<string, BatteryData> = {};
      const initialHistory: Record<string, HistoricalRecord[]> = {};

      DEMO_DEVICES.forEach(dev => {
        globalDevices.push(dev);
        initialData[dev.id] = createMockBatteryData(dev.id, dev.name);
        initialHistory[dev.id] = createMockHistory(dev.id);
      });

      globalRealTimeData = initialData;
      globalHistory = initialHistory;
      setDevices([...globalDevices]);
      setRealTimeData({ ...initialData });
      setHistory({ ...initialHistory });
    }
  };

  const addNetworkDevice = useCallback((name: string) => {
    const id = `ESP32_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    // Якщо демо-режим вимкнено, статус Offline і немає даних
    const status = globalIsDemoMode ? 'Online' : 'Offline';
    const newDevice: BatteryDevice = { id, name, type: 'ESP32', status };
    
    globalDevices = [...globalDevices, newDevice];
    
    if (globalIsDemoMode) {
      globalRealTimeData[id] = createMockBatteryData(id, name);
      globalHistory[id] = createMockHistory(id);
    }
    
    setDevices([...globalDevices]);
    setRealTimeData({ ...globalRealTimeData });
    setHistory({ ...globalHistory });
    return id;
  }, []);

  const addDirectBluetoothDevice = useCallback((name: string) => {
    globalDevices = globalDevices.filter(d => d.type !== 'Bluetooth');
    
    const id = `BLE_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const newDevice: BatteryDevice = { id, name, type: 'Bluetooth', status: 'Online' };
    
    globalDevices = [newDevice, ...globalDevices];
    globalRealTimeData[id] = createMockBatteryData(id, name);
    globalHistory[id] = createMockHistory(id);
    
    setDevices([...globalDevices]);
    setRealTimeData({ ...globalRealTimeData });
    setHistory({ ...globalHistory });
    return id;
  }, []);

  useEffect(() => {
    setDevices(globalDevices);
    setRealTimeData(globalRealTimeData);
    setHistory(globalHistory);
    setIsDemoModeState(globalIsDemoMode);
  }, []);

  useEffect(() => {
    if (!isDemoMode) return;

    const interval = setInterval(() => {
      setRealTimeData(prev => {
        const newData = { ...prev };
        Object.keys(newData).forEach(id => {
          const item = newData[id];
          if (!item) return;

          const currentVariation = (Math.random() - 0.5) * 0.5;
          const voltageVariation = (Math.random() - 0.5) * 0.05;
          
          let balancingCells = Array(item.cellVoltages.length).fill(false);
          if (item.isBalancingActive) {
            const maxV = Math.max(...item.cellVoltages);
            balancingCells = item.cellVoltages.map(v => v > maxV - 0.005);
          }

          const ntcCount = Number(item.eeprom.ntc_cnt) || 3;
          let newTemps = Array(ntcCount).fill(25.0).map((t, idx) => 
            (item.temperatures[idx] || 25.0) + (Math.random() - 0.5) * 0.2
          );

          newData[id] = {
            ...item,
            totalCurrent: item.isDischargeEnabled ? Math.max(-50, Math.min(100, item.totalCurrent + currentVariation)) : 0,
            totalVoltage: item.totalVoltage + voltageVariation,
            stateOfCharge: Math.min(100, Math.max(0, item.stateOfCharge - (item.totalCurrent > 0 ? 0.001 : -0.001))),
            balancingCells,
            temperatures: newTemps,
            lastUpdated: new Date().toISOString()
          };
          
          globalRealTimeData[id] = newData[id];
        });
        return { ...newData };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  const updateEeprom = useCallback((deviceId: string, key: string, value: number | string) => {
    setRealTimeData(prev => {
      if (!prev[deviceId]) return prev;
      const updated = {
        ...prev[deviceId],
        eeprom: { ...prev[deviceId].eeprom, [key]: value }
      };
      globalRealTimeData[deviceId] = updated;
      return { ...prev, [deviceId]: updated };
    });
  }, []);

  const toggleControl = useCallback((deviceId: string, field: 'isChargeEnabled' | 'isDischargeEnabled' | 'isBalancingActive') => {
    setRealTimeData(prev => {
      if (!prev[deviceId]) return prev;
      const updated = { ...prev[deviceId], [field]: !prev[deviceId][field] };
      globalRealTimeData[deviceId] = updated;
      return { ...prev, [deviceId]: updated };
    });
  }, []);

  const setBalancingMode = useCallback((deviceId: string, mode: 'charge' | 'always' | 'static') => {
    setRealTimeData(prev => {
      if (!prev[deviceId]) return prev;
      const updated = { ...prev[deviceId], balancingMode: mode };
      globalRealTimeData[deviceId] = updated;
      return { ...prev, [deviceId]: updated };
    });
  }, []);

  const getAggregatedData = () => {
    const networkData = devices
      .filter(d => d.type === 'ESP32')
      .map(d => realTimeData[d.id])
      .filter(Boolean);

    if (networkData.length === 0) return null;
    
    return {
      totalVoltage: networkData.reduce((acc, curr) => acc + curr.totalVoltage, 0) / networkData.length,
      totalCurrent: networkData.reduce((acc, curr) => acc + curr.totalCurrent, 0),
      avgSoC: networkData.reduce((acc, curr) => acc + curr.stateOfCharge, 0) / networkData.length,
      deviceCount: networkData.length,
      totalPower: networkData.reduce((acc, curr) => acc + (curr.totalVoltage * curr.totalCurrent), 0)
    };
  };

  return {
    devices,
    activeDeviceId,
    setActiveDeviceId,
    allData: realTimeData,
    history,
    aggregated: getAggregatedData(),
    isDemoMode,
    setDemoMode,
    updateEeprom,
    toggleControl,
    setBalancingMode,
    addNetworkDevice,
    addDirectBluetoothDevice
  };
}
