import React from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import styles from './styles';

interface Props {
  children: React.ReactNode;
  isEditable: boolean;
}

const DisabledWrapper: React.FC<Props> = ({ children, isEditable }) => {
  if (isEditable) return children;

  const showEPCWarning = () => {
    showMessage({
      message: 'Please select your EPC number first!',
      type: 'warning',
      duration: 2500,
      icon: 'auto',
    });
  };

  return (
    <TouchableWithoutFeedback onPress={showEPCWarning}>
      <View pointerEvents="box-only" style={styles.disabledView}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default DisabledWrapper;
