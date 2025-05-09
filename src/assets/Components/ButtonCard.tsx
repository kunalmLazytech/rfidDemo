import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text, View } from '@ant-design/react-native';
import globalStyles from '@styles/globalStyles';

interface ButtonCardProps {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    disabled?: boolean;
}

const ButtonCard: React.FC<ButtonCardProps> = ({ icon, label, onPress, disabled = false }) => (
    <TouchableOpacity
        style={globalStyles.buttonCard}
        onPress={onPress}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
    >
        <View style={globalStyles.cardBody}>
            <View style={globalStyles.iconWrapper}>{icon}</View>
            <Text style={globalStyles.labelSm}>{label}</Text>
        </View>
    </TouchableOpacity>
);

export default ButtonCard;
