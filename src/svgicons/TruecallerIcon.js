import * as React from "react";
import Svg, { Path } from "react-native-svg";

const TruecallerIcon = ({ width = 30, height = 30 }) => (
  <Svg width={width} height={height} viewBox="0 0 48 48" fill="none">
    <Path
      d="M24 0C10.745 0 0 10.745 0 24s10.745 24 24 24 24-10.745 24-24S37.255 0 24 0z"
      fill="#1A8CF7"
    />
    <Path
      d="M33.64 26.64c-.2.26-.47.46-.76.58a1.9 1.9 0 0 1-1.5-.03c-1.43-.63-2.65-1.6-3.64-2.9-1.3-1.67-2.14-3.68-2.45-5.82a1.8 1.8 0 0 1 .45-1.49 1.9 1.9 0 0 1 1.47-.6c.48 0 .94.17 1.3.48l.4.35c.22.18.34.46.32.74a7.7 7.7 0 0 0 .13 2.07c.13.62.36 1.23.68 1.78.43.77.97 1.48 1.6 2.1.54.54 1.15 1.02 1.82 1.43.28.15.47.43.52.74.06.3-.02.62-.2.87z"
      fill="#fff"
    />
  </Svg>
);

export default TruecallerIcon;
