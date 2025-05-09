import React from 'react';
import { Button, Flex, Text } from '@ant-design/react-native';
import { ViewStyle } from 'react-native';
import globalStyles from '@styles/globalStyles';
import COLORS from "@assets/Components/Colors";


type CustomButtonProps = {
    onPress?: () => void;
    title?: string;
    style?: ViewStyle;
};

const CustomButton: React.FC<CustomButtonProps> = ({ onPress, title = 'Submit', style }) => {
    return (
        <Flex>
            <Button
                style={[globalStyles.btnComponent, style]}
                onPress={onPress}
            >
                <Text style={globalStyles.buttonText}>{title}</Text>
            </Button>
        </Flex>
    );
};

export default CustomButton;
