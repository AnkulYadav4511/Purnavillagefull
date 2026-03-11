import React, { useEffect, useState } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, ScrollView, 
    ActivityIndicator, Alert, Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next'; // Import hook
import API from '../../services/api';

const { width } = Dimensions.get('window');

export default function ColorReport() {
    const { t } = useTranslation(); // Initialize translation
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    
    const [stats, setStats] = useState({
        supporter: 0,
        my_voter: 0,
        neutral: 0,
        opponent: 0,
        blank: 0
    });

    useEffect(() => {
        fetchColorReport();
    }, []);

    const fetchColorReport = async () => {
        try {
            const response = await API.get('/reports/color');
            setStats(response.data);
        } catch (error) {
            console.error(error);
            // Translated Alert
            Alert.alert(t('error_title'), t('error_load_report'));
        } finally {
            setLoading(false);
        }
    };

    const totalVoters = stats.supporter + stats.my_voter + stats.neutral + stats.opponent + stats.blank;

    // Data array using translated labels
    const reportData = [
        { id: '1', label: t('supporter'), count: stats.supporter, color: '#00C8C8', icon: 'thumb-up' },
        { id: '2', label: t('my_voter'), count: stats.my_voter, color: '#1EB139', icon: 'account-check' },
        { id: '3', label: t('neutral'), count: stats.neutral, color: '#FFD740', icon: 'scale-balance' },
        { id: '4', label: t('opponent'), count: stats.opponent, color: '#FF5252', icon: 'close-circle' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('color_report_title')}</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#FF6600" style={{ marginTop: 50 }} />
            ) : (
                <ScrollView contentContainerStyle={styles.content}>
                    
                    {/* Summary Card */}
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>{t('total_voters')}</Text>
                        <Text style={styles.summaryCount}>{totalVoters}</Text>
                    </View>

                    {/* Report Cards */}
                    {reportData.map((item) => (
                        <View key={item.id} style={[styles.reportRow, { borderLeftColor: item.color }]}>
                            <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}> 
                                <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
                            </View>
                            <View style={styles.rowText}>
                                <Text style={styles.label}>{item.label}</Text>
                                <Text style={styles.count}>{item.count}</Text>
                            </View>
                            {/* Progress Bar */}
                            <View style={[styles.progressBar, { width: `${(item.count / totalVoters * 100) || 0}%`, backgroundColor: item.color + '40' }]} />
                        </View>
                    ))}

                    {/* Blank Stat */}
                    <View style={[styles.reportRow, { borderLeftColor: '#999' }]}>
                        <View style={[styles.iconBox, { backgroundColor: '#eee' }]}>
                            <MaterialCommunityIcons name="account-question" size={24} color="#666" />
                        </View>
                        <View style={styles.rowText}>
                            <Text style={styles.label}>{t('blank_voter')}</Text>
                            <Text style={styles.count}>{stats.blank}</Text>
                        </View>
                    </View>

                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff', elevation: 2 },
    backButton: { marginRight: 15 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    content: { padding: 20 },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 3
    },
    summaryLabel: { fontSize: 16, color: '#666', marginBottom: 5 },
    summaryCount: { fontSize: 32, fontWeight: 'bold', color: '#FF6600' },
    reportRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 5,
        overflow: 'hidden',
        position: 'relative',
        elevation: 2
    },
    iconBox: {
        width: 45, height: 45, borderRadius: 25,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 15,
        zIndex: 2
    },
    rowText: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 },
    label: { fontSize: 16, fontWeight: '600', color: '#333' },
    count: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    progressBar: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0,
        zIndex: 1
    }
});