import { Div, DivProps } from "react-native-magnus";

const Container = (props: DivProps) => {
  const { children, ...restProps } = props;
  return (
    <Div px={20} {...restProps}>
      {children}
    </Div>
  );
};

export default Container;
