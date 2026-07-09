import React from 'react';
import Svg, { Path, Rect, G, Ellipse, Circle, Text as SvgText, Defs, LinearGradient, Stop, ClipPath } from 'react-native-svg';
import { View } from 'react-native';

/**
 * Realistic EMV chip — gold-toned, matching standard credit card chip appearance.
 * Width≈34, Height≈26
 */
export const CardChip: React.FC<{ size?: number }> = ({ size = 1 }) => {
  const w = 34 * size;
  const h = 26 * size;
  return (
    <Svg width={w} height={h} viewBox="0 0 34 26" fill="none">
      {/* Outer body */}
      <Rect x="0.5" y="0.5" width="33" height="25" rx="4.5" fill="#D4A84B" stroke="#B8860B" strokeWidth="1"/>
      {/* Inner contact pad grid */}
      {/* Horizontal center divider */}
      <Rect x="0.5" y="12" width="33" height="1" fill="#B8860B" opacity="0.6"/>
      {/* Vertical center divider */}
      <Rect x="16.5" y="0.5" width="1" height="25" fill="#B8860B" opacity="0.6"/>
      {/* Left col dividers */}
      <Rect x="8" y="0.5" width="1" height="11.5" fill="#B8860B" opacity="0.4"/>
      <Rect x="8" y="13" width="1" height="12.5" fill="#B8860B" opacity="0.4"/>
      {/* Right col dividers */}
      <Rect x="25" y="0.5" width="1" height="11.5" fill="#B8860B" opacity="0.4"/>
      <Rect x="25" y="13" width="1" height="12.5" fill="#B8860B" opacity="0.4"/>
      {/* Center contact square (slightly recessed look) */}
      <Rect x="9" y="5" width="16" height="16" rx="2" fill="#C9972A" stroke="#A0740A" strokeWidth="0.5"/>
      <Rect x="11" y="7" width="12" height="12" rx="1.5" fill="#E8C060" opacity="0.5"/>
    </Svg>
  );
};

/** White Visa wordmark SVG for use on dark backgrounds */
export const VisaLogoWhite: React.FC<{ width?: number }> = ({ width = 52 }) => (
  <Svg width={width} height={width * 0.34} viewBox="0 0 60 20" fill="none">
    <Path
      d="M22.78 0.45L14.93 19.39H9.8L5.93 4.27C5.7 3.34 5.5 3 4.78 2.61C3.62 1.97 1.69 1.37 0 1L0.11 0.45H8.37C9.42 0.45 10.36 1.15 10.6 2.38L12.64 13.34L17.69 0.45H22.78ZM29.71 0.45L25.7 19.39H20.85L24.86 0.45H29.71ZM42.86 13.2C42.88 8.2 36.02 7.93 36.07 5.7C36.08 5.02 36.72 4.29 38.12 4.11C38.82 4.02 40.74 3.95 42.91 4.96L43.76 0.94C42.59 0.51 41.09 0.1 39.22 0.1C34.43 0.1 31.06 2.67 31.03 6.36C31 9.09 33.44 10.61 35.27 11.52C37.16 12.45 37.8 13.04 37.79 13.87C37.77 15.14 36.28 15.71 34.89 15.73C32.45 15.77 31.04 15.06 29.91 14.53L29.03 18.68C30.16 19.21 32.25 19.66 34.42 19.69C39.51 19.69 42.85 17.14 42.86 13.2ZM55.52 19.39H60L56.08 0.45H51.95C51.01 0.45 50.23 1 49.88 1.84L42.61 19.39H47.7L48.71 16.56H54.93L55.52 19.39ZM50.11 12.68L52.66 5.56L54.12 12.68H50.11Z"
      fill="white"
    />
  </Svg>
);

/** Mastercard two-circle logo for use on dark backgrounds */
export const MastercardLogo: React.FC<{ size?: number }> = ({ size = 38 }) => (
  <Svg width={size} height={size * 0.62} viewBox="0 0 38 24" fill="none">
    <G>
      <Path d="M13.5 1.5H24.5V22.5H13.5V1.5Z" fill="#FF5F00" />
      <Path
        d="M14.2 12C14.2 8.07 16.05 4.58 18.9 2.32C16.8 0.68 14.16 -0.31 11.28 -0.31C4.45 -0.31 -1 5.22 -1 12C-1 18.78 4.45 24.31 11.28 24.31C14.16 24.31 16.8 23.32 18.9 21.68C16.05 19.45 14.2 15.93 14.2 12Z"
        fill="#EB001B"
      />
      <Path
        d="M39 12C39 18.78 33.55 24.31 26.72 24.31C23.84 24.31 21.2 23.32 19.1 21.68C21.98 19.43 23.8 15.93 23.8 12C23.8 8.07 21.94 4.58 19.1 2.32C21.2 0.68 23.84 -0.31 26.72 -0.31C33.55 -0.31 39 5.24 39 12Z"
        fill="#F79E1B"
      />
    </G>
  </Svg>
);

