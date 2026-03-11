import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  StatusBar, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next'; // 1. Import
import * as Print from 'expo-print';
import API from '../../../../services/api';

const BOOTH_NUMBERS = ['All', '285', '286', '287', '288', '289', '290', '291', '292'];

export default function GenderWiseReport() {
  const router = useRouter();
  const { t } = useTranslation(); // 2. Initialize hook
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooth, setSelectedBooth] = useState('All');

  useEffect(() => {
    fetchGenderReport();
  }, [selectedBooth]);

  const fetchGenderReport = async () => {
    try {
      setLoading(true);
      const response = await API.get('/reports/gender', {
        params: { booth: selectedBooth }
      });
      setReportData(response.data);
    } catch (error) {
      Alert.alert(t('error'), t('error_load_report'));
    } finally {
      setLoading(false);
    }
  };

  // 3. Translated Label Logic
  const getTranslatedLabel = (dbValue) => {
    if (!dbValue || dbValue === "Unknown") return t('other');
    const val = dbValue.trim();
    if (val === "पुरुष" || val === "Male") return t('male');
    if (val === "महिला" || val === "Female" || val === "स्त्री") return t('female');
    return val;
  };

  const totalVoters = reportData.reduce((sum, item) => sum + item.count, 0);

  const exportToPDF = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h1 { color: #FF6600; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #FF6600; color: white; }
            .info { font-weight: bold; font-size: 16px; margin-top: 10px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>${t('pdf_gender_report')}</h1>
          <div class="info">${t('booth_label')}: ${selectedBooth === 'All' ? t('all') : selectedBooth} | ${t('total')}: ${totalVoters.toLocaleString()}</div>
          <table>
            <tr><th>${t('gender')}</th><th>${t('count')}</th></tr>
            ${reportData.map(item => `
              <tr>
                <td>${getTranslatedLabel(item._id)}</td>
                <td>${item.count.toLocaleString()}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;
    try {
      await Print.printAsync({ html: htmlContent });
    } catch (error) {
      Alert.alert(t('error'), t('print_failed'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#FF6600" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('gender_analysis_title')}</Text>
      </View>

      <View style={styles.boothSelectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.boothScroll}>
          {BOOTH_NUMBERS.map((booth) => (
            <TouchableOpacity
              key={booth}
              style={[styles.boothChip, selectedBooth === booth && styles.activeBoothChip]}
              onPress={() => setSelectedBooth(booth)}
            >
              <Text style={[styles.boothText, selectedBooth === booth && styles.activeBoothText]}>
                {booth === 'All' ? t('all_booths') : `${t('booth_label')} ${booth}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6600" />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{t('total_voters_booth', { booth: selectedBooth === 'All' ? t('all') : selectedBooth })}</Text>
            <Text style={styles.summaryCount}>{totalVoters.toLocaleString()}</Text>
          </View>

          <FlatList
            data={reportData}
            keyExtractor={(item) => item._id || 'unknown'}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.label}>{getTranslatedLabel(item._id)}</Text>
                <View style={styles.right}>
                  <Text style={styles.count}>{item.count.toLocaleString()}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={22} color="#FF6600" />
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>{t('no_data_available')}</Text>}
          />
        </View>
      )}

      {!loading && reportData.length > 0 && (
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.printButton} onPress={exportToPDF}>
            <MaterialCommunityIcons name="printer" size={24} color="#fff" />
            <Text style={styles.printButtonText}>{t('print_report')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  boothSelectorContainer: { height: 55, backgroundColor: '#fff', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  boothScroll: { paddingHorizontal: 15 },
  boothChip: { paddingHorizontal: 16, paddingVertical: 6, backgroundColor: '#F0F0F0', borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#E0E0E0', justifyContent: 'center' },
  activeBoothChip: { backgroundColor: '#FF6600', borderColor: '#FF6600' },
  boothText: { fontSize: 13, color: '#555' },
  activeBoothText: { color: '#fff', fontWeight: 'bold' },
  summaryCard: { margin: 20, backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center', elevation: 2 },
  summaryLabel: { fontSize: 14, color: '#666', marginBottom: 5 },
  summaryCount: { fontSize: 32, fontWeight: 'bold', color: '#FF6600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
  label: { fontSize: 16, fontWeight: '500' },
  right: { flexDirection: 'row', alignItems: 'center' },
  count: { fontWeight: 'bold', color: '#FF6600', fontSize: 16, marginRight: 6 },
  bottomActions: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#ddd' },
  printButton: { backgroundColor: '#FF6600', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 10 },
  printButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});