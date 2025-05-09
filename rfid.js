// rfid.js
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { ZebraRFIDModule } = NativeModules;
const {BeeperActionsModule} = NativeModules;
const rfidEmitter = new NativeEventEmitter(ZebraRFIDModule);

const RFIDService = {
  connectScanner: async connectionString => {
    try {
      await ZebraRFIDModule.connectReader(connectionString);
      return true;
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  },

  setPower: level => {
    ZebraRFIDModule.setPower(level);
  },

  startScan: () => {
    ZebraRFIDModule.startScan();
  },

  stopScan: () => {
    ZebraRFIDModule.stopScan();
  },

  subscribeToTags: callback => {
    const subscription = rfidEmitter.addListener('TAG_DATA', callback);
    return subscription;
  },

  startDiscovery: () => {
    if (Platform.OS === 'android' && ZebraRFIDModule.startDiscovery) {
      ZebraRFIDModule.startDiscovery();
    }
  },

  stopDiscovery: () => {
    if (Platform.OS === 'android' && ZebraRFIDModule.stopDiscovery) {
      ZebraRFIDModule.stopDiscovery();
    }
  },

  pairDevice: (address) => {
    return ZebraRFIDModule.pairDevice(address);
  },  

  subscribeToDevices: callback => {
    return rfidEmitter.addListener('DEVICE_DISCOVERED', callback);
  },
};

export default RFIDService;

