import React from 'react';
import { View } from 'react-native';
import { Progress, Text } from '@ant-design/react-native';
import styles from './styles';

interface Props {
  level: number;
}

const BatteryLevel: React.FC<Props> = ({ level }) => (
  <View style={styles.container}>
    <Progress
      percent={level}
      position="normal"
      unfilled={false}
      style={styles.progress}
      barStyle={styles.bar}
    />
    <Text style={styles.text}>{level}%</Text>
  </View>
);

export default BatteryLevel;
