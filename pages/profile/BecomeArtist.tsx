import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { artistService, ArtistApplicationResponseData } from '@/lib/artistService';
import { profileService } from '@/lib/profileService';
import { getSessionUser, setSessionUser, getSessionToken } from '@/lib/session';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';

const CATEGORIES = [
  'Musician / Vocalist',
  'Visual Artist / Painter',
  'Fashion Designer',
  'Influencer / Creator',
  'Producer / DJ',
  'Actor / Entertainer',
];

const BecomeArtist: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const sessionUser = getSessionUser();

  const [stageName, setStageName] = useState(sessionUser.fullName || '');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [bio, setBio] = useState('');
  const [socialLinks, setSocialLinks] = useState<string[]>(['']);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [existingApplication, setExistingApplication] = useState<ArtistApplicationResponseData | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchApplicationStatus();
    }, [])
  );

  const handleAddLink = () => {
    setSocialLinks([...socialLinks, '']);
  };

  const handleUpdateLink = (index: number, text: string) => {
    const updated = [...socialLinks];
    updated[index] = text;
    setSocialLinks(updated);
  };

  const handleRemoveLink = (index: number) => {
    if (socialLinks.length === 1) {
      setSocialLinks(['']);
    } else {
      setSocialLinks(socialLinks.filter((_, i) => i !== index));
    }
  };

  const fetchApplicationStatus = async () => {
    setIsLoading(true);
    try {
      // Fire profile check non-blocking in background
      if (getSessionToken()) {
        profileService.getMyProfile().then((prof) => {
          if (prof && prof.role === 'ARTIST') {
            setSessionUser({ role: 'ARTIST' });
          }
        }).catch(() => {});
      }

      const status = await artistService.getMyApplicationStatus();
      if (status && status.status) {
        setExistingApplication(status);
        if (status.status === 'APPROVED') {
          setSessionUser({ role: 'ARTIST' });
        }
      } else {
        setExistingApplication(null);
      }
    } catch (err) {
      console.log('Error checking artist application status:', err);
      setExistingApplication(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!stageName.trim()) {
      setErrorMsg('Stage Name is required');
      return;
    }
    if (!selectedCategory) {
      setErrorMsg('Please select a category');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    const validLinks = socialLinks.map((l) => l.trim()).filter(Boolean);
    const combinedSocialProof = validLinks.join(', ');

    try {
      const result = await artistService.submitApplication({
        stageName: stageName.trim(),
        category: selectedCategory,
        bio: bio.trim(),
        socialProofLink: combinedSocialProof,
      });

      setExistingApplication(result);
      Alert.alert(
        'Application Submitted!',
        'Your application to become an Artist is currently under review by our curation team.'
      );
    } catch (err: any) {
      const message = err.message || 'There is a problem submitting your application. Please try again.';
      setErrorMsg(message);
      Alert.alert('Submission Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Become an Artist</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PURPLE} />
          <Text style={styles.loadingText}>Checking application status...</Text>
        </View>
      ) : existingApplication && existingApplication.status ? (
        /* Status Card View if Application Exists */
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.statusCard}>
            {(sessionUser.avatar || sessionUser.profilePicture) ? (
              <Image
                source={{ uri: sessionUser.avatar || sessionUser.profilePicture }}
                style={{ width: 72, height: 72, borderRadius: 36, alignSelf: 'center', marginBottom: 12 }}
              />
            ) : null}
            <View style={styles.badgeRow}>
              <Ionicons
                name={
                  existingApplication.status === 'APPROVED'
                    ? 'checkmark-circle'
                    : existingApplication.status === 'PENDING'
                    ? 'time-outline'
                    : 'close-circle'
                }
                size={40}
                color={
                  existingApplication.status === 'APPROVED'
                    ? '#10B981'
                    : existingApplication.status === 'PENDING'
                    ? '#7126D0'
                    : '#EF4444'
                }
              />
              <Text
                style={[
                  styles.statusTitle,
                  {
                    color:
                      existingApplication.status === 'APPROVED'
                        ? '#10B981'
                        : existingApplication.status === 'PENDING'
                        ? '#7126D0'
                        : '#EF4444',
                  },
                ]}
              >
                {existingApplication.status === 'APPROVED'
                  ? 'Verified Creator / Artist'
                  : existingApplication.status === 'PENDING'
                  ? 'Application Under Review'
                  : 'Application Declined'}
              </Text>
            </View>

            <Text style={styles.statusDesc}>
              {existingApplication.status === 'APPROVED'
                ? 'Congratulations! Your account is verified as an Artist. You now have full access to Merch Sales, Music Uploads, Concert Tickets & Creator Analytics.'
                : existingApplication.status === 'PENDING'
                ? 'Our team is reviewing your application and follower proof. This process typically takes up to 24 hours.'
                : `Reason: ${existingApplication.rejectionReason || 'Criteria not met.'}`}
            </Text>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Stage Name:</Text>
              <Text style={styles.infoValue}>{existingApplication.stageName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category:</Text>
              <Text style={styles.infoValue}>{existingApplication.category}</Text>
            </View>
            {existingApplication.socialProofLink ? (
              <View style={[styles.infoRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                <Text style={styles.infoLabel}>Social Link(s):</Text>
                {existingApplication.socialProofLink
                  .split(/,|\n/)
                  .map((link) => link.trim())
                  .filter(Boolean)
                  .map((link, idx) => (
                    <Text
                      key={idx}
                      style={[styles.infoValue, { marginTop: 4, color: PURPLE }]}
                    >
                      {link}
                    </Text>
                  ))}
              </View>
            ) : null}

            {existingApplication.status === 'APPROVED' && (
              <TouchableOpacity
                style={styles.reapplyBtn}
                onPress={() => {
                  setSessionUser({ role: 'ARTIST' });
                  navigation.navigate('MyProfile', { role: 'artist' });
                }}
              >
                <Text style={styles.reapplyBtnText}>Go to Verified Artist Profile</Text>
              </TouchableOpacity>
            )}

            {existingApplication.status === 'REJECTED' && (
              <TouchableOpacity
                style={styles.reapplyBtn}
                onPress={() => setExistingApplication(null)}
              >
                <Text style={styles.reapplyBtnText}>Submit New Application</Text>
              </TouchableOpacity>
            )}

            {/* Admin Curation Portal — removed: all admin review is now done via the web Admin Dashboard */}
            {/* <View style={styles.adminBox}>
              <View style={styles.adminHeader}>
                <Ionicons name="shield-checkmark-outline" size={18} color={PURPLE} />
                <Text style={styles.adminTitle}>Admin Curation Portal</Text>
              </View>

              {existingApplication.status === 'PENDING' && (
                <View style={styles.adminActions}>
                  <TouchableOpacity
                    style={[styles.adminBtn, styles.adminBtnApprove]}
                    onPress={async () => {
                      try {
                        const updated = await artistService.reviewApplication(existingApplication.id, true);
                        setExistingApplication(updated);
                        setSessionUser({ role: 'ARTIST' });
                        Alert.alert('Approved!', 'Application approved! User converted to Artist with Verified Badge & Artist Wallet.');
                      } catch (err: any) {
                        Alert.alert('Error', err.message || 'Failed to approve');
                      }
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                    <Text style={styles.adminBtnText}>Approve & Tag Artist</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.adminBtn, styles.adminBtnReject]}
                    onPress={async () => {
                      try {
                        const updated = await artistService.reviewApplication(
                          existingApplication.id,
                          false,
                          'Follower count proof threshold not met.'
                        );
                        setExistingApplication(updated);
                        Alert.alert('Declined', 'Application declined.');
                      } catch (err: any) {
                        Alert.alert('Error', err.message || 'Failed to reject');
                      }
                    }}
                  >
                    <Ionicons name="close-circle" size={16} color="#DC2626" />
                    <Text style={[styles.adminBtnText, { color: '#DC2626' }]}>Decline</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={styles.adminLinkBtn}
                onPress={() => navigation.navigate('AdminArtistApplications')}
              >
                <Text style={styles.adminLinkText}>Open Full Admin Dashboard →</Text>
              </TouchableOpacity>
            </View> */}
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Banner */}
          <View style={styles.bannerCard}>
            <Ionicons name="sparkles" size={32} color={PURPLE} />
            <Text style={styles.bannerTitle}>Unlock Artist & Creator Perks</Text>
            <Text style={styles.bannerSub}>
              Sell official merchandise, release music, host live auctions, and manage concerts directly with your fan base.
            </Text>
          </View>

          {errorMsg && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Stage / Brand Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Kenny K Shot"
              placeholderTextColor="#333"
              value={stageName}
              onChangeText={setStageName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Creator Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Short Bio / Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell fans and curators about your craft and work..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={bio}
              onChangeText={setBio}
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelHeaderRow}>
              <Text style={styles.label}>Social Proof & Portfolio Links</Text>
              <TouchableOpacity onPress={handleAddLink} style={styles.addLinkHeaderBtn}>
                <Ionicons name="add-circle-outline" size={18} color={PURPLE} />
                <Text style={styles.addLinkHeaderText}>Add Another Link</Text>
              </TouchableOpacity>
            </View>

            {socialLinks.map((link, idx) => (
              <View key={idx} style={styles.linkInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder={
                    idx === 0
                      ? 'e.g. instagram.com/artisthandle'
                      : idx === 1
                      ? 'e.g. spotify.com/artist/...'
                      : 'e.g. tiktok.com/@artisthandle'
                  }
                  placeholderTextColor="#9CA3AF"
                  value={link}
                  onChangeText={(text) => handleUpdateLink(idx, text)}
                />
                {socialLinks.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveLink(idx)}
                    style={styles.removeLinkBtn}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Artist Application</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  scrollContent: {
    padding: 20,
  },
  bannerCard: {
    backgroundColor: '#F3E8FF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#581C87',
    marginTop: 8,
    textAlign: 'center',
  },
  bannerSub: {
    fontSize: 13,
    fontFamily: 'PoppinsMedium',
    color: '#6B21A8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    color: '#991B1B',
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginRight: 10,
  },
  categoryPillActive: {
    backgroundColor: PURPLE,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#4B5563',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: PURPLE,
    paddingVertical: 10,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  statusCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 20,
  },
  badgeRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginTop: 8,
  },
  statusDesc: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#000000',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  reapplyBtn: {
    backgroundColor: PURPLE,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  reapplyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  adminBox: {
    marginTop: 24,
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  adminTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },
  adminActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  adminBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  adminBtnApprove: {
    backgroundColor: PURPLE,
  },
  adminBtnReject: {
    backgroundColor: '#FEE2E2',
  },
  adminBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  adminLinkBtn: {
    alignItems: 'center',
    marginTop: 4,
    paddingVertical: 4,
  },
  adminLinkText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: PURPLE,
    textDecorationLine: 'underline',
  },
  labelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addLinkHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addLinkHeaderText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },
  linkInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  removeLinkBtn: {
    padding: 8,
  },
});

export default BecomeArtist;
