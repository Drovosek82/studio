import { NextResponse } from 'next/server';

/**
 * API Endpoint for ESP32 devices to report BMS data.
 * In a real app, this would update Firestore or a global state manager.
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.deviceId) {
      return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 });
    }

    console.log(`Received data from ESP32 [${data.deviceId}]:`, data);

    // Here you would typically:
    // 1. Update Firestore: admin.firestore().collection('devices').doc(data.deviceId).set(data)
    // 2. Or push to a real-time event bus

    return NextResponse.json({ 
      success: true, 
      receivedAt: new Date().toISOString() 
    });
  } catch (error) {
    console.error('BMS Update Error:', error);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
