// src/screens/BluetoothPairingScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, PermissionsAndroid, Platform } from 'react-native';
import RFIDService from '../../rfid';
import { useNavigation } from '@react-navigation/native';

const BluetoothPairingScreen = () => {
  const navigation = useNavigation();
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');

  // Request Bluetooth permissions
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        setError('Permission request failed');
        return false;
      }
    }
    return true;
  };

  // Start/stop device discovery
  const toggleScan = async () => {
    if (!isScanning) {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) return;

      setIsScanning(true);
      setError('');
      setDevices([]);
      RFIDService.startDiscovery();
    } else {
      setIsScanning(false);
      RFIDService.stopDiscovery();
    }
  };

  // Handle device selection
  const handleDeviceSelect = (device) => {
    RFIDService.stopDiscovery();
    RFIDService.pairDevice(device.address)
      .then(() => navigation.goBack())
      .catch(e => setError('Connection failed: ' + e.message));
  };

  useEffect(() => {
    const subscription = RFIDService.subscribeToDevices((device) => {
      setDevices(prev => [...prev, device]);
    });

    return () => {
      subscription.remove();
      RFIDService.stopDiscovery();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available RFID Readers</Text>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={toggleScan}
      >
        <Text style={styles.buttonText}>
          {isScanning ? 'Stop Scanning' : 'Start Scanning'}
        </Text>
      </TouchableOpacity>

      {isScanning && <ActivityIndicator size="large" />}

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : devices.length === 0 ? (
        <Text style={styles.message}>
          {isScanning ? 'Scanning for devices...' : 'Press Start Scanning to begin'}
        </Text>
      ) : (
        devices.map((device) => (
          <TouchableOpacity
            key={device.address}
            style={styles.deviceItem}
            onPress={() => handleDeviceSelect(device)}
          >
            <Text style={styles.deviceName}>{device.name || 'Unknown Device'}</Text>
            <Text style={styles.deviceAddress}>{device.address}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  scanButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  deviceItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deviceAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
  message: {
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default BluetoothPairingScreen;