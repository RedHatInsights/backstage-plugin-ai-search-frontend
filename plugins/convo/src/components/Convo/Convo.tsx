import React, { useEffect, useRef, useState } from 'react';
import {
  useApi,
  fetchApiRef,
  configApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Content, Page } from '@backstage/core-components';
import Chatbot, {
  ChatbotDisplayMode,
} from '@patternfly/chatbot/dist/dynamic/Chatbot';
import MessageBox from '@patternfly/chatbot/dist/dynamic/MessageBox';
import Message from '@patternfly/chatbot/dist/dynamic/Message';
import ConvoAvatar from '../../../static/robot.svg';

import { ConvoFooter } from '../ConvoFooter/ConvoFooter';
import { ConvoHeader } from '../ConvoHeader/ConvoHeader';
import { Conversation } from '../Conversation/Conversation';
import { ChatbotConversationHistoryNav } from '@patternfly/chatbot/dist/dynamic/ChatbotConversationHistoryNav';
import { WelcomeMessages } from '../WelcomeMessages/WelcomeMessages';
import { AssistantIntroduction } from '../AssistantIntroduction/AssistantIntroduction';
import { humanizeAssistantName } from '../../lib/helpers';

import { customStyles } from '../../lib/styles';
import { getAssistants, sendUserQuery, getConversations } from '../../lib/api';

// Style imports needed for the virtual assistant component
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/chatbot/dist/css/main.css';

import { UserEntity } from '@backstage/catalog-model';

// CSS Overrides to make PF components look normal in Backstage
const useStyles = makeStyles(theme => customStyles(theme));

const BOT = 'ai';
const USER = 'human';

