import amqp from 'amqplib';
import axios from 'axios';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
const FILE_STORAGE_SERVICE_URL = process.env.FILE_STORAGE_SERVICE_URL || 'http://file-storage-service:3005';
const LINK_SERVICE_URL = process.env.LINK_SERVICE_URL || 'http://link-service:3002';

async function start() {
  const retries = 5;
  let connection: amqp.ChannelModel | null = null;
  let channel: amqp.Channel | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[Worker] Connecting to RabbitMQ (attempt ${i + 1}/${retries})...`);
      connection = await amqp.connect(RABBITMQ_URL);
      channel = await connection.createChannel();
      break;
    } catch (error) {
      console.error('[Worker] Connection failed, retrying in 5s...', error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  if (!channel || !connection) {
    console.error('[Worker] Failed to connect to RabbitMQ. Exiting.');
    process.exit(1);
  }

  const activeChannel = channel as amqp.Channel;

  await activeChannel.assertQueue('file.uploaded', { durable: true });
  await activeChannel.prefetch(100);

  console.log('✅ [Worker] Listening for messages on "file.uploaded" queue');

  activeChannel.consume('file.uploaded', async (msg) => {
    if (!msg) return;

    const contentStr = msg.content.toString();
    console.log(`[Worker] Received message: ${contentStr}`);

    try {
      const { fileId, shortCode, expiresAt } = JSON.parse(contentStr);

      if (!fileId || !shortCode || !expiresAt) {
        console.error('[Worker] Invalid message content, acknowledging to discard');
        activeChannel.ack(msg);
        return;
      }

      const expiryTime = new Date(expiresAt).getTime();
      const delay = expiryTime - Date.now();

      if (delay <= 0) {
        console.log(`[Worker] Link ${shortCode} already expired. Deleting immediately...`);
        await performCleanup(fileId, shortCode);
        activeChannel.ack(msg);
      } else {
        console.log(`[Worker] Scheduling deletion for ${shortCode} in ${Math.round(delay / 1000)} seconds`);
        
        setTimeout(async () => {
          try {
            console.log(`[Worker] Executing scheduled deletion for ${shortCode}...`);
            await performCleanup(fileId, shortCode);
            activeChannel.ack(msg);
          } catch (err: any) {
            console.error(`[Worker] Failed scheduled cleanup for ${shortCode}:`, err.message);
            activeChannel.ack(msg);
          }
        }, delay);
      }
    } catch (error: any) {
      console.error('[Worker] Error processing message:', error.message);
      activeChannel.ack(msg);
    }
  }, { noAck: false });
}

async function performCleanup(fileId: string, shortCode: string) {
  try {
    console.log(`[Cleanup] Deleting file ${fileId} from storage...`);
    await axios.delete(`${FILE_STORAGE_SERVICE_URL}/file/${fileId}`);
    console.log(`[Cleanup] File ${fileId} deleted from storage`);
  } catch (err: any) {
    if (err.response && err.response.status === 404) {
      console.log(`[Cleanup] File ${fileId} already deleted from storage`);
    } else {
      console.error(`[Cleanup] Failed to delete file ${fileId}:`, err.message);
    }
  }

  try {
    console.log(`[Cleanup] Deleting link ${shortCode} from link-service...`);
    await axios.delete(`${LINK_SERVICE_URL}/${shortCode}`);
    console.log(`[Cleanup] Link ${shortCode} deleted`);
  } catch (err: any) {
    if (err.response && err.response.status === 404) {
      console.log(`[Cleanup] Link ${shortCode} already deleted`);
    } else {
      console.error(`[Cleanup] Failed to delete link ${shortCode}:`, err.message);
    }
  }
}

start().catch(console.error);
