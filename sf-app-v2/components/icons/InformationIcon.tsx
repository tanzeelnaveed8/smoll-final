import React from "react";

import Svg, { Path, G, Defs, ClipPath, Rect } from "react-native-svg";

const InformationIcon: React.FC<{ width?: number; height?: number }> = ({ width, height }) => {
  return (
    <Svg
      width={width ? width : "10"}
      height={height ? height : "11"}
      viewBox="0 0 10 11"
      fill="none"
    >
      <Path
        d="M5 10.027C7.76142 10.027 10 7.7884 10 5.02698C10 2.26555 7.76142 0.0269775 5 0.0269775C2.23858 0.0269775 0 2.26555 0 5.02698C0 7.7884 2.23858 10.027 5 10.027Z"
        fill="black"
      />
      <Path
        d="M5.42199 2.4729H4.57799V6.0779H5.42199V2.4729ZM4.99799 7.5799C5.13166 7.5799 5.25985 7.5268 5.35437 7.43228C5.44889 7.33776 5.50199 7.20957 5.50199 7.0759C5.50199 6.94223 5.44889 6.81404 5.35437 6.71952C5.25985 6.625 5.13166 6.5719 4.99799 6.5719C4.86432 6.5719 4.73612 6.625 4.64161 6.71952C4.54709 6.81404 4.49399 6.94223 4.49399 7.0759C4.49399 7.20957 4.54709 7.33776 4.64161 7.43228C4.73612 7.5268 4.86432 7.5799 4.99799 7.5799Z"
        fill="white"
      />
    </Svg>
  );
};

export default InformationIcon;
