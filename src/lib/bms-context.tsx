
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { BatteryData, HistoricalRecord, BatteryDevice } from './types';
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useMemoFirebase,
  updateDocumentNonBlocking
} from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';

interface BmsContextType {
  devices: BatteryDevice[];
  allData: Record<string, BatteryData>;
  history: Record<string, HistoricalRecord[]>;
  aggregated: any;
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;
  toggleControl: (deviceId: string, field: string) => void;
  updateEeprom: (deviceId: string, key: string, value: any) => void;
  setBalancingMode: (deviceId: string, mode: 'charge' | 'always' | 'static') => void;
  addNetworkDevice: (name: string) => string | undefined;
  addDirectBluetoothDevice: (name: string) => string;
}

const BmsContext = createContext<BmsContextType | undefined>(undefined);

const DEMO_DEVICES: BatteryDevice[] = [
  { id: 'DEMO_01', name: 'Battery Pack A (Demo)', type: 'ESP32', status: 'Online' },
  { id: 'DEMO_02', name: 'Battery Pack B (Demo)', type: 'ESP32', status: 'Online' }
];

const createMockBatteryData = (id: string, name: string, isReal: boolean = false): BatteryData => ({
  id,
  name,
  totalVoltage: isReal ? 52.1 : 52.4, // Реальна BMS ініціалізується базовим значенням
  totalCurrent: 0,
  temperatures: isReal ? [22, 23] : [25.0, 26.2, 24.8],
  stateOfCharge: isReal ? 0 : 85,
  protectionStatus: isReal ? 'Normal' : 'Нормально',
  cellVoltages: Array(14).fill(0).map(() => isReal ? 3.721 : 3.742 + (Math.random() - 0.5) * 0.01),
  balancingCells: Array(14).fill(false),
  lastUpdated: new Date().toISOString(),
  capacityAh: 100,
  cycleCount: isReal ? 0 : 42,
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

export const BmsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const db = useFirestore();
  const [isDemoMode, setIsDemoModeState] = useState(false);
  
  const [demoDevices, setDemoDevices] = useState<BatteryDevice[]>([]);
  const [demoData, setDemoData] = useState<Record<string, BatteryData>>({});
  const [demoHistory, setDemoHistory] = useState<Record<string, HistoricalRecord[]>>({});
  
  const [directDevices, setDirectDevices] = useState<BatteryDevice[]>([]);
  const [directData, setDirectData] = useState<Record<string, BatteryData>>({});

  const devicesRef = useMemoFirebase(() => 
    user && db ? collection(db, 'users', user.uid, 'bmsDevices') : null, 
  [user, db]);
  const { data: fbDevices } = useCollection<any>(devicesRef);

  useEffect(() => {
    if (isDemoMode && demoDevices.length === 0) {
      const initialData: Record<string, BatteryData> = {};
      const initialHistory: Record<string, HistoricalRecord[]> = {};
      DEMO_DEVICES.forEach(dev => {
        initialData[dev.id] = createMockBatteryData(dev.id, dev.name);
        initialHistory[dev.id] = createMockHistory(dev.id);
      });
      setDemoDevices(DEMO_DEVICES);
      setDemoData(initialData);
      setDemoHistory(initialHistory);
    } else if (!isDemoMode) {
      setDemoDevices([]);
      setDemoData({});
      setDemoHistory({});
    }
  }, [isDemoMode]);

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

  const addDirectBluetoothDevice = useCallback((name: string) => {
    const id = `BLE_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const newDevice: BatteryDevice = { id, name, type: 'Bluetooth', status: 'Online' };
    const newData = createMockBatteryData(id, name, !isDemoMode);
    
    if (isDemoMode) {
      setDemoDevices(prev => [...prev, newDevice]);
      setDemoData(prev => ({ ...prev, [id]: newData }));
      setDemoHistory(prev => ({ ...prev, [id]: createMockHistory(id) }));
    } else {
      setDirectDevices(prev => [...prev, newDevice]);
      setDirectData(prev => ({ ...prev, [id]: newData }));
    }
    
    return id;
  }, [isDemoMode]);

  const addNetworkDevice = useCallback((name: string) => {
    if (isDemoMode) {
      const id = `DEMO_ESP_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
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
      }, { merge: true });
      return id;
    }
  }, [isDemoMode, user, db]);

  const toggleControl = useCallback((deviceId: string, field: string) => {
    if (isDemoMode || deviceId.startsWith('BLE_') || deviceId.startsWith('DEMO_')) {
      const setter = deviceId.startsWith('BLE_') ? setDirectData : setDemoData;
      setter(prev => {
        if (!prev[deviceId]) return prev;
        return {
          ...prev,
          [deviceId]: { ...prev[deviceId], [field]: !prev[deviceId][field as keyof BatteryData] }
        };
      });
    } else if (user && db) {
      const deviceRef = doc(db, 'users', user.uid, 'bmsDevices', deviceId);
      updateDocumentNonBlocking(deviceRef, { [field]: true }); 
    }
  }, [isDemoMode, user, db]);

  const updateEeprom = useCallback((deviceId: string, key: string, value: any) => {
    if (isDemoMode || deviceId.startsWith('BLE_') || deviceId.startsWith('DEMO_')) {
      const setter = deviceId.startsWith('BLE_') ? setDirectData : setDemoData;
      setter(prev => {
        if (!prev[deviceId]) return prev;
        return {
          ...prev,
          [deviceId]: {
            ...prev[deviceId],
            eeprom: { ...prev[deviceId].eeprom, [key]: value }
          }
        };
      });
    } else if (user && db) {
      const deviceRef = doc(db, 'users', user.uid, 'bmsDevices', deviceId);
      updateDocumentNonBlocking(deviceRef, { [`eeprom.${key}`]: value });
    }
  }, [isDemoMode, user, db]);

  const setBalancingMode = useCallback((deviceId: string, mode: 'charge' | 'always' | 'static') => {
    if (isDemoMode || deviceId.startsWith('BLE_') || deviceId.startsWith('DEMO_')) {
      const setter = deviceId.startsWith('BLE_') ? setDirectData : setDemoData;
      setter(prev => {
        if (!prev[deviceId]) return prev;
        return {
          ...prev,
          [deviceId]: { ...prev[deviceId], balancingMode: mode }
        };
      });
    } else if (user && db) {
      const deviceRef = doc(db, 'users', user.uid, 'bmsDevices', deviceId);
      updateDocumentNonBlocking(deviceRef, { balancingMode: mode });
    }
  }, [isDemoMode, user, db]);

  const getAggregatedData = () => {
    const networkData = isDemoMode 
      ? demoDevices.filter(d => d.type === 'ESP32').map(d => demoData[d.id]).filter(Boolean)
      : (fbDevices || []).filter(d => d.type === 'ESP32' && d.status === 'Online');

    if (networkData.length === 0) return null;
    
    return {
      totalVoltage: networkData.reduce((acc, curr) => acc + (curr.totalVoltage || 0), 0) / networkData.length,
      totalCurrent: networkData.reduce((acc, curr) => acc + (curr.totalCurrent || 0), 0),
      avgSoC: networkData.reduce((acc, curr) => acc + (curr.stateOfCharge || 0), 0) / networkData.length,
      deviceCount: networkData.length,
      totalPower: networkData.reduce((acc, curr) => acc + ((curr.totalVoltage || 0) * (curr.totalCurrent || 0)), 0)
    };
  };

  const allData: Record<string, BatteryData> = isDemoMode ? { ...demoData } : { ...directData };
  if (!isDemoMode && fbDevices) {
    fbDevices.forEach(d => {
      allData[d.id] = d as BatteryData;
    });
  }

  const value = {
    devices: isDemoMode ? demoDevices : [...(fbDevices || []), ...directDevices],
    allData,
    history: isDemoMode ? demoHistory : {},
    aggregated: getAggregatedData(),
    isDemoMode,
    setDemoMode: setIsDemoModeState,
    toggleControl,
    updateEeprom,
    setBalancingMode,
    addNetworkDevice,
    addDirectBluetoothDevice,
  };

  return <BmsContext.Provider value={value}>{children}</BmsContext.Provider>;
};

export const useBms = () => {
  const context = useContext(BmsContext);
  if (context === undefined) {
    throw new Error('useBms must be used within a BmsProvider');
  }
  return context;
};