export const Convo = () => {
  // Constants
  const classes = useStyles();
  const config = useApi(configApiRef);
  const backendUrl = config.getString('backend.baseUrl');
  const theme = useTheme();

  // Define types for conversation messages
  interface ConversationMessage {
    sender: string;
    text: string;
    done: boolean;
    search_metadata?: any;
    interactionId?: string | boolean;
  }

  interface ConversationItem {
    id: string;
    text: string;
    payload: ConversationMessage[];
    sessionId?: string;
  }

  // State
  const [_userInputMessage, setUserInputMessage] = useState<string>('');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [assistants, setAssistants] = useState<any>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<any>({});
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [assistantHasBeenSelected, setAssistantHasBeenSelected] =
    useState<boolean>(false);
  const [responseIsStreaming, setResponseIsStreaming] =
    useState<boolean>(false);
  const [showAssistantIntroduction, setShowAssistantIntroduction] =
    useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>(crypto.randomUUID());
  const [user, setUser] = useState<UserEntity>({} as UserEntity);
  const [userId, setUserId] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const abortControllerRef = useRef(new AbortController());

  const fetchApi = useApi(fetchApiRef);
  const identityApi = useApi(identityApiRef);
  const catalogApi = useApi(catalogApiRef);

  useEffect(() => {
    const handleLinkClick = (event: Event) => {
      const link = (event.target as HTMLElement).closest('a'); // Matches any <a> element
      if (link) {
        event.preventDefault();
        window.open(link.href, '_blank', 'noopener,noreferrer');
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { userEntityRef } = await identityApi.getBackstageIdentity();
      const userEntity = (await catalogApi.getEntityByRef(
        userEntityRef,
      )) as UserEntity;
      setUser(userEntity);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.spec?.profile?.displayName) {
      setFirstName(user.spec.profile.displayName.split(' ')[0]);
    } else {
      setFirstName('');
    }
    if (user?.metadata?.uid) {
      setUserId(user?.spec?.profile?.email || 'unknown_user');
    } else {
      setUserId('');
    }
  }, [user]);

  useEffect(() => {
    const currentTheme = theme.palette.type;
    setIsDarkMode(currentTheme === 'dark');
  }, [theme]);

  React.useEffect(() => {
    const htmlTagElement = document.documentElement;
    const THEME_DARK_CLASS = 'pf-v6-theme-dark';
    if (isDarkMode) {
      htmlTagElement.classList.add(THEME_DARK_CLASS);
    } else {
      htmlTagElement.classList.remove(THEME_DARK_CLASS);
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (assistants.length !== 0) {
      return;
    }
    getAssistants(
      backendUrl,
      fetchApi.fetch,
      setAssistants,
      setSelectedAssistant,
      setError,
      setLoading,
      setResponseIsStreaming,
    );
  }, [assistants]);

  // Fetch conversations from the backend
  useEffect(() => {
    if ( conversation.length > 1 ) {
      return; // Skip fetching conversations if the conversation already has messages
    }
    const fetchConversations = async () => {
      try {
        getConversations(
          backendUrl,
          fetchApi.fetch,
          setConversations,
          setError,
          setLoading,
          userId,
        );
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setError(true);
        setLoading(false);
      }
    };
    if (userId) {
      fetchConversations();
    }
  }, [userId, backendUrl, fetchApi.fetch, conversation]);

  // Whenever the conversation changes,
  // If the last message in the conversation is from the user and the bot is not typing, send the user query
  useEffect(() => {
    if (
      conversation.length > 0 &&
      conversation[conversation.length - 1].sender === USER &&
      !loading
    ) {
      const lastMessage = conversation[conversation.length - 1];
      const previousMessages = conversation.slice(0, conversation.length - 1);
      try {
        sendUserQuery(
          backendUrl,
          fetchApi.fetch,
          selectedAssistant.id,
          lastMessage.text,
          previousMessages,
          setLoading,
          setError,
          setResponseIsStreaming,
          handleError,
          updateConversation,
          sessionId,
          abortControllerRef.current.signal,
          userId,
        );
      } catch (error) {
        console.log('Error sending user query:', error);
      }
    }
    console.log('Conversation updated:', conversation);
  }, [conversation]);

  // If we are loading, clear the user input message
  useEffect(() => {
    if (loading) {
      setUserInputMessage('');
    }
  }, [loading]);

  // If the conversation changes, scroll to the bottom of the message box
  useEffect(() => {
    const messageBox = document.querySelector('.pf-chatbot__messagebox');
    if (messageBox) {
      messageBox.scrollTo({ top: messageBox.scrollHeight, behavior: 'smooth' });
    }
  }, [conversation.length]);

  const updateConversation = (text_content: string, search_metadata: any) => {
    setConversation(prevMessages => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      if (!lastMessage) {
        return prevMessages;
      }

      // If the last message is from the user we need to create a new bot message
      // and we put the text content in the message.
      // In a streaming response this handles the first returned chunk
      if (lastMessage.sender !== BOT) {
        const newMessage = {
          sender: BOT,
          text: text_content,
          done: false,
          //We wont know the interaction ID until we get the last chunk
          interactionId: false,
        };
        return [...prevMessages, newMessage];
      }

      //If we haven't tripped the above conditional we are in a streaming response
      // and we need to update the last message with the new text content
      const updatedMessages = [...prevMessages];

      // If we have text content we need to update the last message
      if (text_content) {
        updatedMessages[updatedMessages.length - 1].text += text_content;
      }

      // If we have search metadata we need to update the last message
      // and set the done flag to true
      if (search_metadata && search_metadata.length > 0) {
        updatedMessages[updatedMessages.length - 1].search_metadata =
          search_metadata;
        updatedMessages[updatedMessages.length - 1].done = true;
        updatedMessages[updatedMessages.length - 1].interactionId =
          search_metadata[0].interactionId;
      }

      return updatedMessages;
    });
    return true;
  };

  const handleError = (error: Error) => {
    setError(true);
    setResponseIsStreaming(false);
    setLoading(false);
    console.error(error.message);
  };

  const sendMessageHandler = (msg: string) => {
    setUserInputMessage('');
    const conversationEntry: ConversationMessage = {
      text: msg,
      sender: USER,
      done: false,
    };
    setConversation([...conversation, conversationEntry]);
  };

  const ShowErrorMessage = () => {
    if (error) {
      return (
        <Content>
          😿 Something went wrong talking Convo's brain. Try back later.
        </Content>
      );
    }
    return null;
  };

  const recycleAbortController = () => {
    // Abort previous request
    abortControllerRef.current.abort();
    // Create a new abort controller for the new session
    abortControllerRef.current = new AbortController();
  };

  const assistantSelectionHandler = (assistant: any) => {
    recycleAbortController();
    setSelectedAssistant(assistant);
    setConversation([]);
    setError(false);
    setLoading(false);
    setResponseIsStreaming(false);
    setAssistantHasBeenSelected(true);
    setShowAssistantIntroduction(true);
    setSessionId(crypto.randomUUID());
  };

  const handleNewChatClick = (conversation: any) => {
    recycleAbortController();
    setConversation(conversation);
    setError(false);
    setLoading(false);
    setResponseIsStreaming(false);
    setShowAssistantIntroduction(false);
    setSessionId(crypto.randomUUID());
  };

  const handleConversationSelect = (_event?: React.MouseEvent, itemId?: string | number) => {
    console.log('handleConversationSelect called with itemId:', itemId, 'type:', typeof itemId);
    console.log('Available conversations:', conversations);
    
    if (itemId !== undefined && Array.isArray(conversations)) {
      // Find conversation by id in the conversations array
      const selectedConversation = conversations.find((conv: ConversationItem) => {
        const idMatch = conv.id.toString() === itemId?.toString();
        console.log('Comparing conv.id:', conv.id, 'with itemId:', itemId, 'match:', idMatch);
        return idMatch;
      });
      
      if (selectedConversation) {
        console.log('Found conversation:', selectedConversation);
        recycleAbortController();
        setConversation(selectedConversation.payload || []);
        setError(false);
        setLoading(false);
        setResponseIsStreaming(false);
        setShowAssistantIntroduction(false);
        setSessionId(selectedConversation.sessionId || crypto.randomUUID());
        setSidebarOpen(false); // Close sidebar after selection
      } else {
        console.log('Conversation not found for itemId:', itemId, 'conversations:', conversations);
      }
    } else {
      console.log('Invalid itemId or conversations array:', { itemId, conversations });
    }
  };

  const ShowLoadingMessage = () => {
    if (loading) {
      return (
        <Message
          name={humanizeAssistantName(selectedAssistant.name)}
          role="bot"
          avatar={ConvoAvatar}
          timestamp=" "
          isLoading
        />
      );
    }
    return null;
  };

  return (
    <Page themeId="tool">
      <Content className={classes.container}>
        <Chatbot displayMode={ChatbotDisplayMode.embedded}>
          <ChatbotConversationHistoryNav
            isDrawerOpen={sidebarOpen}
            conversations={conversations}
            onDrawerToggle={() => {setSidebarOpen(!sidebarOpen)}}
            setIsDrawerOpen={() => {setSidebarOpen(!sidebarOpen)}}
            onSelectActiveItem={handleConversationSelect}
            displayMode={ChatbotDisplayMode.default}
            drawerContent={
              <>
                <ConvoHeader
                  onAssistantSelect={assistantSelectionHandler}
                  onNewChatClick={handleNewChatClick}
                  assistants={assistants}
                  selectedAssistant={selectedAssistant}
                  loading={loading}
                  setSidebarOpen={setSidebarOpen}
                  sidebarOpen={sidebarOpen}
                />
                <MessageBox
                  className={`${classes.messagebox} ${classes.userMessageText} `}
                  style={{ justifyContent: 'flex-end' }}
                  announcement="Type your message and hit enter to send"
                >
                  <WelcomeMessages
                    show={!assistantHasBeenSelected}
                    sendMessageHandler={sendMessageHandler}
                    firstName={firstName}
                  />
                  <AssistantIntroduction
                    assistant={selectedAssistant}
                    backendUrl={backendUrl}
                    assistantHasBeenSelected={assistantHasBeenSelected}
                    show={showAssistantIntroduction}
                    sessionId={sessionId}
                    abortControllerRef={abortControllerRef}
                  />
                  <Conversation
                    conversation={conversation}
                    assistant={selectedAssistant}
                  />
                  <ShowLoadingMessage />
                  <ShowErrorMessage />
                </MessageBox>
                <ConvoFooter
                  sendMessageHandler={sendMessageHandler}
                  responseIsStreaming={responseIsStreaming}
                />
              </>
            }
          />
        </Chatbot>
      </Content>
    </Page>
  );
};
