import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next'; // 1. Import hook

export default function SyncScreen() {
    const { t } = useTranslation(); // 2. Initialize translation hook
    const [syncing, setSyncing] = useState(false);

    const handleSync = () => {
        setSyncing(true);
        // Simulate sync logic - in a real app, this would be an API call
        setTimeout(() => setSyncing(false), 3000); 
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('sync_title')}</Text>
            </View>

            <View style={styles.content}>
                {/* Status Card Section */}
                <View style={styles.syncStatusCard}>
                    <MaterialCommunityIcons 
                        name={syncing ? "sync" : "check-circle"} 
                        size={80} 
                        color={syncing ? "#FF6600" : "#4CAF50"} 
                    />
                    <Text style={styles.statusTitle}>
                        {/* Dynamic translation based on syncing state */}
                        {syncing ? t('sync_loading') : t('sync_success')}
                    </Text>
                    <Text style={styles.lastSync}>{t('last_sync')}</Text>
                </View>

                {/* Info Box Section */}
                <View style={styles.infoBox}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t('offline_voters')}</Text>
                        <Text style={styles.infoValue}>142</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t('pending_changes')}</Text>
                        <Text style={styles.infoValue}>12</Text>
                    </View>
                </View>

                {/* Sync Action Button */}
                <TouchableOpacity 
                    style={[styles.syncButton, syncing && styles.disabledButton]} 
                    onPress={handleSync}
                    disabled={syncing}
                >
                    {syncing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="cloud-upload-outline" size={24} color="#fff" />
                            <Text style={styles.syncButtonText}>{t('sync_now')}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#fff' 
    },
    header: { 
        padding: 20, 
        borderBottomWidth: 1, 
        borderBottomColor: '#eee' 
    },
    headerTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#333' 
    },
    content: { 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 30 
    },
    syncStatusCard: { 
        alignItems: 'center', 
        marginBottom: 40 
    },
    statusTitle: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        marginTop: 20, 
        color: '#333',
        textAlign: 'center'
    },
    lastSync: { 
        color: '#999', 
        marginTop: 5 
    },
    infoBox: { 
        width: '100%', 
        backgroundColor: '#F8F9FA', 
        borderRadius: 15, 
        padding: 20, 
        marginBottom: 40 
    },
    infoRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 10 
    },
    infoLabel: { 
        fontSize: 16, 
        color: '#666' 
    },
    infoValue: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#FF6600' 
    },
    syncButton: { 
        backgroundColor: '#FF6600', 
        width: '100%', 
        height: 60, 
        borderRadius: 30, 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center', 
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    disabledButton: { 
        backgroundColor: '#FFCCBC' 
    },
    syncButtonText: { 
        color: '#fff', 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginLeft: 10 
    }
});