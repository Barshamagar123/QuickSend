
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:3000';

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${GATEWAY_URL}/upload`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }
  
  return response.json();
}

export async function uploadText(content: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const file = new File([blob], 'text-content.txt', { type: 'text/plain' });
  return uploadFile(file);
}
