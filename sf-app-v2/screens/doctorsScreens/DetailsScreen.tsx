import React from "react";
import { Button, Div, ScrollDiv, Text } from "react-native-magnus";
import Header from "@/components/partials/Header";
import Container from "@/components/partials/Container";
import DoctorCard from "@/components/partials/DoctorCard";
import { fontHauoraMedium, fontHauoraSemiBold } from "@/constant/constant";
import { IconCalendarMonth, IconReceiptRefund } from "@tabler/icons-react-native";
import Accordion from "@/components/partials/Accordion";
import ButtonPrimary from "@/components/partials/ButtonPrimary";

const DetailsScreen = () => {
  return (
    <ScrollDiv flex={1} pt={20} showsVerticalScrollIndicator={false}>
      <Header title="Details" />
      <Div py={20} mb={20} borderBottomWidth={1} borderColor="#E0E0E0">
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

      <Container pb={20} mt={16}>
        <ReadonlyItem field="Pet" value="Lucy" />
        <ReadonlyItem field="Phone no" value="(+971) 82 474 7493" />
      </Container>

      <Container mt={12}>
        <Text fontFamily={fontHauoraSemiBold} fontSize="lg" lineHeight={24} color="#222222" mb={12}>
          Date and time
        </Text>

        <Div
          flexDir="row"
          justifyContent="space-between"
          pb={24}
          borderBottomWidth={1}
          borderColor="#E0E0E0"
        >
          <Div flexDir="row" alignItems="center">
            <IconCalendarMonth size={32} color="#222222" strokeWidth={1.5} />
            <Text
              ml={16}
              fontFamily={fontHauoraSemiBold}
              fontSize="lg"
              lineHeight={24}
              color="#222222"
            >
              10:00am-10:15am {"\n"}
              Fri, 9 Feb 2024
            </Text>
          </Div>

          <Button
            bg="transparent"
            fontFamily={fontHauoraSemiBold}
            fontSize="lg"
            lineHeight={24}
            color="#0189F9"
          >
            Change
          </Button>
        </Div>
      </Container>

      <Container mt={24}>
        <Text fontFamily={fontHauoraSemiBold} fontSize="lg" lineHeight={24} color="#222222" mb={12}>
          Our Commitment to You
        </Text>

        <Div flexDir="row" mb={8} style={{ gap: 8 }}>
          <Div h={32} w={32} rounded={32} bg="#0189F9" alignItems="center" justifyContent="center">
            <IconReceiptRefund size={24} color="#fff" />
          </Div>

          <Text fontFamily={fontHauoraMedium} fontSize="lg" lineHeight={20} color="#494949">
            Cancel anytime before your scheduled appointment.
          </Text>
        </Div>
        <Div flexDir="row" style={{ gap: 8 }}>
          <Div h={32} w={32} rounded={32} bg="#0189F9" alignItems="center" justifyContent="center">
            <IconCalendarMonth size={24} color="#fff" />
          </Div>

          <Text fontFamily={fontHauoraMedium} fontSize="lg" lineHeight={20} color="#494949">
            Effortlessly reschedule your booking.
          </Text>
        </Div>
      </Container>

      <Container mt={24}>
        <Text fontFamily={fontHauoraSemiBold} fontSize="lg" lineHeight={24} color="#222222">
          (FAQ) Frequently Asked Questions
        </Text>

        <Accordion pt={12}>
          <Accordion.title>
            <Text fontFamily={fontHauoraMedium} fontSize="lg" lineHeight={20} color="#494949">
              Do I need to bring my pet in a carrier?
            </Text>
          </Accordion.title>
          <Accordion.content>
            <Text>This is a dummy content</Text>
          </Accordion.content>
        </Accordion>
        <Accordion>
          <Accordion.title>
            <Text fontFamily={fontHauoraMedium} fontSize="lg" lineHeight={20} color="#494949">
              How often should my pet have a check-up?
            </Text>
          </Accordion.title>
          <Accordion.content>
            <Text>This is a dummy content 2</Text>
          </Accordion.content>
        </Accordion>
        <Accordion>
          <Accordion.title>
            <Text fontFamily={fontHauoraMedium} fontSize="lg" lineHeight={20} color="#494949">
              Are there any preparations needed before the appointment?
            </Text>
          </Accordion.title>
          <Accordion.content>
            <Text>This is a dummy content 3</Text>
          </Accordion.content>
        </Accordion>
      </Container>

      <Container mt={32} pb={20}>
        <ButtonPrimary>Confirm Appointment</ButtonPrimary>
      </Container>
    </ScrollDiv>
  );
};

const ReadonlyItem = ({ field, value }: { field: string; value: string }) => {
  return (
    <Div py={12} borderBottomWidth={1} borderColor="#E0E0E0">
      <Text fontFamily={fontHauoraMedium} fontSize={"sm"} lineHeight={16} color="#494949">
        {field}
      </Text>
      <Text fontFamily={fontHauoraMedium} fontSize="xl" lineHeight={24} color="#222222">
        {value}
      </Text>
    </Div>
  );
};

export default DetailsScreen;
