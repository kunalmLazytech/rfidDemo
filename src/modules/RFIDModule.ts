import {NativeModules, Platform} from 'react-native';

const {RFIDControllerModule} = NativeModules;

export const RFIDModule = {
  connect: async () => {
    return await RFIDControllerModule.connect();
  },

  
  isBluetoothEnabled: async (): Promise<boolean> => {
    return await RFIDControllerModule.isBluetoothEnabled?.();
  },

  requestEnableBluetooth: (): void => {
    RFIDControllerModule.requestEnableBluetooth?.();
  },

  openBluetoothSettings: (): void => {
    if (Platform.OS === 'android') {
      RFIDControllerModule.openBluetoothSettings?.();
    }
  },

  getBondedDevices: async (): Promise<any> => {
    return await RFIDControllerModule.getBondedDevices?.();
  },

  initSDK: async (): Promise<any> => {
    return await RFIDControllerModule.InitSDK?.();
  },

  getDeviceInfo: async (): Promise<any> => {
    return await RFIDControllerModule.getDeviceInfo?.();
  },

  sdkConnect: async (): Promise<boolean> => {
    return await RFIDControllerModule.sdkConnect();
  },

  disconnect: async () => {
    return await RFIDControllerModule.disconnect();
  },
};
