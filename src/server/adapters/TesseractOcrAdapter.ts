import { OcrAdapter } from './OcrAdapter';
import Tesseract from 'tesseract.js';

export class TesseractOcrAdapter implements OcrAdapter {
  async extractPages(filePath: string): Promise<{ pageNumber: number; text: string }[]> {
    try {
      // Wykorzystujemy Tesseract.js do analizy pliku graficznego
      // Zakładamy język polski i angielski, ew. znaki matematyczne
      const worker = await Tesseract.createWorker('pol+eng');
      
      const { data: { text } } = await worker.recognize(filePath);
      await worker.terminate();

      return [
        {
          pageNumber: 1,
          text: text.trim(),
        }
      ];
    } catch (error) {
      console.error('Błąd analizy Tesseract:', error);
      throw new Error('Nie udało się odczytać tekstu ze zdjęcia.');
    }
  }
}
