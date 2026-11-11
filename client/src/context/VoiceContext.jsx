import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

const VoiceContext = createContext();

export const VoiceProvider = ({ children }) => {
  const { language } = useLanguage();
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [activeCallback, setActiveCallback] = useState(null);

  useEffect(() => {
    // Check SpeechRecognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      // Auto-configure speech language based on app language toggle
      rec.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      setRecognition(rec);
    }
  }, []);

  // Update speech recognition language when the application language changes
  useEffect(() => {
    if (recognition) {
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    }
  }, [language, recognition]);

  const startListening = (onTranscriptReceived, onErrorOccurred) => {
    if (!isSupported || !recognition) {
      if (onErrorOccurred) onErrorOccurred('not_supported');
      return;
    }

    // Stop current listening if any
    try {
      recognition.abort();
    } catch (e) {}

    setIsListening(true);
    setActiveCallback(() => onTranscriptReceived);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onTranscriptReceived) {
        onTranscriptReceived(transcript);
      }
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (onErrorOccurred) {
        onErrorOccurred(event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  return (
    <VoiceContext.Provider value={{ isSupported, isListening, startListening, stopListening }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
