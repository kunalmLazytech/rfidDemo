// sdkCheck.ts
import {NativeEventEmitter, NativeModules} from 'react-native';
import ZebraRFID from './ZebraRFIDModule';
import { useNavigation } from '@react-navigation/native';

const {RFIDControllerModule} = NativeModules;
const eventEmitter = new NativeEventEmitter(RFIDControllerModule);
const navigation = useNavigation();
console.log('🧪 ZebraRFID Module Check');

if (!ZebraRFID) {
  console.warn('❌ ZebraRFID module is undefined!');
}

// Export reusable SDK-related functions
const handleInitSDK = async () => {
  try {
    const result = await RFIDControllerModule.InitSDK();
    console.log('✅ SDK initialized:', result);
    return result;
  } catch (error: any) {
    console.error('❌ InitSDK failed:', error?.message || error);
    navigation.navigate('BluetoothPairingScreen');
  }
};

const handleInit = async () => {
  try {
    const devices = await RFIDControllerModule.getBondedDevices?.();
    console.log('Bonded devices:', devices);
    await handleInitSDK();
  } catch (error) {
    console.error('Error during init:', error);
  }
};

export const SDKCheckUtils = {
  handleInitSDK,
  handleInit,
  eventEmitter, 
};
