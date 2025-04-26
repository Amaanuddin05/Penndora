import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GeminiResponse {
  reply: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiAssistantService {
  private apiUrl = environment.geminiApiUrl;

  constructor(private http: HttpClient) {
    // console.log('Using API URL:', this.apiUrl);
  }

 
  generateContent(prompt: string): Observable<GeminiResponse> {
    console.log('Sending request to Gemini API:', { prompt, url: this.apiUrl });
    return this.http.post<GeminiResponse>(this.apiUrl, { prompt })
      .pipe(
        tap(response => console.log('Received response from Gemini API:', response)),
        catchError(error => {
          console.error('Error from Gemini API:', error);
          return throwError(() => new Error('Failed to get response from AI. Please try again later.'));
        })
      );
  }

 
  generateTitleSuggestions(content: string): Observable<GeminiResponse> {
    const prompt = `Generate 5 short, engaging title suggestions for a blog post about the following content. Only include the titles, with no descriptions or explanations: "${content.substring(0, 500)}..."`;
    return this.generateContent(prompt);
  }


  generateContentIdeas(topic: string): Observable<GeminiResponse> {
    const prompt = `Generate 5 engaging content ideas related to: "${topic}". 
Format each idea as a numbered list with a bold title followed by bullet points that outline the flow of content.

For example:
1. **Clear and Engaging Title:** 
• First main point to explore in the article
• Second key area to cover, including specific examples
• How to implement or what readers should take away
• Concluding thoughts on this topic

IMPORTANT: Be sure to use the bullet point character "•" for each point, followed by a space, then the content. 
Each bullet point should help guide the writing process by suggesting a specific aspect to cover.
Make each idea specific and actionable with a clear angle, not generic.`;
    return this.generateContent(prompt);
  }


  checkGrammarAndStyle(content: string): Observable<GeminiResponse> {
    const prompt = `Analyze the following text for grammar improvements only. Provide your response in the following structured format:

GRAMMAR_ISSUES: List all grammar or spelling issues found, with clear explanations,you can ignore if the grammar issues are minor.
- Issue 1: [original text] → [corrected text] - [brief explanation]
- Issue 2: [original text] → [corrected text] - [brief explanation]
...

IMPROVED_VERSION: Provide a fully corrected version of the text with all grammar fixes applied.

Text to analyze: "${content.substring(0, 1000)}..."`;
    return this.generateContent(prompt);
  }

 
  completeSentence(content: string): Observable<GeminiResponse> {
    const prompt = `Continue writing the following text with 2-3 additional sentences that naturally flow from it: "${content.substring(0, 500)}..."`;
    return this.generateContent(prompt);
  }

  chatWithAssistant(message: string): Observable<GeminiResponse> {
    const prompt = `You are a helpful writing assistant. Please respond to the following question or request about writing, content creation, or blogging: "${message}"

Provide a helpful response that directly addresses the query. If appropriate, include practical tips or suggestions.

Format your response using:
- Use **bold** for headings or important points
- Use * for bullet points when listing items
- Keep paragraphs concise
- Use clear structure with headings when appropriate`;
    return this.generateContent(prompt);
  }


  summarizeContent(content: string): Observable<GeminiResponse> {
    const prompt = `Create a concise summary (3-5 sentences) of the following content, capturing the main points and key takeaways while maintaining the original tone: "${content.substring(0, 1000)}..."`;
    return this.generateContent(prompt);
  }
} 