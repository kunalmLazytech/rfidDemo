import React from 'react';
import { View, Image, Alert, FlatList, ListRenderItem } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import globalStyles from '@styles/globalStyles';
import { useFetch } from '@hooks/useFetch';
import ButtonCard from '@assets/Components/ButtonCard';
import { checkLocationPermission } from '@utils/permissions';
import styles from './style';

type RootStackParamList = {
  Tag: undefined;
  CycleCount: {
    screen: string;
    params: {
      preloadedAreas: any;
    };
  };
  InventoryScreen: undefined;
};

interface ButtonItem {
  icon: React.ReactElement;
  label: string;
  onPress: () => void;
}

const Inventory: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { data: preloadedAreas } = useFetch('zones/child/OP-d6628399-40b2-4c6a-b73c-9c8437d10f5c');

  const buttons: ButtonItem[] = [
    { icon: <Icon name="receipt" size={22} color="#003b71" />, label: 'Item Receipt', onPress: () => { } },
    {
      icon: <Icon name="label" size={24} color="#003b71" />,
      label: 'Tag Item',
      onPress: async () => {
        const granted = await checkLocationPermission();
        granted
          ? navigation.navigate('Tag')
          : Alert.alert('Permission Required', 'Location permission is required to tag an item.');
      },
    },
    {
      icon: <IonIcon name="refresh-circle-outline" size={22} color="#003b71" />,
      label: 'Cycle Count',
      onPress: () =>
        navigation.navigate('CycleCount', {
          screen: 'AreaScreen',
          params: { preloadedAreas: preloadedAreas },
        }),
    },
    { icon: <IonIcon name="map-outline" size={22} color="#003b71" />, label: 'Find Products', onPress: () => { } },
    { icon: <IonIcon name="search-outline" size={22} color="#003b71" />, label: 'Examine Tag', onPress: () => { } },
    {
      icon: <IonIcon name="refresh-circle-outline" size={22} color="#003b71" />,
      label: 'InventoryScreen',
      onPress: () => navigation.navigate('InventoryScreen'),
    },
  ];

  const renderItem: ListRenderItem<ButtonItem> = ({ item }) => <ButtonCard {...item} />;

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.logoContainer}>
        <Image source={require('@assets/h-logo.png')} style={globalStyles.logo} />
      </View>

      <FlatList
        data={buttons}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
};

export default Inventory;
