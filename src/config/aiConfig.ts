export const AI_CONFIG = {
  gemini: {
    apiKey:
      import.meta.env.VITE_GEMINI_API_KEY 
    // model: 'gemini-2.0-flash' || 'gemini-2.5-flash' ||'gemini-2.5-flash-preview-09-2025'||'gemini-flash-latest'||'gemini-2.5-pro' ||'gemini-2.5-flash-lite'||'gemini-2.5-flash-lite-preview-09-2025' ||'gemini-2.0-flash-lite' (these all are available models to use for free )
    model: "gemini-2.0-flash",
  },
  openai: {
    apiKey:
      import.meta.env.VITE_OPENAI_API_KEY
  },
  claude: {
    apiKey: import.meta.env.VITE_CLAUDE_API_KEY || "YOUR_ANTHROPIC_API_KEY",
    model: "claude-3-5-sonnet-20241022",
    baseURL: "https://api.anthropic.com/v1",
    temperature: 0.7,
    maxTokens: 1024,
  },
  nvidia: {
    apiKey:
      import.meta.env.VITE_NVIDIA_API_KEY
    model: "nvidia/llama-3.1-nemotron-70b-instruct",
    baseURL: "https://integrate.api.nvidia.com/v1",
    temperature: 0.5,
    maxTokens: 1024,
  },
  meta: {
    apiKey: import.meta.env.VITE_META_API_KEY || "YOUR_META_API_KEY",
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    baseURL: "https://api.together.xyz/v1",
    temperature: 0.7,
    maxTokens: 1024,
  },
  // Image Generation
  imageGeneration: {
    provider: "gemini",
    gemini: {
      apiKey:
        import.meta.env.VITE_GEMINI_API_KEY ||
        "AIzaSyBI0bRLT4wUFFBXJIBwTF7eDfcIC57roik",
      model: "gemini-2.5-flash-image",
      // model: 'gemini-2.0-flash-preview-image-generation',
    },
  },
  // Audio/Voice (TTS & STT)
  audio: {
    provider: "gemini",
    gemini: {
      apiKey:
        import.meta.env.VITE_GEMINI_API_KEY
      // model: 'gemini-2.5-flash'||'gemini-2.5-pro' ||'gemini-2.5-flash-lite' ||'gemini-2.5-flash-lite-preview-09-2025' || 'gemini-2.0-flash' ||'gemini-2.0-flash-lite' ||'gemini-2.5-flash-preview-09-2025' (these all are available models to use for free )
      model: "gemini-flash-latest",
      ttsModel: "gemini-2.5-flash-preview-tts", // For text-to-speech
    },
  },
  // Image Editing (Hugging Face)
  imageEdit: {
    huggingface: {
      apiKey: import.meta.env.VITE_HUGGINGFACE_API_KEY || '', // Add your HF token
      model: 'Phr00t/Qwen-Image-Edit-Rapid-AIO',
      endpoint: 'https://api-inference.huggingface.co/models/Phr00t/Qwen-Image-Edit-Rapid-AIO',
    },
  },
};

export type AIProviderConfig = typeof AI_CONFIG;
// gemini-2.5-flash-preview-tts  this model converts the text to audio
// gemini-2.0-flash-exp
