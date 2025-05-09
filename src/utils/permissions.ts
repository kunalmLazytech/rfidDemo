import { Platform, PermissionsAndroid } from 'react-native';

export const checkLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
        try {
            const auth = await navigator.geolocation?.requestAuthorization?.('whenInUse');
            return auth === 'granted';
        } catch (err) {
            console.warn('iOS location permission error:', err);
            return false;
        }
    }

    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: 'This app needs access to your location to tag items.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn('Android location permission error:', err);
            return false;
        }
    }

    return false;
};
