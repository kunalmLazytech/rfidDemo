import Slider from '@react-native-community/slider';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';

const {RFIDControllerModule} = NativeModules;
const eventEmitter = new NativeEventEmitter(RFIDControllerModule);

const RFIDControllerComponent = () => {
  const [status, setStatus] = useState<string>('Not Connected');
  const [tags, setTags] = useState<any[]>([]);
  const [power, setPower] = useState<number>(270);
  const [barcode, setBarcode] = useState<string>('');
  const [TriggerPressed, setTriggerPressed] = useState<string>('');

  useEffect(() => {
    // const tagListener = eventEmitter.addListener('TagData', event => {
    //   setTags(prevTags => [...prevTags, ...event.tags]);
    // });

    const tagListener = eventEmitter.addListener('TagData', event => {
      if (event && Array.isArray(event.tags)) {
        setTags(prevTags => [...prevTags, ...event.tags]);
      } else {
        console.warn('Invalid tag event received:', event);
      }
    });
    const triggerListener = eventEmitter.addListener(
      'TriggerEvent',
      pressed => {
        setTriggerPressed(pressed);
      },
    );

    const barcodeListener = eventEmitter.addListener('onBarcodeRead', event => {
      setBarcode(event.barcode);
    });

    return () => {
      tagListener.remove();
      barcodeListener.remove();
      triggerListener.remove();
    };
  }, []);

  const handleSetPower = async () => {
    try {
      await RFIDControllerModule.setPower(power); // Call native method to set the power
      setStatus(`Power set to ${power}`);
    } catch (error: any) {
      setStatus(error.message || 'Setting power failed');
    }
  };

  const handleConnect = async () => {
    try {
      const result = await RFIDControllerModule.connect();
      setStatus(result);
    } catch (error: any) {
      setStatus(error.message || 'Connection Failed');
    }
  };

  const handleDisconnect = async () => {
    try {
      const result = await RFIDControllerModule.disconnect();
      setStatus(result);
    } catch (error: any) {
      setStatus(error.message || 'Disconnection Failed');
    }
  };

  const handleStartInventory = async () => {
    try {
      setTags([]);
      await RFIDControllerModule.startInventory();
    } catch (error: any) {
      setStatus(error.message || 'Inventory start failed');
    }
  };

  const handleStopInventory = async () => {
    try {
      await RFIDControllerModule.stopInventory();
    } catch (error: any) {
      setStatus(error.message || 'Inventory stop failed');
    }
  };

  const handleScanBarcode = async () => {
    try {
      const result = await RFIDControllerModule.scanBarcode();
      setBarcode(result);
    } catch (error: any) {
      setStatus(error.message || 'Scan barcode failed');
    }
  };

  const handleSetPreFilters = async () => {
    try {
      await RFIDControllerModule.setPreFilters();
      setStatus('PreFilters set');
    } catch (error: any) {
      setStatus(error.message || 'PreFilters failed');
    }
  };

  const handleTest1 = async () => {
    try {
      const result = await RFIDControllerModule.test1();
      setStatus(result);
    } catch (error: any) {
      setStatus(error.message || 'Test1 failed');
    }
  };

  const handleTest2 = async () => {
    try {
      const result = await RFIDControllerModule.test2();
      setStatus(result);
    } catch (error: any) {
      setStatus(error.message || 'Test2 failed');
    }
  };

  const handleDefaults = async () => {
    try {
      const result = await RFIDControllerModule.defaults();
      setStatus(result);
    } catch (error: any) {
      setStatus(error.message || 'Defaults failed');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.status}>Status: {status}</Text>
      <Button title="Connect" onPress={handleConnect} />
      <Button title="Disconnect" onPress={handleDisconnect} />
      <Button title="Start Inventory" onPress={handleStartInventory} />
      <Button title="Stop Inventory" onPress={handleStopInventory} />
      {/* <Button title="Scan Barcode" onPress={handleScanBarcode} />
      <Button title="Set PreFilters" onPress={handleSetPreFilters} />
      <Button title="Test1" onPress={handleTest1} />
      <Button title="Test2" onPress={handleTest2} />
      <Button title="Defaults" onPress={handleDefaults} /> */}

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderText}>Power: {power} dBm</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={270}
          step={1}
          value={power}
          onValueChange={value => setPower(value)}
        />
      </View>
      <Button title="Set Power" onPress={handleSetPower} />

      <Text style={styles.header}>Tags:</Text>
      {tags.map((tag, index) => (
        <Text key={index} style={styles.tag}>
          Tag ID: {tag.tagId}, RSSI: {tag.rssi}
        </Text>
      ))}

      <Text style={styles.header}>Barcode:</Text>
      <Text style={styles.barcode}>{barcode}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  status: {
    fontSize: 18,
    marginBottom: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  tag: {
    fontSize: 16,
    marginTop: 5,
  },
  barcode: {
    fontSize: 16,
    marginTop: 5,
    backgroundColor: '#f0f0f0',
    padding: 10,
  },
  sliderContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  slider: {
    width: '80%',
    height: 40,
  },
  sliderText: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default RFIDControllerComponent;