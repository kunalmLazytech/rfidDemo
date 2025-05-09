import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';
import globalStyles from '@styles/globalStyles';
import { RFIDEvents } from '@modules/RFIDEvents';
import { MockData } from '@assets/Components/MockData';


function hexToAscii(hex: string): string {
  if (hex.length % 2 !== 0) hex = '0' + hex;
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    const code = parseInt(hex.substr(i, 2), 16);
    str += String.fromCharCode(code);
  }
  return str;
}


interface Tag {
  epc: string;
}

interface Product {
  skuName: string;
  sku: string;
  tags: Tag[];
}

interface ScanResult {
  skuName: string;
  expectedQty: number;
  scannedQty: number;
}

function compareScannedEPCs(mockData: Product[], scannedEPCs: string[]): ScanResult[] {
  return mockData.map(product => {
    const expectedQty = product.tags.length;
    const scannedQty = product.tags.filter(tag => scannedEPCs.includes(tag.epc)).length;

    return {
      skuName: product.skuName,
      expectedQty,
      scannedQty
    };
  });
}


const InventoryScreen = () => {
  const [tags, setTags] = useState<any[]>([]);
  useEffect(() => {
    RFIDEvents.registerMultiTagDataListener((newTags: any[]) => {
      setTags(prev => {
        const seen = new Set(prev.map(t => t.epc));
        const filtered = newTags
          .map(t => {
            const raw = t.tagId;
            const epc = raw.replace(/^0+/, '');
            return { raw, epc };
          })
          .filter(item => !seen.has(item.epc));

        return [...prev, ...filtered];
      });
    });

    return () => {
      RFIDEvents.removeRFIDListeners();
    };
  }, []);


  const scannedEPCs = tags.map(tag => tag.epc);
  const scanResults = compareScannedEPCs(MockData, scannedEPCs);

  return (
    <View style={[globalStyles.container, { padding: 16 }]}>
      <Text style={globalStyles.headerLabel}>Scanned Tags</Text>
      <FlatList
        data={tags}
        keyExtractor={item => item.epc}
        renderItem={({ item }) => (
          <View style={[globalStyles.rowCenter, { justifyContent: 'space-between', paddingVertical: 8 }]}>
            <Text style={globalStyles.labelMarginLeft12}>
              ID: {item.epc}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text>No tags scanned yet.</Text>}
      />

      <Text style={[globalStyles.headerLabel, { marginTop: 24 }]}>Scan Summary</Text>

      <FlatList
        data={scanResults}
        keyExtractor={item => item.skuName}
        renderItem={({ item }) => {
          const isComplete = item.scannedQty === item.expectedQty;
          const isMissing = item.scannedQty < item.expectedQty;
          const statusColor = isComplete ? 'green' : isMissing ? 'orange' : 'red';

          return (
            <View style={[globalStyles.rowCenter, { justifyContent: 'space-between', paddingVertical: 6 }]}>
              <Text style={[globalStyles.labelSm, { flex: 1 }]}>{item.skuName}</Text>
              <Text style={[globalStyles.labelSm, { flex: 1, textAlign: 'right', color: statusColor }]}>
                {item.scannedQty} / {item.expectedQty}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text>No scan summary available.</Text>}
      />
      <Button title="Clear Tags" onPress={() => setTags([])} />
    </View>
  );
};

export default InventoryScreen;


















// import React, { useEffect, useState } from 'react';
// import { View, Button } from 'react-native';
// import RFIDService from '../rfid';

// const InventoryScreen = () => {
//   const [tags, setTags] = useState([]);

//   // Initialize when component mounts
//   useEffect(() => {
//     const initRFID = async () => {
//       try {
//         await RFIDService.connectScanner('btle://DC:FC:56:12:34:56');
//         RFIDService.setPower(30);
//       } catch (error) {
//         console.error('RFID Init Error:', error);
//       }
//     };

//     // Add tag listener
//     const tagSubscription = RFIDService.subscribeToTags(newTags => {
//       setTags(prev => [...prev, ...newTags]);
//     });

//     initRFID();

//     // Cleanup when component unmounts
//     return () => {
//       tagSubscription.remove();
//       RFIDService.stopScan();
//     };
//   }, []);

//   return (
//     <View>
//       <Button title="Start Scan" onPress={RFIDService.startScan} />
//       <Button title="Stop Scan" onPress={RFIDService.stopScan} />
//       {tags.map(tag => (
//         <Text key={tag.epc}>{tag.epc}</Text>
//       ))}
//     </View>
//   );
// };




// import React, { useState, useEffect } from 'react';
// import { View, Button, Text, Alert, ActivityIndicator, NativeModules, NativeEventEmitter } from 'react-native';
// import { SDKUtils } from '@modules/SDKUtils';

// const { RFIDControllerModule } = NativeModules;
// const eventEmitter = new NativeEventEmitter(RFIDControllerModule);
// const InventoryScreen = () => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [loading, setLoading] = useState(false);

// useEffect(() => {
//   const initSDK = async () => {
//     setLoading(true);
//     await SDKUtils.initSDK();
//     setLoading(false);
//   };

//   initSDK();

//   const errorListener = eventEmitter.addListener('Error', (error) => {
//     console.error('RFID Module Error:', error);
//     Alert.alert('RFID Module Error', error);
//   });

//   const readerAppearedListener = eventEmitter.addListener('ReaderAppeared', (deviceName) => {
//     Alert.alert('Reader Appeared', `Reader ${deviceName} has appeared. Attempting to connect...`);
//     handleConnectInternal(); // Try connecting automatically on appearance
//   });

//   return () => {
//     errorListener.remove();
//     readerAppearedListener.remove();
//   };
// }, []);

//   const handleConnectInternal = async () => {
//     setLoading(true);
//     const result = await SDKUtils.handleConnect();
//     console.log('Connect response:', result);

//     if (result?.success) {
//       setIsConnected(true);
//       Alert.alert(
//         'Connected Successfully',
//         `Connected to ${result.deviceName || 'device'}`
//       );
//     } else {
//       Alert.alert(
//         'Connection Failed',
//         result?.message || 'Failed to connect to the device'
//       );
//     }
//     setLoading(false);
//   };

//   const handleConnectButtonPress = () => {
//     handleConnectInternal();
//   };

//   const handleDisconnect = async () => {
//     setLoading(true);
//     try {
//       await RFIDControllerModule.disconnect();
//       setIsConnected(false);
//       Alert.alert('Disconnected', 'Device disconnected successfully.');
//     } catch (error: any) {
//       console.error('Disconnect error:', error);
//       Alert.alert('Disconnection Failed', error?.message || 'Failed to disconnect.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
//   }

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text style={{ marginBottom: 20 }}>{isConnected ? 'Connected' : 'Not Connected'}</Text>
//       {!isConnected && <Button title="Connect" onPress={handleConnectButtonPress} />}
//       {isConnected && <Button title="Disconnect" onPress={handleDisconnect} />}
//     </View>
//   );
// };

// export default InventoryScreen;