import React, { useEffect, useState } from 'react';
import { NativeModules } from 'react-native';
import { Text, View } from '@ant-design/react-native';
import styles from './styles';

const AppVersion: React.FC = () => {
  const [version, setVersion] = useState<string>('Loading...');

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const ver = await NativeModules.ZebraRFIDModule.getAppVersion();
        setVersion(ver);
      } catch (e) {
        console.error('Error getting app version:', e);
        setVersion('Unknown');
      }
    };

    fetchVersion();
  }, []);

  return (
    <View style={styles.appVersionContainer}>
      <Text style={styles.appVersionText}>Version {version}</Text>
    </View>
  );
};

export default AppVersion;
