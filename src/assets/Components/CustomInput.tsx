import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { InputItem, Button, Flex } from '@ant-design/react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import globalStyles from '@styles/globalStyles';
import styles from './styles';

export interface SuggestionItem {
  skuName: string;
  sku: string;
  [key: string]: any;
}

export interface CustomInputProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  scanId?: string;
  suggestions?: SuggestionItem[];
  isInput2?: boolean;
  isEditable?: boolean;
  onScan?: (scanId: string) => void;
  onSubmitEditing?: () => void;
  onSuggestionSelect?: (item: SuggestionItem) => void;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  value,
  onChange,
  scanId,
  suggestions = [],
  isInput2 = false,
  isEditable = true,
  onScan,
  onSubmitEditing,
  onSuggestionSelect,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.customInputContainer}>
      <Text style={globalStyles.labelSmLeft}>{label}</Text>
      <View style={globalStyles.rowCenter}>
        <View style={globalStyles.inputContainer}>
          <InputItem
            style={globalStyles.input}
            value={value}
            onChange={onChange}
            onFocus={() => isInput2 && setFocused(true)}
            placeholder="Type here..."
            placeholderTextColor="#000"
            editable={isEditable}
            onSubmitEditing={() => onSubmitEditing && onSubmitEditing()}
          />
        </View>

        {isInput2 && focused && suggestions.length > 0 && (
          <ScrollView
            style={styles.suggestionBox}
            nestedScrollEnabled
            keyboardShouldPersistTaps="always"
          >
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => {
                  console.log('Tapped suggestion:', item.skuName);
                  onChange(item.skuName);
                  if (onSuggestionSelect) onSuggestionSelect(item);
                  setFocused(false); // now hide
                }}
              >
                <Text>{item.skuName}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {scanId && onScan && (
          <Button
            style={[globalStyles.btn, { marginLeft: 10 }]}
            onPress={() => onScan(scanId)}
            disabled={!isEditable}
          >
            <Flex>
              <IonIcon name="search" size={18} color="white" />
              <Text style={globalStyles.btnText}>Scan</Text>
            </Flex>
          </Button>
        )}
      </View>
    </View>
  );
};

export default CustomInput;
