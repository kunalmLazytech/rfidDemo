import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Text } from '@ant-design/react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useFetch } from '@hooks/useFetch';
import globalStyles from '@styles/globalStyles';
import styles from './styles';
import AreaListItem from '@assets/Components/AreaListItem';
import type { RootStackParamList, Area } from '@navigation/types';
import HeaderComponent from '@assets/Components/HeaderComponent';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AreaScreen'>;
type RoutePropType = RouteProp<RootStackParamList, 'AreaScreen'>;

const AreaScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const preloadedAreas = route?.params?.preloadedAreas;
  const [areas, setAreas] = useState<Area[]>(preloadedAreas || []);

  const { data: freshData, status, error } = useFetch<Area[]>('zones/child/OP-d6628399-40b2-4c6a-b73c-9c8437d10f5c');

  const handleBack = () => navigation.goBack();

  useEffect(() => {
    if (freshData && JSON.stringify(freshData) !== JSON.stringify(preloadedAreas)) {
      setAreas(freshData);
    }
  }, [freshData]);

  const handleAreaPress = useCallback((zoneId: string, name: string) => {
    navigation.navigate('LocationScreen', {
      selectedZoneArea: zoneId,
      selectedZoneName: name,
      preloadedLocations: null,
    });
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: Area }) => (
    <AreaListItem name={item.name} onPress={() => handleAreaPress(item.zoneId, item.name)} />
  ), [handleAreaPress]);

  return (
    <View style={[globalStyles.container, styles.container]}>
      <HeaderComponent title="Cycle Count" />

      <View style={globalStyles.titleContainer}>
        <Text style={globalStyles.titleText}>Select Area</Text>
      </View>

      {status === 'loading' && !preloadedAreas ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1890ff" />
        </View>
      ) : error && !areas.length ? (
        <Text style={styles.errorText}>Failed to load data.</Text>
      ) : areas.length > 0 ? (
        <FlatList
          data={areas}
          keyExtractor={(item) => item.zoneId}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.emptyText}>No Area available.</Text>
      )}
    </View>
  );
};

export default AreaScreen;
