import {Alert, PermissionsAndroid, Platform} from 'react-native';
import {RFIDModule} from './RFIDModule';

// let isSDKInitialized = false;
// let sdkInitializationPromise: Promise<boolean> | null = null;

export const SDKUtils = {
  // initSDK: async (): Promise<boolean> => {
  //   if (isSDKInitialized) {
  //     return true;
  //   }
  //   if (sdkInitializationPromise) {
  //     return sdkInitializationPromise;
  //   }

  //   sdkInitializationPromise = new Promise(async resolve => {
  //     try {
  //       await RFIDModule.initSDK();
  //       isSDKInitialized = true;
  //       console.log('SDK initialized successfully');
  //       resolve(true);
  //     } catch (error: any) {
  //       console.error('InitSDK failed:', error?.message || error);
  //       Alert.alert(
  //         'SDK Initialization Failed',
  //         error?.message || 'Failed to initialize RFID SDK',
  //       );
  //       isSDKInitialized = false;
  //       resolve(false);
  //     } finally {
  //       sdkInitializationPromise = null;
  //     }
  //   });

  //   return sdkInitializationPromise;
  // },

  // handleConnect: async (): Promise<{
  //   success: boolean;
  //   message?: string;
  //   deviceName?: string;
  // }> => {
  //   if (!isSDKInitialized) {
  //     Alert.alert('Not Initialized', 'Please initialize the SDK first.');
  //     return {success: false, message: 'SDK not initialized'};
  //   }
  //   try {
  //     const result = await RFIDModule.connect();
  //     console.log('Connect response:', result);
  //     return result;
  //   } catch (e: any) {
  //     console.error('Connect error:', e);
  //     return {success: false, message: e?.message || 'Failed to connect'};
  //   }
  // },

  // handleInitSDK: async (): Promise<any> => {
  //   try {
  //     const result = await RFIDModule.initSDK();
  //     console.log('SDK initialized and connected:', result);
  //     return result;
  //   } catch (error: any) {
  //     console.error('InitSDK failed:', error?.message || error);
  //     throw error; // Re-throw the error to be caught in the component
  //   }
  // },

  getDeviceInfo: async (): Promise<any> => {
    try {
      const info = await RFIDModule.getDeviceInfo();
      console.log('Device Info:', info);
      return info;
    } catch (error: any) {
      console.error('getDeviceInfo failed:', error?.message || error);
      return undefined; // Or throw the error, depending on your error handling
    }
  },

  handleInitSDK: async () => {
    try {
      const result = await RFIDModule.initSDK();
      console.log('SDK initialized:', result);
      return result;
    } catch (error: any) {
      console.error('InitSDK failed:', error?.message || error);
    }
  },

  // getDeviceInfo: async (): Promise<any> => {
  //   try {
  //     const info = await RFIDModule.getDeviceInfo();
  //     return info;
  //   } catch (error: any) {
  //     console.error('Error fetching device info:', error?.message || error);
  //     return null;
  //   }
  // },

  handleConnect: async (): Promise<boolean> => {
    try {
      const connected = await RFIDModule.connect();
      console.log('Connect result:', connected);
      return connected;
    } catch (error) {
      // console.error('Connect failed:', error.message);
      return false;
    }
  },

  initAndConnect: async (): Promise<any> => {
    let initialized = false;

    const hasPermission = await SDKUtils.requestPermissions();
    if (!hasPermission) {
      return null;
    }

    await new Promise(res => setTimeout(res, 500));

    const turnedOn = await SDKUtils.enableBluetoothIfOff();
    // console.log(turnedOn);

    if (!turnedOn) {
      Alert.alert(
        'Bluetooth Required',
        'Please enable Bluetooth to continue.',
        [
          {text: 'Open Settings', onPress: RFIDModule.openBluetoothSettings},
          {text: 'Cancel', style: 'cancel'},
        ],
      );
      // return null;
    } else {
      console.log('else');
    }

    if (!initialized) {
      initialized = true;
      console.log('initialized');
      // await SDKUtils.handleInit();
      await SDKUtils.handleInitSDK();
    }

    try {
      const connected = await SDKUtils.handleConnect(); // Can be a boolean or object
      if (!connected) {
        Alert.alert(
          'Connection Failed',
          'Could not connect to the RFID device.',
          [
            {
              text: 'Retry',
              onPress: () => {
                SDKUtils.initAndConnect(); // Retry full flow
              },
            },
            {text: 'Cancel', style: 'cancel'},
          ],
        );
        return connected; // 👈 return whatever `connected` is (likely `false`)
      }

      return connected; // 👈 return full result
    } catch (error: any) {
      console.error('Connect error:', error?.message || error);
      Alert.alert('Error', 'An unexpected error occurred while connecting.');
      return null;
    }
  },

  handleSDKConnect: async (): Promise<boolean> => {
    try {
      const connected = await RFIDModule.sdkConnect();
      // const connected = await RFIDModule.Connect();
      console.log('Connect :', connected);
      return connected;
    } catch (error: any) {
      console.error('Connect failed:', error?.message ?? error);
      return false;
    }
  },

  handleDisconnect: async (): Promise<any> => {
    try {
      const result = await RFIDModule.disconnect();
      return {success: true, message: 'Disconnected successfully'};
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Disconnect failed',
      };
    }
  },

  handleInit: async () => {
    try {
      const devices = await RFIDModule.getBondedDevices();
      console.log('Bonded devices:', devices);
      await SDKUtils.handleInitSDK();
      return devices;
    } catch (error) {
      console.error('Error during init:', error);
    }
  },

  fetchDeviceInfo: async (): Promise<void> => {
    try {
      const info = await RFIDModule.getDeviceInfo();
      console.log('Device Info:', info);
      return info;
    } catch (error: any) {
      console.error('Error:', error?.message || error);
    }
  },

  requestPermissions: async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const version = parseInt(Platform.Version.toString(), 10);
      const permissions =
        version >= 31
          ? [
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            ]
          : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

      const granted = await PermissionsAndroid.requestMultiple(permissions);
      const allGranted = permissions.every(
        perm => granted[perm] === PermissionsAndroid.RESULTS.GRANTED,
      );

      if (!allGranted) {
        Alert.alert(
          'Permissions Denied',
          'Bluetooth and location permissions are required.',
        );
      }

      return allGranted;
    }
    return true;
  },

  enableBluetoothIfOff: async (): Promise<boolean> => {
    const isEnabled = await RFIDModule.isBluetoothEnabled();
    if (isEnabled) return true;

    console.log('Bluetooth is off. Requesting enable...');
    RFIDModule.requestEnableBluetooth();

    await new Promise(res => setTimeout(res, 1500));
    return await RFIDModule.isBluetoothEnabled();
  },
};
