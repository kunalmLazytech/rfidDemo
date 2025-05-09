import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator } from 'react-native';
import { List, WhiteSpace, Card, View, Text } from '@ant-design/react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { RFIDEvents } from '@modules/RFIDEvents';
import { SDKUtils } from '@modules/SDKUtils';
import { useDeviceInfo } from '@modules/RFIDConnectionContext';
import { useAuth } from '@modules/AuthContext';

import ConnectionControls from '@modules/ConnectionControlsWithBtn';
import AppVersion from '@assets/Components/AppVersion';

import styles from './styles';
import globalStyles from '@styles/globalStyles';
import COLORS from '@assets/Components/Colors';

import InfoRow from '@assets/Components/InfoRow';
import StatusIndicator from '@assets/Components/StatusIndicator';
import BatteryLevel from '@assets/Components/BatteryLevel';
import { TouchableOpacity } from 'react-native';

const SettingsScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { deviceInfo, setDeviceInfo } = useDeviceInfo();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => logout() },
      ],
      { cancelable: true }
    );
  };

  const fetchDeviceInfo = async () => {
    try {
      setLoading(true);
      const info = await SDKUtils.getDeviceInfo();
      setDeviceInfo(info?.deviceName ? info : null);
    } catch (error) {
      console.error('Error fetching device info:', error);
      setDeviceInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (deviceInfo?.isConnected) {
      fetchDeviceInfo();
    } else {
      setDeviceInfo(null);
    }

    const subscriptions = [
      RFIDEvents.addReaderAppearedListener(() => {
        if (deviceInfo?.isConnected) {
          fetchDeviceInfo();
        }
      }),
      RFIDEvents.addReaderDisappearedListener(() => {
        setDeviceInfo(null);
      }),
      RFIDEvents.addBluetoothStateListener((state: string) => {
        if (state === 'Disconnected') {
          setDeviceInfo(null);
        }
      }),
    ];

    return () => {
      RFIDEvents.removeRFIDListeners();
    };
  }, [deviceInfo?.isConnected]);

  return (
    <View style={[globalStyles.container, styles.container]}>
      <View style={styles.header}>
        <Icon name="settings" size={32} color="#fff" />
        <Text style={styles.headerTitle}>RFID Reader Settings</Text>
        <Text style={styles.headerSubtitle}>Manage device connections and status</Text>
      </View>

      <Card style={styles.card}>
        <Card.Header
          title="Device Information"
          style={styles.cardHeader}
          titleStyle={styles.cardTitle}
        />
        <Card.Body>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <List>
              <InfoRow
                icon="devices"
                label="Device Name"
                extra={
                  <Text style={globalStyles.labelMarginLeft12} numberOfLines={1}>
                    {deviceInfo?.deviceName || 'N/A'}
                  </Text>
                }
              />

              <InfoRow
                icon="link"
                label="Connection Status"
                extra={<StatusIndicator connected={!!deviceInfo?.isConnected} />}
              />

              <InfoRow
                icon="battery-charging-full"
                label="Battery Level"
                extra={<BatteryLevel level={deviceInfo?.batteryLevel || 0} />}
              />

              {deviceInfo?.batteryTemperature !== undefined && (
                <InfoRow
                  icon="device-thermostat"
                  label="Temperature"
                  extra={
                    <View style={globalStyles.rowCenter}>
                      <Icon name="thermostat" size={20} color="#666" />
                      <Text style={[globalStyles.labelMarginLeft12, { marginLeft: 8 }]}>
                        {deviceInfo.batteryTemperature}°C
                      </Text>
                    </View>
                  }
                />
              )}
            </List>
          )}
        </Card.Body>
      </Card>

      <View style={styles.rowItem}>
        <ConnectionControls />
        <WhiteSpace size="xl" />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={globalStyles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <AppVersion />
      <WhiteSpace size="xl" />
    </View>
  );
};

export default SettingsScreen;
