interface TranslationResult {
  translatedText: string;
  detectedLanguage?: {
    confidence: number;
    language: string;
  };
  alternatives?: string[];
}

export class LibreTranslator {
  private endpoint = 'http://195.200.0.138:5000';
  private apiKey = 'a717917b-9d96-41bc-b514-adc0e48c5a20';

  // Idiomas suportados pelo servidor LibreTranslate
  private supportedLanguages = {
    'pt-BR': 'Portuguese (Brazil)',
    'en': 'English',
  };

  async translateText(
    text: string, 
    targetLanguage: string, 
    sourceLanguage = 'auto'
  ): Promise<TranslationResult> {
    try {
      // Se o idioma fonte for auto, vamos tentar primeiro detectar
      let actualSource = sourceLanguage;
      if (sourceLanguage === 'auto') {
        // Para simplificar, vamos assumir inglês como padrão se for auto
        actualSource = 'en';
      }

      const response = await fetch(`${this.endpoint}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: actualSource,
          target: targetLanguage,
          format: 'text',
          api_key: this.apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Se houve erro, tenta traduzir assumindo que o texto fonte está em inglês
      if (result.error && actualSource !== 'en') {
        console.log('Tentando traduzir assumindo fonte em inglês...');
        const fallbackResponse = await fetch(`${this.endpoint}/translate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: 'en',
            target: targetLanguage,
            format: 'text',
            api_key: this.apiKey,
          }),
        });
        
        const fallbackResult = await fallbackResponse.json();
        if (!fallbackResult.error) {
          return {
            translatedText: fallbackResult.translatedText,
            detectedLanguage: fallbackResult.detectedLanguage,
            alternatives: fallbackResult.alternatives
          };
        }
      }
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return {
        translatedText: result.translatedText,
        detectedLanguage: result.detectedLanguage,
        alternatives: result.alternatives
      };
    } catch (error) {
      console.error('Translation error:', error);
      // Retorna o texto original se falhar
      return {
        translatedText: text,
      };
    }
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const response = await fetch(`${this.endpoint}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          api_key: this.apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`Language detection failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Retorna apenas idiomas suportados (inglês e português brasileiro)
      if (result && result.length > 0) {
        const detectedLanguage = result[0].language;
        
        // Mapear códigos de idioma para os suportados
        if (detectedLanguage === 'pt' || detectedLanguage === 'pt-br' || detectedLanguage === 'pt-BR') {
          return 'pt-BR';
        } else if (detectedLanguage === 'en') {
          return 'en';
        }
        
        // Se não for inglês nem português, assume inglês como padrão
        return 'en';
      }
      
      return 'en';
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en';
    }
  }

  async getAvailableLanguages(): Promise<Record<string, string>> {
    try {
      const response = await fetch(`${this.endpoint}/languages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Se falhar, retorna os idiomas padrão
        return this.supportedLanguages;
      }

      const languages = await response.json();
      
      // Converte array de idiomas para objeto
      const languageMap: Record<string, string> = {};
      languages.forEach((lang: { code: string; name: string }) => {
        languageMap[lang.code] = lang.name;
      });
      
      return languageMap;
    } catch (error) {
      console.error('Error fetching languages:', error);
      return this.supportedLanguages;
    }
  }

  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  getLanguageName(code: string): string {
    return this.supportedLanguages[code as keyof typeof this.supportedLanguages] || code;
  }
}

// Instância singleton para usar em toda a aplicação
export const translator = new LibreTranslator();
