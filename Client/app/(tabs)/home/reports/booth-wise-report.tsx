import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next'; // 1. Import Hook
import API from '../../../../services/api';
import * as Print from 'expo-print';

type BoothItem = {
    _id: string;      
    areaName: string; 
    count: number;
};

export default function BoothReport() {
    const { t } = useTranslation(); // 2. Initialize Hook
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<BoothItem[]>([]);
    const [filteredData, setFilteredData] = useState<BoothItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchBoothReport();
    }, []);

    const fetchBoothReport = async () => {
        try {
            const response = await API.get('/reports/booth');
            setReportData(response.data);
            setFilteredData(response.data);
        } catch (error: any) {
            Alert.alert(t('error'), t('error_load_data'));
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text.trim() === '') {
            setFilteredData(reportData);
        } else {
            const query = text.toLowerCase();
            const filtered = reportData.filter((item) => {
                const boothNum = (item._id || "").toLowerCase();
                const area = (item.areaName || "").toLowerCase();
                return boothNum.includes(query) || area.includes(query);
            });
            setFilteredData(filtered);
        }
    };

    const handlePrint = async () => {
        try {
            if (filteredData.length === 0) return Alert.alert(t('info'), t('no_print_data'));
            
            const tableRows = filteredData.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td><b>${t('booth_label')} ${item._id}</b></td>
                    <td>${item.areaName || t('no_data_available')}</td>
                    <td>${item.count}</td>
                </tr>
            `).join('');

            const htmlContent = `
                <html>
                <head>
                    <style>
                        body{font-family:sans-serif;padding:20px;}
                        h1{text-align:center;color:#FF6600;}
                        table{width:100%;border-collapse:collapse;margin-top:20px;}
                        th,td{border:1px solid #ddd;padding:10px;text-align:left;font-size:12px;}
                        th{background-color:#FF6600;color:white;}
                    </style>
                </head>
                <body>
                    <h1>${t('pdf_header_title')}</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>${t('pdf_sr_no')}</th>
                                <th>${t('booth_label')}</th>
                                <th>${t('area_society')}</th>
                                <th>${t('total_voters')}</th>
                            </tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                </body>
                </html>`;

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
                <Text style={styles.headerTitle}>{t('booth_report_title')}</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#666" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('search_booth_placeholder')}
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#FF6600" /></View>
            ) : (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingBottom: 150 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => router.push({
                                pathname: '/home/reports/booth-voter-list', 
                                params: { boothNumber: item._id }
                            })}
                        >
                            <View style={styles.card}>
                                <View style={styles.leftInfo}>
                                    <View style={styles.boothIconBox}>
                                        <Text style={styles.boothNumberText}>{item._id}</Text>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.boothTitle}>{t('booth_number_label', { num: item._id })}</Text>
                                        <Text style={styles.areaSubtitle} numberOfLines={1}>
                                            {item.areaName || t('no_data_available')}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.badge}>
                                    <Text style={styles.total}>{item.count}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}

            <View style={styles.fabContainer}>
                <TouchableOpacity style={styles.printFab} onPress={handlePrint}>
                    <MaterialCommunityIcons name="printer" size={24} color="#fff" />
                    <Text style={styles.fabText}>{t('print')}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
    searchContainer: { padding: 12, backgroundColor: '#fff' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', paddingHorizontal: 12, borderRadius: 10, height: 45 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 15 },
    card: { backgroundColor: '#fff', padding: 15, marginHorizontal: 15, marginVertical: 6, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
    leftInfo: { flexDirection: 'row', flex: 1, alignItems: 'center' },
    boothIconBox: { backgroundColor: '#FF6600', width: 45, height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    boothNumberText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    boothTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    areaSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
    badge: { backgroundColor: '#FFF0E6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, minWidth: 50, alignItems: 'center' },
    total: { color: '#FF6600', fontWeight: 'bold', fontSize: 16 },
    fabContainer: { position: 'absolute', bottom: 30, right: 20 },
    printFab: { backgroundColor: '#0288D1', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, elevation: 6 },
    fabText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 }
});