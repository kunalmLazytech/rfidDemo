import React from 'react';
import { View } from 'react-native';
import { Text } from '@ant-design/react-native';
import globalStyles from '@styles/globalStyles';
import styles from './styles';

interface Props {
  connected: boolean;
}

const StatusIndicator: React.FC<Props> = ({ connected }) => (
  <View style={globalStyles.rowCenter}>
    <View
      style={[
        globalStyles.statusDot,
        connected ? globalStyles.connected : globalStyles.disconnected,
      ]}
    />
    <Text
      style={[
        globalStyles.labelMarginLeft12,
        styles.statusText,
        connected ? styles.connectedText : styles.disconnectedText,
      ]}
    >
      {connected ? 'Connected' : 'Disconnected'}
    </Text>
  </View>
);

export default StatusIndicator;
