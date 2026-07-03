import React, { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, TextInput,
  StyleSheet, Dimensions, Image, ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';
const GREEN = '#32A06E';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reviewData: { rating: number; feedback: string }) => void;
  imageSource?: any;
  title?: string;
  subtitle?: string;
  price?: string;
}

const RATING_LABELS = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];

const StarIcon = ({ filled }: { filled: boolean }) => (
  <Svg width={32} height={32} viewBox="0 0 24 23" fill="none">
    <Path
      d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
      fill={filled ? '#FCAF41' : 'none'}
      stroke="#FCAF41"
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  </Svg>
);

const ReviewModal: React.FC<ReviewModalProps> = ({
  visible, onClose, onSubmit,
  imageSource = require('../../assets/images/cart/order1.jpg'),
  title = "Kendric's Jacket on Tour",
  subtitle = 'Kendric Lamar',
  price = '$150.00',
}) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit({ rating, feedback });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setFeedback('');
      onClose();
    }, 1800);
  };

  const handleClose = () => {
    setRating(0);
    setFeedback('');
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {submitted ? (
            <View style={styles.successContainer}>
              <View style={styles.successCircle}>
                <Svg width={28} height={28} viewBox="0 0 24 24" fill={GREEN}>
                  <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </Svg>
              </View>
              <Text style={styles.successTitle}>Review Submitted!</Text>
              <Text style={styles.successSub}>Thank you for your feedback.</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {/* Header */}
              <Text style={styles.modalTitle}>Rate Your Order</Text>

              {/* Product mini card */}
              <View style={styles.productCard}>
                <Image source={imageSource} style={styles.productImage} resizeMode="cover" />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>{title}</Text>
                  <Text style={styles.productArtist}>{subtitle}</Text>
                  <Text style={styles.productPrice}>{price}</Text>
                </View>
              </View>

              {/* Rating prompt */}
              <Text style={styles.ratingPrompt}>How was your experience?</Text>
              <Text style={styles.ratingSubPrompt}>Tap a star to rate this item</Text>

              {/* Stars */}
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                    <StarIcon filled={star <= rating} />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Rating label */}
              {rating > 0 && (
                <View style={[styles.ratingLabelBadge, { backgroundColor: rating >= 4 ? '#EAF7F2' : rating === 3 ? '#FFF8EE' : '#F0E8FF' }]}>
                  <Text style={[styles.ratingLabelText, { color: rating >= 4 ? GREEN : rating === 3 ? '#E88C00' : '#E02020' }]}>
                    {RATING_LABELS[rating]}
                  </Text>
                </View>
              )}

              {/* Feedback input */}
              <Text style={styles.feedbackLabel}>Write your feedback</Text>
              <TextInput
                style={styles.feedbackInput}
                placeholder="Tell us what you liked or disliked about this item..."
                placeholderTextColor="#BDBDBD"
                multiline
                numberOfLines={4}
                value={feedback}
                onChangeText={setFeedback}
                textAlignVertical="top"
              />

              {/* Quick tags */}
              <View style={styles.tagsRow}>
                {['Great quality', 'Fast delivery', 'True to size', 'Loved it'].map(tag => (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tag, feedback.includes(tag) && styles.tagSelected]}
                    onPress={() => setFeedback(prev => prev.includes(tag) ? prev.replace(tag, '').trim() : (prev ? `${prev}, ${tag}` : tag))}
                  >
                    <Text style={[styles.tagText, feedback.includes(tag) && styles.tagTextSelected]}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                activeOpacity={rating > 0 ? 0.85 : 1}
              >
                <Text style={styles.submitText}>Submit Review</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    padding: 20,
    paddingTop: 12,
    maxHeight: '92%',
  },
  handleBar: {
    width: 90, height: 4, backgroundColor: '#888',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20, color: '#111',
    textAlign: 'center', marginBottom: 16, fontFamily: 'Poppins-Bold',
  },

  // Product card
  productCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F8F8',
    borderRadius: 12, padding: 12, marginBottom: 20,
  },
  productImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, color: '#111', marginBottom: 2, fontFamily: 'Poppins-Bold' },
  productArtist: { fontSize: 14, color: '#888', marginBottom: 4, fontFamily: 'Poppins-Regular' },
  productPrice: { fontSize: 16, color: PURPLE, fontFamily: 'Poppins-Bold' },

  // Stars
  ratingPrompt: { fontSize: 16, color: '#111', textAlign: 'center', marginBottom: 4, fontFamily: 'Poppins-Bold' },
  ratingSubPrompt: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 14, fontFamily: 'Poppins-Regular' },
  starRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 12 },
  ratingLabelBadge: { alignSelf: 'center', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 16 },
  ratingLabelText: { fontSize: 14, fontFamily: 'Poppins-Bold' },

  // Feedback
  feedbackLabel: { fontSize: 16, color: '#333', marginBottom: 8, fontFamily: 'Poppins-Medium' },
  feedbackInput: {
    borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 5,
    padding: 14, height: 110, fontSize: 16, color: '#111',
    backgroundColor: '#FAFAFA', fontFamily: 'Poppins-Regular', marginBottom: 12,
  },

  // Quick tags
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tag: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#F8F8F8' },
  tagSelected: { borderColor: PURPLE, backgroundColor: '#F0E8FF' },
  tagText: { fontSize: 13, color: '#555', fontFamily: 'Poppins-Regular' },
  tagTextSelected: { color: PURPLE, fontFamily: 'Poppins-Medium' },

  // Buttons
  submitBtn: { backgroundColor: PURPLE, borderRadius: 5, paddingVertical: 10, alignItems: 'center', marginBottom: 10 },
  submitBtnDisabled: { backgroundColor: '#C4A1EE' },
  submitText: { color: '#fff', fontSize: 15, fontFamily: 'Poppins-Bold' },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { color: '#888', fontSize: 16, fontFamily: 'Poppins-Bold' },

  // Success
  successContainer: { alignItems: 'center', paddingVertical: 40 },
  successCircle: { width: 60, height: 60, borderRadius: 40, backgroundColor: '#EAF7F2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  successTitle: { fontSize: 22, color: '#111', marginBottom: 8, fontFamily: 'Poppins-Bold' },
  successSub: { fontSize: 14, color: '#888', fontFamily: 'Poppins-Regular' },
});

export default ReviewModal;

