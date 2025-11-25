import { useState, useCallback } from 'react';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenAI } from '@google/genai';
import { AI_CONFIG } from '@/config/aiConfig';

export type AIProviderType = 'gemini' | 'openai' | 'claude' | 'nvidia' | 'meta';
export type ImageProviderType = 'imagen' | 'dalle'|'gemini' ;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const useAIProvider = () => {
  const [provider, setProvider] = useState<AIProviderType>('gemini');
  const [imageProvider, setImageProvider] = useState<ImageProviderType>('gemini');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [silenceTimeout, setSilenceTimeout] = useState<NodeJS.Timeout | null>(null);

  // Initialize AI clients
  const initializeClient = useCallback((providerType: AIProviderType) => {
    switch (providerType) {
      case 'gemini':
        return new GoogleGenerativeAI(AI_CONFIG.gemini.apiKey);
      
      case 'openai':
        return new OpenAI({
          apiKey: AI_CONFIG.openai.apiKey,
          dangerouslyAllowBrowser: true
        });
      
      case 'claude':
        return new OpenAI({
          apiKey: AI_CONFIG.claude.apiKey,
          baseURL: AI_CONFIG.claude.baseURL,
          dangerouslyAllowBrowser: true
        });
      
      case 'nvidia':
        return new OpenAI({
          apiKey: AI_CONFIG.nvidia.apiKey,
          baseURL: AI_CONFIG.nvidia.baseURL,
          dangerouslyAllowBrowser: true
        });
      
      case 'meta':
        return new OpenAI({
          apiKey: AI_CONFIG.meta.apiKey,
          baseURL: AI_CONFIG.meta.baseURL,
          dangerouslyAllowBrowser: true
        });
      
      default:
        return null;
    }
  }, []);

  // Call Gemini API
  const callGemini = async (question: string): Promise<string> => {
    const client = initializeClient('gemini') as GoogleGenerativeAI;
    const model = client.getGenerativeModel({ model: AI_CONFIG.gemini.model });
    const result = await model.generateContent(question);
    return result.response.text() || '';
  };

  // Call OpenAI API
  const callOpenAI = async (question: string): Promise<string> => {
    const client = initializeClient('openai') as OpenAI;
    const completion = await client.chat.completions.create({
      model: AI_CONFIG.openai.model,
      messages: [{ role: 'user', content: question }],
    });
    return completion.choices[0]?.message?.content || '';
  };

  // Call Claude API
  const callClaude = async (question: string): Promise<string> => {
    const client = initializeClient('claude') as OpenAI;
    const completion = await client.chat.completions.create({
      model: AI_CONFIG.claude.model,
      messages: [{ role: 'user', content: question }],
      temperature: AI_CONFIG.claude.temperature,
      max_tokens: AI_CONFIG.claude.maxTokens,
    });
    return completion.choices[0]?.message?.content || '';
  };

  // Call NVIDIA API
  const callNvidia = async (question: string): Promise<string> => {
    const client = initializeClient('nvidia') as OpenAI;
    const completion = await client.chat.completions.create({
      model: AI_CONFIG.nvidia.model,
      messages: [{ role: 'user', content: question }],
      temperature: AI_CONFIG.nvidia.temperature,
      max_tokens: AI_CONFIG.nvidia.maxTokens,
    });
    return completion.choices[0]?.message?.content || '';
  };

  // Call Meta API
  const callMeta = async (question: string): Promise<string> => {
    const client = initializeClient('meta') as OpenAI;
    const completion = await client.chat.completions.create({
      model: AI_CONFIG.meta.model,
      messages: [{ role: 'user', content: question }],
      temperature: AI_CONFIG.meta.temperature,
      max_tokens: AI_CONFIG.meta.maxTokens,
    });
    return completion.choices[0]?.message?.content || '';
  };

  // Generate Image using Gemini 2.0 with responseModalities
  const generateImageWithGemini = async (prompt: string): Promise<string> => {
    console.log('📸 Generating with Gemini model:', AI_CONFIG.imageGeneration.gemini.model);
    
    const genAI = new GoogleGenAI({
      apiKey: AI_CONFIG.imageGeneration.gemini.apiKey,
    });
    
    const response = await genAI.models.generateContent({
      model: AI_CONFIG.imageGeneration.gemini.model,
      contents: prompt,
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    // Extract image from response parts
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        // Check for inline image data
        if (part.inlineData && part.inlineData.data) {
          console.log(' Gemini generated image successfully');
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error('No image generated from Gemini - model may not support image generation');
  };

  // Main image generation router - using Gemini
  const generateImage = async (prompt: string): Promise<string> => {
    console.log(' Image generation using Gemini');
    return generateImageWithGemini(prompt);
  };

  // Check if prompt is asking for image generation
  const isImageGenerationRequest = (prompt: string): boolean => {
    const imageKeywords = [
      'generate image',
      'create image',
      'draw',
      'make image',
      'picture of',
      'illustration of',
      'generate picture',
      'create picture',
      'show me image',
      'show image',
      'visualize',
      'paint',
      'sketch',
      'artwork of',
      'photo of',
      'imagen',
      'image of',
      'make a picture',
      'generate a picture',
      'create a photo'
    ];
    
    const lowerPrompt = prompt.toLowerCase();
    const isImageRequest = imageKeywords.some(keyword => lowerPrompt.includes(keyword));
    
    console.log('🔍 Image Detection:', {
      prompt: prompt,
      isImageRequest: isImageRequest,
      matchedKeyword: imageKeywords.find(k => lowerPrompt.includes(k))
    });
    
    return isImageRequest;
  };

  // Main send message function
  const sendMessage = async (question: string): Promise<{ type: 'text' | 'image', content: string }> => {
    setIsLoading(true);
    
    try {
      console.log(' Received question:', question);
      
      // Check if this is an image generation request
      if (isImageGenerationRequest(question)) {
        console.log(' Routing to image generation with provider:', imageProvider);
        const imageUrl = await generateImage(question);
        console.log(' Image generated:', imageUrl.substring(0, 50) + '...');
        return { type: 'image', content: imageUrl };
      }

      console.log(' Routing to text model:', provider);
      let responseText = '';

      switch (provider) {
        case 'gemini':
          responseText = await callGemini(question);
          break;
        case 'openai':
          responseText = await callOpenAI(question);
          break;
        case 'claude':
          responseText = await callClaude(question);
          break;
        case 'nvidia':
          responseText = await callNvidia(question);
          break;
        case 'meta':
          responseText = await callMeta(question);
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      return { type: 'text', content: responseText };
    } catch (error: any) {
      console.error(`Error calling ${provider} API:`, error);
      
      // Handle different error types
      let errorMessage = 'Sorry, there was an error processing your request.';
      
      if (error?.status === 429 || error?.error?.error?.code === 'rate_limit_exceeded') {
        errorMessage = ' Rate limit exceeded. You have exceeded your API quota or requests per minute.';
      } else if (error?.status === 401 || error?.error?.error?.code === 'invalid_api_key') {
        errorMessage = ' Invalid API key. Please check your API key configuration.';
      } else if (error?.status === 403) {
        errorMessage = ' Access forbidden. Please verify your API key has the necessary permissions.';
      } else if (error?.status === 500 || error?.status === 503) {
        errorMessage = ` ${provider} service is temporarily unavailable. Please try again in a moment.`;
      } else if (error?.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Start voice recording with silence detection
  const startVoiceRecording = async (onTranscriptionComplete?: (text: string) => void): Promise<void> => {
    try {
      console.log('🎤 Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone access granted');
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: Blob[] = [];
      
      // Audio context for silence detection
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let lastSoundTime = Date.now();
      const SILENCE_THRESHOLD = 30; // Adjust sensitivity (lower = more sensitive)
      const SILENCE_DURATION = 2000; // 2 seconds of silence
      let animationId: number;
      
      // Collect audio data
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          console.log('📊 Audio chunk received, size:', e.data.size);
          chunks.push(e.data);
        }
      };
      
      // Start recording with timeslice (collect data every 100ms)
      recorder.start(100);
      setMediaRecorder(recorder);
      setIsRecording(true);
      console.log('🎤 Recording started with silence detection');
      console.log('🔊 Speak now...');
      
      // Check for silence periodically
      const checkSilence = () => {
        if (recorder.state === 'recording') {
          analyser.getByteFrequencyData(dataArray);
          
          // Calculate average volume
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          
          // Log audio level for debugging
          if (average > 5) {
            console.log('🔊 Audio level:', Math.round(average));
          }
          
          if (average > SILENCE_THRESHOLD) {
            // Sound detected, reset timer
            lastSoundTime = Date.now();
            console.log('🗣️ Voice detected!');
          } else {
            // Check if silence duration exceeded
            const silenceDuration = Date.now() - lastSoundTime;
            if (silenceDuration > SILENCE_DURATION && chunks.length > 0) {
              console.log('🔇 Silence detected for 2 seconds, stopping...');
              console.log('📦 Total chunks collected:', chunks.length);
              cancelAnimationFrame(animationId);
              stopAndTranscribe(recorder, chunks, stream, audioContext, onTranscriptionComplete);
              return;
            }
          }
          
          // Continue checking
          animationId = requestAnimationFrame(checkSilence);
        }
      };
      
      // Start silence detection
      animationId = requestAnimationFrame(checkSilence);
      
    } catch (error) {
      console.error(' Error starting recording:', error);
      setIsRecording(false);
      throw new Error('Failed to start recording. Please check microphone permissions.');
    }
  };
  
  // Helper function to stop recording and transcribe
  const stopAndTranscribe = async (
    recorder: MediaRecorder, 
    chunks: Blob[], 
    stream: MediaStream,
    audioContext: AudioContext,
    onComplete?: (text: string) => void
  ) => {
    if (recorder.state === 'inactive') return;
    
    recorder.onstop = async () => {
      try {
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
        
        if (chunks.length === 0) {
          console.log('No audio data recorded');
          setIsRecording(false);
          return;
        }
        
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        console.log(' Recording stopped, blob size:', audioBlob.size);
        console.log(' Transcribing with Gemini...');
        
        // Convert audio to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          try {
            const base64Audio = reader.result as string;
            const base64Data = base64Audio.split(',')[1];
            
            // Use Gemini for transcription
            const genAI = new GoogleGenerativeAI(AI_CONFIG.audio.gemini.apiKey);
            const model = genAI.getGenerativeModel({ model: AI_CONFIG.audio.gemini.model }); // Using TTS model
            
            const result = await model.generateContent([
              {
                inlineData: {
                  data: base64Data,
                  mimeType: 'audio/webm'
                }
              },
              'Transcribe this audio to text. Only return the transcribed text, nothing else.'
            ]);
            
            const transcription = result.response.text().trim();
            console.log(' Transcription:', transcription);
            setIsRecording(false);
            
            // Call the callback with transcription
            if (onComplete) {
              onComplete(transcription);
            }
          } catch (error) {
            console.error('Transcription error:', error);
            setIsRecording(false);
          }
        };
      } catch (error) {
        console.error('Stop recording error:', error);
        setIsRecording(false);
      }
    };
    
    recorder.stop();
  };

  // Manual stop for voice recording
  const stopVoiceRecording = async (): Promise<void> => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      console.log(' Manually stopping recording...');
      
      // Get stream and stop tracks
      const stream = mediaRecorder.stream;
      
      // Stop the recorder
      mediaRecorder.stop();
      
      // Stop all media tracks
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      setIsRecording(false);
      setMediaRecorder(null);
      console.log(' Recording stopped manually');
    }
  };

  // Text to Speech using Gemini 2.5 Flash TTS
  const textToSpeech = async (text: string): Promise<void> => {
    if (!text || !text.trim()) {
      console.warn('⚠️ No text provided for TTS');
      return;
    }

    try {
      console.log('🔊 Generating speech with Gemini TTS model...');
      console.log('📝 Text to convert:', text);
      
      const genAI = new GoogleGenerativeAI(AI_CONFIG.audio.gemini.apiKey);
      const model = genAI.getGenerativeModel({ 
        model: AI_CONFIG.audio.gemini.ttsModel,
      });
      
      // Request content with speech modalities
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'], // Request audio output
        },
      });
      
      const response = await result.response;
      console.log('📦 Gemini TTS response:', response);
      
      // Try to extract audio from response
      let audioPlayed = false;
      
      // Check if response has audio parts
      if (response.candidates && response.candidates[0]?.content?.parts) {
        console.log('🔍 Checking response parts for audio...');
        for (const part of response.candidates[0].content.parts) {
          console.log('📄 Part:', part);
          
          // Check for inline audio data
          if (part.inlineData && part.inlineData.mimeType?.includes('audio')) {
            console.log('✅ Audio data found! Playing...');
            
            // Create audio element and play
            const audio = new Audio(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
            audio.onplay = () => console.log('🎵 Audio playback started');
            audio.onended = () => console.log('✅ Audio playback completed');
            audio.onerror = (e) => console.error('❌ Audio playback error:', e);
            await audio.play();
            audioPlayed = true;
            break;
          }
        }
      }
      
      // Fallback to browser's built-in speech synthesis if no audio returned
      if (!audioPlayed) {
        console.log('⚠️ No audio in Gemini response, using browser TTS fallback');
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          window.speechSynthesis.speak(utterance);
          console.log('✅ Playing speech with browser TTS');
        }
      }
    } catch (error: any) {
      console.error('❌ TTS error:', error);
      console.error('Error details:', error?.message || JSON.stringify(error, null, 2));
      
      // Fallback to browser TTS on error
      if ('speechSynthesis' in window) {
        console.log('🔄 Using browser TTS as fallback due to error');
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const changeProvider = (newProvider: AIProviderType) => {
    setProvider(newProvider);
    console.log('AI Provider changed to:', newProvider);
  };

  const changeImageProvider = (newProvider: ImageProviderType) => {
    setImageProvider(newProvider);
    console.log('Image Provider changed to:', newProvider);
  };

  return {
    provider,
    imageProvider,
    changeProvider,
    changeImageProvider,
    sendMessage,
    isLoading,
    isRecording,
    startVoiceRecording,
    stopVoiceRecording,
    textToSpeech,
  };
};
