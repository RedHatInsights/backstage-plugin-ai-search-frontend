import React from 'react';
import { sendUserQuery } from '../../lib/api';
import { getAssistantIntroductionPrompt } from '../../lib/assistantIntroductionPrompt';
import Message from '@patternfly/chatbot/dist/dynamic/Message';
import ConvoAvatar from '../../../static/robot.svg';
import { humanizeAssistantName } from '../../lib/helpers';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';

const AssistantIntroductionMessage: React.FC<{
  text: string;
  assistant: any;
  loading: boolean;
  show: boolean;
}> = ({ text, assistant, loading, show }) => {
  if (!show) {
    return null;
  }
  return (
    <Message
      key={text}
      name={`${humanizeAssistantName(assistant.name)} Assistant`}
      role="bot"
      content={text}
      avatar={ConvoAvatar}
      timestamp=' '
      isLoading={loading}
    />
  );
};

export const AssistantIntroduction: React.FC<{
  assistant: any;
  backendUrl: string;
  assistantHasBeenSelected: boolean;
  show: boolean;
  sessionId: string;
  abortControllerRef: React.MutableRefObject<AbortController>;
  userId: string;
}> = ({ assistant, backendUrl, assistantHasBeenSelected, show, sessionId, abortControllerRef, userId }) => {
  const [llmResponse, setLlmResponse] = React.useState<string>('👋');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<boolean>(false);
  const fetchApi = useApi(fetchApiRef);
  

  const noop = () => {};

  const updateResponse = (text_content: string, _search_metadata: any) => {
    if (!text_content) {
      return;
    }
    setLlmResponse(prev => prev + text_content);
  };

  React.useEffect(() => {
    if (!assistantHasBeenSelected) {
      return;
    }
    setLlmResponse('👋');
    handleAssistantIntroduction();
  }, [assistant]);


  const handleAssistantIntroduction = async () => {
    setError(false);
    try {
      await sendUserQuery(
        backendUrl,
        fetchApi.fetch,
        assistant.id,
        getAssistantIntroductionPrompt(assistant.name),
        [],
        setLoading,
        noop,
        noop,
        noop,
        updateResponse,
        sessionId,
        abortControllerRef.current.signal,
        userId,
        IS_INTRODUCTION_PROMPT
      );
    } catch (error) {
      console.error('Error fetching assistant introduction:', error);
      setError(true);
    }
  };

  if (error) {
    return (
      <section>
        <b>Something went wrong talking to the server.</b>
      </section>
    );
  }

  return (
    <AssistantIntroductionMessage
      text={llmResponse}
      assistant={assistant}
      loading={loading}
      show={show}
    />
  );
};
