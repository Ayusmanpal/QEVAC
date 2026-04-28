// Mock Firebase Service for Demo
// Since we don't have a Firebase Config yet, we use an in-memory or localStorage mock

let mockBlockages = [];
let listeners = [];

export function subscribeToBlockages(callback) {
  listeners.push(callback);
  callback(mockBlockages);
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
}

export function reportBlockage(blockage) {
  const newBlockage = {
    ...blockage,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  };
  mockBlockages = [...mockBlockages, newBlockage];
  
  // Notify listeners
  listeners.forEach(cb => cb(mockBlockages));
  
  return newBlockage;
}
