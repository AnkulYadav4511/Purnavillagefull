import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    TextInput,
    Alert,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next'; // 1. Import Hook
import API from '../../../../services/api';

type Voter = {
    _id: string;
    srNo: number;
    name: string;
    voter_name_eng?: string;
    epic_id: string;
    age: number;
    gender: string;
    house: string;
    mobile?: string;
    colorCode?: string;    
    isVoted?: boolean;
};

export default function FinalVoterList() {
    const router = useRouter();
    const { t } = useTranslation(); // 2. Initialize Hook
    
    const params = useLocalSearchParams();
    const yadiString = params.yadiString as string;

    const [loading, setLoading] = useState(true);
    const [voters, setVoters] = useState<Voter[]>([]);
    const [filteredVoters, setFilteredVoters] = useState<Voter[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (yadiString) {
            fetchVoters();
        }
    }, [yadiString]);

    const fetchVoters = async () => {
        try {
            const encodedYadi = encodeURIComponent(yadiString);
            const response = await API.get(`/reports/voters-by-yadi?yadiString=${encodedYadi}`);
            const data = response.data.data || [];
            setVoters(data);
            setFilteredVoters(data);
        } catch (error) {
            Alert.alert(t('error'), t('error_load_list'));
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text.trim() === '') {
            setFilteredVoters(voters);
        } else {
            const query = text.toLowerCase();
            const filtered = voters.filter((item) => 
                (item.name || "").toLowerCase().includes(query) ||
                (item.voter_name_eng || "").toLowerCase().includes(query) ||
                (item.epic_id || "").toLowerCase().includes(query) ||
                String(item.srNo).includes(query)
            );
            setFilteredVoters(filtered);
        }
    };

    const renderVoterCard = ({ item }: { item: Voter }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({
                pathname: "/details/[id]",
                params: { id: item._id }
            })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.serialBox}>
                    <Text style={styles.serialLabel}>{t('sr_no_short')}</Text>
                    <Text style={styles.serialText}>{item.srNo}</Text>
                </View>
                <View style={styles.idBadge}>
                    <Text style={styles.idText}>{item.epic_id}</Text>
                </View>
            </View>
            
            <View style={styles.nameSection}>
                <Text style={styles.marathiName}>{item.name}</Text>
                {item.voter_name_eng && (
                    <Text style={styles.englishName}>{item.voter_name_eng}</Text>
                )}
            </View>
            
            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="home-outline" size={16} color="#666" />
                    <Text style={styles.detailText}> {t('house_no_label')}: {item.house || "-"}</Text>
                </View>
                <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="account-outline" size={16} color="#666" />
                    <Text style={styles.detailText}> 
                        {item.gender === 'Male' ? t('male_label') : t('female_label')} / {item.age}
                    </Text>
                </View>
            </View>

            {item.isVoted && (
                <View style={styles.votedBadge}>
                    <MaterialCommunityIcons name="check-decagram" size={14} color="#2E7D32" />
                    <Text style={styles.votedText}>{t('voted_done')}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={26} color="#FF6600" />
                </TouchableOpacity>
                <View style={{flex: 1, marginLeft: 12}}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{t('voter_list_title')}</Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>{yadiString}</Text>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#666" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={t('search_voter_placeholder')}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholderTextColor="#999"
                    />
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#FF6600" />
                </View>
            ) : (
                <FlatList
                    data={filteredVoters}
                    keyExtractor={(item) => item._id}
                    renderItem={renderVoterCard}
                    contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
                    ListHeaderComponent={
                        <Text style={styles.summaryText}>{t('total_voters_label', { count: filteredVoters.length })}</Text>
                    }
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <MaterialCommunityIcons name="account-search-outline" size={50} color="#ccc" />
                            <Text style={{color: '#999', marginTop: 10}}>{t('voters_not_found')}</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 15, 
        backgroundColor: '#fff', 
        borderBottomWidth: 1, 
        borderColor: '#eee',
        elevation: 2 
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    headerSubtitle: { fontSize: 12, color: '#FF6600', fontWeight: '500' },
    searchContainer: { padding: 12, backgroundColor: '#fff' },
    searchBar: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#F0F2F5', 
        paddingHorizontal: 12, 
        borderRadius: 10, 
        height: 48 
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#333' },
    summaryText: { fontSize: 14, color: '#666', marginBottom: 10, fontWeight: 'bold' },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    serialBox: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center'
    },
    serialLabel: { fontSize: 10, color: '#1565C0', marginRight: 4 },
    serialText: { color: '#1565C0', fontWeight: 'bold', fontSize: 13 },
    idBadge: {
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4
    },
    idText: { color: '#E65100', fontWeight: 'bold', fontSize: 12 },
    nameSection: { marginBottom: 10 },
    marathiName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    englishName: { fontSize: 14, color: '#777', marginTop: 2 },
    detailsRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#f5f5f5',
        paddingTop: 8,
        marginTop: 4
    },
    detailItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
    detailText: { fontSize: 13, color: '#555', marginLeft: 4 },
    votedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: '#E8F5E9',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4
    },
    votedText: { fontSize: 11, color: '#2E7D32', fontWeight: 'bold', marginLeft: 4 }
});