import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import {
  ChatbotHeader,
  ChatbotHeaderMain,
  ChatbotHeaderActions,
  ChatbotHeaderTitle,
  ChatbotHeaderMenu,
} from '@patternfly/chatbot/dist/dynamic/ChatbotHeader';

import { Title, Button } from '@patternfly/react-core';

import { AssistantSelect } from './AssistantSelect';

import { customStyles } from '../../lib/styles';
import { useTheme } from '@material-ui/core/styles';

export const ConvoHeader: React.FC<{
  onAssistantSelect: (assistant: any) => void;
  onNewChatClick: ([]: any) => void;
  assistants: any[];
  selectedAssistant: any;
  loading: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarOpen: boolean;
}> = ({
  onAssistantSelect,
  onNewChatClick,
  assistants,
  selectedAssistant,
  loading,
  setSidebarOpen,
  sidebarOpen,
}) => {
  // CSS Overrides to make PF components look normal in Backstage
  const theme = useTheme();
  const useStyles = makeStyles(_theme => customStyles(theme));
  const classes = useStyles();

  return (
    <ChatbotHeader className={classes.header}>
      <ChatbotHeaderMain>
        <ChatbotHeaderMenu
          aria-expanded={sidebarOpen}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <ChatbotHeaderTitle className={classes.headerTitle}>
          <Title headingLevel="h1" size="3xl">
            Convo
          </Title>
        </ChatbotHeaderTitle>
      </ChatbotHeaderMain>
      <ChatbotHeaderActions>
        <Button
          className={
            loading ? classes.redHatGrayBGColor : classes.redHatRedBGColor
          }
          isDisabled={loading}
          onClick={() => {
            onNewChatClick([]);
          }}
        >
          New Chat
        </Button>
        <AssistantSelect
          assistants={assistants}
          onAssistantSelect={onAssistantSelect}
          selectedAssistant={selectedAssistant}
          className={classes.assistantMenu}
        />
      </ChatbotHeaderActions>
    </ChatbotHeader>
  );
};
