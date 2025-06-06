'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { translateMessage } from '../../(actions)/translation';
import { useTranslation } from '../../contexts/TranslationContext';
import BrazilFlag from '../icons/BrazilFlag';
import USFlag from '../icons/USFlag';

interface MessageTranslationProps {
  originalText: string;
  onTranslationToggle?: (isTranslated: boolean) => void;
  isMyMessage?: boolean;
}

export default function MessageTranslation({ 
  originalText, 
  onTranslationToggle,
  isMyMessage = false
}: MessageTranslationProps) {
  const { preferredLanguage } = useTranslation();
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslated, setIsTranslated] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState(preferredLanguage || 'pt-BR');
  const [, setDetectedLanguage] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languageOptions = [
    { code: 'pt-BR', name: 'Português', flag: <BrazilFlag width={14} height={10} /> },
    { code: 'en', name: 'Inglês', flag: <USFlag width={14} height={10} /> }
  ];

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Atualizar idioma preferido quando mudar
  useEffect(() => {
    if (preferredLanguage) {
      setTargetLanguage(preferredLanguage);
    }
  }, [preferredLanguage]);

  const handleTranslate = useCallback(async () => {
    if (isTranslated) {
      // Voltar ao texto original
      setIsTranslated(false);
      onTranslationToggle?.(false);
      return;
    }

    setIsTranslating(true);
    try {
      const result = await translateMessage(originalText, targetLanguage);
      if (result.success && result.translatedText) {
        setTranslatedText(result.translatedText);
        setDetectedLanguage(result.detectedLanguage || '');
        setIsTranslated(true);
        onTranslationToggle?.(true);
      } else {
        console.error('Translation failed:', result);
        alert('Erro na tradução. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro na tradução:', error);
      alert('Erro na tradução. Verifique sua conexão.');
    } finally {
      setIsTranslating(false);
    }
  }, [isTranslated, originalText, targetLanguage, onTranslationToggle]);

  // Não mostrar botão de tradução se o texto for muito curto ou apenas emojis
  if (originalText.length < 2 || /^[\s\p{Emoji}]*$/u.test(originalText)) {
    return <div className="text-sm">{originalText}</div>;
  }

  return (
    <div className="text-sm">
      <div className={isMyMessage ? "text-white" : "text-[#7A80DA]"}>
        {isTranslated ? translatedText : originalText}
      </div>
      
      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={handleTranslate}
          disabled={isTranslating}
          className="text-xs text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1"
        >
          {isTranslating ? (
            <>
              <div className="w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              Traduzindo...
            </>
          ) : (
            <>
              <span className="text-sm">🌐</span>
              <span className={isMyMessage ? 'text-white' : 'text-[#7A80DA]'}>
                {isTranslated ? 'Ver original' : 'Traduzir'}
              </span>
            </>
          )}
        </button>

        {!isTranslated && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`text-xs bg-transparent border-none outline-none pl-6 pr-2 flex items-center gap-1 hover:opacity-75 transition-opacity ${
                isMyMessage ? 'text-white' : 'text-[#7A80DA]'
              }`}
            >
              {targetLanguage === 'pt-BR' ? (
                <BrazilFlag width={14} height={10} />
              ) : (
                <USFlag width={14} height={10} />
              )}
              <span>{languageOptions.find(opt => opt.code === targetLanguage)?.name}</span>
              <span className="text-xs">▼</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[120px]">
                {languageOptions.map((option) => (
                  <button
                    key={option.code}
                    onClick={() => {
                      setTargetLanguage(option.code);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs text-black hover:bg-gray-100 flex items-center gap-2 ${
                      targetLanguage === option.code ? 'bg-blue-50' : ''
                    }`}
                  >
                    {option.flag}
                    <span>{option.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
