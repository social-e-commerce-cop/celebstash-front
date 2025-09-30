import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Platform } from 'react-native';
import Svg, { G, Circle, Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface HeaderProps {
  title: string;
  onRightPress?: () => void;
  RightIcon?: React.ReactNode; // Allow passing custom icon
}

const Header: React.FC<HeaderProps> = ({ title, onRightPress, RightIcon }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>{title}</Text>

      {onRightPress && (
        <TouchableOpacity onPress={onRightPress}>
          <View
            style={
              Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOpacity: 0.25,
                  shadowRadius: 2,
                  shadowOffset: { width: 0, height: 1 },
                },
                android: { elevation: 2 },
                default: {},
              }) as any
            }
          >
            {RightIcon ? (
              RightIcon
            ) : (
              // Default Cart Icon
              <Svg width={width * 0.12} height={width * 0.12} viewBox="0 0 47 47" fill="none">
                <G>
                  <Circle cx="23.5" cy="22.5" r="22.5" fill="#FFF6ED" fillOpacity={0.5} />
                  <Path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.7982 32.3957H27.4939C30.6879 32.3957 33.1383 31.242 32.4424 26.5987L31.6319 20.3057C31.2028 17.9888 29.725 17.1021 28.4282 17.1021H17.8257C16.5099 17.1021 15.1178 18.0555 14.622 20.3057L13.8115 26.5987C13.2204 30.7176 15.6041 32.3957 18.7982 32.3957Z"
                    stroke="#1D1E20"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M18.6553 16.8732C18.6553 14.3877 20.6702 12.3728 23.1556 12.3728C24.3525 12.3678 25.5021 12.8397 26.3502 13.6842C27.1983 14.5287 27.6751 15.6763 27.6751 16.8732"
                    stroke="#1D1E20"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path d="M20.0664 21.5645H20.1141" stroke="#1D1E20" strokeWidth={1.5} strokeLinecap="round" />
                  <Path d="M26.1399 21.5645H26.1876" stroke="#1D1E20" strokeWidth={1.5} strokeLinecap="round" />
                </G>
              </Svg>
            )}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height * 0.02,
  },
  headerText: {
    fontSize: width * 0.07,
    fontWeight: '600',
    color: '#333',
  },
});
