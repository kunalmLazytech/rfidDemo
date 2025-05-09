// ZebraRFIDModule.ts
import {NativeModules} from 'react-native';

interface ZebraRFIDModuleInterface {
  connectReader: () => Promise<string>;
  startReading: () => Promise<string>;
  stopReading: () => Promise<string>;
  getReadTags: () => Promise<string[]>;
  scanBluetoothDevices: () => Promise<{name: string; address: string}[]>;
}

const ZebraRFIDModule: ZebraRFIDModuleInterface = NativeModules.ZebraRFIDModule;

export default ZebraRFIDModule;
