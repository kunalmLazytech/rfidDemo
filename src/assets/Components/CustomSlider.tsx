import React, { useState } from 'react';
import Slider from '@react-native-community/slider';
import globalStyles from '@styles/globalStyles';
import { Alert, NativeModules } from 'react-native';
import { Button, View, Text } from '@ant-design/react-native';
import { useDeviceInfo } from '@modules/RFIDConnectionContext';
import { SDKUtils } from '@modules/SDKUtils';

const { RFIDControllerModule } = NativeModules;

const CustomSlider = ({
    label = 'Power',
    min = 0,
    max = 270,
    initialValue = 0,
    step = 1,
    loading,
    setLoading,
}: {
    label?: string;
    min?: number;
    max?: number;
    initialValue?: number;
    step?: number;
    loading: boolean;
    setLoading: (val: boolean) => void;
}) => {
    const [power, setPower] = useState<number>(initialValue);
    const [status, setStatus] = useState<string>('');
    const { deviceInfo, setDeviceInfo } = useDeviceInfo();

    const handleSetPower = async () => {
        try {
            await RFIDControllerModule.setPower(power);
            setStatus(`${label} set to ${power} dBm`);
        } catch (error: any) {
            setStatus(error.message || `Setting ${label.toLowerCase()} failed`);
        }
    };

    const handleTagPress = () => {
        if (!deviceInfo?.isConnected) {
            Alert.alert(
                'Scanner Not Connected',
                'Would you like to connect your RFID scanner now?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Connect', onPress: () => handleConnect() },
                ],
                { cancelable: true }
            );
        }
    };

    const handleConnect = async () => {
        setLoading(true);
        const result = await SDKUtils.initAndConnect();
        if (result?.success) {
            await fetchDeviceInfo();
            Alert.alert('Connected Successfully', `Connected to ${result.deviceName || 'device'}`);
        } else {
            Alert.alert('Connection Failed', result?.message || 'Failed to connect to the device');
        }
        setLoading(false);
    };

    const fetchDeviceInfo = async () => {
        try {
            const info = await SDKUtils.getDeviceInfo();
            setDeviceInfo(info?.deviceName ? info : null);
        } catch (e) {
            console.error('Error fetching device info:', e);
            setDeviceInfo(null);
        }
    };

    return (
        <View style={globalStyles.sliderContainer}>
            {deviceInfo?.isConnected ? (
                <>
                    <Text style={globalStyles.sliderLabel}>{label}: {power} dBm</Text>
                    <Slider
                        style={globalStyles.slider}
                        minimumValue={min}
                        maximumValue={max}
                        step={step}
                        value={power}
                        minimumTrackTintColor="#0059c9"
                        maximumTrackTintColor="#ccc"
                        thumbTintColor="#0059c9"
                        onValueChange={(val: number) => setPower(val)}
                    />
                    <Button style={globalStyles.btn} onPress={handleSetPower}>
                        <Text style={globalStyles.btnText}>Set {label}</Text>
                    </Button>
                    {status !== '' && <Text style={globalStyles.statusText}>{status}</Text>}
                </>
            ) : (
                <Button style={globalStyles.btn} onPress={handleTagPress}>
                    <Text style={globalStyles.btnText}>Connect Scanner</Text>
                </Button>
            )}
        </View>
    );
};


export default CustomSlider;
