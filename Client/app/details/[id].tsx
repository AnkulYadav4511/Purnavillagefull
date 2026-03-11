import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
  Share, Alert, Modal, TextInput, Dimensions, StatusBar, KeyboardAvoidingView, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from "react-native-view-shot";
import * as Sharing from 'expo-sharing';
import { useTranslation } from 'react-i18next';
import API from '../../services/api';
import { useAuth } from '../../services/AuthContext';

const { width } = Dimensions.get('window');

// --- REUSABLE SUB-COMPONENTS ---

const InfoRow = ({ label, value }: { label: string, value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '-'}</Text>
  </View>
);

const SurveyItem = ({ label, value, icon = "pencil-outline", type = "input", onToggle, onEdit, isColor }: any) => (
  <View style={styles.surveyRow}>
    <Text style={styles.surveyLabel}>{label}</Text>
    <View style={styles.surveyAction}>
      {type === "input" ? (
        <View style={styles.inputWrapper}>
          {isColor ? (
            <View style={[styles.colorIndicator, { backgroundColor: value || '#ddd' }]} />
          ) : (
            <Text style={styles.surveyValueDisplay} numberOfLines={1}>{value || '...'}</Text>
          )}
          <TouchableOpacity onPress={onEdit}>
            <MaterialCommunityIcons name={icon} size={20} color="#FF6600" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.radioGroup}>
          <TouchableOpacity style={styles.radio} onPress={() => onToggle(false)}>
            <View style={styles.radioOuter}>{!value && <View style={styles.radioInnerActive} />}</View>
            <Text style={styles.radioText}>नाही</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.radio} onPress={() => onToggle(true)}>
            <View style={styles.radioOuter}>{value && <View style={styles.radioInnerActive} />}</View>
            <Text style={styles.radioText}>होय</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  </View>
);

