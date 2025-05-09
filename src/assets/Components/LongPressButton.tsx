import React, { useRef } from 'react';
import { Pressable, Animated, Text } from 'react-native';
import COLORS from '@assets/Components/Colors';
import globalStyles from '@styles/globalStyles';

interface LongPressButtonProps {
    onLongPress: () => void;
    title: string;
}

/**
 * A button that:
 *  • springs down a bit on press‐in
 *  • springs back on press‐out
 *  • only triggers onLongPress after 500ms
 */
export const LongPressButton: React.FC<LongPressButtonProps> = ({
    onLongPress,
    title,
}) => {
    const scale = useRef(new Animated.Value(1)).current;

    const animatePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.95,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    const animatePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <Pressable
                onPressIn={animatePressIn}
                onPressOut={animatePressOut}
                onLongPress={onLongPress}
                delayLongPress={500}
                style={({ pressed }) => [
                    // globalStyles.button,
                    {
                        backgroundColor: pressed ? COLORS.gray : COLORS.success,
                        paddingVertical: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                    },
                ]}
            >
                <Text style={[globalStyles.buttonText, { color: '#fff' }]}>
                    {title}
                </Text>
            </Pressable>
        </Animated.View>
    );
};
