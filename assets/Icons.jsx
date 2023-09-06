import * as React from "react";
import Svg, {
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

export const ExclamationIcon = (props) => {
  return (
    <Svg
      height="100px"
      width="100px"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      xmlSpace="preserve"
      {...props}
    >
      <Path
        d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 19.66c-.938 0-1.58-.723-1.58-1.66 0-.964.669-1.66 1.58-1.66.963 0 1.58.696 1.58 1.66 0 .938-.617 1.66-1.58 1.66zm.622-6.339c-.239.815-.992.829-1.243 0-.289-.956-1.316-4.585-1.316-6.942 0-3.11 3.891-3.125 3.891 0-.001 2.371-1.083 6.094-1.332 6.942z"
        {...props}
      />
    </Svg>
  );
};
export const PcIcon = (props) => (
  <Svg
    width="100px"
    height="100px"
    viewBox="0 -1.5 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M12.861 27.943a.8.8 0 00.798.857h4.682a.8.8 0 00.798-.857L18.4 17.6h-4.8l-.739 10.343z"
      fill="url(#paint0_linear_103_1792)"
    />
    <Path
      d="M28.8 0H3.2A3.2 3.2 0 000 3.2v16a3.2 3.2 0 003.2 3.2h25.6a3.2 3.2 0 003.2-3.2v-16A3.2 3.2 0 0028.8 0z"
      fill="url(#paint1_radial_103_1792)"
    />
    <Path
      d="M0 20.8A3.2 3.2 0 003.2 24h25.6a3.2 3.2 0 003.2-3.2v-3.2H0v3.2z"
      fill="#D8D8D8"
    />
    <Path d="M17.6 20.8a1.6 1.6 0 10-3.2 0 1.6 1.6 0 003.2 0z" fill="#2B2B2B" />
    <Defs>
      <LinearGradient
        id="paint0_linear_103_1792"
        x1={16}
        y1={16.1707}
        x2={16}
        y2={28.8}
        gradientUnits="userSpaceOnUse"
      >
        <Stop />
        <Stop offset={1} />
      </LinearGradient>
      <RadialGradient
        id="paint1_radial_103_1792"
        cx={0}
        cy={0}
        r={1}
        gradientUnits="userSpaceOnUse"
        gradientTransform="rotate(137.02 -5.122 14.615) scale(42.2447 63.3453)"
      >
        <Stop />
        <Stop offset={1} />
      </RadialGradient>
    </Defs>
  </Svg>
);
