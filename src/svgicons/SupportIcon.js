import * as React from "react"
import Svg, { Path, Defs, Pattern, Use, Image } from "react-native-svg"

function SupportIcon(props) {
  return (
    <Svg
      width={34}
      height={34}
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <Path
        fill="url(#pattern0_251_1048)"
        d="M0.644043 0.63147H33.458543000000006V33.44597H0.644043z"
      />
      <Defs>
        <Pattern
          id="pattern0_251_1048"
          patternContentUnits="objectBoundingBox"
          width={1}
          height={1}
        >
          <Use
            xlinkHref="#image0_251_1048"
            transform="matrix(.01176 0 0 .01124 -2.743 -.247)"
          />
        </Pattern>
        <Image
          id="image0_251_1048"
          width={331}
          height={133}
          xlinkHref="data:image/png;base64,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"
        />
      </Defs>
    </Svg>
  )
}

export default SupportIcon
