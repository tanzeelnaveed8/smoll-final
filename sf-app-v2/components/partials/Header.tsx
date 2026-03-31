import { Div, Icon, Text } from "react-native-magnus";
import { IconArrowLeft } from "@tabler/icons-react-native";
import { fontHauoraSemiBold } from "@/constant/constant";
import Container from "./Container";

type PropTypes = {
  title: string;
};

const Header = (props: PropTypes) => {
  const { title } = props;
  return (
    <Container flexDir="row" alignItems="center" py={9}>
      <IconArrowLeft size={28} color="#222222" strokeWidth={1.5} />

      <Text
        fontWeight="600"
        fontFamily={fontHauoraSemiBold}
        fontSize="xl"
        lineHeight={24}
        mx="auto"
      >
        {title}
      </Text>
    </Container>
  );
};

export default Header;
