import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTranslation } from 'react-i18next'; // Import hook
import API from '../../services/api';

export default function VoterSearch() {
    const { t } = useTranslation(); // Initialize hook
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [voters, setVoters] = useState([]);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filters, setFilters] = useState({ surname: '', area: '', house: '' });
    const [permission, requestPermission] = useCameraPermissions();
    const [isScannerVisible, setIsScannerVisible] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const handleOpenScanner = async () => {
        if (!permission?.granted) {
            const { granted } = await requestPermission();
            if (!granted) {
                Alert.alert(t('permission_title'), t('camera_permission_denied'));
                return;
            }
        }
        setScanned(false);
        setIsScannerVisible(true);
    };

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        setScanned(true);
        setIsScannerVisible(false);
        setSearchQuery(data);
    };

    useEffect(() => {
        const timer = setTimeout(() => { setDebouncedQuery(searchQuery); }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchVoters = async (pageNumber = 1, query = '', shouldRefresh = false) => {
        if (loadingMore && !shouldRefresh) return;
        try {
            if (pageNumber === 1) setLoading(true);
            else setLoadingMore(true);

            const { surname, area, house } = filters;
            let url = `/voters?page=${pageNumber}&search=${query}`;
            if (surname) url += `&surname=${surname}`;
            if (area) url += `&area=${area}`;
            if (house) url += `&house=${house}`;

            const response = await API.get(url);
            const newData = response.data;

            if (shouldRefresh || pageNumber === 1) setVoters(newData);
            else setVoters(prev => [...prev, ...newData]);

            setHasMore(newData.length === 20);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchVoters(1, debouncedQuery, true);
    }, [debouncedQuery, filters]);

    const loadMoreVoters = () => {
        if (!hasMore || loading || loadingMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchVoters(nextPage, debouncedQuery, false);
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setPage(1);
        fetchVoters(1, debouncedQuery, true);
    }, [debouncedQuery, filters]);

    const renderEmpty = () => {
        if (loading) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#FF6600" />
                </View>
            );
        }
        return (
            <View style={styles.centerContainer}>
                <MaterialCommunityIcons name="account-search-outline" size={50} color="#ccc" />
                <Text style={styles.emptyText}>{t('no_results')}</Text>
            </View>
        );
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{t('search_voter')}</Text>
                    <TouchableOpacity onPress={() => setIsFilterVisible(true)}>
                        <MaterialCommunityIcons
                            name={filters.surname || filters.area || filters.house ? "filter-check" : "filter-outline"}
                            size={26} color="#FF6600"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <View style={styles.searchBox}>
                        <MaterialCommunityIcons name="magnify" size={24} color="#666" />
                        <TextInput
                            style={styles.input}
                            placeholder={t('search_placeholder')}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#999"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ marginRight: 10 }}>
                                <MaterialCommunityIcons name="close-circle" size={20} color="#ccc" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.scanButton} onPress={handleOpenScanner}>
                            <MaterialCommunityIcons name="barcode-scan" size={24} color="#FF6600" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Filter Modal */}
                <Modal visible={isFilterVisible} animationType="slide" transparent={true}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.filterCard}>
                            <View style={styles.filterHeader}>
                                <Text style={styles.filterTitle}>{t('filter_title')}</Text>
                                <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>{t('surname_label')}</Text>
                            <TextInput
                                style={styles.filterInput}
                                placeholder="Sharma"
                                value={filters.surname}
                                onChangeText={(t) => setFilters({ ...filters, surname: t })}
                            />

                            <Text style={styles.label}>{t('area_label')}</Text>
                            <TextInput
                                style={styles.filterInput}
                                placeholder="Purna Village"
                                value={filters.area}
                                onChangeText={(t) => setFilters({ ...filters, area: t })}
                            />

                            <Text style={styles.label}>{t('house_no_label')}</Text>
                            <TextInput
                                style={styles.filterInput}
                                placeholder="101"
                                value={filters.house}
                                onChangeText={(t) => setFilters({ ...filters, house: t })}
                            />

                            <View style={styles.filterActions}>
                                <TouchableOpacity
                                    style={styles.clearBtn}
                                    onPress={() => {
                                        setFilters({ surname: '', area: '', house: '' });
                                        setIsFilterVisible(false);
                                    }}
                                >
                                    <Text style={styles.clearText}>{t('clear_all')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.applyBtn}
                                    onPress={() => setIsFilterVisible(false)}
                                >
                                    <Text style={styles.applyText}>{t('apply_filters')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Modal visible={isScannerVisible} animationType="slide">
                    <View style={styles.scannerContainer}>
                        <CameraView
                            style={StyleSheet.absoluteFillObject}
                            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        />
                        <View style={styles.overlay}>
                            <TouchableOpacity style={styles.closeScanner} onPress={() => setIsScannerVisible(false)}>
                                <MaterialCommunityIcons name="close" size={30} color="#fff" />
                            </TouchableOpacity>
                            <View style={styles.scanTarget} />
                        </View>
                    </View>
                </Modal>

                <FlatList
                    data={voters}
                    keyExtractor={(item) => item._id.toString()}
                    contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
                    onEndReached={loadMoreVoters}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6600']} />}
                    renderItem={({ item }) => (
                        <View style={styles.voterCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.voterName}>{item.name}</Text>
                                <View style={styles.boothBadge}>
                                    <Text style={styles.boothText}>{t('sr_no')}: {item.srNo}</Text>
                                </View>
                            </View>

                            <View style={styles.cardBody}>
                                <Text style={styles.voterDetails}>
                                    {item.relative_type === "Father" ? t('father_name') : t('husband_name')}: 
                                    <Text style={styles.boldDetail}> {item.fatherName || "N/A"}</Text>
                                </Text>
                                <Text style={styles.voterDetails}>
                                    {t('age')}: <Text style={styles.boldDetail}>{item.age}</Text> |
                                    {t('gender')}: <Text style={styles.boldDetail}>{item.gender}</Text>
                                </Text>
                                <Text style={styles.epicText}>EPIC: {item.epic_id}</Text>
                            </View>

                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={[styles.actionBtn]}
                                    onPress={() => router.push({ pathname: "/details/[id]", params: { id: item._id } })}
                                >
                                    <MaterialCommunityIcons name="eye-outline" size={18} color="#FF6600" />
                                    <Text style={styles.viewBtnText}>{t('view')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    searchContainer: { padding: 15 },
    searchBox: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15, height: 55, alignItems: 'center', elevation: 3 },
    input: { flex: 1, marginLeft: 10, fontSize: 16 },
    scanButton: { paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: '#eee' },

    // Voter Card Styles
    voterCard: { backgroundColor: '#fff', borderRadius: 15, marginBottom: 16, elevation: 4, overflow: 'hidden' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
    voterName: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', flex: 1 },
    boothBadge: { backgroundColor: '#FF660015', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    boothText: { color: '#FF6600', fontWeight: 'bold' },
    cardBody: { paddingHorizontal: 16, paddingBottom: 10 },
    voterDetails: { color: '#666', fontSize: 14, marginBottom: 4 },
    boldDetail: { color: '#333', fontWeight: '600' },
    epicText: { color: '#888', fontSize: 13, marginTop: 4 },

    // Bifurcated Action Styles
    actionRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
    viewBtnBorder: { borderRightWidth: 1, borderRightColor: '#F0F0F0' },
    viewBtnText: { color: '#FF6600', fontWeight: 'bold', marginLeft: 6 },
    editBtnText: { color: '#2E7D32', fontWeight: 'bold', marginLeft: 6 },

    // Filter Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    filterCard: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, elevation: 20 },
    filterHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    filterTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    label: { fontSize: 14, color: '#666', marginBottom: 5, marginTop: 10, fontWeight: '600' },
    filterInput: { backgroundColor: '#F2F2F2', borderRadius: 10, padding: 12, fontSize: 16 },
    filterActions: { flexDirection: 'row', gap: 10, marginTop: 30 },
    clearBtn: { flex: 1, padding: 15, alignItems: 'center' },
    applyBtn: { flex: 2, backgroundColor: '#FF6600', padding: 15, borderRadius: 12, alignItems: 'center' },
    clearText: { color: '#666', fontWeight: 'bold' },
    applyText: { color: '#fff', fontWeight: 'bold' },

    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#999', marginTop: 10 },
    scannerContainer: { flex: 1, backgroundColor: '#000' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    closeScanner: { position: 'absolute', top: 50, right: 20 },
    scanTarget: { width: 280, height: 200, borderWidth: 2, borderColor: '#FF6600', borderRadius: 10 },
});