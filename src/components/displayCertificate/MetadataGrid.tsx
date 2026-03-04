import React from "react";
import { SimpleGrid } from "@chakra-ui/react";
import { MetadataItem } from "./MetadataItem";

interface MetadataGridProps {
  certificateType?: string;
  startDate?: string;
  endDate?: string;
  certificateId: string;
}

export const MetadataGrid: React.FC<MetadataGridProps> = ({
  certificateType,
  startDate,
  endDate,
  certificateId,
}) => {
  return (
    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} w="100%">
      <MetadataItem
        label="Type"
        value={certificateType || "N/A"}
        lightBg="teal.50"
        darkBg="teal.900"
        lightLabelColor="teal.600"
        darkLabelColor="teal.200"
      />
      <MetadataItem
        label="Format"
        value={certificateType || "N/A"}
        lightBg="purple.50"
        darkBg="purple.900"
        lightLabelColor="purple.600"
        darkLabelColor="purple.200"
      />
      <MetadataItem
        label="Start Date"
        value={startDate || "N/A"}
        lightBg="green.50"
        darkBg="green.900"
        lightLabelColor="green.600"
        darkLabelColor="green.200"
      />
      <MetadataItem
        label="End Date"
        value={endDate || "N/A"}
        lightBg="green.50"
        darkBg="green.900"
        lightLabelColor="green.600"
        darkLabelColor="green.200"
      />
      <MetadataItem
        label="Cert. #"
        value={certificateId}
        lightBg="yellow.50"
        darkBg="yellow.900"
        lightLabelColor="yellow.600"
        darkLabelColor="yellow.200"
      />
    </SimpleGrid>
  );
};
