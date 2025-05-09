import React, { useCallback } from 'react';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LocationScreen'>;
type RoutePropType = RouteProp<RootStackParamList, 'LocationScreen'>;

const LocationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { selectedZoneArea, selectedZoneName } = route.params;

  const { data, status, error } = useFetch<Area[]>(`zones/child/${selectedZoneArea}`);

  const handleBack = () => navigation.goBack();

  const handleLocationPress = useCallback((zoneId: string, name: string) => {
    navigation.navigate('CycleCount', {
      selectedZoneLocation: zoneId,
      selectedZoneAName: selectedZoneName,
      selectedZoneLName: name,
    });
  }, [navigation, selectedZoneName]);

  const renderItem = useCallback(({ item }: { item: Area }) => (
    <AreaListItem name={item.name} onPress={() => handleLocationPress(item.zoneId, item.name)} />
  ), [handleLocationPress]);

  return (
    <View style={[globalStyles.container, styles.container]}>
      <HeaderComponent title={selectedZoneName} />
      <View style={globalStyles.titleContainer}>
        <Text style={globalStyles.titleText}>Select Location</Text>
      </View>

      {status === 'loading' ? (
        <View style={globalStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#1890ff" />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>Failed to load data.</Text>
      ) : (
        <FlatList
          data={data || []}
          keyExtractor={(item) => item.zoneId}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>No locations available.</Text>}
        />
      )}
    </View>
  );
};

export default LocationScreen;
