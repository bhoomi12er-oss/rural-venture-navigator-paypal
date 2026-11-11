import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useVoice } from '../../context/VoiceContext';
import { useLanguage } from '../../context/LanguageContext';

export const Input = React.forwardRef(({
  label,
  hint,
  error,
  type = 'text',
  allowVoice = false,
  className = '',
  id,
  value,
  onChange,
  ...props
}, ref) => {
  const { isSupported, isListening, startListening, stopListening } = useVoice();
  const { t } = useLanguage();

  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(
        (transcript) => {
          if (onChange) {
            // Create a mock event to pass to standard React onChange
            const event = {
              target: {
                id,
                value: transcript,
                name: props.name || id
              }
            };
            onChange(event);
          }
        },
        (error) => {
          console.error("Speech input error:", error);
        }
      );
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-0.5">
          <label htmlFor={id} className="font-semibold text-brand-dark text-base sm:text-lg">
            {label}
          </label>
          {hint && (
            <span className="text-xs sm:text-sm text-brand-secondary font-medium italic">
              {hint}
            </span>
          )}
        </div>
      )}
      
      <div className="relative flex items-center">
        <input
          id={id}
          type={type}
          ref={ref}
          value={value}
          onChange={onChange}
          className={`w-full bg-white border ${
            error ? 'border-red-500 focus:outline-red-500' : 'border-brand-neutralGray focus:border-brand-primary'
          } text-brand-dark rounded-lg py-3 px-4 text-base transition-all duration-200 ${
            allowVoice && isSupported ? 'pr-12' : ''
          }`}
          {...props}
        />
        
        {allowVoice && isSupported && (
          <button
            type="button"
            onClick={handleVoiceClick}
            className={`absolute right-2 p-2 rounded-full transition-all duration-200 ${
              isListening
                ? 'bg-red-100 text-red-600 animate-pulse'
                : 'text-brand-primary hover:bg-brand-primaryLight'
            }`}
            title={isListening ? t('speechListening') : t('speechPrompt')}
            aria-label="Voice input"
          >
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {error && <span className="text-xs sm:text-sm text-red-600 font-medium">{error}</span>}
      {isListening && (
        <span className="text-xs text-red-500 animate-pulse font-medium">
          {t('speechListening')}...
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
