import { Dropdown as MagnusDropdown, Button, Div, DropdownRef, Text } from "react-native-magnus";

import React, { forwardRef } from "react";

interface DropdownProps {
  ref: React.RefObject<DropdownRef>;
  isDeceased: boolean;
  showCancelSubscription: boolean;
  onSelect: (value: string) => void;
}

const Dropdown = forwardRef<DropdownRef, DropdownProps>((props, ref) => {
  return (
    ref && (
      <Div>
        {/* <Button
          block
          bg="pink500"
          mt="sm"
          p="md"
          color="white"
          onPress={() => {
            if ("current" in ref && ref.current) {
              ref.current.open();
            }
          }}
        >
          Open Dropdown
        </Button> */}

        <MagnusDropdown
          ref={ref}
          m="md"
          pb="md"
          bg="transparent"
          showSwipeIndicator={false}
          roundedTop="xl"
        >
          <MagnusDropdown.Option
            value={"Delete Pet"}
            block
            bg="gray100"
            color="blue600"
            py="lg"
            px="xl"
            borderBottomWidth={1}
            borderBottomColor="gray200"
            justifyContent="center"
            roundedTop="lg"
            onPress={() => {
              props.onSelect("Delete Pet");
            }}
          >
            Delete
          </MagnusDropdown.Option>
          <MagnusDropdown.Option
            value={"Second"}
            block
            borderBottomWidth={1}
            borderBottomColor="gray200"
            bg="gray100"
            color="blue600"
            py="lg"
            px="xl"
            justifyContent="center"
            onPress={() => {
              props.onSelect("Deceased");
            }}
          >
            {props.isDeceased ? "Alive" : "Deceased"}
          </MagnusDropdown.Option>

          {props.showCancelSubscription ? (
            <MagnusDropdown.Option
              value={"cancelSubscription"}
              block
              borderBottomWidth={1}
              borderBottomColor="gray200"
              bg="gray100"
              color="red500"
              py="lg"
              px="xl"
              justifyContent="center"
              roundedBottom="lg"
              onPress={() => {
                props.onSelect("cancelSubscription");
              }}
            >
              Cancel Subscription
            </MagnusDropdown.Option>
          ) : (
            <></>
          )}
          <MagnusDropdown.Option
            value={"Cancel"}
            block
            color="red500"
            underlayColor="gray100"
            py="lg"
            mt="lg"
            px="xl"
            fontWeight="bold"
            justifyContent="center"
            rounded="lg"
          >
            Cancel
          </MagnusDropdown.Option>
        </MagnusDropdown>
      </Div>
    )
  );
});

export default Dropdown;
