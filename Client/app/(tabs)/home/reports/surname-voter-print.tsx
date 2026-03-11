import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Alert, StatusBar, TextInput
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useTranslation } from 'react-i18next'; // 1. Import hook
import API from '../../../../services/api';
import i18n from 'i18next';

export default function SurnameVoterPrint() {
    const { surname, booth } = useLocalSearchParams();
    const router = useRouter();
    const { t } = useTranslation(); // 2. Initialize hook

    const [voters, setVoters] = useState<any[]>([]);
    const [filteredVoters, setFilteredVoters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (surname) fetchVoters();
    }, [surname, booth]);

    const fetchVoters = async () => {
    try {
        setLoading(true);

        const res = await API.get('/reports/surname-details', {
            params: { surname, booth }
        });

        console.log("API DATA 👉", res.data);   // ✅ ADD THIS LINE

        setVoters(res.data);
        setFilteredVoters(res.data);

    } catch (error) {
        Alert.alert(t('error'), t('error_voter_list'));
    } finally {
        setLoading(false);
    }
};
    const handleSearch = (text: string) => {
    setSearchQuery(text);

    if (!text.trim()) {
        setFilteredVoters(voters);
        return;
    }

    const query = text.toLowerCase().trim();
    const currentLang = i18n.language;

    const filtered = voters.filter((voter) => {
        const epicMatch = voter.epic_id?.toLowerCase().includes(query);

        if (currentLang === 'en') {
            return (
                voter.voter_name_eng?.toLowerCase().includes(query) ||
                epicMatch
            );
        } else {
            return (
                voter.name?.toLowerCase().includes(query) ||
                epicMatch
            );
        }
    });

    setFilteredVoters(filtered);
};

    const handlePrint = async () => {
        const printData = filteredVoters;
        
        // Localized HTML for PDF
        const html = `
            <html>
                <head>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 12px; }
                        th { background-color: #f2f2f2; }
                        h2 { text-align: center; color: #FF6600; margin-bottom: 5px; }
                        p { text-align: center; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h2>${t('report_surname')}: ${surname}</h2>
                    <p>${t('booth_label')}: ${booth} | ${t('total_voters_count', { count: printData.length })}</p>
                    <table>
                        <tr>
                            <th>${t('pdf_sr_no')}</th>
                            <th>${t('pdf_voter_name')}</th>
                            <th>${t('pdf_epic_id')}</th>
                            <th>${t('pdf_age')}</th>
                            <th>${t('pdf_gender')}</th>
                        </tr>
                        ${printData.map((v, i) => `
                            <tr>
                                <td>${v.srNo || i + 1}</td>
                                <td>${v.name}</td>
                                <td>${v.epic_id}</td>
                                <td>${v.age}</td>
                                <td>${v.gender === 'Male' ? t('male_label') : t('female_label')}</td>
                            </tr>
                        `).join('')}
                    </table>
                </body>
            </html>`;

        try {
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri);
        } catch (e) {
            Alert.alert(t('error'), t('error_pdf_gen'));
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={26} color="#FF6600" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('list_title', { surname })}</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#666" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('search_name_epic_placeholder')}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#FF6600" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={filteredVoters}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>{t('no_results')}</Text>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.voterCard}
                            onPress={() => router.push({
                                pathname: "/details/[id]",
                                params: { id: item._id }
                            })}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={styles.voterName}>{item.name}</Text>
                                <Text style={styles.voterSub}>EPIC: {item.epic_id}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.voterAge}>{item.age} {t('years')}</Text>
                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={20}
                                    color="#CCC"
                                    style={{ marginLeft: 8 }}
                                />
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={handlePrint}>
                <MaterialCommunityIcons name="printer" size={28} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
    searchContainer: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', borderRadius: 10, paddingHorizontal: 10, height: 45 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: '#333' },
    emptyText: { textAlign: 'center', marginTop: 30, color: '#999', fontSize: 14 },
    voterCard: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center' },
    voterName: { fontSize: 16, fontWeight: '600', color: '#333' },
    voterSub: { fontSize: 13, color: '#666', marginTop: 2 },
    voterAge: { fontSize: 14, fontWeight: 'bold', color: '#FF6600' },
    fab: { position: 'absolute', right: 25, bottom: 25, width: 60, height: 60, borderRadius: 30, backgroundColor: '#FF6600', justifyContent: 'center', alignItems: 'center', elevation: 5 }
});