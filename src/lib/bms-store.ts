"use client";

import { useState, useEffect, useCallback } from 'react';
import { BatteryData, HistoricalRecord, BatteryDevice } from './types';

export function useBmsStore() {
  const [devices, setDevices] = useState<BatteryDevice[]>([
    { id: 'BMS_01', name: 'Battery Pack A', type: 'ESP32', status: 'Online' },
    { id: 'BMS_02', name: 'Battery Pack B', type: 'ESP32', status: 'Online' }
  ]);
  const [activeDeviceId, setActiveDeviceId] = useState<string>('BMS_01');
  const [realTimeData, setRealTimeData] = useState<Record<string, BatteryData>>({});
  const [history, setHistory] = useState<Record<string, HistoricalRecord[]>>({});
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Initialize demo data for multiple devices
  useEffect(() => {
    if (isDemoMode) {
      const initialData: Record<string, BatteryData> = {};
      const initialHistory: Record<string, HistoricalRecord[]> = {};

      devices.forEach(dev => {
        initialData[dev.id] = {
          id: dev.id,
          name: dev.name,
          totalVoltage: 52.4 + (Math.random() - 0.5) * 0.2,
          totalCurrent: 2.0 + Math.random() * 5,
          temperature: 24.5 + Math.random(),
          stateOfCharge: 80 + Math.random() * 15,
          protectionStatus: 'Нормально',
          cellVoltages: Array(14).fill(0).map(() => 3.7 + Math.random() * 0.1),
          lastUpdated: new Date().toISOString(),
          capacityAh: 100,
        };

        initialHistory[dev.id] = Array(50).fill(0).map((_, i) => ({
          timestamp: new Date(Date.now() - (50 - i) * 60000).toISOString(),
          totalVoltage: 52.0 + Math.random() * 0.8,
          totalCurrent: 1.0 + Math.random() * 5,
          stateOfCharge: 80 + (i / 50) * 10,
        }));
      });

      setRealTimeData(initialData);
      setHistory(initialHistory);
    }
  }, [isDemoMode, devices]);

  // Aggregated data calculation
  const getAggregatedData = () => {
    const activeData = Object.values(realTimeData);
    if (activeData.length === 0) return null;

    return {
      totalVoltage: activeData.reduce((acc, curr) => acc + curr.totalVoltage, 0) / activeData.length, // Average for parallel
      totalCurrent: activeData.reduce((acc, curr) => acc + curr.totalCurrent, 0), // Sum for parallel
      avgSoC: activeData.reduce((acc, curr) => acc + curr.stateOfCharge, 0) / activeData.length,
      deviceCount: activeData.length,
      totalPower: activeData.reduce((acc, curr) => acc + (curr.totalVoltage * curr.totalCurrent), 0)
    };
  };

  return {
    devices,
    activeDeviceId,
    setActiveDeviceId,
    currentData: realTimeData[activeDeviceId],
    allData: realTimeData,
    activeHistory: history[activeDeviceId] || [],
    aggregated: getAggregatedData(),
    isDemoMode,
    setIsDemoMode,
  };
}