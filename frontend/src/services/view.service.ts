
import { apiClient } from './api';

export async function getFileInfo(shortCode: string) {
  // Use Gateway - it will route to view-service
  return apiClient.get(`/view/preview/${shortCode}`);
}

export function downloadFile(shortCode: string) {
  // Use Gateway URL
  window.open(`http://localhost:3000/view/${shortCode}`, '_blank');
}
