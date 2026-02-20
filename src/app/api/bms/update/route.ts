import { NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Ініціалізація Firebase Client на сервері (Edge/Node)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { deviceId, userId, ...telemetry } = data;
    
    if (!deviceId || !userId) {
      return NextResponse.json({ error: 'Missing deviceId or userId' }, { status: 400 });
    }

    // 1. Оновлюємо стан пристрою
    const deviceRef = doc(db, 'users', userId, 'bmsDevices', deviceId);
    await setDoc(deviceRef, {
      ...telemetry,
      status: 'Online',
      lastSeenAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // 2. Додаємо історичний запис
    const historyRef = collection(db, 'users', userId, 'bmsDevices', deviceId, 'bmsDataRecords');
    await addDoc(historyRef, {
      ...telemetry,
      timestamp: serverTimestamp(),
      bmsDeviceId: deviceId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('BMS Update Error:', error);
    return NextResponse.json({ error: 'Failed to process telemetry' }, { status: 500 });
  }
}