export default function VoterDetails() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const { userId } = useAuth();
  const router = useRouter();
  const viewShotRef = useRef<any>();

  const [activeTab, setActiveTab] = useState('Information');
  const [voter, setVoter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [ticketModalVisible, setTicketModalVisible] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [currentEdit, setCurrentEdit] = useState({ key: '', label: '', value: '' });

  const COLOR_OPTIONS = [
    { id: '1', label: t('supporter'), color: '#00C8C8' },
    { id: '2', label: t('my_voter'), color: '#1EB139' },
    { id: '3', label: t('neutral'), color: '#FFD740' },
    { id: '4', label: t('opponent'), color: '#FF5252' },
  ];

  useEffect(() => {
    fetchVoterDetails();
  }, [id]);

  const fetchVoterDetails = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/voters/${id}`);
      setVoter(response.data);
    } catch (error) {
      Alert.alert(t('error'), t('data_not_found'));
    } finally {
      setLoading(false);
    }
  };

  const updateVoterField = async (fieldName: string, value: any) => {
    setIsSaving(true);
    try {
      const payload = { [fieldName]: value, userId };
      const response = await API.put(`/voters/${id}`, payload);
      setVoter(response.data);
      setEditModalVisible(false);
      setColorModalVisible(false);
    } catch (error) { Alert.alert(t('error'), t('save_error')); }
    finally { setIsSaving(false); }
  };

  const openEditModal = (key: string, label: string, value: any) => {
    setCurrentEdit({ key, label, value: value ? String(value) : '' });
    setEditModalVisible(true);
  };

  const shareTicketImage = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri);
    } catch (error) { Alert.alert(t('error'), "Could not share."); }
  };

  if (loading) return <ActivityIndicator size="large" color="#FF6600" style={styles.loader} />;
  if (!voter) return <View style={styles.loader}><Text>{t('data_not_found')}</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.orangeHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="#FF6600" style={styles.backIconBg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{voter.name}</Text>
      </View>

      <View style={styles.tabBar}>
        {['Information', 'Survey'].map((key) => (
          <TouchableOpacity key={key} style={[styles.tabItem, activeTab === key && styles.activeTabBorder]} onPress={() => setActiveTab(key)}>
            <Text style={[styles.tabText, activeTab === key && styles.activeTabText]}>
              {key === 'Information' ? t('Information') : t('Survey')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'Information' && (
          <View style={styles.card}>
            <View style={styles.voterHeader}>
              <Text style={styles.voterMainName}>{voter.name}</Text>
              <View style={[styles.statusDot, { backgroundColor: voter.colorCode || '#ddd' }]} />
            </View>
            <View style={styles.gridContainer}>
              <View style={styles.gridItem}><Text style={styles.gridLabel}>{t('ward')}</Text><Text style={styles.gridValue}>{voter.parbhag ? voter.parbhag.split(' ').pop() : '-'}</Text></View>
              <View style={styles.gridItem}><Text style={styles.gridLabel}>{t('sr_no')}</Text><Text style={styles.gridValue}>{voter.srNo || '-'}</Text></View>
              <View style={styles.gridItem}><Text style={styles.gridLabel}>{t('age')}</Text><Text style={styles.gridValue}>{voter.age || '-'}</Text></View>
              <View style={styles.gridItem}><Text style={styles.gridLabel}>{t('gender')}</Text><Text style={styles.gridValue}>{voter.gender || '-'}</Text></View>
            </View>
            
            <InfoRow 
              label={voter.relative_type === 'Husband' ? t('husband_name') : voter.relative_type === 'Father' ? t('father_name') : t('relative_name')} 
              value={voter.fatherName} 
            />
            
            <InfoRow label={t('dob')} value={voter.dob} />
            <InfoRow label={t('village')} value={voter.mahanagarpalika} />
            <InfoRow label={t('epic_id')} value={voter.epic_id} />
            <View style={styles.addressBox}>
              <Text style={styles.infoLabel}>{t('address')}</Text>
              <Text style={styles.addressText}>{voter.yadi_bhag}</Text>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.ticketBtn} onPress={() => setTicketModalVisible(true)}>
                <MaterialCommunityIcons name="ticket-confirmation" size={20} color="#fff" />
                <Text style={styles.ticketBtnText}>{t('digital_ticket')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtnInfo} onPress={() => Share.share({ message: `*${t('Information')}*\nनाव: ${voter.name}\nEPIC: ${voter.epic_id}` })}>
                <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'Survey' && (
          <View style={styles.card}>
            <SurveyItem label={t('mobile')} value={voter.mobile} onEdit={() => openEditModal('mobile', t('mobile'), voter.mobile)} />
            <SurveyItem label={t('dob')} value={voter.dob} onEdit={() => openEditModal('dob', t('dob'), voter.dob)} />
            <SurveyItem label={t('voter_category')} value={voter.colorCode} isColor onEdit={() => setColorModalVisible(true)} />
            <SurveyItem label={t('caste')} value={voter.caste} onEdit={() => openEditModal('caste', t('caste'), voter.caste)} />
            <SurveyItem label={t('designation')} value={voter.designation} onEdit={() => openEditModal('designation', t('designation'), voter.designation)} />
            <SurveyItem label={t('society')} value={voter.society} onEdit={() => openEditModal('society', t('society'), voter.society)} />
            <SurveyItem label={t('flat_no')} value={voter.flatNo} onEdit={() => openEditModal('flatNo', t('flat_no'), voter.flatNo)} />
            <SurveyItem label={t('demands')} value={voter.demands} onEdit={() => openEditModal('demands', t('demands'), voter.demands)} />
            <View style={styles.divider} />
            <SurveyItem label={t('is_dead')} type="radio" value={voter.isDead} onToggle={(val: boolean) => updateVoterField('isDead', val)} />
            <SurveyItem label={t('star_voter')} type="radio" value={voter.isStar} onToggle={(val: boolean) => updateVoterField('isStar', val)} />
            <SurveyItem label={t('voted')} type="radio" value={voter.isVoted} onToggle={(val: boolean) => updateVoterField('isVoted', val)} />
            {isSaving && <ActivityIndicator color="#FF6600" style={{ marginTop: 10 }} />}
          </View>
        )}
      </ScrollView>

      {/* --- MODALS --- */}
      <Modal visible={ticketModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
            <View style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <View>
                  <Text style={styles.ticketHeaderTitle}>{voter.name}</Text>
                  <Text style={styles.ticketSubHeader}>{t('voter_slip')}</Text>
                </View>
                <MaterialCommunityIcons name="check-decagram" size={30} color="#fff" />
              </View>
              <View style={styles.ticketBody}>
                <View style={styles.ticketRow}>
                   <View style={styles.ticketCol}>
                      <Text style={styles.tLabel}>EPIC NO</Text>
                      <Text style={styles.tValue}>{voter.epic_id || '-'}</Text>
                   </View>
                   <View style={styles.ticketCol}>
                      <Text style={styles.tLabel}>{t('sr_no')}</Text>
                      <Text style={styles.tValue}>{voter.srNo || '-'}</Text>
                   </View>
                </View>

                <View style={styles.ticketDivider} />

                <View style={styles.ticketRow}>
                   <View style={styles.ticketCol}>
                      <Text style={styles.tLabel}>{t('ward')}</Text>
                      <Text style={styles.tValue}>{voter.parbhag ? voter.parbhag.split(' ').pop() : '-'}</Text>
                   </View>
                   <View style={styles.ticketCol}>
                      <Text style={styles.tLabel}>{t('dob')}</Text>
                      <Text style={styles.tValue}>{voter.dob || '-'}</Text>
                   </View>
                </View>

                <View style={styles.ticketDivider} />

                <View style={styles.ticketRow}>
                   <View style={styles.ticketCol}>
                      <Text style={styles.tLabel}>{t('gender')} / {t('age')}</Text>
                      <Text style={styles.tValue}>{voter.gender} / {voter.age}</Text>
                   </View>
                </View>

                <View style={styles.ticketDivider} />

                <Text style={styles.tLabel}>{t('address')}</Text>
                <Text style={styles.tValueSmall}>{voter.yadi_bhag}</Text>
              </View>
              <View style={styles.ticketFooter}>
                 <Text style={styles.footerText}>याद राखा, मतदान करा!</Text>
              </View>
            </View>
          </ViewShot>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.shareBtnLarge} onPress={shareTicketImage}>
              <MaterialCommunityIcons name="whatsapp" size={24} color="#fff" />
              <Text style={styles.btnText}>{t('share')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTicketModalVisible(false)}><Text style={{ color: '#fff', marginTop: 20 }}>{t('close')}</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior="padding" style={styles.editCard}>
            <Text style={styles.modalTitle}>{t('update')} {currentEdit.label}</Text>
            <TextInput style={styles.modalInput} value={currentEdit.value} onChangeText={(txt) => setCurrentEdit({ ...currentEdit, value: txt })} autoFocus />
            <View style={styles.modalActionsRow}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}><Text>{t('close')}</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={() => updateVoterField(currentEdit.key, currentEdit.value)}><Text style={{ color: '#fff' }}>{t('save')}</Text></TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={colorModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.editCard}>
            <Text style={styles.modalTitle}>{t('voter_category')}</Text>
            {COLOR_OPTIONS.map((opt) => (
              <TouchableOpacity key={opt.id} style={[styles.colorOption, { backgroundColor: opt.color }]} onPress={() => updateVoterField('colorCode', opt.color)}>
                <Text style={styles.colorLabel}>{opt.label}</Text>
                {voter?.colorCode === opt.color && <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={{ alignItems: 'center', marginTop: 15 }} onPress={() => setColorModalVisible(false)}><Text style={{ color: '#FF6600', fontWeight: 'bold' }}>{t('close')}</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  orangeHeader: { height: 110, backgroundColor: '#FF8C00', borderBottomLeftRadius: 35, borderBottomRightRadius: 35, alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', left: 20, top: 40 },
  backIconBg: { backgroundColor: '#fff', borderRadius: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', marginTop: -20, marginHorizontal: 20, borderRadius: 12, elevation: 4 },
  tabItem: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTabBorder: { borderBottomWidth: 3, borderBottomColor: '#FF6600' },
  tabText: { color: '#888', fontWeight: 'bold' },
  activeTabText: { color: '#FF6600' },
  scrollContent: { padding: 15, paddingTop: 20 },
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 15, elevation: 2, marginBottom: 20 },
  voterHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  voterMainName: { fontSize: 18, fontWeight: 'bold', marginRight: 10 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  gridContainer: { flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 15, marginBottom: 15 },
  gridItem: { alignItems: 'center' },
  gridLabel: { fontSize: 12, color: '#999' },
  gridValue: { fontSize: 16, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  infoLabel: { color: '#888', fontSize: 13 },
  infoValue: { fontWeight: 'bold', fontSize: 14, textAlign: 'right' },
  addressBox: { marginTop: 10, backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8 },
  addressText: { color: '#555', fontSize: 13, lineHeight: 18 },
  actionRow: { flexDirection: 'row', marginTop: 15, gap: 10 },
  ticketBtn: { flex: 1, backgroundColor: '#FF6600', flexDirection: 'row', padding: 14, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  ticketBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  shareBtnInfo: { backgroundColor: '#3498db', padding: 14, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  surveyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  surveyLabel: { fontSize: 14, color: '#444', flex: 1 },
  surveyAction: { flex: 1, alignItems: 'flex-end' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  surveyValueDisplay: { color: '#888', fontSize: 13 },
  colorIndicator: { width: 20, height: 20, borderRadius: 10 },
  radioGroup: { flexDirection: 'row', gap: 12 },
  radio: { flexDirection: 'row', alignItems: 'center' },
  radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#FF6600', justifyContent: 'center', alignItems: 'center', marginRight: 5 },
  radioInnerActive: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF6600' },
  radioText: { fontSize: 13 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  editCard: { backgroundColor: '#fff', borderRadius: 15, padding: 20, width: '100%' },
  modalTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 15 },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 20 },
  modalActionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20, alignItems: 'center' },
  saveBtn: { backgroundColor: '#FF6600', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  colorOption: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderRadius: 10, marginBottom: 10 },
  colorLabel: { color: '#fff', fontWeight: 'bold' },
  ticketCard: { width: width * 0.85, backgroundColor: '#fff', borderRadius: 15, overflow: 'hidden', elevation: 10 },
  ticketHeader: { backgroundColor: '#FF6600', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketHeaderTitle: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  ticketSubHeader: { color: '#ffd4b3', fontSize: 12, fontWeight: '600' },
  ticketBody: { padding: 20 },
  ticketRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  ticketCol: { flex: 1 },
  ticketDivider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  tLabel: { color: '#999', fontSize: 10, marginBottom: 2, textTransform: 'uppercase' },
  tValue: { color: '#000', fontWeight: 'bold', fontSize: 15 },
  tValueSmall: { color: '#444', fontSize: 13, lineHeight: 18 },
  ticketFooter: { backgroundColor: '#f0f0f0', padding: 10, alignItems: 'center' },
  footerText: { color: '#FF6600', fontWeight: 'bold', fontSize: 12 },
  modalActions: { alignItems: 'center', marginTop: 30 },
  shareBtnLarge: { backgroundColor: '#25D366', flexDirection: 'row', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 30, alignItems: 'center', gap: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});