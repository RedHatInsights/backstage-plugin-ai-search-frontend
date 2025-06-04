import React, { useEffect, useState } from 'react';
import { getWelcomePrompts } from '../../lib/welcomePrompts';
import ChatbotWelcomePrompt from '@patternfly/chatbot/dist/dynamic/ChatbotWelcomePrompt';
import { makeStyles, useTheme } from '@material-ui/core';
import { customStyles } from '../../lib/styles';

export const WelcomeMessages: React.FC<{
  show: boolean;
  sendMessageHandler: (param: string) => void;
  firstName?: string;
}> = ({ show, sendMessageHandler, firstName }) => {
  const [welcomePrompts, setWelcomePrompts] = useState<any>([]);

  // CSS Overrides to make PF components look normal in Backstage
  const theme = useTheme();
  const useStyles = makeStyles(_theme => customStyles(theme));
  const classes = useStyles();


  useEffect(() => {
    if (!show) {
      setWelcomePrompts([]);
    }
  }, [show]);

  useEffect(() => {
    if (welcomePrompts.length > 0) {
      return;
    }
    setWelcomePrompts(getWelcomePrompts(sendMessageHandler));
  }, [welcomePrompts]);

  if (show && welcomePrompts.length > 0) {
    return (
      <ChatbotWelcomePrompt
        title={`Hi ${firstName || 'there'}!`}
        description="What would you like to know?"
        prompts={welcomePrompts}
        className={classes.userName}
        />
    );
  }
  return null;
};
