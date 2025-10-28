import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"

function FacebookIcon(props) {
  return (
    <Svg
      width={35}
      height={35}
      viewBox="0 0 35 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#clip0_251_6056)">
        <Path
          d="M34.938 17.696c0-9.375-7.6-16.975-16.975-16.975C8.588.721.988 8.321.988 17.696c0 7.96 5.48 14.64 12.874 16.475V22.884h-3.5v-5.188h3.5v-2.235c0-5.778 2.615-8.456 8.287-8.456 1.076 0 2.932.212 3.69.422v4.702c-.4-.042-1.096-.063-1.96-.063-2.783 0-3.859 1.054-3.859 3.795v1.835h5.545l-.953 5.188H20.02v11.663c8.405-1.015 14.918-8.172 14.918-16.85z"
          fill="#0866FF"
        />
        <Path
          d="M24.612 22.884l.953-5.188H20.02v-1.835c0-2.74 1.075-3.795 3.859-3.795.864 0 1.56.02 1.96.063V7.427c-.758-.211-2.614-.422-3.69-.422-5.672 0-8.287 2.678-8.287 8.456v2.235h-3.5v5.188h3.5V34.17a17 17 0 006.157.376V22.884h4.593z"
          fill="#fff"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_251_6056">
          <Path
            fill="#fff"
            transform="translate(.988 .721)"
            d="M0 0H33.95V33.95H0z"
          />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default FacebookIcon
