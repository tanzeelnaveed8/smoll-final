
import React from "react";
import { Svg, G, Path } from "react-native-svg";

const CodeIcon = ({ active = false, size = 13,height,width }: {
    active?: boolean | undefined;
    size?: number | undefined;
    height: any;
    width: any;
}) => {
  // Color changes based on active state
  const fillColor = active ? "#2563eb" : "#404954";

  return (
    <Svg width={height} height={width} viewBox="0 0 6.43 10.004">
      <G transform="translate(-1038 725.254) rotate(-90)">
        <Path
          d="M15.9,21.879H6.607a.357.357,0,0,0-.357.357v5.716a.357.357,0,0,0,.357.357H15.9a.357.357,0,0,0,.357-.357V26.2a.357.357,0,0,0-.357-.357.72.72,0,0,1-.27-.052.741.741,0,0,1-.486-.7.757.757,0,0,1,.753-.756h0a.357.357,0,0,0,.357-.357V22.236a.357.357,0,0,0-.357-.357Zm-1.47,3.213a1.464,1.464,0,0,0,.946,1.371,1.348,1.348,0,0,0,.167.048v1.083H6.965v-5h8.575v1.077a1.469,1.469,0,0,0-1.113,1.421Z"
          transform="translate(709 1016.121)"
          fill={fillColor}
        />
        <Path
          d="M62.542,46.875h0a.357.357,0,1,0,.361.357.356.356,0,0,0-.361-.357Z"
          transform="translate(659.462 993.983)"
          fill={fillColor}
        />
        <Path
          d="M62.542,34.375h0a.357.357,0,1,0,.361.357.356.356,0,0,0-.361-.357Z"
          transform="translate(659.462 1005.054)"
          fill={fillColor}
        />
        <Path
          d="M62.542,59.375h0a.357.357,0,1,0,.361.357.356.356,0,0,0-.361-.357Z"
          transform="translate(659.462 982.912)"
          fill={fillColor}
        />
      </G>
    </Svg>
  );
};

export default CodeIcon;