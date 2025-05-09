// ReviewScreen.tsx
import React, { useEffect, useState } from 'react';
import { Text, Alert, } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import globalStyles from '@styles/globalStyles';
import HeaderComponent from '@assets/Components/HeaderComponent';
import { View, Flex, InputItem, WhiteSpace } from '@ant-design/react-native';
import SummaryCard from '@assets/Components/CustomCards';
import COLORS from '@assets/Components/Colors';
import { LongPressButton } from '@assets/Components/LongPressButton';
import { useFetch } from '@hooks/useFetch';



const ReviewScreen = ({ route }) => {
    const navigation = useNavigation();
    const { tag, selectedProduct, tETags, tMatched, tMissing, grandExpected, grandCurrent } = route.params;

    const totalExpectedTags = tETags;
    const totalMatched = tMatched;
    const totalMissing = tMissing;
    const totalMoved = 0;
    const expectedQty = grandExpected;
    const currentQty = grandCurrent;

    const onSubmit = () => {
        // const { data, status, error, refetch: createCycleCount, } = useFetch('/cycle-count', {
        //     method: 'POST',
        //     // body: UpdatedData,
        // }, false);
        // Alert.alert('Report submitted!', 'Thank you for completing the cycle count.');
        navigation.goBack();
    };

    return (
        <View style={[globalStyles.container, { paddingTop: 0 }]}>
            <HeaderComponent title="Review" />
            <View style={globalStyles.bodyContainer}>
                <Text style={globalStyles.cardTitle}>Tags</Text>
                <Flex>
                    <SummaryCard label="Total Tags Expected" value={totalExpectedTags} />
                    <SummaryCard label="Current Match" value={totalMatched} valueStyle={{ color: COLORS.success }} />
                </Flex>
                <Flex>
                    <SummaryCard label="New" value={totalMoved} valueStyle={{ color: COLORS.warning }} />
                    <SummaryCard label="Missing" value={totalMissing} valueStyle={{ color: COLORS.danger }} />
                </Flex>
                <WhiteSpace size="sm" />
                <Text style={globalStyles.cardTitle}>Quantity</Text>
                <View style={globalStyles.cardRow}>
                    <SummaryCard label="Total Quantity Expected" value={expectedQty} />
                    <SummaryCard label="Total Quantity Counted" value={currentQty} />
                </View>
                <WhiteSpace size="sm" />
                <Text style={globalStyles.cardTitle}>Comment</Text>
                <View style={[globalStyles.inputContainer, { maxHeight: 100 }]}>
                    <InputItem
                        placeholder="Enter comment"
                        placeholderTextColor="#000"
                        multiline
                        style={[globalStyles.input, { height: 50, paddingVertical: 8 }]}
                    />
                </View>
                <View style={{ flex: 1, justifyContent: "flex-end" }}>
                    <View style={{ flex: 1, justifyContent: 'flex-end', padding: 16 }}>
                        <LongPressButton
                            title="Hold to Submit Report"
                            onLongPress={onSubmit}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

export default ReviewScreen;


