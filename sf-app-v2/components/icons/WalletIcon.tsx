import React from "react";
import { Path, Svg } from "react-native-svg";

const WalletIcon: React.FC<{
  mb?: number;
  width?: number;
  height?: number;
}> = ({ mb, width, height }) => {
  return (
    <Svg
      width={width ? width : "27.236"}
      height={height ? height : "22.877"}
      viewBox="0 0 27.236 22.877"
      style={{ marginBottom: mb }}
    >
      <Path
        id="Path_90432"
        data-name="Path 90432"
        d="M45.386,33.308H43.868V28.735a.727.727,0,0,0-.727-.727H40.8l.115-3.317a.748.748,0,0,0-.2-.53.728.728,0,0,0-.521-.219l-18.461-.084a2.872,2.872,0,0,0-2.876,2.872v16.78a3.235,3.235,0,0,0,3.229,3.224h21.07a.721.721,0,0,0,.71-.721V41.388h1.5a.724.724,0,0,0,.727-.721V34.032a.722.722,0,0,0-.71-.723ZM20.737,25.724a1.408,1.408,0,0,1,.99-.412l17.717.079-.092,2.626H20.313V26.735a1.429,1.429,0,0,1,.424-1.01Zm21.7,19.563H22.094a1.781,1.781,0,0,1-1.781-1.776V29.467H42.432V33.31l-3.308,0a4.04,4.04,0,0,0,0,8.08h3.308Z"
        transform="translate(-18.859 -23.859)"
      />
    </Svg>
  );
};

export default WalletIcon;
