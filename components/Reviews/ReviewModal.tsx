import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet, Dimensions } from 'react-native';
import TrackCard from '../cart/TrackCard';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reviewData: { rating: number; feedback: string }) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ visible, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmitReview = () => {
    onSubmit({ rating, feedback });
    onClose();
  };

  const renderStar = (starNumber: number) => {
    if (starNumber <= rating) {
      // Selected star SVG
      return (
        <Svg width={24} height={23} viewBox="0 0 24 23" fill="none">
          <Path
            d="M9.2712 5.18275C10.4854 3.00541 11.092 1.91675 11.9996 1.91675C12.9071 1.91675 13.5137 3.00541 14.7279 5.18275L15.0423 5.74625C15.3873 6.36533 15.5598 6.67487 15.8281 6.879C16.0964 7.08312 16.4319 7.15883 17.1027 7.31025L17.7122 7.44825C20.0697 7.98204 21.2475 8.24846 21.5283 9.15025C21.8081 10.0511 21.005 10.9912 19.3979 12.8705L18.982 13.3564C18.5258 13.8902 18.2968 14.1575 18.1942 14.4872C18.0917 14.8178 18.1262 15.1743 18.1952 15.8864L18.2584 16.5352C18.5009 19.0431 18.6226 20.2966 17.8885 20.8534C17.1544 21.4102 16.0504 20.9023 13.8444 19.8865L13.2722 19.6239C12.6455 19.3345 12.3321 19.1907 11.9996 19.1907C11.667 19.1907 11.3537 19.3345 10.7269 19.6239L10.1557 19.8865C7.9487 20.9023 6.8447 21.4102 6.11157 20.8544C5.37653 20.2966 5.49824 19.0431 5.7407 16.5352L5.80395 15.8873C5.87295 15.1743 5.90745 14.8178 5.80395 14.4882C5.70237 14.1575 5.47332 13.8902 5.01716 13.3573L4.60124 12.8705C2.99412 10.9922 2.19103 10.052 2.47087 9.15025C2.7507 8.24846 3.93041 7.98108 6.28791 7.44825L6.89741 7.31025C7.56728 7.15883 7.90174 7.08312 8.17103 6.879C8.44032 6.67487 8.61187 6.36533 8.95687 5.74625L9.2712 5.18275Z"
            fill="#FCAF41"
          />
        </Svg>
      );
    } else {
      // Unselected star SVG
      return (
        <Svg width={24} height={23} viewBox="0 0 24 23" fill="none">
          <Path
            d="M12 2.41675C12.2139 2.4169 12.4629 2.52946 12.8516 3.03687C13.2409 3.54528 13.6757 4.3232 14.291 5.42651L14.6055 5.98999C14.9287 6.56995 15.1543 6.99479 15.5254 7.2771C15.9002 7.5622 16.365 7.65605 16.9922 7.79761L17.6016 7.93628C18.7973 8.20703 19.6359 8.39814 20.2158 8.62671C20.7149 8.82347 20.924 9.00995 21.0176 9.21167L21.0508 9.29858C21.1255 9.53925 21.0862 9.83791 20.7471 10.3767C20.4046 10.9208 19.8318 11.5935 19.0176 12.5457L18.6025 13.031L18.6016 13.032C18.2266 13.4707 17.9376 13.7971 17.7773 14.1736L17.7168 14.3386C17.5775 14.7878 17.6323 15.264 17.6973 15.9343V15.9353L17.7607 16.5837C17.8835 17.8536 17.9695 18.7516 17.9404 19.4041C17.9114 20.0556 17.7712 20.3143 17.5859 20.4548C17.4086 20.5893 17.1469 20.6486 16.5557 20.4792C15.958 20.308 15.1723 19.9474 14.0537 19.4324H14.0527L13.4805 19.1697H13.4814C12.896 18.8993 12.4676 18.6913 12 18.6912C11.6492 18.6912 11.3202 18.8084 10.9307 18.9812L10.5176 19.1697L9.94727 19.4324H9.94629C8.82717 19.9475 8.04112 20.3079 7.44336 20.4792C6.85185 20.6488 6.59079 20.5897 6.41406 20.4558C6.22805 20.3147 6.08776 20.0555 6.05859 19.4041C6.03671 18.9147 6.07979 18.2872 6.1543 17.4685L6.23828 16.5837L6.30176 15.9363V15.9353C6.35855 15.3484 6.40813 14.9099 6.3252 14.5085L6.28125 14.3386C6.14166 13.8869 5.8244 13.5318 5.39648 13.032L4.98145 12.5457L4.41602 11.8816C3.89532 11.2656 3.50881 10.7857 3.25195 10.3777C2.91297 9.83914 2.87343 9.53989 2.94824 9.29858C3.0213 9.06315 3.21252 8.85069 3.7832 8.62573C4.36337 8.39707 5.20278 8.20652 6.39844 7.93628L7.00781 7.79761C7.63484 7.65588 8.0973 7.56158 8.47266 7.2771C8.75233 7.06511 8.94908 6.77272 9.16602 6.39526L9.39355 5.98999L9.70801 5.42651C10.3233 4.3232 10.7581 3.54528 11.1475 3.03687C11.5364 2.52907 11.786 2.41675 12 2.41675Z"
            stroke="#FCAF41"
          />
        </Svg>
      );
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Review</Text>
          <TrackCard
            imageSource={require('../../assets/images/cart/order1.jpg')}
            title="Kendric's Jacket on Tour"
            subtitle="Kendric Lamar"
            price="$150.00"
          />
          <Text style={styles.title}>How is your order?</Text>
          <Text style={styles.label}>
            Please give your rating & also your feedback review
          </Text>

          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                {renderStar(star)}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.title}>Write the reason for your feedback</Text>
          <TextInput
            style={styles.input}
            placeholder="Please give your rating & also your feedback review"
            placeholderTextColor="#A9A9A9"
            multiline
            value={feedback}
            onChangeText={setFeedback}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#f5f8faff',
    padding: 20,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 25, color: '#000', textAlign: 'center' },
  label: { fontSize: 18, color: '#8A8A8A', marginBottom: 25, textAlign: 'center' },
  starContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30, gap: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#8A8A8A66',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    textAlignVertical: 'top',
    width: '100%',
    height: 140,
    fontSize: 16,
    color: '#8A8A8A',
  },
  submitButton: {
    backgroundColor: '#FF650E',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cancelButton: { marginTop: 10, alignItems: 'center' },
  cancelText: { color: '#FF650E', fontSize: 16 },
});

export default ReviewModal;
