// src\assets\Components\CustomCards.tsx


// src/assets/Components/SummaryCard.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import COLORS from './Colors';

interface SummaryCardProps {
    label: string;
    value: string | number;
    containerStyle?: ViewStyle;
    labelStyle?: TextStyle;
    valueStyle?: TextStyle;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
    label,
    value,
    containerStyle,
    labelStyle,
    valueStyle,
}) => {
    return (
        <View style={[styles.card, containerStyle]}>
            <Text style={[styles.label, labelStyle]} numberOfLines={1}>
                {label}
            </Text>
            <Text style={[styles.value, valueStyle]}>{value}</Text>
        </View>
    );
};

export default SummaryCard;

const styles = StyleSheet.create({
    card: {
        flex: 1,
        margin: 4,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        minWidth: 100,
        backgroundColor: COLORS.white,
        padding: 16,
        borderColor: COLORS.gray,
        shadowColor: COLORS.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    label: { fontSize: 13, color: COLORS.dark },
    value: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
});
