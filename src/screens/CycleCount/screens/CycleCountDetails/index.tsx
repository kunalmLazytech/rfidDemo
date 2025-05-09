import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { Text, Flex, WhiteSpace } from '@ant-design/react-native';
import globalStyles from "@styles/globalStyles";
import { SDKUtils } from "@modules/SDKUtils";
import { useDeviceInfo } from '@modules/RFIDConnectionContext';
import Icon from "react-native-vector-icons/MaterialIcons";
import IonIcon from "react-native-vector-icons/Ionicons";
import FAIcon from "react-native-vector-icons/FontAwesome";
import COLORS from "@assets/Components/Colors";

import ConnectionControlsWithBtn2 from '@modules/ConnectionControlsWithBtn2';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MockData } from "@assets/Components/MockData";
import { useNavigation } from '@react-navigation/native';
import { ProgressCard } from "@assets/Components/ProgressCard";
import HeaderComponent from './../../../../assets/Components/HeaderComponent';
import { useTags } from '../../../../context/TagsContext';
import { compareWithProduct } from "@utils/tagUtils";







const CycleCountDetails = ({ route }) => {
    const navigation = useNavigation();
    const { selectedZoneAName } = route.params;
    const { tags } = useTags();
    const { deviceInfo, setDeviceInfo } = useDeviceInfo();
    const [productData, setProductData] = useState<Product[]>([]);
    const [scanResults, setScanResults] = useState<ScanResult[]>([]);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                const storedData = await AsyncStorage.getItem("productData");
                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    setProductData(parsedData);
                    const scannedEPCs = tags.map((tag) => tag.epc);
                    const results = compareWithProduct(parsedData, scannedEPCs);
                    setScanResults(results);
                    console.log(results);
                }
            } catch (error) {
                console.error("❌ Failed to load product data:", error);
            }
        };

        fetchProductData();
    }, [tags]); // ✅ react to changes in context

    const totalExpectedQty = scanResults.reduce((sum, item) => sum + item.expectedQty, 0);
    const totalScannedQty = scanResults.reduce((sum, item) => sum + item.scannedQty, 0);
    const progressPercent = totalExpectedQty > 0
        ? Math.round(Math.min((totalScannedQty / totalExpectedQty) * 100, 100))
        : 0;
    let progressColor = COLORS.danger;
    if (progressPercent >= 80) {
        progressColor = COLORS.success;
    } else if (progressPercent >= 50) {
        progressColor = COLORS.warning;
    }

    return (
        <View style={[globalStyles.container, { paddingTop: 0 }]}>
            <HeaderComponent title="Cycle Count Details" />
            <View style={globalStyles.titleContainer}>
                <ConnectionControlsWithBtn2 />
            </View>
            <ProgressCard
                title="Item Audited"
                onpressText={selectedZoneAName}
                progressPercent={progressPercent}
                total={totalExpectedQty}
                found={totalScannedQty}
                progressColor={progressColor}
                subText={""}
            />
            {/* table */}
            <Flex style={globalStyles.table}>
                <Flex.Item><Text style={globalStyles.thead}>Item</Text></Flex.Item>
                <Flex.Item><Text style={globalStyles.thead}>Current/Expected</Text></Flex.Item>
            </Flex>
            <WhiteSpace size="sm" />
            {/* table.body */}
            <FlatList
                data={scanResults}
                keyExtractor={(item, index) => item.sku + index}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate("ItemDetailScreen", {
                            selectedProduct: item.skuName,
                            selectedZoneAName
                        })}
                    >
                        <Flex align="center" style={globalStyles.row}>
                            <Icon name="fiber-manual-record" size={14} color={item.color} />
                            <View style={{ width: "45%", alignItems: "flex-start", marginLeft: 10 }}>
                                <Text>{item.skuName}</Text>
                                <Text style={[globalStyles.rowItem, { color: COLORS.secondary }]}>
                                    {item.sku}
                                </Text>
                            </View>
                            <FAIcon name={item.icon} size={20} color="gray" />
                            <Text style={[globalStyles.rowItem, { color: item.color }]}>
                                {item.scannedQty}/{item.expectedQty}
                            </Text>
                            <IonIcon name="chevron-forward" size={20} color="gray" />
                        </Flex>
                    </TouchableOpacity>
                )}
                contentContainerStyle={globalStyles.tbody}
                ListEmptyComponent={
                    <Text style={globalStyles.labelSm}>No items scanned yet.</Text>
                }
            />
        </View >
    );
};

export default CycleCountDetails;
