import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text, Flex, WhiteSpace, Button } from '@ant-design/react-native';
import globalStyles from "@styles/globalStyles";
import { SDKUtils } from "@modules/SDKUtils";
import { useDeviceInfo } from '@modules/RFIDConnectionContext';
import Icon from "react-native-vector-icons/MaterialIcons";
import IonIcon from "react-native-vector-icons/Ionicons";
import COLORS from "@assets/Components/Colors";

import ConnectionControlsWithBtn2 from '@modules/ConnectionControlsWithBtn2';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import { useFetch } from "@hooks/useFetch";
import { RFIDEvents } from "@modules/RFIDEvents";
import CustomSlider from "@assets/Components/CustomSlider";
import { ProgressCard } from '@assets/Components/ProgressCard';
import HeaderComponent from "@assets/Components/HeaderComponent";
import { useTags } from '../../../../context/TagsContext';

function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

function compareScannedEPCs(
  ProductData: Product[],
  scannedEPCs: string[]
): ScanResult[] {
  return ProductData.map(product => {
    const expectedQty = product.tags.length;
    const scannedQty = product.tags.filter(tag =>
      scannedEPCs.includes(tag.epc)
    ).length;
    const isGroupTag = expectedQty > 1;
    const icon = isGroupTag ? 'cubes' : 'cube';

    let color = COLORS.dark;
    if (scannedQty === expectedQty) {
      color = COLORS.success;
    } else if (scannedQty > 0 && scannedQty < expectedQty) {
      color = COLORS.warning;
    }
    return {
      sku: product.sku,
      skuName: product.skuName,
      expectedQty,
      scannedQty,
      isGroupTag,
      icon,
      color
    };
  });
}


const CycleCount = ({ route }) => {
  const navigation = useNavigation();
  const handleBack = () => navigation.goBack();
  const { deviceInfo, setDeviceInfo } = useDeviceInfo();
  const { selectedZoneLocation, selectedZoneAName, selectedZoneLName } =
    route.params;
  const [loading, setLoading] = useState(false);

  const { tags, addTags } = useTags();

  const { data, status, error } = useFetch(
    `products/zone/${selectedZoneLocation}`
  );
  const [showSlider, setShowSlider] = useState(false);



  useEffect(() => {
    const storeProductData = async () => {
      if (data && status === "success") {
        try {
          await AsyncStorage.setItem("productData", JSON.stringify(data));
        } catch (storageError) {
          console.error("❌ Failed to store product data:", storageError);
        }
      }
    };

    storeProductData();
  }, [data, status]);
  useEffect(() => {
    RFIDEvents.registerMultiTagDataListener((newTags: any[]) => {
      const formattedTags = newTags.map((t) => {
        const raw = t.tagId;
        const epc = raw.replace(/^0+/, '');
        return { epc, scannedAt: new Date().getTime() };
      });

      addTags(formattedTags);
    });

    return () => {
      RFIDEvents.removeRFIDListeners();
    };
  }, []);

  // console.log(data);
  // console.log(tags);

  const totalExpectedQty = data?.reduce(
    (sum, product) => sum + product.tags.length,
    0
  );
  const scannedCount = tags.length;
  const expectedCount = totalExpectedQty || 0;
  const progressPercent =
    expectedCount > 0
      ? Math.round(Math.min((scannedCount / expectedCount) * 100, 100))
      : 0;
  let progressColor = COLORS.danger;
  if (progressPercent >= 80) {
    progressColor = COLORS.success;
  } else if (progressPercent >= 50) {
    progressColor = COLORS.warning;
  }
  return (
    <View style={[globalStyles.container, { paddingTop: 0 }]}>
      <HeaderComponent title="Cycle Count" />
      <View style={globalStyles.titleContainer}>
        <View>
          <ConnectionControlsWithBtn2 />
          <TouchableOpacity onPress={() => setShowSlider((prev) => !prev)}>
            <Text style={{ color: "blue" }}>
              {showSlider ? "Hide Power Control" : "Show Power Control"}
            </Text>
          </TouchableOpacity>
          {showSlider && (
            <CustomSlider
              label="Power"
              min={0}
              max={270}
              initialValue={20}
              loading={loading}
              setLoading={setLoading}
            />
          )}
        </View>
      </View>
      <ProgressCard
        title="Item Scanned"
        onpressText={selectedZoneAName}
        progressPercent={progressPercent}
        total={expectedCount}
        found={scannedCount}
        progressColor={progressColor}
        subText={""}
      />
      <View style={{ flexDirection: "row" }}>
        <View
          style={[
            globalStyles.card,
            { flex: 1, flexDirection: "row", alignItems: "center" },
          ]}
        >
          <Icon
            name="u-turn-right"
            size={30}
            color={COLORS.primary}
            style={{
              transform: [{ rotate: "270deg" }],
            }}
          />
          <View
            style={{ flex: 1, flexDirection: "column", alignItems: "center" }}
          >
            <Text>Move</Text>
            <Text style={{ fontSize: 20, fontWeight: 500 }}>5</Text>
          </View>
          <View>
            <Icon name="chevron-right" size={28} color="#000" />
          </View>
        </View>
        <View
          style={[
            globalStyles.card,
            { flex: 1, flexDirection: "row", alignItems: "center" },
          ]}
        >
          <Icon name="new-releases" size={30} color={COLORS.primary} />
          <Icon name="" size={28} color="#000" />
          <View
            style={{ flex: 1, flexDirection: "column", alignItems: "center" }}
          >
            <Text>New</Text>
            <Text style={{ fontSize: 20, fontWeight: 500 }}>5</Text>
          </View>
          <View>
            <Icon name="chevron-right" size={28} color="#000" />
          </View>
        </View>
      </View>
      <ScrollView>
        <View style={globalStyles.containerCard}>
          <View
            style={[globalStyles.labelRow, { justifyContent: "flex-start" }]}
          >
            <Text style={globalStyles.labelSm}>Recent Scans</Text>
          </View>
          {tags.map((item) => (
            <View key={item.epc} style={globalStyles.rowCenter}>
              <IonIcon name="checkmark-circle" size={20} color="green" />
              <View
                style={[
                  globalStyles.rowCenter,
                  {
                    width: "90%",
                    justifyContent: "space-between",
                    paddingVertical: 8,
                  },
                ]}
              >
                <Text style={globalStyles.labelMarginLeft12}>
                  {item.epc}
                </Text>
                <Text
                  style={[globalStyles.labelSm, { color: COLORS.secondary }]}
                >
                  {getRelativeTime(item.scannedAt)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <Flex>
        <Button
          style={{
            flex: 1,
            borderRadius: 10,
            borderWidth: 0,
            marginTop: 5,
            marginBottom: 15,
            marginHorizontal: 15,
            backgroundColor: COLORS.success,
          }}
          onPress={() => navigation.navigate("CycleCountDetails", {
            selectedZoneAName: selectedZoneAName
          })}
        >
          <Text style={globalStyles.buttonText}>submit</Text>
        </Button>
      </Flex>
    </View >
  );
}

export default CycleCount;
