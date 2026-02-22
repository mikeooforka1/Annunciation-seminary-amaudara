import { openDB } from 'idb';

const DB_NAME = 'asa-offline-db';
const STORE_NAME = 'queue';

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    },
  });
}

export async function addToQueue(action) {
  const db = await getDB();
  await db.add(STORE_NAME, { ...action, timestamp: Date.now() });
}

export async function getQueue() {
  const db = await getDB();
  return await db.getAll(STORE_NAME);
}

export async function clearQueue() {
  const db = await getDB();
  await db.clear(STORE_NAME);
}

export async function saveOfflineState(state) {
  const db = await getDB();
  await db.put('queue', { id: 'offlineState', ...state });
}

export async function loadOfflineState() {
  const db = await getDB();
  return await db.get('queue', 'offlineState');
}