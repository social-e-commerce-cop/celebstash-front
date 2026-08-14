import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Linking,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { artistService, ArtistApplicationResponseData } from '@/lib/artistService';

const PURPLE = '#7126D0';

const AdminArtistApplications: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [applications, setApplications] = useState<ArtistApplicationResponseData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Rejection modal state
  const [declineModalApp, setDeclineModalApp] = useState<ArtistApplicationResponseData | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadApplications();
  }, [filter]);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const statusParam = filter === 'ALL' ? undefined : filter;
      const data = await artistService.getAllApplications(statusParam);
      setApplications(data || []);
    } catch (err) {
      console.log('Error fetching applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (app: ArtistApplicationResponseData) => {
    setIsSubmitting(true);
    try {
      await artistService.reviewApplication(app.id, true);
      Alert.alert(
        'Application Approved!',
        `User ${app.userFullName} has been upgraded to an Artist account with verified status & artist wallet.`
      );
      loadApplications();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to approve application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDecline = async () => {
    if (!declineModalApp) return;

    if (!rejectionReason.trim()) {
      Alert.alert('Reason Required', 'Please provide a reason for declining the application.');
      return;
    }

    setIsSubmitting(true);
    try {
      await artistService.reviewApplication(declineModalApp.id, false, rejectionReason.trim());
      Alert.alert('Application Declined', 'Application rejected with notification sent.');
      setDeclineModalApp(null);
      setRejectionReason('');
      loadApplications();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to decline application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openLink = (url?: string) => {
    if (!url) return;
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(formattedUrl).catch(() => {
      Alert.alert('Invalid Link', `Could not open link: ${url}`);
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Artist Applications</Text>
        <TouchableOpacity onPress={loadApplications} style={styles.backBtn}>
          <Ionicons name="refresh" size={22} color={PURPLE} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterChip, filter === tab && styles.filterChipActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.filterText, filter === tab && styles.filterTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Applications List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PURPLE} />
          <Text style={styles.loadingText}>Loading applications...</Text>
        </View>
      ) : applications.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="documents-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Applications Found</Text>
          <Text style={styles.emptySub}>No applications match the "{filter}" filter.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {applications.map((app) => {
            const isPending = app.status === 'PENDING';
            const isApproved = app.status === 'APPROVED';

            return (
              <View key={app.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stageName}>{app.stageName}</Text>
                    <Text style={styles.applicantInfo}>
                      By {app.userFullName} • {app.userEmail}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      isApproved
                        ? styles.badgeApproved
                        : isPending
                        ? styles.badgePending
                        : styles.badgeRejected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        isApproved
                          ? styles.textApproved
                          : isPending
                          ? styles.textPending
                          : styles.textRejected,
                      ]}
                    >
                      {app.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Category:</Text>
                    <Text style={styles.detailValue}>{app.category}</Text>
                  </View>

                  {app.bio ? (
                    <View style={styles.detailRowCol}>
                      <Text style={styles.detailLabel}>Bio:</Text>
                      <Text style={styles.bioText}>{app.bio}</Text>
                    </View>
                  ) : null}

                  {app.socialProofLink ? (
                    <TouchableOpacity
                      style={styles.linkRow}
                      onPress={() => openLink(app.socialProofLink)}
                    >
                      <Ionicons name="link-outline" size={16} color={PURPLE} />
                      <Text style={styles.linkText} numberOfLines={1}>
                        {app.socialProofLink}
                      </Text>
                    </TouchableOpacity>
                  ) : null}

                  {app.rejectionReason ? (
                    <View style={styles.rejectionBox}>
                      <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
                      <Text style={styles.rejectionText}>{app.rejectionReason}</Text>
                    </View>
                  ) : null}
                </View>

                {isPending && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.btn, styles.btnDecline]}
                      onPress={() => {
                        setDeclineModalApp(app);
                        setRejectionReason('');
                      }}
                    >
                      <Ionicons name="close" size={16} color="#DC2626" />
                      <Text style={styles.btnDeclineText}>Decline</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.btn, styles.btnApprove]}
                      onPress={() => handleApprove(app)}
                      disabled={isSubmitting}
                    >
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      <Text style={styles.btnApproveText}>Approve & Tag Artist</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Review Rejection Modal */}
      <Modal visible={!!declineModalApp} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Decline Application</Text>
            <Text style={styles.modalSub}>
              Declining application for {declineModalApp?.stageName} ({declineModalApp?.userFullName})
            </Text>

            <Text style={styles.inputLabel}>Reason for declining:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Follower count threshold not met or insufficient portfolio proof."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              value={rejectionReason}
              onChangeText={setRejectionReason}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setDeclineModalApp(null);
                  setRejectionReason('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleConfirmDecline}
                disabled={isSubmitting}
              >
                <Text style={styles.modalSubmitText}>Confirm Rejection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: PURPLE,
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#4B5563',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#374151',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stageName: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  applicantInfo: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePending: { backgroundColor: '#FEF3C7' },
  badgeApproved: { backgroundColor: '#D1FAE5' },
  badgeRejected: { backgroundColor: '#FEE2E2' },
  statusBadgeText: { fontSize: 11, fontFamily: 'Poppins-Bold' },
  textPending: { color: '#D97706' },
  textApproved: { color: '#059669' },
  textRejected: { color: '#DC2626' },
  cardBody: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailRowCol: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#4B5563',
  },
  detailValue: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
  },
  bioText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    lineHeight: 18,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  linkText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: PURPLE,
    textDecorationLine: 'underline',
  },
  rejectionBox: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  rejectionLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#991B1B',
  },
  rejectionText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#B91C1C',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  btnDecline: {
    backgroundColor: '#FEE2E2',
  },
  btnDeclineText: {
    color: '#DC2626',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
  },
  btnApprove: {
    backgroundColor: PURPLE,
  },
  btnApproveText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  modalSub: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    height: 80,
    textAlignVertical: 'top',
    fontSize: 13,
    color: '#111827',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 18,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    color: '#6B7280',
    fontFamily: 'Poppins-Medium',
  },
  modalSubmitBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
  },
});

export default AdminArtistApplications;
