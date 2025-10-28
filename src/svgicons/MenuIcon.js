import * as React from "react"
import Svg, { Path } from "react-native-svg"

function MenuIcon(props) {
  return (
    <Svg
      width={42}
      height={42}
      viewBox="0 0 42 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M9.16 12.552H32.92M9.16 21.039H32.92M9.16 29.525H32.92"
        stroke="#222"
        strokeWidth={1.6973}
        strokeLinecap="round"
      />
    </Svg>
  )
}

export default MenuIcon
