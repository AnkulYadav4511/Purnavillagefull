import React, { useEffect, useState } from 'react';
import { 
    StyleSheet, Text, View, FlatList, ActivityIndicator, 
    TouchableOpacity, Alert, StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next'; // 1. Import hook
import API from '../../../../services/api';

type PartItem = {
    _id: string; // e.g., "यादी भाग क्र. 285 1 - बस स्टाप..."
    count: number;
};

const BoothPartList = () => {
    const router = useRouter();
    const { t } = useTranslation(); // 2. Initialize hook
    const { boothNumber } = useLocalSearchParams(); 
    const [loading, setLoading] = useState(true);
    const [parts, setParts] = useState<PartItem[]>([]);

    useEffect(() => {
        if (boothNumber) fetchParts();
    }, [boothNumber]);

    const fetchParts = async () => {
        try {
            const response = await API.get(`/reports/booth-parts/${boothNumber}`);
            setParts(response.data.data || []);
        } catch (error) {
            Alert.alert(t('error'), t('error_load_list'));
        } finally {
            setLoading(false);
        }
    };

    const parseYadiString = (fullString: string) => {
        try {
            const parts = fullString.split(' - ');
            const titlePart = parts[0] || ""; 
            const addressPart = parts[1] || ""; 
            const numberMatch = titlePart.match(/(\d+)$/); 
            const partNo = numberMatch ? numberMatch[0] : "?";

            return { partNo, addressPart, fullTitle: titlePart };
        } catch (e) {
            return { partNo: "?", addressPart: fullString, fullTitle: fullString };
        }
    };

    const handlePress = (yadiString: string) => {
        router.push({
            pathname: '/home/reports/final-voter-list',
            params: { yadiString: yadiString }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={26} color="#FF6600" />
                </TouchableOpacity>
                <View style={{marginLeft: 10}}>
                    <Text style={styles.headerTitle}>{t('yadi_section_title')}</Text>
                    <Text style={styles.headerSubtitle}>
                        {t('booth_num_header', { num: boothNumber })}
                    </Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#FF6600" /></View>
            ) : (
                <FlatList
                    data={parts}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ padding: 15 }}
                    renderItem={({ item }) => {
                        const { partNo, addressPart, fullTitle } = parseYadiString(item._id);
                        
                        return (
                            <TouchableOpacity 
                                style={styles.card}
                                onPress={() => handlePress(item._id)}
                            >
                                <View style={styles.leftSection}>
                                    <View style={styles.iconBox}>
                                        <Text style={styles.partNumberBig}>{partNo}</Text>
                                        <Text style={styles.partLabel}>{t('part_label_small')}</Text>
                                    </View>
                                </View>

                                <View style={styles.middleSection}>
                                    <Text style={styles.mainTitle}>{fullTitle}</Text>
                                    <Text style={styles.addressText} numberOfLines={2}>
                                        <MaterialCommunityIcons name="map-marker-outline" size={14} /> 
                                        {addressPart}
                                    </Text>
                                </View>

                                <View style={styles.rightSection}>
                                    <View style={styles.badge}>
                                        <Text style={styles.countText}>{item.count}</Text>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </SafeAreaView>
    );
};

// Styles remain identical to your original code
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    headerSubtitle: { fontSize: 14, color: '#666' },
    card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, elevation: 2, alignItems: 'center' },
    leftSection: { paddingRight: 12 },
    iconBox: { width: 50, height: 50, backgroundColor: '#E3F2FD', borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#BBDEFB' },
    partNumberBig: { fontSize: 20, fontWeight: 'bold', color: '#1976D2' },
    partLabel: { fontSize: 9, color: '#1976D2' },
    middleSection: { flex: 1, justifyContent: 'center' },
    mainTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    addressText: { fontSize: 12, color: '#666', lineHeight: 16 },
    rightSection: { flexDirection: 'row', alignItems: 'center', paddingLeft: 8 },
    badge: { backgroundColor: '#FFF3E0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 8 },
    countText: { color: '#E65100', fontWeight: 'bold', fontSize: 14 }
});

export default BoothPartList;