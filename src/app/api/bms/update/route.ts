import { NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Ініціалізація Firebase Client на сервері
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const urlUserId = searchParams.get('userId');
    
    const data = await request.json();
    const { deviceId, userId: payloadUserId, name, ...telemetry } = data;
    
    // Пріоритет userId з URL (Майстер прошивки додає його туди)
    const userId = urlUserId || payloadUserId;
    
    if (!deviceId || !userId) {
      return NextResponse.json({ error: 'Missing deviceId or userId' }, { status: 400 });
    }

    // 1. Оновлюємо або створюємо (авто-реєстрація) пристрій
    const deviceRef = doc(db, 'users', userId, 'bmsDevices', deviceId);
    
    // Додаємо поля для нового пристрою, якщо його ще немає
    const deviceUpdate = {
      ...telemetry,
      id: deviceId,
      name: name || `BMS Bridge ${deviceId.slice(-4)}`,
      status: 'Online',
      type: 'ESP32',
      lastSeenAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(deviceRef, deviceUpdate, { merge: true });

    // 2. Додаємо історичний запис для графіків
    const historyRef = collection(db, 'users', userId, 'bmsDevices', deviceId, 'bmsDataRecords');
    await addDoc(historyRef, {
      ...telemetry,
      timestamp: serverTimestamp(),
      bmsDeviceId: deviceId
    });

    return NextResponse.json({ success: true, registered: true });
  } catch (error) {
    console.error('BMS Update Error:', error);
    return NextResponse.json({ error: 'Failed to process telemetry' }, { status: 500 });
  }
}
