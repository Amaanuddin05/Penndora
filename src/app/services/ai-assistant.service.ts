import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface GeminiResponse {
  reply: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiAssistantService {
  private apiUrl = 'http://localhost:5000/api/gemini';

  constructor(private http: HttpClient) { }

  /**
   * Sends a prompt to the Gemini API and returns the response
   */
  generateContent(prompt: string): Observable<GeminiResponse> {
    console.log('Sending request to Gemini API:', { prompt });
    return this.http.post<GeminiResponse>(this.apiUrl, { prompt })
      .pipe(
        tap(response => console.log('Received response from Gemini API:', response))
      );
  }

  /**
   * Generates title suggestions based on content
   */
  generateTitleSuggestions(content: string): Observable<GeminiResponse> {
    const prompt = `Generate 5 short, engaging title suggestions for a blog post about the following content. Only include the titles, with no descriptions or explanations: "${content.substring(0, 500)}..."`;
    return this.generateContent(prompt);
  }

  /**
   * Generates content ideas related to a topic
   */
  generateContentIdeas(topic: string): Observable<GeminiResponse> {
    const prompt = `Generate 5 engaging content ideas related to: "${topic}". 
Format each idea as a numbered list with a bold title followed by a brief description of the idea. 
For example:
1. **Title of the Idea:** Brief description explaining what the content would cover and why it would be interesting to readers.

Make each idea specific and actionable with a clear angle, not generic.`;
    return this.generateContent(prompt);
  }

  /**
   * Checks grammar and style in the provided content
   */
  checkGrammarAndStyle(content: string): Observable<GeminiResponse> {
    const prompt = `Analyze the following text for grammar and style improvements. Provide specific suggestions: "${content.substring(0, 1000)}..."`;
    return this.generateContent(prompt);
  }

  /**
   * Completes sentences or paragraphs based on provided content
   */
  completeSentence(content: string): Observable<GeminiResponse> {
    const prompt = `Continue writing the following text with 2-3 additional sentences that naturally flow from it: "${content.substring(0, 500)}..."`;
    return this.generateContent(prompt);
  }
} 