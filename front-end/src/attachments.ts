import type { Provider } from './Store';

export interface Attachment {
  id: string;
  name: string;
  kind: 'image' | 'document';
  data: string;
  mediaType: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  attachments?: Attachment[];
}

export const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TEXT_LENGTH = 100_000;
export const ACCEPTED_FILES = '.png,.jpg,.jpeg,.webp,.gif,.pdf,.docx,.txt,.md,.csv,.json,.log';

export async function readAttachment(file: File): Promise<Attachment> {
  if (file.size > MAX_FILE_SIZE) throw new Error(`${file.name}: maximum file size is 10 MB.`);
  if (!file.size) throw new Error(`${file.name}: file is empty.`);
  const extension = file.name.split('.').pop()?.toLowerCase();
  const imageTypes: Record<string, string> = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif',
  };
  const base = { id: crypto.randomUUID(), name: file.name };
  if (extension && imageTypes[extension]) {
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
      reader.readAsDataURL(new Blob([file], { type: imageTypes[extension] }));
    });
    return { ...base, kind: 'image', data, mediaType: imageTypes[extension] };
  }
  let text: string;
  if (extension === 'pdf') {
    const pdfjs = await import('pdfjs-dist');
    const { default: workerUrl } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
    const pdf = await task.promise;
    try {
      const pages: string[] = [];
      let length = 0;
      for (let page = 1; page <= pdf.numPages; page++) {
        const content = await (await pdf.getPage(page)).getTextContent();
        const pageText = content.items.map(item => 'str' in item ? item.str : '').join(' ');
        length += pageText.length;
        if (length > MAX_TEXT_LENGTH) throw new Error(`${file.name}: document exceeds 100,000 characters.`);
        pages.push(pageText);
      }
      text = pages.join('\n\n');
    } finally {
      await task.destroy();
    }
  } else if (extension === 'docx') {
    const mammoth = await import('mammoth/mammoth.browser');
    text = (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
  } else if (extension && ['txt', 'md', 'csv', 'json', 'log'].includes(extension)) {
    text = await file.text();
    if (text.includes('\0')) throw new Error(`${file.name}: expected a text document.`);
  } else {
    throw new Error(`${file.name}: unsupported file type.`);
  }
  if (!text.trim()) throw new Error(`${file.name}: no readable text found. Scanned PDFs need OCR first.`);
  if (text.length > MAX_TEXT_LENGTH) throw new Error(`${file.name}: document exceeds 100,000 characters.`);
  return { ...base, kind: 'document', data: text, mediaType: 'text/plain' };
}

export function serializeMessages(messages: ChatMessage[], provider: Provider) {
  return messages.map(message => {
    const documents = message.attachments?.filter(a => a.kind === 'document') || [];
    const images = message.attachments?.filter(a => a.kind === 'image') || [];
    const text = [message.content, ...documents.map(a => `Attached document: ${a.name}\n<document>\n${a.data}\n</document>`)].filter(Boolean).join('\n\n');
    if (!images.length) return { role: message.role, content: text };
    if (provider === 'ollama') {
      return { role: message.role, content: text, images: images.map(a => a.data.split(',')[1]) };
    }
    if (provider === 'anthropic') {
      return {
        role: message.role,
        content: [
          ...(text ? [{ type: 'text', text }] : []),
          ...images.map(a => ({ type: 'image', source: { type: 'base64', media_type: a.mediaType, data: a.data.split(',')[1] } })),
        ],
      };
    }
    return {
      role: message.role,
      content: [
        ...(text ? [{ type: 'text', text }] : []),
        ...images.map(a => ({ type: 'image_url', image_url: { url: a.data } })),
      ],
    };
  });
}
