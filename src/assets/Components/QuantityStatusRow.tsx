import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { InputItem } from '@ant-design/react-native';
import globalStyles from '@styles/globalStyles';
import styles from './styles';

type QuantityStatusRowProps = {
  index: number;
  field: {
    quantity: string;
    status: string;
  };
  onChange: (index: number, key: 'quantity' | 'status', value: string) => void;
  statuses: string[];
};

const QuantityStatusRow: React.FC<QuantityStatusRowProps> = ({
  index,
  field,
  onChange,
  statuses,
}) => {
  return (
    <View style={styles.row}>
      <View style={styles.quantityContainer}>
        <Text style={globalStyles.labelSmLeft}>Quantity</Text>
        <View style={[globalStyles.inputContainer, styles.inputContainerFlexReset]}>
          <InputItem
            value={field.quantity}
            onChangeText={(text: string) => onChange(index, 'quantity', text)}
            placeholder="e.g. 10"
            type="number"
            placeholderTextColor="#000"
            style={globalStyles.input}
          />
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Text style={globalStyles.labelSmLeft}>Status</Text>
        <View style={globalStyles.dropDownContainer}>
          <Picker
            selectedValue={field.status}
            style={styles.picker}
            onValueChange={(val: string) => onChange(index, 'status', val)}
          >
            <Picker.Item label="Select" value="Select" />
            {statuses.map((status) => (
              <Picker.Item key={status} label={status} value={status} />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
};

export default memo(QuantityStatusRow);