/** AMEX text logo in white */
export const AmexLogoWhite: React.FC = () => (
  <View style={{ backgroundColor: 'transparent' }}>
    <Svg width={52} height={18} viewBox="0 0 52 18" fill="none">
      <Path
        d="M2 14V4H16V6.5H5V8H15.5V10.5H5V11.5H16V14H2Z M17 14L21.5 9L17 4H20.5L23 7L25.5 4H29L24.5 9L29 14H25.5L23 11L20.5 14H17Z M30 14V4H36C38.5 4 40 5.2 40 7.2C40 8.4 39.3 9.3 38.2 9.8L40.5 14H37.5L35.5 10.2H33V14H30ZM33 7.8H35.8C36.6 7.8 37 7.4 37 6.8C37 6.2 36.6 5.8 35.8 5.8H33V7.8Z M42 14V4H50V6.5H45V8H49.5V10.5H45V11.5H50V14H42Z"
        fill="white"
      />
    </Svg>
  </View>
);

/**
 * MTN Logo — matches real MTN brand: yellow-gold gradient background,
 * black oval border containing bold black "MTN" wordmark.
 */
export const MTNLogo: React.FC<{ size?: number }> = ({ size = 48 }) => {
  const w = size;
  const h = size * 0.65;
  return (
    <Svg width={w} height={h} viewBox="0 0 80 52" fill="none">
      <Defs>
        <LinearGradient id="mtnGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F5C518" />
          <Stop offset="1" stopColor="#C99A00" />
        </LinearGradient>
      </Defs>
      {/* Gold gradient background */}
      <Rect x="0" y="0" width="80" height="52" rx="6" fill="url(#mtnGrad)" />
      {/* Black oval border */}
      <Ellipse cx="40" cy="26" rx="32" ry="20" fill="none" stroke="#111" strokeWidth="3.5" />
      {/* Bold MTN wordmark — hand-tuned paths */}
      {/* M */}
      <Path d="M14 34V18h3.2l4 7.4 4-7.4H28V34h-2.8v-9.6L21.4 32h-2.8l-3.8-7.6V34H14z" fill="#111" />
      {/* T */}
      <Path d="M30 20.8V18h12v2.8h-4.5V34H35V20.8H30z" fill="#111" />
      {/* N */}
      <Path d="M44 18h3v9.8L53 18h3v16h-3v-9.8L47 34h-3V18z" fill="#111" />
    </Svg>
  );
};

/**
 * Airtel Logo — matches real Airtel brand: white background,
 * bold red swoosh curl mark on top, "airtel" red wordmark below.
 */
export const AirtelLogo: React.FC<{ size?: number }> = ({ size = 48 }) => {
  const w = size;
  const h = size * 1.15;
  return (
    <Svg width={w} height={h} viewBox="0 0 60 69" fill="none">
      {/* White background */}
      <Rect x="0" y="0" width="60" height="69" rx="6" fill="#fff" />
      {/* Red swoosh — the distinctive Airtel curl/wave mark */}
      <Path
        d="M30 6 C20 6, 10 14, 14 24 C16 30, 22 32, 28 30 C34 28, 38 22, 36 16 C34 10, 28 8, 30 6Z"
        fill="#E40000"
        opacity="0"
      />
      {/* Airtel stylized red swoosh curl (top icon) */}
      <Path
        d="M44 8 C44 8, 50 12, 48 20 C46 27, 38 30, 30 28 C22 26, 16 20, 18 14 C20 8, 28 6, 34 8 C40 10, 44 16, 40 22 C37 26, 32 27, 30 25"
        fill="none"
        stroke="#E40000"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Inner curl tail */}
      <Path
        d="M30 25 C27 24, 24 22, 26 18 C27 14, 32 13, 35 16"
        fill="none"
        stroke="#E40000"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* "airtel" wordmark in red */}
      <SvgText
        x="30"
        y="58"
        textAnchor="middle"
        fontSize="13"
        fontWeight="bold"
        fill="#E40000"
        fontFamily="serif"
        letterSpacing="0.5"
      >
        airtel
      </SvgText>
    </Svg>
  );
};
