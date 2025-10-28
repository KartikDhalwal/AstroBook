import * as React from "react"
import Svg, { Path } from "react-native-svg"

function GoBack(props) {
  return (
    <Svg
      width={9}
      height={16}
      viewBox="0 0 9 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M7.79 1.118l-6.789 6.79 6.79 6.788"
        stroke="#222"
        strokeWidth={1.13153}
      />
    </Svg>
  )
}

export default GoBack
