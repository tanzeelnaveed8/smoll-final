import { Dropdown as MagnusDropdown, Button, Div, DropdownRef, Text } from "react-native-magnus";

import React, { forwardRef } from "react";

interface DropdownProps {
  ref: React.RefObject<DropdownRef>;
  onSelect: (value: string) => void;
}

const DocumentTypeDropdown = forwardRef<DropdownRef, DropdownProps>((props, ref) => {
  return (
    ref && (
      <Div>
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
              props.onSelect("Photo Library");
            }}
          >
            Photo Library
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
              props.onSelect("Browse");
            }}
          >
            Browse
          </MagnusDropdown.Option>
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

export default DocumentTypeDropdown;
