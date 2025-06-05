'use server';

import { translator } from '../(lib)/translationService';

export async function translateMessage(text: string, targetLanguage: string, sourceLanguage = 'auto') {
  console.log('translateMessage server action called:', { text, targetLanguage, sourceLanguage });
  
  try {
    console.log('Calling translator.translateText...');
    const result = await translator.translateText(text, targetLanguage, sourceLanguage);
    console.log('Translation service result:', result);
    
    return {
      success: true,
      translatedText: result.translatedText,
      detectedLanguage: result.detectedLanguage?.language,
      confidence: result.detectedLanguage?.confidence,
      alternatives: result.alternatives,
    };
  } catch (error) {
    console.error('Translation action error:', error);
    return {
      success: false,
      error: 'Falha na tradução',
      translatedText: text, // Retorna texto original
    };
  }
}

export async function detectLanguage(text: string) {
  try {
    const language = await translator.detectLanguage(text);
    return {
      success: true,
      language,
    };
  } catch (error) {
    console.error('Language detection action error:', error);
    return {
      success: false,
      language: 'auto',
    };
  }
}

export async function getSupportedLanguages() {
  try {
    return await translator.getAvailableLanguages();
  } catch (error) {
    console.error('Error getting supported languages:', error);
    return translator.getSupportedLanguages();
  }
}
