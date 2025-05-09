import ZebraRFID from './ZebraRFIDModule';
import { getCurrentPosition } from './locationUtil';

export const readRFIDTags = async () => {
  try {
    const tags = await ZebraRFID.readTags(); // Only call readTags()

    const { lat, long } = await getCurrentPosition();
    const timestamp = new Date().toISOString();

    return tags.map((epc: string) => ({
      epc,
      materialId: 'Material-001',
      description: 'Sample Product',
      count: 1,
      lat,
      long,
      timestamp
    }));
  } catch (error) {
    console.error('Error reading RFID tags:', error);
    throw error;
  }
};
