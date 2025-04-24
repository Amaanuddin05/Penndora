import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Editor } from 'ngx-editor';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { serverTimestamp } from '@angular/fire/firestore'; // ✅ Use the modular serverTimestamp
import { AiAssistantService } from '../services/ai-assistant.service';

// Interface for content idea structure
interface ContentIdea {
  title: string;
  description: string;
  fullText: string;
}

// Interface for grammar and style analysis
interface GrammarStyleAnalysis {
  grammarIssues: {
    original: string;
    corrected: string;
    explanation: string;
  }[];
  improvedVersion: string;
}

// Interface for chat messages
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit, OnDestroy {
  title: string = '';
  content: string = '';
  html = '';
  
  // AI assistant state
  showAiAssistant: boolean = false;
  assistantType: string = '';
  assistantPrompt: string = '';
  assistantResponse: string = '';
  isLoading: boolean = false;
  
  // Chat messages
  chatMessages: ChatMessage[] = [];
  chatInput: string = '';
  
  // Floating chat
  showFloatingChat: boolean = false;

  @Output('postCreated') postCreated = new EventEmitter();

  editor!: Editor;

  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth, // ✅ Inject AngularFireAuth
    private aiAssistantService: AiAssistantService
  ) {}

  ngOnInit(): void {
    this.editor = new Editor();
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  createPost() {
    console.log('Title:', this.title);
    console.log('Content:', this.html);

    if (!this.title || !this.html) {
      console.error('Content or Title is not defined or invalid.');
      return;
    }

    this.afAuth.currentUser.then(user => {
      if (!user) {
        console.error('User not authenticated.');
        return;
      }

      const post = {
        title: this.title,
        content: this.html,
        owner: user.uid, // ✅ Safe UID access
        created: serverTimestamp() // ✅ Correct timestamp usage
      };

      this.firestore.collection('posts').add(post)
        .then(() => {
          console.log('Post created successfully!');
          this.postCreated.emit();
        })
        .catch(error => {
          console.error('Error creating post:', error);
        });
    });
  }

  // AI Assistant methods
  toggleAiAssistant() {
    this.showAiAssistant = !this.showAiAssistant;
    
    // Close floating chat if AI Assistant panel is opened
    if (this.showAiAssistant && this.showFloatingChat) {
      this.showFloatingChat = false;
    }
    
    if (!this.showAiAssistant) {
      this.resetAssistant();
    }
  }

  selectAssistantFeature(feature: string) {
    this.assistantType = feature;
    this.assistantPrompt = '';
    this.assistantResponse = '';
    
    // Initialize chat if selected
    if (feature === 'chat' && this.chatMessages.length === 0) {
      this.chatMessages = [{
        role: 'assistant',
        content: 'Hi! I\'m your writing assistant. How can I help you today?',
        timestamp: new Date()
      }];
    }
  }

  generateTitleSuggestions() {
    if (!this.html || this.html.length < 50) {
      this.assistantResponse = 'Please add more content to your post before generating title suggestions.';
      return;
    }

    this.isLoading = true;
    this.aiAssistantService.generateTitleSuggestions(this.html)
      .subscribe({
        next: (response) => {
          this.assistantResponse = response.reply;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error generating title suggestions:', error);
          this.assistantResponse = 'Sorry, an error occurred while generating title suggestions.';
          this.isLoading = false;
        }
      });
  }

  generateContentIdeas() {
    if (!this.assistantPrompt) {
      this.assistantResponse = 'Please enter a topic to generate content ideas.';
      return;
    }

    this.isLoading = true;
    this.aiAssistantService.generateContentIdeas(this.assistantPrompt)
      .subscribe({
        next: (response) => {
          this.assistantResponse = response.reply;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error generating content ideas:', error);
          this.assistantResponse = 'Sorry, an error occurred while generating content ideas.';
          this.isLoading = false;
        }
      });
  }

  checkGrammarAndStyle() {
    if (!this.html || this.html.length < 50) {
      this.assistantResponse = 'Please add more content to your post before checking grammar and style.';
      return;
    }

    this.isLoading = true;
    this.aiAssistantService.checkGrammarAndStyle(this.html)
      .subscribe({
        next: (response) => {
          this.assistantResponse = response.reply;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error checking grammar and style:', error);
          this.assistantResponse = 'Sorry, an error occurred while checking grammar and style.';
          this.isLoading = false;
        }
      });
  }

  completeSentence() {
    if (!this.html) {
      this.assistantResponse = 'Please start writing your post before using sentence completion.';
      return;
    }

    this.isLoading = true;
    this.aiAssistantService.completeSentence(this.html)
      .subscribe({
        next: (response) => {
          this.assistantResponse = response.reply;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error completing sentences:', error);
          this.assistantResponse = 'Sorry, an error occurred while completing sentences.';
          this.isLoading = false;
        }
      });
  }

  /**
   * Parse title suggestions from the AI response text
   * Handles different formats including numbered lists and markdown
   */
  parseTitleSuggestions(response: string): string[] {
    if (!response) return [];
    
    console.log('Parsing title suggestions from:', response);
    
    // Split by newline and filter out empty lines
    const lines = response.split('\n').filter(line => line.trim().length > 0);
    
    // Extract titles, removing numbering, asterisks, and other markdown
    const titles = lines.map(line => {
      // Remove numbers at the beginning (e.g., "1. ", "2. ")
      let title = line.replace(/^\d+[\.\)]\s*/, '');
      
      // Remove markdown bold markers (e.g., "**Title**")
      title = title.replace(/\*\*/g, '');
      
      // Remove other markdown or formatting
      title = title.replace(/^[#-\s]+/, '');
      
      return title.trim();
    }).filter(title => title.length > 0);
    
    console.log('Parsed titles:', titles);
    return titles;
  }

  /**
   * Parse content ideas from the AI response
   * Extracts title and description from each idea
   */
  parseContentIdeas(response: string): ContentIdea[] {
    if (!response) return [];
    
    console.log('Parsing content ideas from:', response);
    
    // First, split the content into individual idea blocks
    // This assumes each idea starts with a number followed by a period or parenthesis
    const ideaRegex = /\d+[\.\)]\s+(.+?)((?=\d+[\.\)])|$)/gs;
    let matches;
    const ideas: ContentIdea[] = [];
    
    // Extract each idea block
    let match;
    while ((match = ideaRegex.exec(response + "\n1.")) !== null) {
      if (match[1]) {
        const fullText = match[1].trim();
        
        // Try to extract a title from the first part (often bolded or before a colon)
        let title = '';
        let description = fullText;
        
        // Check for bold markdown titles
        const boldTitleMatch = fullText.match(/\*\*(.+?)\*\*:?/);
        if (boldTitleMatch) {
          title = boldTitleMatch[1];
          
          // Replace the title part to get the description
          description = fullText.replace(boldTitleMatch[0], '').trim();
          
          // Make sure description starts with the first bullet point
          if (description.indexOf('•') > 0) {
            description = description.substring(description.indexOf('•')).trim();
          }
        } 
        // Check for titles with colons
        else {
          const colonMatch = fullText.match(/^(.+?):/);
          if (colonMatch) {
            title = colonMatch[1];
            
            // Replace the title part to get the description
            description = fullText.replace(colonMatch[0], '').trim();
            
            // Make sure description starts with the first bullet point
            if (description.indexOf('•') > 0) {
              description = description.substring(description.indexOf('•')).trim();
            }
          } else {
            // If no clear title format, use the first sentence or part of it
            const firstSentence = fullText.split(/\.\s|:/)[0];
            title = firstSentence.length > 60 
              ? firstSentence.substring(0, 57) + '...'
              : firstSentence;
              
            // Try to find bullet points in the rest
            const bulletPointIndex = fullText.indexOf('•');
            if (bulletPointIndex > 0) {
              description = fullText.substring(bulletPointIndex).trim();
            } else {
              description = fullText.substring(title.length).trim();
              if (description.startsWith(':')) {
                description = description.substring(1).trim();
              }
            }
          }
        }
        
        // Replace any non-bullet point markers with actual bullet points
        description = description.replace(/[-*]\s+/g, '• ');
        
        // Clean up the title and description
        const cleanTitle = title.replace(/\*\*/g, '').trim();
        const cleanDescription = description.replace(/\*\*/g, '').trim();
        
        console.log('Parsed idea:', { title: cleanTitle, description: cleanDescription });
        
        ideas.push({
          title: cleanTitle,
          description: cleanDescription,
          fullText
        });
      }
    }
    
    console.log('Parsed content ideas:', ideas);
    return ideas;
  }

  // Method to use a content idea as the post outline/content and set the title
  applyContentIdea(idea: ContentIdea) {
    // Set the title
    this.title = idea.title;
    
    // Split the description into bullet points if they exist
    const bulletPoints = idea.description.split('•').filter(point => point.trim().length > 0);
    
    let formattedContent = '';
    
    // Check if we have bullet points
    if (bulletPoints.length > 0) {
      formattedContent = '<ul>\n';
      bulletPoints.forEach(point => {
        formattedContent += `<li>${point.trim()}</li>\n`;
      });
      formattedContent += '</ul>';
    } else {
      // If no bullet points, just use the description as paragraph
      formattedContent = `<p>${idea.description}</p>`;
    }
    
    console.log('Applying content idea with formatted content:', formattedContent);
    
    // Set content directly (replace instead of append)
    this.html = formattedContent;
    
    // Force update of editor content
    setTimeout(() => {
      // This timeout allows Angular to process the model change
      const event = new Event('input', { bubbles: true });
      document.querySelector('ngx-editor')?.dispatchEvent(event);
    }, 100);
  }

  applyTitleSuggestion(title: string) {
    // Clean title is now handled in parseTitleSuggestions
    this.title = title;
  }

  applyCompletion(completion: string) {
    this.html += ' ' + completion;
  }

  resetAssistant() {
    this.assistantType = '';
    this.assistantPrompt = '';
    this.assistantResponse = '';
    // Don't clear chat messages to maintain conversation history
  }

  /**
   * Parse grammar and style analysis from AI response
   */
  parseGrammarAndStyle(response: string): GrammarStyleAnalysis {
    console.log('Parsing grammar analysis from:', response);
    
    const analysis: GrammarStyleAnalysis = {
      grammarIssues: [],
      improvedVersion: ''
    };
    
    // Extract grammar issues
    const grammarIssuesMatch = response.match(/GRAMMAR_ISSUES:(.*?)(?=IMPROVED_VERSION:|$)/s);
    if (grammarIssuesMatch && grammarIssuesMatch[1]) {
      const issuesText = grammarIssuesMatch[1].trim();
      const issueLines = issuesText.split('\n').filter(line => line.trim().startsWith('-'));
      
      issueLines.forEach(line => {
        const cleanLine = line.replace(/^-\s*/, '');
        const parts = cleanLine.split('→');
        
        if (parts.length >= 2) {
          const original = parts[0].trim();
          const explanationParts = parts[1].split('-');
          let corrected = '';
          let explanation = '';
          
          if (explanationParts.length >= 2) {
            corrected = explanationParts[0].trim();
            explanation = explanationParts[1].trim();
          } else {
            corrected = parts[1].trim();
            explanation = parts.length > 2 ? parts[2].trim() : '';
          }
          
          analysis.grammarIssues.push({
            original,
            corrected,
            explanation
          });
        }
      });
    }
    
    // Extract improved version
    const improvedVersionMatch = response.match(/IMPROVED_VERSION:(.*?)$/s);
    if (improvedVersionMatch && improvedVersionMatch[1]) {
      analysis.improvedVersion = improvedVersionMatch[1].trim();
    }
    
    console.log('Parsed grammar analysis:', analysis);
    return analysis;
  }

  /**
   * Apply a grammar fix to the content
   */
  applyGrammarFix(issue: { original: string; corrected: string }) {
    if (!this.html) return;
    console.log('Applying grammar fix:', issue);
    
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.html;
    const textContent = tempDiv.textContent || '';
    
    // Replace the original text with the corrected text
    if (textContent.includes(issue.original)) {
      this.html = this.html.replace(issue.original, issue.corrected);
      console.log('Grammar fix applied');
    }
  }

  /**
   * Apply a style suggestion to the content
   */
  applyStyleSuggestion(suggestion: { original: string; improved: string }) {
    if (!this.html) return;
    console.log('Applying style suggestion:', suggestion);
    
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.html;
    const textContent = tempDiv.textContent || '';
    
    // Replace the original text with the improved text
    if (textContent.includes(suggestion.original)) {
      this.html = this.html.replace(suggestion.original, suggestion.improved);
      console.log('Style suggestion applied');
    }
  }

  /**
   * Apply the fully improved version to the content
   */
  applyImprovedVersion(improvedVersion: string) {
    if (!improvedVersion) return;
    console.log('Applying improved version');
    
    // Set the entire content to the improved version
    this.html = `<p>${improvedVersion}</p>`;
  }

  /**
   * Apply tone to the content
   */
  applyTone(tone: string) {
    if (!this.html || !tone) return;
    console.log('Applying tone:', tone);
    
    this.isLoading = true;
    const prompt = `Rewrite the following text in a ${tone} tone, maintaining the same meaning and information: "${this.html}"`;
    
    this.aiAssistantService.generateContent(prompt)
      .subscribe({
        next: (response) => {
          const rewrittenContent = response.reply;
          this.html = `<p>${rewrittenContent}</p>`;
          this.isLoading = false;
          console.log('Tone applied');
        },
        error: (error) => {
          console.error('Error applying tone:', error);
          this.isLoading = false;
        }
      });
  }

  /**
   * Send a chat message to the AI assistant
   */
  sendChatMessage() {
    if (!this.chatInput.trim()) return;
    
    // Add user message to chat
    this.chatMessages.push({
      role: 'user',
      content: this.chatInput,
      timestamp: new Date()
    });
    
    // Ensure chat is set as the active type if not already
    if (this.assistantType !== 'chat') {
      this.assistantType = 'chat';
    }
    
    // Scroll to bottom after adding user message
    setTimeout(() => this.scrollChatToBottom(), 100);
    
    const userMessage = this.chatInput;
    this.chatInput = '';
    this.isLoading = true;
    
    // Send message to AI
    this.aiAssistantService.chatWithAssistant(userMessage)
      .subscribe({
        next: (response) => {
          // Format the response text with proper HTML
          const formattedResponse = this.formatChatResponse(response.reply);
          
          // Add AI response to chat
          this.chatMessages.push({
            role: 'assistant',
            content: formattedResponse,
            timestamp: new Date()
          });
          this.isLoading = false;
          
          // Scroll to bottom after receiving response
          setTimeout(() => this.scrollChatToBottom(), 100);
        },
        error: (error) => {
          console.error('Error in chat:', error);
          // Add error message to chat
          this.chatMessages.push({
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
            timestamp: new Date()
          });
          this.isLoading = false;
          
          // Scroll to bottom after error message
          setTimeout(() => this.scrollChatToBottom(), 100);
        }
      });
  }

  /**
   * Scroll the chat container to the bottom
   */
  scrollChatToBottom() {
    try {
      const chatContainer = document.querySelector('.chat-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling chat to bottom:', err);
    }
  }

  /**
   * Format chat response text with proper HTML formatting
   */
  formatChatResponse(text: string): string {
    if (!text) return '';
    
    // Replace all asterisk bullet points with HTML list items
    let formatted = text;
    
    // Check if the text contains bullet points (asterisks)
    if (text.includes('* ')) {
      // Convert bullet point lists to HTML lists
      const parts = text.split('\n');
      const formattedParts: string[] = [];
      let inList = false;
      
      parts.forEach(part => {
        const trimmed = part.trim();
        
        if (trimmed.startsWith('* ')) {
          if (!inList) {
            formattedParts.push('<ul>');
            inList = true;
          }
          // Extract the content after the bullet point
          const content = trimmed.substring(2);
          formattedParts.push(`<li>${content}</li>`);
        } else {
          if (inList) {
            formattedParts.push('</ul>');
            inList = false;
          }
          formattedParts.push(part);
        }
      });
      
      // Close any open list
      if (inList) {
        formattedParts.push('</ul>');
      }
      
      formatted = formattedParts.join('\n');
    }
    
    // Format bold text (text between ** markers)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Format italics (text between * markers, but not within a **bold** section)
    // This regex is more complex to avoid matching inside already processed bold tags
    formatted = formatted.replace(/(?<!\*)\*(?!\*)([^\*]+)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    
    // Replace newlines with <br> tags
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  }

  // Toggle floating chat
  toggleFloatingChat() {
    this.showFloatingChat = !this.showFloatingChat;
    
    // Initialize chat if it's not already
    if (this.showFloatingChat && this.chatMessages.length === 0) {
      this.chatMessages = [{
        role: 'assistant',
        content: 'Hi! I\'m your writing assistant. How can I help you today?',
        timestamp: new Date()
      }];
    }
    
    // Initialize chat as the active feature when opening floating chat
    if (this.showFloatingChat) {
      this.assistantType = 'chat';
    }
    
    // Scroll to bottom when opening chat
    if (this.showFloatingChat) {
      setTimeout(() => this.scrollChatToBottom(), 100);
    }
  }
}
