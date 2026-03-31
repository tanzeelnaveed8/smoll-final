import Layout from "@/components/app/Layout";
import AvailabilityAndDateSelector from "@/components/partials/AvailabilityAndDateSelector";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import Container from "@/components/partials/Container";
import DoctorCard from "@/components/partials/DoctorCard";
import Header from "@/components/partials/Header";
import { fontHauoraMedium, fontHauoraSemiBold } from "@/constant/constant";
import { Button, Div, Text, ScrollDiv } from "react-native-magnus";

const availabTime = [
  {
    id: 1,
    day: "Thu, 15  Jun",
    timeSlots: ["10:00am", "11:15am", "1:00pm", "2:00pm", "4:00pm"],
  },
  {
    id: 2,
    day: "Fri, 16  Jun",
    timeSlots: ["10:00am", "11:15am", "1:00pm", "2:00pm", "4:00pm"],
  },
];

const SlotBookingScreen = () => {
  return (
    <Layout showBack title="Dr. Emily Carter">
      <ScrollDiv flex={1} pt={20} showsVerticalScrollIndicator={false}>
        {/* <Header title="Book a Slot" /> */}
        <Div py={20} mb={20}>
          <Container>
            <DoctorCard
              name="Dr. Emily Carter"
              speciality="DVM, GPCERT (FelP)"
              experience={5}
              verified
              slotScreen
            />
          </Container>
        </Div>

        <Container pb={20}>
          <ButtonPrimary bgColor="primary">Instant Consultation</ButtonPrimary>
          <Div mt={24}>
            <AvailabilityAndDateSelector />

            <Div mt={16}>
              <Text fontFamily={fontHauoraSemiBold} fontSize="xl" lineHeight={24} color="#222222">
                Availability
              </Text>
              {availabTime.map((t) => (
                <Div key={t.id} py={12} borderBottomWidth={1} borderColor="#E0E0E0">
                  <Text
                    fontFamily={fontHauoraSemiBold}
                    fontSize="xl"
                    lineHeight={24}
                    color="#222222"
                    mb={12}
                  >
                    {t.day}
                  </Text>
                  <Div flexDir="row" flexWrap="wrap" style={{ gap: 8 }}>
                    {t.timeSlots.map((slot) => (
                      <Button
                        key={slot}
                        fontFamily={fontHauoraMedium}
                        fontSize="lg"
                        lineHeight={20}
                        p={10}
                        borderWidth={1}
                        color="#494949"
                        borderColor="#E0E0E0"
                        rounded={4}
                        bg="transparent"
                      >
                        {slot}
                      </Button>
                    ))}
                  </Div>
                </Div>
              ))}
            </Div>
          </Div>
          <Div mt={80}>
            <ButtonPrimary>Proceed</ButtonPrimary>
          </Div>
        </Container>
      </ScrollDiv>
    </Layout>
  );
};

export default SlotBookingScreen;
