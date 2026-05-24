import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

// Initialize if API key exists, otherwise use mock responses in development
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateArticleDraft(topic: string): Promise<string> {
  if (!genAI) {
    console.warn('GEMINI_API_KEY is not defined. Returning a premium mock article draft.');
    return `# The Quiet Art of Intentional Expression

In an era defined by persistent noise and immediate reaction, the practice of writing demands a return to quiet spaces. Verbum invites you to slow down, to strip away the clutter, and to rediscover the deep weight of words on a page.

When we reduce our focus to the essentials, we reveal a blank canvas where thought can expand naturally. The warm white environment, soft beige textures, and minimal typographic styling are not simple stylistic choices; they are a sanctuary. They allow ideas to be built with intention, ensuring that every sentence we craft resonates with truth.

### Creating Space for Resonance
A beautiful composition is not built by what we add, but by what we choose to omit. By dedicating generous whitespace, we grant text its proper power. A single word placed deliberately carries a strength that a crowded screen can never reproduce.

True writers understand that the reader's mind needs room to wander and absorb. In cultivating this editorial luxury, we foster authentic connection. We transition from mere information sharing to true communication, where every story finds its space and every voice is heard in the quiet.`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const promptText = `You are a premium, literary writing assistant for Verbum, a minimal writing platform inspired by Kinfolk and Aesop. 
Write a complete, beautifully composed article draft about: "${topic}".
Structure the article with:
1. An elegant, serif-worthy title starting with # (e.g. # Title Here)
2. Generous, airy paragraphs with a calm, intellectual, and literary tone.
3. Natural sub-sections using standard Markdown (e.g. ### Subtitle) but avoiding dry headers like "Introduction" or "Conclusion". Make them feel like a premium printed editorial.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      },
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API generation error:', error);
    throw new Error('Failed to generate article using Gemini AI. Please check your API key.');
  }
}

export async function refineArticleContent(content: string, instruction: string): Promise<string> {
  if (!genAI) {
    console.warn('GEMINI_API_KEY is not defined. Returning mock refined content.');
    return `${content}\n\n[AI Refinement (Mock: "${instruction}")]:\nThis section has been refined to emphasize mindful language and calm luxury, focusing on a more polished literary structure.`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const promptText = `You are an expert editorial editor for Verbum, a premium writing platform.
Please refine the following text content according to this instruction: "${instruction}".

Content to refine:
"${content}"

Ensure the output is written in the platform's signature elegant, literary, and minimal tone. 
Return ONLY the final refined text. Do not include any introductions, quotes, explanations, or meta-commentary.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 1200,
      },
    });

    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Gemini API refinement error:', error);
    throw new Error('Failed to refine content using Gemini AI.');
  }
}
