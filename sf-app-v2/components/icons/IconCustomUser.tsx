import React from "react";
import { Svg, Path, SvgProps, G, Rect, Circle } from "react-native-svg";

interface IconCustomUserProps extends SvgProps {
  width?: number;
  height?: number;
}

const IconCustomUser: React.FC<IconCustomUserProps> = ({ width = 24, height = 24, ...props }) => {
  return (
    <Svg width="32" height="34" viewBox="0 0 34 36">
      <Path
        d="M33.635,25.107a4.948,4.948,0,0,0-4.949-4.949h-10.3a4.948,4.948,0,0,0-4.949,4.949v4.185a.432.432,0,0,0,.432.432H33.2a.432.432,0,0,0,.432-.432V25.107Zm-.863,0V28.86H14.3V25.107a4.086,4.086,0,0,1,4.086-4.086h10.3a4.086,4.086,0,0,1,4.086,4.086ZM23.534,4.688a6.8,6.8,0,1,0,6.8,6.8A6.805,6.805,0,0,0,23.534,4.688Zm0,.863A5.938,5.938,0,1,1,17.6,11.49,5.941,5.941,0,0,1,23.534,5.551Z"
        fill="#fff"
        stroke="#222"
        strokeWidth={1.2}
      />
    </Svg>
  );
};

export default IconCustomUser;
