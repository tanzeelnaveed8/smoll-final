import React from "react";
import { Path, Svg } from "react-native-svg";

const DotIcon = () => {
  return (
    <Svg width="3" height="21" viewBox="0 0 3 21" fill="none">
      <Path
        d="M1.5 3C2.32843 3 3 2.32843 3 1.5C3 0.671573 2.32843 0 1.5 0C0.671573 0 0 0.671573 0 1.5C0 2.32843 0.671573 3 1.5 3Z"
        fill="black"
      />
      <Path
        d="M1.5 12C2.32843 12 3 11.3284 3 10.5C3 9.67157 2.32843 9 1.5 9C0.671573 9 0 9.67157 0 10.5C0 11.3284 0.671573 12 1.5 12Z"
        fill="black"
      />
      <Path
        d="M1.5 21C2.32843 21 3 20.3284 3 19.5C3 18.6716 2.32843 18 1.5 18C0.671573 18 0 18.6716 0 19.5C0 20.3284 0.671573 21 1.5 21Z"
        fill="black"
      />
    </Svg>
  );
};

export default DotIcon;
