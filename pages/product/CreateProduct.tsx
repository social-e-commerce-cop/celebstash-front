import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';
import { productsService } from '@/lib/productsService';
import { API_BASE_URL, uploadFileToBackend } from '@/lib/apiClient';
import { getSessionToken } from '@/lib/session';
import { convertUSDToFRW } from '@/lib/currency';

const { width } = Dimensions.get('window');

const CATEGORIES = ['Clothing', 'Accessories', 'Art', 'Utilities', 'Merch'];
const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const AVAILABLE_COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Purple', 'Gold', 'Silver', 'Pink', 'Multi-color'];

interface SelectedMedia {
  uri: string;
  type: string;
  name: string;
}

export default function CreateProduct() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editProduct = route.params?.editProduct;
  const isEditing = !!editProduct?.id;

  // Form State initialized with editProduct if present
  const [name, setName] = useState(editProduct?.name || '');
  const [description, setDescription] = useState(editProduct?.description || '');
  const [price, setPrice] = useState(editProduct?.price ? String(editProduct.price) : '');
  const [category, setCategory] = useState(editProduct?.category || 'Clothing');
  const [statusMode, setStatusMode] = useState<'ACTIVE' | 'DRAFT'>('ACTIVE');
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>(
    editProduct?.imageUrls && editProduct.imageUrls.length > 0
      ? editProduct.imageUrls.map((url: string, index: number) => ({
          uri: url,
          type: 'image/jpeg',
          name: `existing_img_${index}.jpg`,
        }))
      : editProduct?.imageUrl
      ? [{ uri: editProduct.imageUrl, type: 'image/jpeg', name: 'existing_img_0.jpg' }]
      : []
  );

  // Stock, Size & Color State
  const [totalStock, setTotalStock] = useState(editProduct?.stockQuantity ? String(editProduct.stockQuantity) : '50');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    editProduct?.sizeStock && Object.keys(editProduct.sizeStock).length > 0
      ? Object.keys(editProduct.sizeStock)
      : ['S', 'M', 'L', 'XL']
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    editProduct?.availableColors && editProduct.availableColors.length > 0
      ? editProduct.availableColors
      : ['Black', 'White']
  );
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, string>>(() => {
    if (editProduct?.sizeStock && Object.keys(editProduct.sizeStock).length > 0) {
      const res: Record<string, string> = {};
      Object.entries(editProduct.sizeStock).forEach(([k, v]) => {
        res[k] = String(v);
      });
      return res;
    }
    return { S: '10', M: '15', L: '15', XL: '10' };
  });

  const [loading, setLoading] = useState(false);

  // Validation check for required fields: at least 1 image, title, and valid price > 0
  const isFormValid =
    selectedMedia.length > 0 &&
    name.trim().length > 0 &&
    price.trim().length > 0 &&
    !isNaN(Number(price)) &&
    Number(price) > 0;

  // Pick Images from Gallery
  const pickImages = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Please grant photo library access to choose product images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images || 'images' as any,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newMedia: SelectedMedia[] = result.assets.map((asset, idx) => ({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `product_img_${Date.now()}_${idx}.jpg`,
        }));
        setSelectedMedia((prev) => [...prev, ...newMedia]);
      }
    } catch (err: any) {
      Alert.alert('Error picking images', err.message || 'Failed to open image picker.');
    }
  };

  const removeMedia = (index: number) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSize = (sz: string) => {
    if (selectedSizes.includes(sz)) {
      setSelectedSizes(selectedSizes.filter((item) => item !== sz));
    } else {
      setSelectedSizes([...selectedSizes, sz]);
    }
  };

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter((c) => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const updateSizeQty = (sz: string, val: string) => {
    setSizeQuantities((prev) => ({ ...prev, [sz]: val }));
  };

  // Upload image file to backend with automatic fallback URL retry
  const uploadImageFile = async (media: SelectedMedia): Promise<string> => {
    return await uploadFileToBackend(media.uri, media.name, media.type);
  };

  // Submit Product Creation
  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a product title.');
      return;
    }
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price.');
      return;
    }
    if (selectedMedia.length === 0) {
      Alert.alert('Validation Error', 'Please select at least 1 image for your product.');
      return;
    }

    setLoading(true);

    try {
      // 1. Upload all selected images to backend file storage
      const imageUrls: string[] = [];
      for (const media of selectedMedia) {
        if (media.uri.startsWith('http')) {
          imageUrls.push(media.uri);
        } else {
          const uploadedUrl = await uploadImageFile(media);
          imageUrls.push(uploadedUrl);
        }
      }

      // 2. Build sizeStock map
      const sizeStockMap: Record<string, number> = {};
      selectedSizes.forEach((sz) => {
        const val = parseInt(sizeQuantities[sz] || '0', 10);
        sizeStockMap[sz] = isNaN(val) ? 0 : val;
      });

      const parsedStock = parseInt(totalStock, 10) || 0;
      const parsedPrice = parseFloat(price);

      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
        category,
        stockQuantity: parsedStock,
        imageUrls,
        sizeStock: sizeStockMap,
        availableColors: selectedColors,
        productType: 'REGULAR' as const,
      };

      // 3. Call Create/Update Product API
      if (isEditing) {
        await productsService.updateProduct(editProduct.id, payload);
        setLoading(false);
        Alert.alert(
          'Product Resubmitted!',
          'Your updated product details have been resubmitted for Admin review.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        await productsService.createProduct(payload);
        setLoading(false);
        Alert.alert(
          'Product Submitted!',
          'Your product has been submitted for Admin approval. It will appear on the shop once approved.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Failed to Create Product', err?.message || 'An error occurred while creating product.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round">
            <Path d="M19 12H5M12 19l-7-7 7-7" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Product</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* 1. Add Media Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Media</Text>
          <Text style={styles.cardSubtitle}>Add media for this product (1-10 photos)</Text>

          <TouchableOpacity style={styles.selectMediaBox} activeOpacity={0.8} onPress={pickImages}>
            <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7126D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
              <Path d="M16 5h6v6" />
              <Path d="M13 11L22 2" />
            </Svg>
            <Text style={styles.selectMediaText}>Select Media</Text>
            <Text style={styles.selectMediaSub}>Tap to browse photo library</Text>
          </TouchableOpacity>

          {/* Media Thumbnails List */}
          {selectedMedia.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaRow}>
              {selectedMedia.map((item, idx) => (
                <View key={idx} style={styles.mediaThumbWrap}>
                  <Image source={{ uri: item.uri }} style={styles.mediaThumb} />
                  <TouchableOpacity style={styles.removeMediaBtn} onPress={() => removeMedia(idx)}>
                    <Text style={styles.removeMediaText}>✕</Text>
                  </TouchableOpacity>
                  <View style={styles.mediaBadge}>
                    <Text style={styles.mediaBadgeText}>{idx + 1}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* 2. Product Title */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Product Title *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter product title"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* 3. Status Toggle */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Status</Text>
          <View style={styles.statusRow}>
            <TouchableOpacity
              style={[styles.statusPill, statusMode === 'ACTIVE' && styles.statusPillActive]}
              onPress={() => setStatusMode('ACTIVE')}
            >
              <Text style={[styles.statusPillText, statusMode === 'ACTIVE' && styles.statusPillTextActive]}>
                Active (Pending Review)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusPill, statusMode === 'DRAFT' && styles.statusPillActive]}
              onPress={() => setStatusMode('DRAFT')}
            >
              <Text style={[styles.statusPillText, statusMode === 'DRAFT' && styles.statusPillTextActive]}>
                Draft
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Product description, materials, details..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* 5. Category Selection */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.chipWrap}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, category === cat && styles.chipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 6. Price & Stock Inputs */}
        <View style={styles.rowTwo}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Price ($ USD) *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0.00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
            />
            {!!price && !isNaN(Number(price)) && Number(price) > 0 && (
              <Text style={{ fontSize: 11, color: '#7126D0', fontFamily: 'Poppins-Medium', marginTop: 4 }}>
                ≈ {convertUSDToFRW(price)}
              </Text>
            )}
          </View>

          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Total Stock *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="50"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={totalStock}
              onChangeText={setTotalStock}
            />
          </View>
        </View>

        {/* 7. Size & Quantity Breakdown */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Available Sizes & Stock per Size</Text>
          <View style={styles.chipWrap}>
            {AVAILABLE_SIZES.map((sz) => {
              const isSelected = selectedSizes.includes(sz);
              return (
                <TouchableOpacity
                  key={sz}
                  style={[styles.sizeChip, isSelected && styles.sizeChipActive]}
                  onPress={() => toggleSize(sz)}
                >
                  <Text style={[styles.sizeChipText, isSelected && styles.sizeChipTextActive]}>{sz}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Size Quantity Inputs */}
          {selectedSizes.length > 0 && (
            <View style={styles.sizeQtyContainer}>
              {selectedSizes.map((sz) => (
                <View key={sz} style={styles.sizeQtyRow}>
                  <Text style={styles.sizeQtyLabel}>Size {sz} Quantity:</Text>
                  <TextInput
                    style={styles.sizeQtyInput}
                    keyboardType="number-pad"
                    value={sizeQuantities[sz] || '0'}
                    onChangeText={(val) => updateSizeQty(sz, val)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 8. Available Colors */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Available Colors</Text>
          <View style={styles.chipWrap}>
            {AVAILABLE_COLORS.map((col) => {
              const isSelected = selectedColors.includes(col);
              return (
                <TouchableOpacity
                  key={col}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => toggleColor(col)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{col}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, (!isFormValid || loading) && styles.disabledBtn]}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>Add Product</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  scrollContent: {
    padding: 16,
  },

  // Cards & Groups
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#777',
    marginBottom: 14,
  },
  selectMediaBox: {
    borderWidth: 2,
    borderColor: '#E9D8FD',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBF8FF',
  },
  selectMediaText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#7126D0',
  },
  selectMediaSub: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#888',
    marginTop: 2,
  },
  mediaRow: {
    marginTop: 14,
    flexDirection: 'row',
  },
  mediaThumbWrap: {
    position: 'relative',
    marginRight: 10,
  },
  mediaThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  removeMediaBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF3B30',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  removeMediaText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mediaBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mediaBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
  },

  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#222',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#111',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  statusRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  statusPillActive: {
    borderColor: '#7126D0',
    backgroundColor: '#F3E8FF',
  },
  statusPillText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  statusPillTextActive: {
    color: '#7126D0',
    fontFamily: 'Poppins-Bold',
  },

  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EDF2F7',
  },
  chipActive: {
    backgroundColor: '#7126D0',
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#4A5568',
  },
  chipTextActive: {
    color: '#FFF',
  },

  rowTwo: {
    flexDirection: 'row',
    gap: 12,
  },

  sizeChip: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  sizeChipActive: {
    borderColor: '#7126D0',
    backgroundColor: '#7126D0',
  },
  sizeChipText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#4A5568',
  },
  sizeChipTextActive: {
    color: '#FFF',
  },

  sizeQtyContainer: {
    marginTop: 12,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  sizeQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sizeQtyLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#333',
  },
  sizeQtyInput: {
    width: 70,
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },

  submitBtn: {
    backgroundColor: '#7126D0',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#7126D0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});
