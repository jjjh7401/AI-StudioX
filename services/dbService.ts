const DB_NAME = 'CosmosAssetsDB';
const DB_VERSION = 2; 
const STORE_NAME = 'assets';
const PROJECTS_STORE_NAME = 'projects';

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject('IndexedDB error');
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const tempDb = (event.target as IDBOpenDBRequest).result;
      if (!tempDb.objectStoreNames.contains(STORE_NAME)) {
        tempDb.createObjectStore(STORE_NAME);
      }
      if (!tempDb.objectStoreNames.contains(PROJECTS_STORE_NAME)) {
        tempDb.createObjectStore(PROJECTS_STORE_NAME);
      }
    };
  });
};

export const storeAsset = async (assetId: string, assetData: Blob): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(assetData, assetId);
        
        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Failed to store asset:', request.error);
            reject(request.error);
        };
    });
};

export const getAsset = async (assetId: string): Promise<Blob | undefined> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(assetId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
            console.error('Failed to get asset:', request.error);
            reject(request.error);
        };
    });
};

/**
 * Persists the list of projects to IndexedDB.
 * This bypasses localStorage limits for large Base64 image data.
 */
export const saveProjectsList = async (projects: any[]): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([PROJECTS_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(PROJECTS_STORE_NAME);
        // We store the entire array under a single key 'project-list'
        const request = store.put(projects, 'project-list');
        
        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Failed to save projects to IndexedDB:', request.error);
            reject(request.error);
        };
    });
};

/**
 * Retrieves the list of projects from IndexedDB.
 */
export const getProjectsList = async (): Promise<any[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([PROJECTS_STORE_NAME], 'readonly');
        const store = transaction.objectStore(PROJECTS_STORE_NAME);
        const request = store.get('project-list');

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => {
            console.error('Failed to get projects from IndexedDB:', request.error);
            reject(request.error);
        };
    });
};

export const dataURLToBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Invalid data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};