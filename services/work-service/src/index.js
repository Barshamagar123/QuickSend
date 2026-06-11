console.log('✅ Worker service started');
console.log('Worker is running and waiting for jobs...');

setInterval(() => {
  console.log('Worker heartbeat: ' + new Date().toISOString());
}, 30000);
