import { NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

/**
 * Ендпоінт для отримання агрегованих даних всієї системи.
 * Використовується віддаленими екранами на базі ESP32.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Отримуємо всі пристрої користувача для розрахунку агрегації
    const devicesRef = collection(db, 'users', userId, 'bmsDevices');
    const snapshot = await getDocs(devicesRef);
    
    const devices = snapshot.docs.map(doc => doc.data());
    const networkDevices = devices.filter(d => d.type === 'ESP32');

    if (networkDevices.length === 0) {
      return NextResponse.json({
        totalVoltage: 0,
        totalCurrent: 0,
        totalPower: 0,
        avgSoC: 0,
        deviceCount: 0,
        status: 'No Devices'
      });
    }

    const totalVoltage = networkDevices.reduce((acc, curr) => acc + (curr.totalVoltage || 0), 0) / networkDevices.length;
    const totalCurrent = networkDevices.reduce((acc, curr) => acc + (curr.totalCurrent || 0), 0);
    const totalPower = networkDevices.reduce((acc, curr) => acc + ((curr.totalVoltage || 0) * (curr.totalCurrent || 0)), 0);
    const avgSoC = networkDevices.reduce((acc, curr) => acc + (curr.stateOfCharge || 0), 0) / networkDevices.length;

    return NextResponse.json({
      totalVoltage: parseFloat(totalVoltage.toFixed(2)),
      totalCurrent: parseFloat(totalCurrent.toFixed(2)),
      totalPower: parseFloat(totalPower.toFixed(2)),
      avgSoC: parseFloat(avgSoC.toFixed(1)),
      deviceCount: networkDevices.length,
      status: 'Active'
    });

  } catch (error) {
    console.error('Aggregated Data API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
