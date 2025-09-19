import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';

type Option = {
  id: 'none' | 'economy' | 'cargo';
  label: string;
  price: string;
  estimated: string;
  icon: 'economyIcon' | 'cargoIcon' | null;
  disabled: boolean;
};

const ShippingCard: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<Option['id']>('economy');

  const options: Option[] = [
    {
      id: 'economy',
      label: 'Economy (In Kigali)',
      price: '$13',
      estimated: 'Estimate Arrival May 14',
      icon: 'economyIcon',
      disabled: false,
    },
    {
      id: 'cargo',
      label: 'Cargo (Outside Kigali)',
      price: '$20',
      estimated: 'Estimate Arrival May 20',
      icon: 'cargoIcon',
      disabled: false,
    },
  ];

  // Economy SVG
  // Economy SVG (use your original full path)
const EconomyIcon = () => (
 <Svg width="53" height="54" viewBox="0 0 53 54" fill="none">
<Rect y="0.5" width="53" height="53" rx="26.5" fill="#FF6EA8" fill-opacity="0.2"/>
<Rect x="4" y="4.5" width="45" height="45" rx="22.5" fill="#FF6EA8"/>
<Path d="M16.5 18.0002V17.0002C16.2348 17.0002 15.9804 17.1056 15.7929 17.2931C15.6054 17.4807 15.5 17.735 15.5 18.0002H16.5ZM27.5 18.0002H28.5C28.5 17.735 28.3946 17.4807 28.2071 17.2931C28.0196 17.1056 27.7652 17.0002 27.5 17.0002V18.0002ZM27.5 24.0002V23.0002C27.2348 23.0002 26.9804 23.1056 26.7929 23.2931C26.6054 23.4807 26.5 23.735 26.5 24.0002H27.5ZM16.5 19.0002H27.5V17.0002H16.5V19.0002ZM26.5 18.0002V34.0002H28.5V18.0002H26.5ZM17.5 32.0002V18.0002H15.5V32.0002H17.5ZM27.5 25.0002H32.5V23.0002H27.5V25.0002ZM35.5 28.0002V32.0002H37.5V28.0002H35.5ZM28.5 34.0002V24.0002H26.5V34.0002H28.5ZM33.207 34.7072C33.0195 34.8947 32.7652 35 32.5 35C32.2348 35 31.9805 34.8947 31.793 34.7072L30.379 36.1212C30.9416 36.6837 31.7045 36.9996 32.5 36.9996C33.2955 36.9996 34.0584 36.6837 34.621 36.1212L33.207 34.7072ZM31.793 33.2932C31.9805 33.1058 32.2348 33.0005 32.5 33.0005C32.7652 33.0005 33.0195 33.1058 33.207 33.2932L34.621 31.8792C34.0584 31.3168 33.2955 31.0009 32.5 31.0009C31.7045 31.0009 30.9416 31.3168 30.379 31.8792L31.793 33.2932ZM21.207 34.7072C21.0195 34.8947 20.7652 35 20.5 35C20.2348 35 19.9805 34.8947 19.793 34.7072L18.379 36.1212C18.9416 36.6837 19.7045 36.9996 20.5 36.9996C21.2955 36.9996 22.0584 36.6837 22.621 36.1212L21.207 34.7072ZM19.793 33.2932C19.9805 33.1058 20.2348 33.0005 20.5 33.0005C20.7652 33.0005 21.0195 33.1058 21.207 33.2932L22.621 31.8792C22.0584 31.3168 21.2955 31.0009 20.5 31.0009C19.7045 31.0009 18.9416 31.3168 18.379 31.8792L19.793 33.2932ZM33.207 33.2932C33.403 33.4882 33.5 33.7432 33.5 34.0002H35.5C35.5 33.2342 35.207 32.4642 34.621 31.8792L33.207 33.2932ZM33.5 34.0002C33.4999 34.2654 33.3946 34.5198 33.207 34.7072L34.621 36.1212C35.1836 35.5588 35.4998 34.7958 35.5 34.0002H33.5ZM30.5 33.0002H27.5V35.0002H30.5V33.0002ZM31.793 34.7072C31.6054 34.5198 31.5001 34.2654 31.5 34.0002H29.5C29.5 34.7662 29.793 35.5362 30.379 36.1212L31.793 34.7072ZM31.5 34.0002C31.5001 33.7351 31.6054 33.4807 31.793 33.2932L30.379 31.8792C29.8164 32.4417 29.5002 33.2047 29.5 34.0002H31.5ZM19.793 34.7072C19.6055 34.5198 19.5001 34.2654 19.5 34.0002H17.5C17.5 34.7662 17.793 35.5362 18.379 36.1212L19.793 34.7072ZM19.5 34.0002C19.5001 33.7351 19.6055 33.4807 19.793 33.2932L18.379 31.8792C17.8164 32.4417 17.5002 33.2047 17.5 34.0002H19.5ZM27.5 33.0002H22.5V35.0002H27.5V33.0002ZM21.207 33.2932C21.403 33.4882 21.5 33.7432 21.5 34.0002H23.5C23.5 33.2342 23.207 32.4642 22.621 31.8792L21.207 33.2932ZM21.5 34.0002C21.4999 34.2654 21.3945 34.5198 21.207 34.7072L22.621 36.1212C23.1836 35.5588 23.4998 34.7958 23.5 34.0002H21.5ZM35.5 32.0002C35.5 32.2655 35.3946 32.5198 35.2071 32.7074C35.0196 32.8949 34.7652 33.0002 34.5 33.0002V35.0002C35.2956 35.0002 36.0587 34.6842 36.6213 34.1216C37.1839 33.559 37.5 32.7959 37.5 32.0002H35.5ZM32.5 25.0002C33.2956 25.0002 34.0587 25.3163 34.6213 25.8789C35.1839 26.4415 35.5 27.2046 35.5 28.0002H37.5C37.5 27.3436 37.3707 26.6935 37.1194 26.0868C36.8681 25.4802 36.4998 24.929 36.0355 24.4647C35.5712 24.0004 35.02 23.6321 34.4134 23.3808C33.8068 23.1296 33.1566 23.0002 32.5 23.0002V25.0002ZM15.5 32.0002C15.5 32.7959 15.8161 33.559 16.3787 34.1216C16.9413 34.6842 17.7044 35.0002 18.5 35.0002V33.0002C18.2348 33.0002 17.9804 32.8949 17.7929 32.7074C17.6054 32.5198 17.5 32.2655 17.5 32.0002H15.5Z" fill="white"/>
</Svg>

);

