import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiSupportService } from '../../services/ai-support-service';
import { AiChatMessage } from '../../models/ai-support-model';

@Component({
  selector: 'app-ai-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-support.html'
})
export class AiSupport {
  private aiService = inject(AiSupportService);

  isOpen = signal(false);
  messages = signal<AiChatMessage[]>([]);
  input = '';
  loading = signal(false);

  toggle(): void {
    this.isOpen.update(v => !v);
    if (this.isOpen() && this.messages().length === 0) {
      this.messages.set([{
        role: 'assistant',
        content: 'مرحباً! أنا مساعد صلّحلي. كيف يمكنني مساعدتك في طلباتك أو العروض؟'
      }]);
    }
  }

  send(): void {
    const text = this.input.trim();
    if (!text || this.loading()) return;

    this.messages.update(m => [...m, { role: 'user', content: text }]);
    this.input = '';
    this.loading.set(true);

    const history = this.messages().filter(m => m.content);

    this.aiService.ask(text, history).subscribe({
      next: (res) => {
        this.messages.update(m => [...m, { role: 'assistant', content: res.reply }]);
        this.loading.set(false);
      },
      error: () => {
        this.messages.update(m => [...m, {
          role: 'assistant',
          content: 'عذراً، حدث خطأ. حاول مرة أخرى.'
        }]);
        this.loading.set(false);
      }
    });
  }
}