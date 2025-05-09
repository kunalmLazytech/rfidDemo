import React from 'react';
import { View } from 'react-native';
import { List, Text } from '@ant-design/react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import styles from '@styles/globalStyles';

interface Props {
  name: string;
  onPress: () => void;
}

const AreaListItem = React.memo(({ name, onPress }: Props) => (
  <List.Item
    onPress={onPress}
    extra={<Icon name="chevron-right" size={20} color="#666" />}
  >
    <View style={styles.rowCenter}>
      <Text style={styles.labelMarginLeft12}>{name}</Text>
    </View>
  </List.Item>
));

export default AreaListItem;
