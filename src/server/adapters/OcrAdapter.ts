export interface OcrAdapter {
  extractPages(filePath: string): Promise<{ pageNumber: number; text: string }[]>;
}
