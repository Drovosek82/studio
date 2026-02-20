"use client";

import { useState, useEffect, useCallback } from 'react';
import { BatteryData, HistoricalRecord, BatteryDevice } from './types';

export function useBmsStore() {
  const [devices, setDevices] = useState<BatteryDevice[]>([
    { id: 'DEMO_01', name: 'Demo Battery Pack', type: 'Bluetooth', status: 'Online' }
  ]);
  const [activeDeviceId, setActiveDeviceId] = useState<string>('DEMO_01');
  const [realTimeData, setRealTimeData] = useState<Record<string, BatteryData>>({});
  const [history, setHistory] = useState<Record<string, HistoricalRecord[]>>({});
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Initialize demo data
  useEffect(() => {
    if (isDemoMode) {
      const initialData: BatteryData = {
        id: 'DEMO_01',
        name: 'Demo Battery Pack',
        totalVoltage: 52.4,
        totalCurrent: 2.5,
        temperature: 24.5,
        stateOfCharge: 85,
        protectionStatus: 'Нормально',
        cellVoltages: Array(14).fill(0).map(() => 3.7 + Math.random() * 0.1),
        lastUpdated: new Date().toISOString(),
      };
      setRealTimeData({ 'DEMO_01': initialData });
      
      const initialHistory: HistoricalRecord[] = Array(50).fill(0).map((_, i) => ({
        timestamp: new Date(Date.now() - (50 - i) * 60000).toISOString(),
        totalVoltage: 52.0 + Math.random() * 0.8,
        totalCurrent: 1.0 + Math.random() * 5,
        stateOfCharge: 80 + (i / 50) * 10,
      }));
      setHistory({ 'DEMO_01': initialHistory });
    }
  }, [isDemoMode]);

  // Simulate updates for demo mode
  useEffect(() => {
    if (!isDemoMode) return;

    const interval = setInterval(() => {
      setRealTimeData(prev => {
        const current = prev['DEMO_01'];
        if (!current) return prev;
        
        const newData: BatteryData = {
          ...current,
          totalVoltage: current.totalVoltage + (Math.random() - 0.5) * 0.1,
          totalCurrent: current.totalCurrent + (Math.random() - 0.5) * 0.5,
          temperature: current.temperature + (Math.random() - 0.5) * 0.2,
          stateOfCharge: Math.min(100, Math.max(0, current.stateOfCharge + (Math.random() - 0.4) * 0.1)),
          cellVoltages: current.cellVoltages.map(v => Math.max(3.0, Math.min(4.2, v + (Math.random() - 0.5) * 0.01))),
          lastUpdated: new Date().toISOString(),
        };

        return { ...prev, 'DEMO_01': newData };
      });

      setHistory(prev => {
        const devHistory = prev['DEMO_01'] || [];
        const currentData = realTimeData['DEMO_01'];
        if (!currentData) return prev;

        const newRecord: HistoricalRecord = {
          timestamp: new Date().toISOString(),
          totalVoltage: currentData.totalVoltage,
          totalCurrent: currentData.totalCurrent,
          stateOfCharge: currentData.stateOfCharge,
        };

        const updated = [...devHistory, newRecord].slice(-500);
        return { ...prev, 'DEMO_01': updated };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isDemoMode, realTimeData]);

  const addDevice = useCallback((device: BatteryDevice) => {
    setDevices(prev => [...prev, device]);
    setActiveDeviceId(device.id);
  }, []);

  return {
    devices,
    activeDeviceId,
    setActiveDeviceId,
    currentData: realTimeData[activeDeviceId],
    activeHistory: history[activeDeviceId] || [],
    isDemoMode,
    setIsDemoMode,
    addDevice,
  };
}