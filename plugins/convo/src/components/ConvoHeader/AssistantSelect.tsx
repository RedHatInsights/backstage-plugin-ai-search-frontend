import React, { useEffect, useState } from 'react';
import { ChatbotHeaderSelectorDropdown } from '@patternfly/chatbot/dist/dynamic/ChatbotHeader';
import { DropdownItem, DropdownList } from '@patternfly/react-core';
import { humanizeAssistantName } from '../../lib/helpers';

export const AssistantSelect: React.FC<{
  assistants: any[];
  onAssistantSelect: (assistant: any) => void;
  selectedAssistant: any;
  className: string;
}> = ({ assistants, onAssistantSelect, selectedAssistant, className }) => {
  const [assistantsCount, setAssistantsCount] = useState(assistants.length);

  useEffect(() => {
    setAssistantsCount(assistants.length);
  }, [assistants]);

  if (assistantsCount === 0) {
    return null;
  }



  return (
    <div className={className}>
      <ChatbotHeaderSelectorDropdown
        value={humanizeAssistantName(selectedAssistant.name)}
        onSelect={(_event, selection) => {
          const assistant = assistants.find((assistant: any) => assistant.id === selection);
          onAssistantSelect(assistant);
        }}
      >
        <DropdownList className={className}>
          {assistants.map((assistant, _index) => (
            <DropdownItem value={assistant.id} key={assistant.id}>
              {humanizeAssistantName(assistant.name)}
            </DropdownItem>
          ))}
        </DropdownList>
      </ChatbotHeaderSelectorDropdown>
    </div>
  );
};