// Cargo SVG (use the full path you pasted for cargo)
const CargoIcon = () => (
  <Svg width="53" height="54" viewBox="0 0 53 54" fill="none" >
<Rect y="0.5" width="53" height="53" rx="26.5" fill="#FF6EA8" fill-opacity="0.2"/>
<Rect x="4" y="4.5" width="45" height="45" rx="22.5" fill="#FF6EA8"/>
<Path d="M22.5016 29.8906C22.5279 29.9856 22.5726 30.0744 22.6332 30.1521C22.6938 30.2298 22.7691 30.2947 22.8548 30.3433C22.9405 30.3919 23.035 30.4231 23.1327 30.4351C23.2305 30.4472 23.3297 30.4399 23.4246 30.4136C23.5196 30.3874 23.6084 30.3427 23.6861 30.2821C23.7638 30.2215 23.8287 30.1462 23.8773 30.0605C23.9259 29.9747 23.9571 29.8803 23.9691 29.7825C23.9812 29.6848 23.9739 29.5856 23.9476 29.4906L22.5016 29.8906ZM18.1956 19.3506C18.1003 19.3228 18.0004 19.3142 17.9017 19.3252C17.803 19.3363 17.7075 19.3669 17.6208 19.4151C17.534 19.4634 17.4577 19.5284 17.3962 19.6064C17.3348 19.6844 17.2894 19.7739 17.2628 19.8695C17.2362 19.9652 17.2288 20.0652 17.2412 20.1637C17.2535 20.2623 17.2853 20.3574 17.3347 20.4435C17.384 20.5297 17.45 20.6052 17.5288 20.6656C17.6076 20.7261 17.6976 20.7703 17.7936 20.7956L18.1956 19.3506ZM35.1836 30.3506C35.2813 30.3281 35.3734 30.2861 35.4546 30.2273C35.5358 30.1685 35.6044 30.0941 35.6563 30.0083C35.7082 29.9226 35.7424 29.8273 35.7568 29.7281C35.7713 29.6289 35.7657 29.5278 35.7404 29.4308C35.7152 29.3338 35.6707 29.2429 35.6097 29.1634C35.5487 29.0839 35.4724 29.0174 35.3852 28.9678C35.2981 28.9183 35.2019 28.8868 35.1023 28.8751C35.0028 28.8633 34.9019 28.8717 34.8056 28.8996L35.1836 30.3506ZM25.1926 32.1846C25.5026 33.3046 24.8226 34.4876 23.6186 34.8006L23.9956 36.2516C25.9726 35.7386 27.1806 33.7496 26.6386 31.7846L25.1926 32.1846ZM23.6186 34.8006C22.4066 35.1156 21.1906 34.4116 20.8786 33.2816L19.4326 33.6816C19.9726 35.6366 22.0266 36.7636 23.9956 36.2516L23.6186 34.8006ZM20.8786 33.2816C20.5686 32.1616 21.2486 30.9786 22.4526 30.6656L22.0756 29.2156C20.0986 29.7286 18.8896 31.7166 19.4326 33.6816L20.8786 33.2816ZM22.4526 30.6656C23.6646 30.3506 24.8806 31.0546 25.1926 32.1846L26.6386 31.7846C26.0986 29.8296 24.0446 28.7026 22.0756 29.2146L22.4526 30.6656ZM23.9476 29.4906L21.7956 21.7006L20.3496 22.1006L22.5016 29.8906L23.9476 29.4906ZM19.8996 19.8226L18.1956 19.3506L17.7936 20.7956L19.4986 21.2686L19.8996 19.8226ZM21.7956 21.7006C21.6685 21.2506 21.4271 20.8412 21.0948 20.5121C20.7626 20.183 20.3508 19.9455 19.8996 19.8226L19.5006 21.2686C19.9256 21.3866 20.2416 21.7096 20.3496 22.1006L21.7956 21.7006ZM26.1056 32.7106L35.1836 30.3506L34.8066 28.8996L25.7276 31.2596L26.1056 32.7106Z" fill="white"/>
<Path d="M34.1606 20.8617C33.6756 19.1057 33.4326 18.2277 32.7206 17.8287C32.0066 17.4287 31.1016 17.6647 29.2916 18.1357L27.3716 18.6337C25.5616 19.1037 24.6566 19.3397 24.2456 20.0317C23.8336 20.7227 24.0756 21.6007 24.5606 23.3557L25.0756 25.2187C25.5606 26.9737 25.8026 27.8517 26.5156 28.2507C27.2286 28.6507 28.1336 28.4147 29.9436 27.9447L31.8636 27.4447C33.6736 26.9747 34.5786 26.7397 34.9906 26.0487C35.2166 25.6687 35.2456 25.2327 35.1446 24.6257" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
</Svg>


);


  // Render radio button
  const renderRadioButton = (isSelected: boolean) => (
    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
      {isSelected && <View style={styles.radioInner} />}
    </View>
  );

  const handleSelect = (id: Option['id']) => {
    if (id === 'none') {
      setSelectedOption('none');
      return;
    }
    const option = options.find(opt => opt.id === id);
    if (option && !option.disabled) {
      setSelectedOption(id);
    }
  };

  const renderIcon = (icon: Option['icon']) => {
    switch (icon) {
      case 'economyIcon':
        return <EconomyIcon />;
      case 'cargoIcon':
        return <CargoIcon />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose shipping</Text>

      {/* No Delivery */}
      <Pressable style={styles.noDeliveryRow} onPress={() => handleSelect('none')}>
        {renderRadioButton(selectedOption === 'none')}
        <Text style={styles.noDeliveryText}>No delivery</Text>
      </Pressable>

      {options.map(option => (
        <Pressable
          key={option.id}
          style={[
            styles.optionCard,
            selectedOption === option.id && styles.selectedCard,
            option.disabled && styles.disabledCard,
          ]}
          onPress={() => handleSelect(option.id)}
          disabled={option.disabled}
        >
          <View style={styles.optionContent}>
            <View style={styles.leftSection}>
              <View style={styles.iconContainer}>
                {renderIcon(option.icon)}
              </View>
              <View style={styles.textContainer}>
                <View style={styles.labelPriceRow}>
                  <Text style={[styles.label, option.disabled && styles.disabledText]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.price, selectedOption === option.id && styles.selectedPrice]}>
                    {option.price}
                  </Text>
                </View>
                {option.estimated ? (
                  <Text style={[styles.estimated, option.disabled && styles.disabledText]}>
                    {option.estimated}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={styles.rightSection}>
              {renderRadioButton(selectedOption === option.id)}
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 10 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#000' },
  noDeliveryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  noDeliveryText: { fontSize: 16, fontWeight: '600', marginLeft: 8, color: '#000' },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 12,
  },
  selectedCard: { shadowOpacity: 0.15 },
  disabledCard: { backgroundColor: '#f5f5f5' },
  optionContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leftSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  textContainer: { flex: 1 },
  labelPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  label: { fontSize: 16, fontWeight: '600', color: '#000' },
  estimated: { fontSize: 14, color: '#666', marginTop: 2 },
  disabledText: { color: '#999' },
  rightSection: { justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#FF650E', marginLeft: 8 },
  selectedPrice: { color: '#FF650E' },
  radioOuter: {
    width: 23,
    height: 23,
    borderRadius: 11.5,
    borderWidth: 1.5,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: { borderColor: '#FF650E' },
  radioInner: { width: 15, height: 15, borderRadius: 7.5, backgroundColor: '#FF650E' },
});

export default ShippingCard;
