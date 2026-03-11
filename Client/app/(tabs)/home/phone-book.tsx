import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    StatusBar,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next'; // Import hook
import API from '../../../services/api'; 
import { useAuth } from '../../../services/AuthContext'; 

export default function PhoneBook() {
    const { t } = useTranslation(); // Initialize hook
    const router = useRouter();
    const { userId } = useAuth(); 
    const [search, setSearch] = useState('');
    const [contacts, setContacts] = useState<any[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPhoneBook = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const response = await API.get(`/users/phonebook/${userId}`);
            setContacts(response.data);
            setFilteredContacts(response.data);
        } catch (error) {
            console.error("Error fetching phonebook:", error);
            Alert.alert(t('error_title'), t('error_load_contacts'));
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchPhoneBook();
        }, [userId])
    );

    useEffect(() => {
        if (search.trim() === '') {
            setFilteredContacts(contacts);
        } else {
            const lowerSearch = search.toLowerCase();
            const filtered = contacts.filter(item => 
                item.name?.toLowerCase().includes(lowerSearch) ||
                item.mobile?.includes(lowerSearch) ||
                item.epic_id?.toLowerCase().includes(lowerSearch)
            );
            setFilteredContacts(filtered);
        }
    }, [search, contacts]);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push(`/details/${item._id}`)}
        >
            <View style={styles.rowBetween}>
                <Text style={styles.name}>
                    {item.name} {item.age ? `(${item.age})` : ''}
                </Text>
                <View style={[styles.statusDot, { backgroundColor: item.colorCode || '#ccc' }]} />
            </View>

            <View style={styles.rowBetween}>
                <Text style={styles.orangeText}>{t('sr_label')} {item.srNo}</Text>
                <Text style={styles.orangeText}>{t('part_label')} {item.part}</Text>
            </View>

            <Text style={styles.detail}>EPIC: {item.epic_id}</Text>
            <Text style={styles.detail}>
                {item.mobile || "N/A"} / {item.gender === 'M' ? t('male_label') : item.gender === 'F' ? t('female_label') : t('gender_other')}
            </Text>
            <Text style={styles.detail}>{item.section || t('general')}</Text>

            <View style={styles.expand}>
                <MaterialCommunityIcons name="chevron-right" size={22} color="#666" />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar backgroundColor="#F2F2F2" barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#FF6600" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('phonebook_title')}</Text>
            </View>

            <View style={styles.topRow}>
                <View style={styles.searchBox}>
                    <TextInput
                        placeholder={t('search_contact_placeholder')}
                        placeholderTextColor="#999"
                        value={search}
                        onChangeText={setSearch}
                        style={styles.input}
                    />
                    <MaterialCommunityIcons name="magnify" size={22} color="#FF6600" />
                </View>

                <TouchableOpacity style={styles.reloadBtn} onPress={fetchPhoneBook}>
                    <MaterialCommunityIcons name="reload" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <Text style={styles.countText}>{t('total')} : {filteredContacts.length}</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#FF6600" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={filteredContacts}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>{t('no_contacts')}</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F2F2F2' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
    topRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginTop: 10 },
    searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 25, paddingHorizontal: 15, height: 45 },
    input: { flex: 1, fontSize: 14 },
    reloadBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF6600', marginLeft: 10, width: 40, height: 40, borderRadius: 20 },
    countText: { marginLeft: 20, marginTop: 10, marginBottom: 5, color: '#FF6600', fontWeight: '600' },
    card: { backgroundColor: '#fff', marginHorizontal: 15, marginBottom: 10, padding: 15, borderRadius: 10, elevation: 2 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
    name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    statusDot: { width: 12, height: 12, borderRadius: 6 },
    orangeText: { color: '#FF6600', fontWeight: '600', marginTop: 4, fontSize: 13 },
    detail: { color: '#666', fontSize: 13, marginTop: 2 },
    expand: { alignItems: 'flex-end', marginTop: -20 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 }
});