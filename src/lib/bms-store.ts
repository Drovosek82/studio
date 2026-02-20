
"use client";

import { useState, useEffect, useCallback } from 'react';
import { BatteryData, HistoricalRecord, BatteryDevice } from './types';
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useMemoFirebase,
  updateDocumentNonBlocking
} from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';

// Початкові демо-дані
const DEMO_DEVICES: BatteryDevice[] = [
  { id: 'BMS_01', name: 'Battery Pack A', type: 'ESP32', status: 'Online' },
  { id: 'BMS_02', name: 'Battery Pack B', type: 'ESP32', status: 'Online' }
];

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

export function useBmsStore() {
  const { user } = useUser();
  const db = useFirestore();
  const [isDemoMode, setIsDemoModeState] = useState(true);
  
  // Локальний стейт
  const [demoDevices, setDemoDevices] = useState<BatteryDevice[]>(DEMO_DEVICES);
  const [demoData, setDemoData] = useState<Record<string, BatteryData>>({});
  const [demoHistory, setDemoHistory] = useState<Record<string, HistoricalRecord[]>>({});

  // Firebase стейт
  const devicesRef = useMemoFirebase(() => 
    user && db ? collection(db, 'users', user.uid, 'bmsDevices') : null, 
  [user, db]);
  const { data: fbDevices } = useCollection<any>(devicesRef);

  useEffect(() => {
    if (isDemoMode && Object.keys(demoData).length === 0) {
      const initialData: Record<string, BatteryData> = {};
      const initialHistory: Record<string, HistoricalRecord[]> = {};
      DEMO_DEVICES.forEach(dev => {
        initialData[dev.id] = createMockBatteryData(dev.id, dev.name);
        initialHistory[dev.id] = createMockHistory(dev.id);
      });
      setDemoData(initialData);
      setDemoHistory(initialHistory);
    }
  }, [isDemoMode]);

  // Симуляція демо-даних
  useEffect(() => {
    if (!isDemoMode) return;
    const interval = setInterval(() => {
      setDemoData(prev => {
        const newData = { ...prev };
        Object.keys(newData).forEach(id => {
          const item = newData[id];
          if (!item) return;
          newData[id] = {
            ...item,
            totalCurrent: item.isDischargeEnabled ? Math.max(-50, Math.min(100, item.totalCurrent + (Math.random() - 0.5) * 0.5)) : 0,
            totalVoltage: item.totalVoltage + (Math.random() - 0.5) * 0.05,
            stateOfCharge: Math.min(100, Math.max(0, item.stateOfCharge - (item.totalCurrent > 0 ? 0.001 : -0.001))),
            lastUpdated: new Date().toISOString()
          };
        });
        return newData;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isDemoMode]);

  const setDemoMode = (val: boolean) => {
    setIsDemoModeState(val);
    if (!val) {
      setDemoDevices([]);
      setDemoData({});
      setDemoHistory({});
    } else {
      setDemoDevices(DEMO_DEVICES);
    }
  };

  const addDirectBluetoothDevice = useCallback((name: string) => {
    const id = `BLE_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const newDevice: BatteryDevice = { id, name, type: 'Bluetooth', status: 'Online' };
    
    setDemoDevices(prev => [...prev, newDevice]);
    setDemoData(prev => ({ ...prev, [id]: createMockBatteryData(id, name) }));
    setDemoHistory(prev => ({ ...prev, [id]: createMockHistory(id) }));
    
    return id;
  }, []);

  const addNetworkDevice = useCallback((name: string) => {
    if (isDemoMode) {
      const id = `ESP32_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      const newDevice: BatteryDevice = { id, name, type: 'ESP32', status: 'Online' };
      setDemoDevices(prev => [...prev, newDevice]);
      setDemoData(prev => ({ ...prev, [id]: createMockBatteryData(id, name) }));
      setDemoHistory(prev => ({ ...prev, [id]: createMockHistory(id) }));
      return id;
    } else if (user && db) {
      const id = `ESP32_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      const deviceRef = doc(db, 'users', user.uid, 'bmsDevices', id);
      updateDocumentNonBlocking(deviceRef, {
        id,
        name,
        type: 'ESP32',
        status: 'Offline',
        createdAt: serverTimestamp(),
      });
      return id;
    }
  }, [isDemoMode, user, db]);

  const toggleControl = useCallback((deviceId: string, field: string) => {
    if (isDemoMode || deviceId.startsWith('BLE_')) {
      setDemoData(prev => ({
        ...prev,
        [deviceId]: { ...prev[deviceId], [field]: !prev[deviceId][field as keyof BatteryData] }
      }));
    } else if (user && db) {
      const deviceRef = doc(db, 'users', user.uid, 'bmsDevices', deviceId);
      updateDocumentNonBlocking(deviceRef, { [field]: true }); 
    }
  }, [isDemoMode, user, db]);

  const updateEeprom = useCallback((deviceId: string, key: string, value: any) => {
    if (isDemoMode || deviceId.startsWith('BLE_')) {
      setDemoData(prev => ({
        ...prev,
        [deviceId]: {
          ...prev[deviceId],
          eeprom: { ...prev[deviceId].eeprom, [key]: value }
        }
      }));
    } else if (user && db) {
      const deviceRef = doc(db, 'users', user.uid, 'bmsDevices', deviceId);
      updateDocumentNonBlocking(deviceRef, { [`eeprom.${key}`]: value });
    }
  }, [isDemoMode, user, db]);

  const setBalancingMode = useCallback((deviceId: string, mode: 'charge' | 'always' | 'static') => {
    if (isDemoMode || deviceId.startsWith('BLE_')) {
      setDemoData(prev => ({
        ...prev,
        [deviceId]: { ...prev[deviceId], balancingMode: mode }
      }));
    } else if (user && db) {
      const deviceRef = doc(db, 'users', user.uid, 'bmsDevices', deviceId);
      updateDocumentNonBlocking(deviceRef, { balancingMode: mode });
    }
  }, [isDemoMode, user, db]);

  const getAggregatedData = () => {
    const activeDevices = isDemoMode ? demoDevices : (fbDevices || []);
    const activeData = isDemoMode ? demoData : {}; 
    
    const networkData = activeDevices
      .filter((d: any) => d.type === 'ESP32')
      .map((d: any) => activeData[d.id])
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
    devices: isDemoMode ? demoDevices : (fbDevices || []),
    allData: isDemoMode ? demoData : {},
    history: isDemoMode ? demoHistory : {},
    aggregated: getAggregatedData(),
    isDemoMode,
    setDemoMode,
    toggleControl,
    updateEeprom,
    setBalancingMode,
    addNetworkDevice,
    addDirectBluetoothDevice,
    user
  };
}
