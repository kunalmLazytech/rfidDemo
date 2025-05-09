import React, { useState, useCallback, useMemo } from 'react';
import { FlatList, ListRenderItem, Alert } from 'react-native';
import { Text, View, Button, Flex, InputItem } from '@ant-design/react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import globalStyles from '@styles/globalStyles';
import styles from './style';
import QuantityStatusRow from '@assets/Components/QuantityStatusRow';
import { Picker } from '@react-native-picker/picker';
import CustomButton from '@assets/Components/CustomButton';
import { useTags } from '../../../../context/TagsContext';
import { normalizeEPC } from '@utils/tagUtils';

type Field = {
    quantity: string;
    status: string;
    _key?: string;
};

type QuantityScreenRouteParams = {
    params: {
        item: {
            id: string;
        },
    };
};


const convertUpdatesToQuantities = (
    updates: { status: string; quantity: number }[]
) => {
    const defaultQuantities = {
        qtyUsable: 0,
        qtyRepairable: 0,
        qtyDamaged: 0,
        qtyCorroded: 0,
        qtyExpired: 0,
        qtyMissing: 0,
        qtyObsolete: 0,
    };

    const statusMapping: Record<string, keyof typeof defaultQuantities> = {
        Usable: 'qtyUsable',
        Repaired: 'qtyRepairable',
        Damaged: 'qtyDamaged',
        Corroded: 'qtyCorroded',
        Expired: 'qtyExpired',
        Missing: 'qtyMissing',
        Obsolete: 'qtyObsolete',
    };

    const result = { ...defaultQuantities };

    updates.forEach(update => {
        const key = statusMapping[update.status];
        if (key) result[key] += update.quantity;
    });

    return result;
};

const generateKey = () => `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const QuantityScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<QuantityScreenRouteParams, 'params'>>();
    const { item } = route.params;
    const { tags, setTags, addTags } = useTags();
    const extractFieldsFromItem = (item): Field[] => {
        const statusMap = {
            qtyUsable: 'Usable',
            qtyCorroded: 'Corroded',
            qtyRepairable: 'Repaired',
            qtyExpired: 'Expired',
            qtyObsolete: 'Obsolete',
            qtyDamaged: 'Damaged',
        };

        const fields: Field[] = [];
        Object.entries(statusMap).forEach(([key, status]) => {
            const quantity = item[key];
            if (quantity && quantity > 0) {
                fields.push({
                    quantity: quantity.toString(),
                    status,
                    _key: generateKey(),
                });
            }
        });

        return fields.length > 0
            ? fields
            : [{ quantity: '', status: 'Select', _key: generateKey() }];
    };

    const matchingTag = useMemo(
        () => tags.find(t => normalizeEPC(t.epc) === normalizeEPC(item.epc)),
        [tags, item.epc]
    );

    const initialFields = useMemo(() => {
        const source =
            matchingTag && matchingTag.updatedAt ? matchingTag : item;
        return extractFieldsFromItem(source);
    }, [matchingTag, item]);
    const [fields, setFields] = useState<Field[]>(initialFields);
    // const [fields, setFields] = useState<Field[]>(extractFieldsFromItem(item));
    const statuses = ['Usable', 'Corroded', 'Repaired', 'Expired', 'Obsolete', 'Damaged', 'Missing'];
    const handleBack = () => navigation.goBack();

    const handleAddMore = () => {
        setFields(prev => [
            ...prev,
            { quantity: '', status: 'Select', _key: generateKey() },
        ]);
    };

    const handleRemove = (index: number) => {
        setFields(prev =>
            prev.length > 1
                ? prev.filter((_, i) => i !== index)
                : [{ quantity: '', status: 'Select', _key: generateKey() }]
        );
    };

    const handleChange = useCallback(
        (index: number, key: keyof Field, value: string) => {
            setFields(prevFields => {
                const updated = [...prevFields];
                updated[index] = { ...updated[index], [key]: value };
                return updated;
            });
        },
        []
    );

    const handleSave = () => {
        const validFields = fields.filter(
            f => f.quantity && f.status && f.status !== 'Select'
        );

        if (validFields.length === 0) {
            Alert.alert('Please enter at least one valid quantity and status.');
            return;
        }

        const updates = validFields.map(f => ({
            status: f.status,
            quantity: parseInt(f.quantity, 10),
        }));

        const qtyFields = convertUpdatesToQuantities(updates);

        const updatedTags = tags.map(tag => {

            const tagKey = normalizeEPC(tag.epc);
            const itemKey = normalizeEPC(item.epc);

            if (tagKey === itemKey) {
                return {
                    ...tag,
                    ...qtyFields,
                    updatedAt: new Date().toISOString(),
                };
            }
            return tag;
        });

        setTags(updatedTags);
        navigation.goBack();
    };

    const renderItem: ListRenderItem<Field> = useCallback(
        ({ item: field, index }) => (
            <View>
                <IonIcon
                    onPress={() => handleRemove(index)}
                    style={globalStyles.closeButton}
                    name="close"
                    size={18}
                    color="#fff"
                />
                <QuantityStatusRow
                    index={index}
                    field={field}
                    onChange={handleChange}
                    statuses={statuses}
                />
            </View>
        ),
        [handleChange]
    );

    // Footer for adding more or saving
    const renderFooter = () => (
        <Flex style={styles.footerButtons}>
            <Button style={[globalStyles.addMore, styles.addButton]} onPress={handleAddMore}>
                <Flex>
                    <IonIcon name="add-outline" size={18} />
                    <Text style={styles.iconText}>Add</Text>
                </Flex>
            </Button>
            <CustomButton title="Save" onPress={handleSave} />
        </Flex>
    );

    return (
        <View style={[globalStyles.container, styles.container]}>
            <View style={globalStyles.header}>
                <Icon
                    style={globalStyles.backButton}
                    onPress={handleBack}
                    name="chevron-left"
                    size={28}
                    color="#fff"
                />
                <Text style={globalStyles.headerLabel}>{item.epc}</Text>
            </View>

            <View style={[globalStyles.containerCard, styles.cardContainer]}>
                <FlatList
                    data={fields}
                    keyExtractor={(item) => item._key || Math.random().toString()}
                    renderItem={renderItem}
                    ListFooterComponent={renderFooter}
                    contentContainerStyle={styles.contentContainer}
                />
            </View>
        </View>
    );
};

export default QuantityScreen;
