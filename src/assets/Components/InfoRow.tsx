import React from 'react';
import { View } from 'react-native';
import { List } from '@ant-design/react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import globalStyles from '@styles/globalStyles';
import { Text } from '@ant-design/react-native';

interface InfoRowProps {
    icon: string;
    label: string;
    extra?: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, extra }) => (
    <List.Item extra={extra}>
        <View style={globalStyles.rowCenter}>
            <Icon name={icon} size={20} color="#666" />
            <Text style={globalStyles.labelMarginLeft12}>{label}</Text>
        </View>
    </List.Item>
);

export default InfoRow;
