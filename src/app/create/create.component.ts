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
    if (!this.showAiAssistant) {
      this.resetAssistant();
    }
  }

  selectAssistantFeature(feature: string) {
    this.assistantType = feature;
    this.assistantPrompt = '';
    this.assistantResponse = '';
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
          description = fullText.replace(boldTitleMatch[0], '').trim();
        } 
        // Check for titles with colons
        else {
          const colonMatch = fullText.match(/^(.+?):/);
          if (colonMatch) {
            title = colonMatch[1];
            description = fullText.replace(colonMatch[0], '').trim();
          } else {
            // If no clear title format, use the first sentence or part of it
            const firstSentence = fullText.split(/\.\s|:/)[0];
            title = firstSentence.length > 60 
              ? firstSentence.substring(0, 57) + '...'
              : firstSentence;
            description = fullText.substring(title.length).trim();
            if (description.startsWith(':')) {
              description = description.substring(1).trim();
            }
          }
        }
        
        ideas.push({
          title: title.replace(/\*\*/g, '').trim(),
          description: description.replace(/\*\*/g, '').trim(),
          fullText
        });
      }
    }
    
    console.log('Parsed content ideas:', ideas);
    return ideas;
  }

  // Method to use a content idea's title as the post title
  applyContentTitle(contentTitle: string) {
    this.title = contentTitle;
  }

  // Method to use a content idea as the post outline/content
  applyContentIdea(content: string) {
    // Format the content idea as an HTML outline
    const formattedContent = `<h2>${this.title || 'Outline'}</h2>
<p>${content}</p>`;
    
    // If the editor is empty, set the content directly
    if (!this.html.trim()) {
      this.html = formattedContent;
    } else {
      // Otherwise append it
      this.html += `<br>${formattedContent}`;
    }
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
  }
}
