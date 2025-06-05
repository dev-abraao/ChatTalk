'use client';

import { useTranslation } from '../../contexts/TranslationContext';
import BrazilFlag from '../icons/BrazilFlag';
import USFlag from '../icons/USFlag';

interface TranslationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TranslationSettingsModal({
  isOpen,
  onClose,
}: TranslationSettingsModalProps) {
  const { 
    preferredLanguage, 
    autoTranslate, 
    setPreferredLanguage, 
    setAutoTranslate 
  } = useTranslation();

  // Usar as funções do contexto diretamente
  const handleLanguageChange = (language: string) => {
    setPreferredLanguage(language);
  };

  const handleAutoTranslateChange = (enabled: boolean) => {
    setAutoTranslate(enabled);
  };

  // Função para renderizar a bandeira baseada no código do idioma
  const renderFlag = (code: string) => {
    if (code === 'pt-BR') {
      return <BrazilFlag width={16} height={12} />;
    } else if (code === 'en') {
      return <USFlag width={16} height={12} />;
    }
    return null;
  };
  
  const languages = [
    { code: 'pt-BR', name: 'Português (Brasil)' },
    { code: 'en', name: 'English' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            🌐 Configurações de Tradução
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Idioma Preferido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idioma Preferido para Tradução
            </label>
            <div className="relative">
              <select
                value={preferredLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full p-3 pl-12 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                {renderFlag(preferredLanguage)}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Idioma padrão para traduzir mensagens
            </p>
          </div>

          {/* Tradução Automática */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={autoTranslate}
                onChange={(e) => handleAutoTranslateChange(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-700">
                  Tradução Automática
                </div>
                <div className="text-xs text-gray-500">
                  Traduzir automaticamente mensagens em outros idiomas
                </div>
              </div>
            </label>
          </div>

          {/* Informações */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              ℹ️ Informações
            </h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Clique no ícone 🌐 nas mensagens para traduzir</li>
              <li>• A tradução usa LibreTranslate (gratuito)</li>
              <li>• Nem todos os idiomas são suportados</li>
              <li>• A qualidade pode variar dependendo do texto</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
