import React, { useEffect, useState } from "react";
import { FlatList, TouchableOpacity, Alert } from "react-native";
import { Text, View, Flex, WhiteSpace } from '@ant-design/react-native';
import globalStyles from "@styles/globalStyles";
import Icon from "react-native-vector-icons/MaterialIcons";
import IonIcon from "react-native-vector-icons/Ionicons";
import FAIcon from "react-native-vector-icons/FontAwesome";
import COLORS from "@assets/Components/Colors";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProgressCard } from "@assets/Components/ProgressCard";
import HeaderComponent from "@assets/Components/HeaderComponent";
import { useTags } from "context/TagsContext";
import { compareWithTags, computeScannedThisTag, getTagTotalQuantity, normalizeEPC, Tag } from '@utils/tagUtils';
import CustomButton from '@assets/Components/CustomButton';
import { useFetch } from '@hooks/useFetch';
import { MockData } from '@assets/Components/MockData';

const ItemDetailScreen = ({ route }) => {
    const navigation = useNavigation();
    const { selectedProduct, selectedZoneAName } = route.params;
    const { tags } = useTags();
    const [selectedData, setSelectedData] = useState<Product | null>(null);
    const [scanResults, setScanResults] = useState<ScanResult[]>([]);
    const [grandExpected, setGrandExpected] = useState(0);
    const [grandCurrent, setGrandCurrent] = useState(0);
    const [scannedEPCs, setScannedEPCs] = useState<string[]>([]);



    const [totalExpectedTags, setTotalExpectedTags] = useState(0);
    const [totalMatched, setTotalMatched] = useState(0);
    const [totalMissing, setTotalMissing] = useState(0);


    useEffect(() => {
        const loadData = async () => {
            const storedData = await AsyncStorage.getItem("productData");
            if (!storedData) return;
            const parsedData: Product[] = JSON.parse(storedData);
            // const parsedData: Product[] = MockData; //mockData
            const product = parsedData.find((p) => p.skuName === selectedProduct);
            if (!product) return;
            setSelectedData(product);
            const epcs = tags.map((t: any) => t.epc);
            setScannedEPCs(epcs);
            let expectedQty = 0;
            let currentQty = 0;

            const scanMap = new Map<string, Tag>();
            tags.forEach(entry => {
                const key = normalizeEPC(entry.epc);
                scanMap.set(key, entry);
            });





            const totalExpectedTags = product.tags.length;
            let totalMatchedCount = 0;
            let totalMissingCount = 0;
            setTotalExpectedTags(product.tags.length);

            product.tags.forEach((tag) => {
                const isFound = tags.find(t => normalizeEPC(t.epc) === normalizeEPC(tag.epc));
                if (isFound) {
                    totalMatchedCount += 1;
                } else {
                    totalMissingCount += 1;
                }
                const tagTotalQty = getTagTotalQuantity(tag);
                expectedQty += tagTotalQty;
                const scanEntry = tags.find(t => normalizeEPC(t.epc) === normalizeEPC(tag.epc));
                const scannedThisTag = computeScannedThisTag(scanEntry, tagTotalQty);
                currentQty += scannedThisTag;
            });
            setGrandExpected(expectedQty);
            setGrandCurrent(currentQty);
            setTotalMatched(totalMatchedCount);
            setTotalMissing(totalMissingCount);
            // console.log("Expected:", totalExpectedTags);
            // console.log("Matched:", totalMatched);
            // console.log("Missing:", totalMissing);
        };
        loadData();
    }, [selectedProduct, tags]);





    // console.log(tags);

    const payload = { tags };
    const {
        data,
        status,
        error,
        refetch: createCycleCount,
    } = useFetch('/cycle-count', {
        method: 'POST',
        body: payload,
    }, false);

    const handleCreateCycleCount = async () => {
        navigation.navigate('ReviewScreen', {
            tag: tags,
            selectedProduct: selectedData,
            tETags: totalExpectedTags,
            tMatched: totalMatched,
            tMissing: totalMissing,
            grandExpected: grandExpected,
            grandCurrent: grandCurrent,
        });


        // await createCycleCount();

        // if (status === 'success') {
        //     Alert.alert('Success', 'Cycle count created successfully!');
        // } else if (status === 'error') {
        //     // console.log(tags);
        //     Alert.alert('Error', error?.message || 'Failed to create cycle count');
        // }
    };

    const ProgressPercent = grandExpected > 0 ? Math.round((grandCurrent / grandExpected) * 100) : 0
    let ProgressColor = COLORS.danger;
    if (ProgressPercent >= 80) {
        ProgressColor = COLORS.success;
    } else if (ProgressPercent >= 50) {
        ProgressColor = COLORS.warning;
    }

    return (
        <View style={[globalStyles.container, { paddingTop: 0 }]}>
            <HeaderComponent title="Item Details" />
            <ProgressCard
                title={selectedData?.skuName}
                onpressText={selectedZoneAName}
                progressPercent={ProgressPercent}
                found={grandCurrent}
                total={grandExpected}
                progressColor={ProgressColor}
                subText={"Quantities Audited"}
            />
            <Flex style={globalStyles.table}>
                <Flex.Item><Text style={globalStyles.thead}>EPC Number</Text></Flex.Item>
                <Flex.Item><Text style={globalStyles.thead}>Current/Expected</Text></Flex.Item>
            </Flex>
            <WhiteSpace size="sm" />
            <FlatList
                data={selectedData?.tags || []}
                keyExtractor={(item, index) => item.epc + index}
                renderItem={({ item }) => {
                    const result = compareWithTags(item, tags, selectedData);
                    return (
                        <TouchableOpacity
                            disabled={!result.tagMatched}
                            onPress={() =>
                                result.tagMatched && navigation.navigate("QuantityScreen", { item })
                            }
                        >
                            <Flex align="center" style={globalStyles.row}>
                                <FAIcon name={result.iconName} size={20} color={result.color} />
                                <View style={{ width: "40%", marginLeft: 10 }}>
                                    <Text style={globalStyles.rowItem}>{item.epc}</Text>
                                </View>
                                <FAIcon name={result.icon} size={20} color="gray" />
                                <Text style={[globalStyles.rowItem, { color: result.groupColor }]}>
                                    {result.displayScanned} / {result.displayTotal}
                                </Text>
                                <IonIcon
                                    name="chevron-forward"
                                    size={20}
                                    color={COLORS.gray}
                                    style={{ opacity: result.tagMatched ? 1 : 0 }}
                                />
                            </Flex>
                        </TouchableOpacity>
                    );
                }}
                contentContainerStyle={globalStyles.tbody}
            />
            <CustomButton title="Save" onPress={handleCreateCycleCount} style={{ marginHorizontal: 10 }} />
        </View>
    );
};

export default ItemDetailScreen;
