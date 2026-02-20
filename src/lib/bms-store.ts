"use client";

import { useState, useEffect, useCallback } from 'react';
import { BatteryData, HistoricalRecord, BatteryDevice } from './types';

let globalDevices: BatteryDevice[] = [
  { id: 'BMS_01', name: 'Battery Pack A', type: 'ESP32', status: 'Online' },
  { id: 'BMS_02', name: 'Battery Pack B', type: 'ESP32', status: 'Online' }
];

let globalRealTimeData: Record<string, BatteryData> = {};
let globalHistory: Record<string, HistoricalRecord[]> = {};

export function useBmsStore() {
  const [devices, setDevices] = useState<BatteryDevice[]>(globalDevices);
  const [activeDeviceId, setActiveDeviceId] = useState<string>('BMS_01');
  const [realTimeData, setRealTimeData] = useState<Record<string, BatteryData>>(globalRealTimeData);
  const [history, setHistory] = useState<Record<string, HistoricalRecord[]>>(globalHistory);
  const [isDemoMode, setIsDemoMode] = useState(true);

  useEffect(() => {
    if (isDemoMode && Object.keys(globalRealTimeData).length === 0) {
      const initialData: Record<string, BatteryData> = {};
      const initialHistory: Record<string, HistoricalRecord[]> = {};

      globalDevices.forEach(dev => {
        initialData[dev.id] = {
          id: dev.id,
          name: dev.name,
          totalVoltage: 52.4,
          totalCurrent: 2.5,
          temperatures: [25.0, 26.2, 24.8], // 3 датчики за замовчуванням
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
            design_cap: 10000,
            cycle_cap: 10000,
            cap_100: 4150,
            cap_80: 4000,
            cap_60: 3850,
            cap_40: 3750,
            cap_20: 3600,
            cap_0: 3000,
            dsg_rate: 10,
            covp: 4250,
            covp_rel: 4150,
            cuvp: 2700,
            cuvp_rel: 3000,
            povp: 5880,
            puvp: 4200,
            bal_start: 3400,
            bal_window: 50,
            shunt_res: 100,
            cell_cnt: 14,
          }
        };

        initialHistory[dev.id] = Array(50).fill(0).map((_, i) => ({
          timestamp: new Date(Date.now() - (50 - i) * 60000).toISOString(),
          totalVoltage: 52.0 + Math.random() * 0.8,
          totalCurrent: 1.0 + Math.random() * 5,
          stateOfCharge: 80 + (i / 50) * 5,
        }));
      });

      globalRealTimeData = initialData;
      globalHistory = initialHistory;
      setRealTimeData({ ...initialData });
      setHistory({ ...initialHistory });
    }
  }, [isDemoMode]);

  useEffect(() => {
    if (!isDemoMode) return;

    const interval = setInterval(() => {
      setRealTimeData(prev => {
        const newData = { ...prev };
        Object.keys(newData).forEach(id => {
          const item = newData[id];
          const currentVariation = (Math.random() - 0.5) * 0.5;
          const voltageVariation = (Math.random() - 0.5) * 0.05;
          
          let balancingCells = Array(item.cellVoltages.length).fill(false);
          if (item.isBalancingActive) {
            const maxV = Math.max(...item.cellVoltages);
            balancingCells = item.cellVoltages.map(v => v > maxV - 0.005);
          }

          // Симуляція температур
          const newTemps = item.temperatures.map(t => t + (Math.random() - 0.5) * 0.2);

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
        return newData;
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
    const activeData = Object.values(realTimeData);
    if (activeData.length === 0) return null;
    return {
      totalVoltage: activeData.reduce((acc, curr) => acc + curr.totalVoltage, 0) / activeData.length,
      totalCurrent: activeData.reduce((acc, curr) => acc + curr.totalCurrent, 0),
      avgSoC: activeData.reduce((acc, curr) => acc + curr.stateOfCharge, 0) / activeData.length,
      deviceCount: activeData.length,
      totalPower: activeData.reduce((acc, curr) => acc + (curr.totalVoltage * curr.totalCurrent), 0)
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
    updateEeprom,
    toggleControl,
    setBalancingMode
  };
}
