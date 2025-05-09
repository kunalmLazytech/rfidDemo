// src\modules\ConnectionControlsWithBtn.tsx

import React, { useState } from 'react';
import { Alert, ActivityIndicator } from 'react-native';
import { Button, Text } from '@ant-design/react-native';
import { SDKUtils } from '@modules/SDKUtils';
import { useDeviceInfo } from '@modules/RFIDConnectionContext';
import globalStyles from '@styles/globalStyles';

const ConnectionControls = () => {
    const [loading, setLoading] = useState(false);
    const { deviceInfo, setDeviceInfo } = useDeviceInfo();

    const fetchDeviceInfo = async () => {
        try {
            const info = await SDKUtils.getDeviceInfo();
            if (info && info.deviceName) {
                setDeviceInfo(info);
            } else {
                setDeviceInfo(null);
            }
        } catch (e) {
            console.error('Error fetching device info:', e);
            setDeviceInfo(null);
        }
    };

    const handleConnect = async () => {
        try {
            setLoading(true);
            const result = await SDKUtils.initAndConnect();
            if (result?.success) {
                await fetchDeviceInfo();
                Alert.alert('Connected Successfully', `Connected to ${result.deviceName || 'device'}`);
            } else {
                Alert.alert('Connection Failed', result?.message || 'Failed to connect to the device');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            setLoading(true);
            const result = await SDKUtils.handleDisconnect();
            if (result.success) {
                Alert.alert('Disconnected', 'Device disconnected successfully');
                await fetchDeviceInfo();
            } else {
                Alert.alert('Disconnect Failed', result.message || 'Failed to disconnect device');
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Unexpected error during disconnection');
        } finally {
            setLoading(false);
        }
    };

    const isConnected = deviceInfo?.isConnected ?? false;

    return (
        <Button
            style={isConnected ? globalStyles.disconnectButton : globalStyles.connectButton}
            onPress={isConnected ? handleDisconnect : handleConnect}
            disabled={loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={globalStyles.buttonText}>
                    {isConnected ? 'Disconnect Device' : 'Connect Device'}
                </Text>
            )}
        </Button>
    );
};

export default ConnectionControls;
