export async function getFileInfo(shortCode: string) {
  const response = await fetch(`http://localhost:3004/preview/${shortCode}`);
  if (!response.ok) throw new Error(`Failed: ${response.status}`);
  return response.json();
}

export function downloadFile(shortCode: string) {
  window.open(`http://localhost:3004/view/${shortCode}`, '_blank');
}