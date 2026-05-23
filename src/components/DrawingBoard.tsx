'use client'

import React, { useCallback, useState } from 'react';
import { Tldraw, Editor } from 'tldraw';
import 'tldraw/tldraw.css';
import { Loader2, Camera, Send } from 'lucide-react';

interface DrawingBoardProps {
  onSendSnapshot: (base64Image: string) => void;
}

export const DrawingBoard: React.FC<DrawingBoardProps> = ({ onSendSnapshot }) => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor);
  }, []);

  const takeSnapshot = useCallback(async () => {
    if (!editor) return;
    try {
      setIsExporting(true);
      
      // Sprawdź czy są zaznaczone elementy
      const selectedShapeIds = editor.getSelectedShapeIds();
      
      // Jeśli użytkownik coś zaznaczył, eksportuj tylko to, w przeciwnym razie wszystkie kształty
      const shapeIdsToExport = selectedShapeIds.length > 0 
        ? selectedShapeIds 
        : Array.from(editor.getCurrentPageShapeIds());

      if (shapeIdsToExport.length === 0) {
        alert("Tablica jest pusta. Narysuj coś najpierw!");
        setIsExporting(false);
        return;
      }

      // Eksport do pliku Blob (PNG) poprzez nową metodę editor.toImage
      const { blob } = await editor.toImage(Array.from(shapeIdsToExport), {
        format: 'png',
        background: true,
        padding: 32
      });

      // Konwersja na base64, by wysłać do AI
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        onSendSnapshot(base64data);
        setIsExporting(false);
      };
      reader.readAsDataURL(blob);
      
    } catch (e) {
      console.error('Błąd podczas robienia zrzutu:', e);
      setIsExporting(false);
      alert("Nie udało się utworzyć zrzutu z tablicy.");
    }
  }, [editor, onSendSnapshot]);

  return (
    <div className="relative h-full w-full rounded-[32px] overflow-hidden border border-[#dce7f5] shadow-sm">
      <Tldraw onMount={handleMount} hideUi={false} />

      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[500]">
        <button
          onClick={takeSnapshot}
          disabled={isExporting}
          className="cartoon-button flex items-center gap-2 rounded-2xl bg-[#7057ff] px-6 py-4 font-extrabold text-white shadow-xl hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {isExporting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Camera className="h-5 w-5" />
          )}
          Zrób zdjęcie i wyślij do AI
        </button>
      </div>
    </div>
  );
};
