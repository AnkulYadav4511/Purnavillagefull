import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import API from '../../../../services/api';

const BOOTH_NUMBERS = ['All', '285', '286', '287', '288', '289', '290', '291', '292'];

export default function MobileNumberReport() {
  const { t } = useTranslation();
  const router = useRouter();
  
  const [search, setSearch] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooth, setSelectedBooth] = useState("All");
  const [showBoothPicker, setShowBoothPicker] = useState(false);

  useEffect(() => {
    fetchMobileReport();
  }, [selectedBooth]);

  const fetchMobileReport = async () => {
    try {
      setLoading(true);
      const response = await API.get('/reports/mobile-summary', {
        params: { booth: selectedBooth }
      });
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch mobile report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (number: string) => {
    if (number) {
      Linking.openURL(`tel:${number}`);
    }
  };

  // Improved Filter: Searches both Name and Mobile
  const filteredData = data.filter((item: any) => {
    if (!item) return false;
    const term = search.toLowerCase().trim();
    const name = (item.voterName || "").toLowerCase();
    const mob = (item.mobile || "").toString();
    return name.includes(term) || mob.includes(term);
  });

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.row}>
      <View style={styles.infoArea}>
        <View style={styles.mobileIconCircle}>
          <MaterialCommunityIcons name="account" size={24} color="#FF6600" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.voterName} numberOfLines={1}>{item.voterName || "No Name"}</Text>
          <Text style={styles.mobileText}>{item.mobile}</Text>
          <Text style={styles.boothSubText}>{t('booth_label')}: {item.booth}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.callButton} 
        onPress={() => handleCall(item.mobile)}
      >
        <MaterialCommunityIcons name="phone" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#FF6600" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('mobile_report_title')}</Text>
      </View>

      {/* Booth Picker at Top */}
      <TouchableOpacity style={styles.boothSelector} onPress={() => setShowBoothPicker(true)}>
        <Text style={styles.boothLabel}>{t('selected_booth')}</Text>
        <View style={styles.boothValueRow}>
          <Text style={styles.boothValue}>
            {selectedBooth === 'All' 
              ? t('all_booths') 
              : t('booth_no', { no: selectedBooth })}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
        </View>
      </TouchableOpacity>

      {/* Search Bar - Supports Name and Mobile */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder={t('search_mobile_placeholder')}
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
        <MaterialCommunityIcons name="magnify" size={22} color="#FF6600" />
      </View>

      {/* Main Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#FF6600" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="phone-off" size={60} color="#ccc" />
              <Text style={styles.emptyText}>{t('no_data_found')}</Text>
            </View>
          }
        />
      )}

      {/* Booth Selection Modal */}
      <Modal visible={showBoothPicker} transparent animationType="slide">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowBoothPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('select_booth_title')}</Text>
            <FlatList
              data={BOOTH_NUMBERS}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem} 
                  onPress={() => { setSelectedBooth(item); setShowBoothPicker(false); }}
                >
                  <Text style={[styles.modalItemText, selectedBooth === item && { color: '#FF6600', fontWeight: 'bold' }]}>
                    {item === 'All' ? t('all_booths') : t('booth_no', { no: item })}
                  </Text>
                  {selectedBooth === item && <MaterialCommunityIcons name="check" size={20} color="#FF6600" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10, color: '#333' },
  boothSelector: { backgroundColor: '#fff', margin: 15, padding: 12, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  boothLabel: { fontSize: 10, color: '#999', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
  boothValueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  boothValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 15, marginBottom: 15, paddingHorizontal: 15, borderRadius: 25, height: 45, elevation: 1 },
  input: { flex: 1 },
  row: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 15, marginBottom: 10, padding: 12, borderRadius: 15, alignItems: 'center', elevation: 2 },
  infoArea: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  mobileIconCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  textContainer: { flex: 1 },
  voterName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  mobileText: { fontSize: 14, color: '#FF6600', fontWeight: '600', marginTop: 2 },
  boothSubText: { fontSize: 12, color: '#777' },
  callButton: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  emptyContainer: { marginTop: 100, alignItems: 'center', opacity: 0.4 },
  emptyText: { textAlign: 'center', marginTop: 10, fontSize: 16, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, maxHeight: '75%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  modalItemText: { fontSize: 16, color: '#444' }
});