interface TranslationResult {
  translatedText: string;
  detectedLanguage?: {
    confidence: number;
    language: string;
  };
  alternatives?: string[];
}

export class LibreTranslator {
  private endpoint = 'https://translation.slocksert.dev';
  private apiKey = process.env.LIBRETRANSLATE_API_KEY; // Substitua pela API key gerada
  private debug = false; // Controla se os logs de debug são exibidos

  // Idiomas suportados pelo servidor LibreTranslate
  private supportedLanguages = {
    'pt-BR': 'Portuguese (Brazil)',
    'en': 'English',
  };

  private log(...args: unknown[]) {
    if (this.debug) {
      console.log(...args);
    }
  }

  // Método para ativar/desativar debug
  setDebug(enabled: boolean) {
    this.debug = enabled;
  }

  getDebugStatus() {
    return this.debug;
  }

  async translateText(
    text: string, 
    targetLanguage: string, 
    sourceLanguage = 'auto'
  ): Promise<TranslationResult> {
    try {
      // Verificar idiomas disponíveis apenas se debug estiver ativo
      const availableLanguages = await this.getAvailableLanguages();
      this.log('Idiomas disponíveis:', Object.keys(availableLanguages));

      // Se o idioma fonte for auto, vamos detectar primeiro
      let actualSource = sourceLanguage;
      let detectedLang = null;
      
      if (sourceLanguage === 'auto') {
        try {
          detectedLang = await this.detectLanguage(text);
          actualSource = detectedLang;
          this.log(`Idioma detectado: ${detectedLang}`);
        } catch (error) {
          this.log('Falha na detecção de idioma, tentando com auto:', error);
          actualSource = 'auto';
        }
      }

      const requestBody = {
        q: text,
        source: actualSource === 'pt' ? 'pt-BR' : actualSource, // Usar pt-BR para português
        target: targetLanguage, // Manter pt-BR como está
        format: 'text',
        api_key: this.apiKey,
      };

      this.log('Request body:', JSON.stringify(requestBody));

      const response = await fetch(`${this.endpoint}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      this.log(`Tentativa de tradução: ${requestBody.source} -> ${requestBody.target}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Translation failed with status ${response.status}: ${response.statusText}`);
        console.error('Error response:', errorText);
        throw new Error(`Translation failed: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      // Se houve erro e não tentamos português ainda, tenta assumindo português
      if (result.error && actualSource !== 'pt-BR') {
        this.log('Tentando traduzir assumindo fonte em português...');
        const fallbackResponse = await fetch(`${this.endpoint}/translate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: 'pt-BR',
            target: targetLanguage,
            format: 'text',
            api_key: this.apiKey,
          }),
        });
        
        const fallbackResult = await fallbackResponse.json();
        if (!fallbackResult.error) {
          return {
            translatedText: fallbackResult.translatedText,
            detectedLanguage: {
              language: 'pt-BR',
              confidence: 0.8
            },
            alternatives: fallbackResult.alternatives
          };
        }
      }
      
      // Se ainda houver erro, tenta assumindo inglês
      if (result.error && actualSource !== 'en') {
        this.log('Tentando traduzir assumindo fonte em inglês...');
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
            detectedLanguage: {
              language: 'en',
              confidence: 0.8
            },
            alternatives: fallbackResult.alternatives
          };
        }
      }
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return {
        translatedText: result.translatedText,
        detectedLanguage: detectedLang ? {
          language: detectedLang,
          confidence: 0.9
        } : result.detectedLanguage,
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
        const confidence = result[0].confidence;
        
        this.log(`Resultado da detecção: ${JSON.stringify(result[0])}`);
        
        // Se a confiança for muito baixa (< 50%), usar detecção heurística
        if (confidence < 50) {
          this.log('Confiança baixa na detecção, usando heurística...');
          return this.detectLanguageHeuristic(text);
        }
        
        // Mapear códigos de idioma para os suportados
        if (detectedLanguage === 'pt' || detectedLanguage === 'pt-br' || detectedLanguage === 'pt-BR') {
          return 'pt-BR';
        } else if (detectedLanguage === 'en') {
          return 'en';
        }
        
        // Se não for inglês nem português, usar heurística
        return this.detectLanguageHeuristic(text);
      }
      
      return 'en';
    } catch (error) {
      this.log('Language detection error:', error);
      return this.detectLanguageHeuristic(text);
    }
  }

  private detectLanguageHeuristic(text: string): string {
    this.log('Usando detecção heurística para:', text);
    
    // Palavras comuns em português
    const commonPortugueseWords = ['o', 'a', 'de', 'do', 'da', 'para', 'com', 'em', 'um', 'uma', 'que', 'não', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'suas', 'numa', 'pelos', 'pelas', 'esse', 'eles', 'tinha', 'foram', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'pelas', 'essas', 'esses', 'pelas', 'pelos', 'aquele', 'aquela', 'aqueles', 'aquelas', 'testando', 'ingles', 'português', 'brasil', 'brasileiro'];

    // Palavras comuns em inglês
    const commonEnglishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'this', 'that', 'these', 'those', 'a', 'an', 'some', 'any', 'all', 'no', 'not', 'very', 'so', 'too', 'here', 'there', 'where', 'when', 'how', 'what', 'who', 'which', 'why', 'yes', 'no', 'hello', 'hi', 'good', 'bad', 'big', 'small', 'new', 'old', 'first', 'last', 'long', 'short', 'high', 'low', 'hot', 'cold', 'right', 'left', 'up', 'down', 'out', 'over', 'under', 'again', 'back', 'come', 'go', 'get', 'give', 'take', 'make', 'see', 'know', 'think', 'say', 'tell', 'ask', 'work', 'play', 'run', 'walk', 'sit', 'stand', 'put', 'turn', 'start', 'stop', 'open', 'close', 'read', 'write', 'count', 'find', 'keep', 'let', 'begin', 'seem', 'help', 'talk', 'turn', 'start', 'show', 'hear', 'play', 'run', 'move', 'live', 'believe', 'hold', 'bring', 'happen', 'write', 'provide', 'sit', 'stand', 'lose', 'pay', 'meet', 'include', 'continue', 'set', 'learn', 'change', 'lead', 'understand', 'watch', 'follow', 'stop', 'create', 'speak', 'read', 'allow', 'add', 'spend', 'grow', 'open', 'walk', 'win', 'offer', 'remember', 'love', 'consider', 'appear', 'buy', 'wait', 'serve', 'die', 'send', 'expect', 'build', 'stay', 'fall', 'cut', 'reach', 'kill', 'remain'];

    // Padrões específicos do português
    const portuguesePatterns = [
      /ção$/i,     // palavras terminadas em ção
      /ão$/i,      // palavras terminadas em ão
      /ões$/i,     // palavras terminadas em ões
      /nh/i,       // palavras com nh
      /lh/i,       // palavras com lh
      /ç/i,        // palavras com ç
      /ã/i,        // palavras com ã
      /õ/i,        // palavras com õ
      /á|é|í|ó|ú/i // acentos agudos
    ];

    const words = text.toLowerCase().split(/\s+/);
    
    // Verificar padrões portugueses
    let portugueseScore = 0;
    let englishScore = 0;
    
    words.forEach(word => {
      // Verifica palavras comuns
      if (commonPortugueseWords.includes(word)) {
        portugueseScore += 2;
      }
      if (commonEnglishWords.includes(word)) {
        englishScore += 2;
      }
      
      // Verifica padrões portugueses
      portuguesePatterns.forEach(pattern => {
        if (pattern.test(word)) {
          portugueseScore += 1;
        }
      });
    });
    
    this.log(`Scores - Português: ${portugueseScore}, Inglês: ${englishScore}`);
    
    // Se tiver pelo menos uma indicação de português, considera português
    if (portugueseScore > 0) {
      return 'pt-BR';
    }
    
    // Se não houver indicações claras, mas o texto contém acentos ou caracteres especiais, assume português
    if (/[áéíóúâêîôûãõç]/i.test(text)) {
      return 'pt-BR';
    }
    
    return englishScore > portugueseScore ? 'en' : 'pt-BR';
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
