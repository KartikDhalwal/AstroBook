import * as React from "react"
import Svg, { Path } from "react-native-svg"

function LoginArrow(props) {
  return (
    <Svg
      width={19}
      height={15}
      viewBox="0 0 19 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M17.745 7.703l.4-.4.4.4-.4.4-.4-.4zM.772 8.27a.566.566 0 010-1.131v1.131zM11.356.514l6.79 6.79-.8.8-6.79-6.79.8-.8zm6.79 7.59l-6.79 6.789-.8-.8 6.79-6.79.8.8zm-.4.165H.771V7.138h16.973v1.131z"
        fill="#fff"
      />
    </Svg>
  )
}

export default LoginArrow
