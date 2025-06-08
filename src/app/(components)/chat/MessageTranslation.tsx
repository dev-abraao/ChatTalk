"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { translateMessage } from "../../(actions)/translation";
import { useTranslation } from "../../contexts/TranslationContext";
import BrazilFlag from "../icons/BrazilFlag";
import USFlag from "../icons/USFlag";

interface MessageTranslationProps {
  originalText: string;
  onTranslationToggle?: (isTranslated: boolean) => void;
  isMyMessage?: boolean;
  isLastFewMessages?: boolean;
}

const TranslationIcon = ({
  className = "w-4 h-4",
  isMyMessage = false,
}: {
  className?: string;
  isMyMessage?: boolean;
}) => (
  <svg
    className={`${className} ${isMyMessage ? "text-white" : "text-gray-500"}`}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.87 15.07L10.33 12.56L10.36 12.53C12.1 10.59 13.34 8.36 14.07 6H17V4H10V2H8V4H1V6H12.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8H4.69C5.42 9.63 6.42 11.17 7.67 12.56L2.58 17.58L4 19L9 14L12.11 17.11L12.87 15.07ZM18.5 10H16.5L12 22H14L15.12 19H19.87L21 22H23L18.5 10ZM15.88 17L17.5 12.67L19.12 17H15.88Z"
      fill="currentColor"
    />
  </svg>
);

const LoadingSpinner = ({
  className = "w-3 h-3",
  isMyMessage = false,
}: {
  className?: string;
  isMyMessage?: boolean;
}) => (
  <svg
    className={`${className} animate-spin ${
      isMyMessage ? "text-white" : "text-gray-500"
    }`}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      className="opacity-25"
    />
    <path
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      fill="currentColor"
    />
  </svg>
);

export default function MessageTranslation({
  originalText,
  onTranslationToggle,
  isMyMessage = false,
  isLastFewMessages = false,
}: MessageTranslationProps) {
  const { preferredLanguage } = useTranslation();
  const [translatedText, setTranslatedText] = useState<string>("");
  const [isTranslated, setIsTranslated] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState(
    preferredLanguage || "pt-BR"
  );
  const [, setDetectedLanguage] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [shouldDropUpward, setShouldDropUpward] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const languageOptions = [
    {
      code: "pt-BR",
      name: "Português",
      flag: <BrazilFlag width={14} height={10} />,
    },
    { code: "en", name: "Inglês", flag: <USFlag width={14} height={10} /> },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isDropdownOpen && buttonRef.current) {
      const updatePosition = () => {
        const button = buttonRef.current;
        if (!button) return;

        if (isLastFewMessages) {
          setShouldDropUpward(true);
          return;
        }

        const scrollContainer = button.closest(
          'div[class*="overflow-y-auto"]'
        ) as HTMLElement;

        if (scrollContainer) {
          const buttonRect = button.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();

          const spaceBelow = containerRect.bottom - buttonRect.bottom;
          const dropdownHeight = 85;

          const shouldGoUp = spaceBelow < dropdownHeight;
          setShouldDropUpward(shouldGoUp);
        } else {
          const rect = button.getBoundingClientRect();
          const isInBottomHalf = rect.top > window.innerHeight * 0.6;
          setShouldDropUpward(isInBottomHalf);
        }
      };

      updatePosition();
      const timeout = setTimeout(updatePosition, 10);
      return () => clearTimeout(timeout);
    }
  }, [isDropdownOpen, isLastFewMessages]);

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleScroll = () => {
      setIsDropdownOpen(false);
    };

    // Procurar pelo container de scroll específico do chat
    const scrollContainer = document.querySelector(
      'div[class*="overflow-y-auto"][class*="h-full"]'
    ) as HTMLElement;

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, {
        passive: true,
      });
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    if (preferredLanguage) {
      setTargetLanguage(preferredLanguage);
    }
  }, [preferredLanguage]);

  const handleTranslate = useCallback(async () => {
    if (isTranslated) {
      setIsTranslated(false);
      onTranslationToggle?.(false);
      return;
    }

    setIsTranslating(true);
    try {
      const result = await translateMessage(originalText, targetLanguage);
      if (result.success && result.translatedText) {
        setTranslatedText(result.translatedText);
        setDetectedLanguage(result.detectedLanguage || "");
        setIsTranslated(true);
        onTranslationToggle?.(true);
      } else {
        console.error("Translation failed:", result);
        alert("Erro na tradução. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro na tradução:", error);
      alert("Erro na tradução. Verifique sua conexão.");
    } finally {
      setIsTranslating(false);
    }
  }, [isTranslated, originalText, targetLanguage, onTranslationToggle]);

  if (originalText.length < 2 || /^[\s\p{Emoji}]*$/u.test(originalText)) {
    return <div className="text-sm">{originalText}</div>;
  }

  return (
    <div className="text-sm">
      <div className={isMyMessage ? "text-white" : "text-gray-800"}>
        {isTranslated ? translatedText : originalText}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={handleTranslate}
          disabled={isTranslating}
          className={`text-xs transition-colors flex items-center gap-1.5 ${
            isMyMessage
              ? "text-white/80 hover:text-white"
              : "text-gray-500 hover:text-blue-600"
          }`}
        >
          {isTranslating ? (
            <>
              <LoadingSpinner className="w-3 h-3" isMyMessage={isMyMessage} />
              <span>Traduzindo...</span>
            </>
          ) : (
            <>
              <TranslationIcon className="w-4 h-4" isMyMessage={isMyMessage} />
              <span className={isMyMessage ? "text-white" : "text-[#7A80DA]"}>
                {isTranslated ? "Ver original" : "Traduzir"}
              </span>
            </>
          )}
        </button>

        {!isTranslated && (
          <div className="relative" ref={dropdownRef}>
            <button
              ref={buttonRef}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`text-xs bg-transparent border-none outline-none pl-6 pr-2 flex items-center gap-1 hover:opacity-75 transition-opacity ${
                isMyMessage ? "text-white" : "text-[#7A80DA]"
              }`}
            >
              {targetLanguage === "pt-BR" ? (
                <BrazilFlag width={14} height={10} />
              ) : (
                <USFlag width={14} height={10} />
              )}
              <span>
                {
                  languageOptions.find((opt) => opt.code === targetLanguage)
                    ?.name
                }
              </span>
              <span className="text-xs">▼</span>
            </button>

            {isDropdownOpen && (
              <div
                className={`absolute left-0 bg-white border border-gray-200 rounded shadow-lg z-[9999] min-w-[120px] max-h-[80px] overflow-y-auto ${
                  shouldDropUpward ? "bottom-full mb-1" : "top-full mt-1"
                }`}
                style={{
                  transform: shouldDropUpward
                    ? "translateY(0)"
                    : "translateY(0)",
                }}
              >
                {languageOptions.map((option) => (
                  <button
                    key={option.code}
                    onClick={() => {
                      setTargetLanguage(option.code);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs text-black hover:bg-gray-100 flex items-center gap-2 ${
                      targetLanguage === option.code ? "bg-blue-50" : ""
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
