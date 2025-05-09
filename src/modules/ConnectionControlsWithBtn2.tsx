//  src\modules\ConnectionControlsWithBtn2.tsx

import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
import { SDKUtils } from '@modules/SDKUtils';
import { useDeviceInfo } from '@modules/RFIDConnectionContext';
import globalStyles from '@styles/globalStyles';

const ConnectionControlsWithBtn2 = () => {
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
    const batteryLevel = deviceInfo?.batteryLevel ?? 0;

    return (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 10,
            }}
        >
            <View style={globalStyles.rowCenter}>
                <View
                    style={[
                        globalStyles.statusDot,
                        isConnected ? globalStyles.connected : globalStyles.disconnected,
                    ]}
                />
                <Text style={{ marginLeft: 8 }}>
                    {isConnected ? 'Scanner Connected' : 'Scanner Disconnected'}
                </Text>
                <Text
                    style={{
                        marginLeft: 8,
                        color: isConnected ? '#52c41a' : '#ff4d4f',
                    }}
                >
                    {batteryLevel}%
                </Text>
            </View>

            {isConnected && (
                <TouchableOpacity onPress={handleDisconnect}>
                    <Text style={{ color: 'darkred', marginRight: 15 }}>Disconnect</Text>
                </TouchableOpacity>
            )}

            {!isConnected && (
                <TouchableOpacity onPress={handleConnect}>
                    <Text style={{ color: '#1890ff', marginRight: 15 }}>Connect</Text>
                </TouchableOpacity>
            )}

            {loading && <ActivityIndicator color="#1890ff" />}
        </View>
    );
};

export default ConnectionControlsWithBtn2;
