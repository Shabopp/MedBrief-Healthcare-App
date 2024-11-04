// src/api/geminiReviewModel.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.REACT_APP_GEMINI_REVIEW_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const reviewModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

const reviewGenerationConfig = {
  temperature: 0.8,
  topP: 0.9,
  topK: 50,
  maxOutputTokens: 4096,
  responseMimeType: 'application/json',
};

export const reviewTranscriptionWithGemini = async (transcriptionText) => {
  try {
    const result = await reviewModel.generateContent({
      contents: [{ role: 'user', text: `input: ${transcriptionText}` }],
      generationConfig: reviewGenerationConfig,
    });

    return result.response.text();
  } catch (error) {
    console.error('Gemini AI transcription review error:', error);
    throw error;
  }
};
