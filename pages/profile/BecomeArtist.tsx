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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { artistService, ArtistApplicationResponseData } from '@/lib/artistService';
import { getSessionUser, setSessionUser } from '@/lib/session';

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
  const [socialProofLink, setSocialProofLink] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [existingApplication, setExistingApplication] = useState<ArtistApplicationResponseData | null>(null);

  useEffect(() => {
    fetchApplicationStatus();
  }, []);

  const fetchApplicationStatus = async () => {
    setIsLoading(true);
    try {
      const status = await artistService.getMyApplicationStatus();
      if (status) {
        setExistingApplication(status);
      }
    } catch (err) {
      console.log('Error checking artist application status:', err);
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

    try {
      const result = await artistService.submitApplication({
        stageName: stageName.trim(),
        category: selectedCategory,
        bio: bio.trim(),
        socialProofLink: socialProofLink.trim(),
      });

      setExistingApplication(result);
      Alert.alert(
        'Application Submitted!',
        'Your application to become an Artist is currently under review by our curation team.'
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
      ) : existingApplication ? (
        /* Status Card View if Application Exists */
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.statusCard}>
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
                    ? '#F59E0B'
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
                        ? '#F59E0B'
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
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Social Link:</Text>
                <Text style={styles.infoValue}>{existingApplication.socialProofLink}</Text>
              </View>
            ) : null}

            {existingApplication.status === 'REJECTED' && (
              <TouchableOpacity
                style={styles.reapplyBtn}
                onPress={() => setExistingApplication(null)}
              >
                <Text style={styles.reapplyBtnText}>Submit New Application</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      ) : (
        /* Application Form View */
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
              placeholderTextColor="#9CA3AF"
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
            <Text style={styles.label}>Social Proof / Portfolio Link</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. instagram.com/artist handle or Spotify link"
              placeholderTextColor="#9CA3AF"
              value={socialProofLink}
              onChangeText={setSocialProofLink}
            />
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
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1F2937',
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
    borderRadius: 20,
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
    height: 52,
    borderRadius: 12,
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
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  reapplyBtn: {
    backgroundColor: PURPLE,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  reapplyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
});

export default BecomeArtist;
