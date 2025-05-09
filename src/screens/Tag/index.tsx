import React, { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { InputItem, Text, View, Button, Flex, WhiteSpace } from '@ant-design/react-native';
import { API, xtenantId } from '../../../app.json';
import CustomSlider from '@assets/Components/CustomSlider';
import { RFIDEvents } from '@modules/RFIDEvents';
import globalStyles from '@styles/globalStyles';
import { useDeviceInfo } from '@modules/RFIDConnectionContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DisabledWrapper from '@assets/Components/DisabledWrapper';
import { useNavigation } from '@react-navigation/native';
import CustomInput, { SuggestionItem } from '@assets/Components/CustomInput';
import HeaderComponent from '@assets/Components/HeaderComponent';

const Tag = () => {
  const navigation = useNavigation();
  const [selectedOption, setSelectedOption] = useState('Inventory');
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');
  const [comment, setComment] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Select');
  const [selectedStatus, setSelectedStatus] = useState('Select');
  const [TriggerPressed, setTriggerPressed] = useState('');
  const [selectedSku, setSelectedSku] = useState('');
  const [tags, setTags] = useState([]);
  const [fields, setFields] = useState([{ quantity: '', status: 'Select' }]);
  const { deviceInfo, setDeviceInfo } = useDeviceInfo();
  const [loading, setLoading] = useState(false);
  const [isMissing, setIsMissing] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [zones, setZones] = useState([]);
  const [defaultLocation, setDefaultLocation] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const debounceRef = useRef(null);
  const [isInput2Focused, setIsInput2Focused] = useState(false);


  const statuses = ['Usable', 'Corroded', 'Repaired', 'Expired', 'Obsolete', 'Damaged'];


  // Geolocation
  useEffect(() => {
    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        const latStr = latitude.toFixed(6);
        const longStr = longitude.toFixed(6);
        setInput3(`${latStr},${longStr}`);

        try {
          const token = await AsyncStorage.getItem('accessToken');
          const response = await fetch(
            `https://mvp-api.scatterlink.com/api/zones/resolve-zone?lat=${latStr}&long=${longStr}`,
            // `https://mvp-api.scatterlink.com/api/zones/resolve-zone?lat=19.138680775147572&long=72.83690324068991`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'x-tenant-id': xtenantId,
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch zone data');
          }

          const data = await response.json();
          setZones(data.zones || []);
          if (data.defaultSelected?.zoneId) {
            setZoneId(data.defaultSelected?.zoneId); // ✅ Set the zone ID
            console.log('Resolved zone ID:', zoneId); // 🔍 Log directly from data
          }

          if (data.defaultSelected?.pathNames?.length) {
            const defaultPath = data.defaultSelected.pathNames.join(' / ');
            setDefaultLocation(defaultPath);
            setSelectedLocation(defaultPath);
          }

        } catch (err) {
          console.error('Zone fetch error:', err);
          Alert.alert('Error fetching location zones');
        }
      },
      error => {
        console.log('Location error:', error);
        Alert.alert('Unable to fetch location');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  }, []);

  useEffect(() => {
    RFIDEvents.registerTagDataListener(tag => {
      setTags([tag]);
      setInput1(tag.tagId);
    });

    RFIDEvents.registerTriggerListener(pressed => {
      setTags([]);
      setInput1('');
      setTriggerPressed(pressed);
    });

    const bluetoothSub = RFIDEvents.addBluetoothStateListener(state => {
      console.log('Bluetooth state changed:', state);
    });

    return () => {
      RFIDEvents.removeRFIDListeners();
      RFIDEvents.removeListener(bluetoothSub);
    };
  }, []);

  const handleScan = field => console.log(`Scan for ${field}`);

  const handleAddMore = () => {
    const usedStatuses = fields.map(f => f.status);
    const availableStatuses = statuses.filter(s => !usedStatuses.includes(s));
    if (availableStatuses.length === 0) {
      Alert.alert('All statuses used', 'You cannot add more statuses.');
      return;
    }
    setFields([...fields, { quantity: '', status: 'Select' }]);
  };

  const handleChange = (index, key, value) => {
    if (key === 'quantity') {
      const numericValue = value.replace(/[^0-9]/g, '');
      value = numericValue;
    }

    if (key === 'status') {
      const isDuplicate = fields.some((f, i) => f.status === value && i !== index);
      if (isDuplicate) {
        Alert.alert('Duplicate Status', 'This status is already used in another field.');
        return;
      }
    }

    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  };

  const handleRemove = index => {
    const updated = fields.filter((_, i) => i !== index);
    setFields(updated.length ? updated : [{ quantity: '', status: 'Select' }]);
  };

  const handleInputChange = (val) => {
    setInput2(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchTagDetails(val);
    }, 500);
  };

  const fetchTagDetails = async (epcNo) => {
    if (!epcNo || epcNo.trim() === '') return;
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Error', 'Missing access token');
        return;
      }
      const url = `${API}products/search?limit=4&q=${epcNo}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': xtenantId,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch tag');
      }

      const data = await response?.json();
      const items = data.results?.map((r) => r._source) || [];

      setSuggestions(items);
    } catch (error) {
      console.error('Fetch error:', error.message);
      Alert.alert('Network Error', error.message);
    }
  };

  const loadTagIfEditing = async () => {
    if (!input1) return;

    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API}tags/${input1}?product=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-tenant-id': xtenantId,
        },
      });

      if (response.status === 404) {
        const errorData = await response.json();
        if (errorData.error === "Tag not found") {
          setIsEditable(true);
          setInput2('');
          setComment('');
          setFields([{ quantity: '', status: 'Select' }]);
          setIsMissing(false);
          setSuggestions([]);
          setIsInput2Focused(false);
          return;
        } else {
          Alert.alert('Error: ' + errorData.error);
        }
      }

      if (!response.ok) throw new Error('Failed to fetch tag');

      const data = await response.json();

      setIsEditable(false);
      setInput1(data.tag.epc);
      setInput2(data.tag?.product?.skuName);
      setComment(data.tag.comment || '');
      setIsMissing(data.tag.isMissing);

      const statusFields = [
        { status: 'Usable', quantity: data.tag.qtyUsable?.toString() || '' },
        { status: 'Damaged', quantity: data.tag.qtyDamaged?.toString() || '' },
        { status: 'Corroded', quantity: data.tag.qtyCorroded?.toString() || '' },
        { status: 'Expired', quantity: data.tag.qtyExpired?.toString() || '' },
        { status: 'Repaired', quantity: data.tag.qtyRepairable?.toString() || '' },
        { status: 'Obsolete', quantity: data.tag.qtyObsolete?.toString() || '' },
      ].filter(s => s.quantity !== '');

      setFields(statusFields.length ? statusFields : [{ quantity: '', status: 'Select' }]);

    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to load tag');
    }
  };

  const handleCreateTag = async () => {
    const statusQuantities = {
      Usable: 0,
      Damaged: 0,
      Corroded: 0,
      Expired: 0,
      Repaired: 0,
      Obsolete: 0,
    };

    fields.forEach(field => {
      if (field.status in statusQuantities) {
        statusQuantities[field.status] += parseInt(field.quantity || 0, 10);
      }
    });

    const [latitude, longitude] = input3?.split(',') || [null, null];

    console.log('🟨 DEBUGGING DATA BEFORE SUBMIT 🟨');
    console.log('Fields:', fields);
    console.log('Latitude/Longitude:', input3);
    console.log('Comment:', comment);
    console.log('EPC:', input1);
    console.log('Product (SKU):', input2);
    console.log('Selected Location:', selectedLocation);
    console.log('Status Quantities:', statusQuantities);
    console.log('userId:', `${await AsyncStorage.getItem('userId')}`);

    const payload = {
      epc: input1,
      sku: selectedSku,
      zoneId: zoneId,
      userId: `${await AsyncStorage.getItem('userId')}`,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      qtyUsable: statusQuantities['Usable'],
      qtyDamaged: statusQuantities['Damaged'],
      qtyCorroded: statusQuantities['Corroded'],
      qtyExpired: statusQuantities['Expired'],
      qtyRepairable: statusQuantities['Repaired'],
      qtyObselete: statusQuantities['Obsolete'],
      isMissing: isMissing,
      comment,
    };

    try {
      const response = await fetch(API + 'tags/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('accessToken')}`,
          'x-tenant-id': xtenantId,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        Alert.alert('Success', 'Tag created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to create tag');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Network Error', 'Something went wrong while submitting the tag');
    }
  };

  const handleClearOrDelete = () => {
    Alert.alert(
      isEditable ? 'Delete Tag' : 'Clear Fields',
      isEditable ? 'Are you sure you want to delete this tag?' : 'Are you sure you want to clear all fields?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isEditable ? 'Delete' : 'Clear',
          style: isEditable ? 'destructive' : 'default',
          onPress: () => {
            setIsEditable(false);
            setInput1('');
            setInput2('');
            setInput3('');
            setComment('');
            setFields([{ quantity: '', status: 'Select' }]);
            setSelectedLocation('Select');
            setIsMissing(false);
            setSuggestions([]);
            setIsInput2Focused(false);
          },
        },
      ]
    );
  };

  const isFormValid = () => {
    return (
      input1?.trim?.() !== '' &&
      input2?.trim?.() !== '' &&
      selectedLocation !== 'Select' &&
      fields.every(field => field.quantity !== '' && field.status !== 'Select')
    );
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={[globalStyles.container, { paddingTop: 0, backgroundColor: 'white' }]}>
      <HeaderComponent title="Tag Item" />

      <View style={globalStyles.scrollContainer}>
        <WhiteSpace size="xl" />
        <View style={[globalStyles.rowCenter, { gap: 20 }]}>
          <Text
            style={[
              globalStyles.toggleText,
              selectedOption === 'Inventory' && globalStyles.selectedText,
            ]} onPress={() => setSelectedOption('Inventory')}>
            Inventory
          </Text>
          <Text
            style={[
              globalStyles.toggleText,
              selectedOption === 'Non-Inventory' && globalStyles.selectedText,
            ]} onPress={() => setSelectedOption('Non-Inventory')}>
            Non-Inventory
          </Text>
        </View>

        {selectedOption === 'Inventory' && (
          <ScrollView showsVerticalScrollIndicator={false} style={{ paddingVertical: 20 }}>
            <CustomSlider label="Power" min={0} max={270} initialValue={100} loading={loading} setLoading={setLoading} />

            {/* EPC Number */}
            <CustomInput
              label="EPC Number"
              value={input1}
              onChange={setInput1}
              scanId="code1"
              isInput2={false}
              isEditable={true}
              onScan={handleScan}
              onSubmitEditing={loadTagIfEditing}
            />
            {isMissing && (
              <Text style={[globalStyles.btnText, { color: 'red', marginTop: -10, marginBottom: 6 }]}>
                This Tag Already Exists
              </Text>
            )}
            <DisabledWrapper isEditable={isEditable}>
              {/* Product Name/Material ID */}
              <CustomInput
                label="Product Name/Material ID"
                value={input2}
                onChange={handleInputChange}
                suggestions={suggestions}
                isInput2={true}
                isEditable={isEditable}
                onSuggestionSelect={(item: SuggestionItem) => {
                  // when user taps one of the suggestions:
                  setSelectedSku(item.sku);
                  setSelectedStatus(item.inventoryStatus || 'Select');
                  setSuggestions([]);
                }}
              />

              {/* Expected Location */}
              <CustomInput
                label="Expected Location"
                value={input3}
                onChange={setInput3}
                isInput2={false}
                isEditable={isEditable}
              />
              {/* {renderField('EPC Number', input1, setInput1, 'code1', true, false)}
            {isMissing ? (
              <Text style={[globalStyles.btnText, { color: 'red', marginTop: -10, marginBottom: 6 }]}>This Tag Already Exist</Text>
            ) : (
              <Text></Text>
            )} */}
              {/* {renderField('Product Name/Material ID', input2, (val) => {
              handleInputChange(val);
            }, null, suggestions, true, isEditable)} */}
              {/* {renderField('Expected Location', input3, setInput3, null, [], true, isEditable)} */}

              <Text style={globalStyles.labelSmLeft}>Select Location</Text>
              <View style={globalStyles.dropDownContainer}>
                <Picker
                  selectedValue={selectedLocation}
                  enabled={isEditable}
                  style={{ color: "#000" }}
                  onValueChange={(val) => {
                    setSelectedLocation(val);

                    const selectedZone = zones.find(
                      zone => zone.pathNames.join(' / ') === val
                    );

                    if (selectedZone) {
                      setZoneId(selectedZone.zoneId);
                      console.log('Selected Zone ID:', selectedZone.zoneId);
                    } else {
                      setZoneId(null); // or some fallback
                    }
                  }}
                >
                  <Picker.Item label="Select Location" value="Select" />
                  {zones.map((zone) => (
                    <Picker.Item
                      key={zone.zoneId}
                      label={zone.pathNames.join(' / ')}
                      value={zone.pathNames.join(' / ')}
                    />
                  ))}
                </Picker>

              </View>

              {fields.map((field, index) => (
                <View
                  key={index}>
                  <IonIcon
                    onPress={() => isEditable && handleRemove(index)}
                    style={globalStyles.closeButton}
                    name="close"
                    size={18}
                    color="#fff"
                  />
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={globalStyles.labelSmLeft}>Quantity</Text>
                      <View style={[globalStyles.inputContainer, { flex: 0 }]}>
                        <InputItem
                          value={field.quantity}
                          onChangeText={text => handleChange(index, 'quantity', text)}
                          placeholder="e.g. 10"
                          type="number"
                          placeholderTextColor="#000"
                          editable={isEditable}
                          style={globalStyles.input}
                        />
                      </View>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={globalStyles.labelSmLeft}>Select Status</Text>
                      <View style={globalStyles.dropDownContainer}>
                        <Picker
                          selectedValue={field.status}
                          onValueChange={val => handleChange(index, 'status', val)}
                          style={{ color: "#000" }}
                          enabled={isEditable}>
                          <Picker.Item label="Select" value="Select" />
                          {statuses.map((status, i) => {
                            const isUsed = fields.some((f, idx) => f.status === status && idx !== index);
                            return (
                              <Picker.Item
                                key={i}
                                label={status}
                                value={status}
                                enabled={!isUsed}
                              />
                            );
                          })}
                        </Picker>
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              <Button
                style={globalStyles.addMore}
                onPress={handleAddMore}
                disabled={!isEditable}>
                <Flex>
                  <IonIcon name="add-outline" size={18} />
                  <Text style={{ marginHorizontal: 10, fontSize: 14 }}>Add</Text>
                </Flex>
              </Button>

              <Text style={globalStyles.labelSmLeft}>Comment</Text>
              <View style={[globalStyles.inputContainer, { minHeight: 100 }]}>
                <InputItem
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Enter comment"
                  placeholderTextColor="#000"
                  multiline
                  numberOfLines={3}
                  editable={isEditable}
                  style={[globalStyles.input, { minHeight: 50, marginRight: -15 }]}
                />
              </View>
              <View style={{ alignItems: 'center', marginTop: 24 }}>
                <Flex>
                  <Button
                    style={{
                      flex: 1,
                      backgroundColor: isFormValid() ? '#4cc38a' : '#a5e1c4',
                      borderRadius: 10,
                      borderWidth: 0,
                    }}
                    disabled={!isFormValid()}
                    onPress={handleCreateTag}>
                    <Text style={globalStyles.buttonText}>Create Tag</Text>
                  </Button>
                </Flex>
              </View>
            </DisabledWrapper>

            <View style={{ alignItems: 'center', marginTop: 5 }}>
              <TouchableOpacity onPress={handleClearOrDelete}>
                <Text style={{ color: isEditable ? 'red' : '#007AFF', fontWeight: 'bold', marginTop: 10, textDecorationLine: 'underline' }}>
                  {isEditable ? 'Delete' : 'Clear'}
                </Text>
              </TouchableOpacity>
            </View>

            <WhiteSpace size="xl" />
            <WhiteSpace size="xl" />
          </ScrollView>
        )}

        {selectedOption === 'Non-Inventory' && (
          <ScrollView>
            <Text style={globalStyles.labelSmLeft}>Option 2 content goes here.</Text>
            <WhiteSpace size="xl" />
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default Tag;
