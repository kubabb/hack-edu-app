'use client';

import { useState, useCallback } from 'react';
import { Upload, File, X, Loader2 } from 'lucide-react';

export default function UploadBookForm({ onUpload }: { onUpload: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
    }
  }, [title]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) return;
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    try {
      const res = await fetch('/api/books', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Błąd przesyłania');
      setFile(null);
      setTitle('');
      onUpload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver ? 'border-[#1d7874] bg-[#f0f7f6]' : 'border-[#d0e5e1] bg-[#fafcfb]'
        }`}
      >
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <File className="w-8 h-8 text-[#1d7874]" />
            <div className="text-left">
              <p className="text-sm font-medium text-[#1a1a1a]">{file.name}</p>
              <p className="text-xs text-[#666]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button type="button" onClick={() => setFile(null)} className="ml-2 text-[#999] hover:text-red-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <label className="cursor-pointer block">
            <Upload className="w-10 h-10 text-[#c8ddd9] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#1a1a1a]">Przeciągnij plik lub kliknij, aby wybrać</p>
            <p className="text-xs text-[#999] mt-1">PDF, JPG, PNG (max 50MB)</p>
            <input type="file" accept=".pdf,image/*" onChange={handleFileChange} className="hidden" />
          </label>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1a1a1a] mb-1">Tytuł książki</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="np. Matematyka - klasa 3"
          className="w-full px-4 py-2.5 rounded-lg border border-[#d0e5e1] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1d7874]/20 focus:border-[#1d7874] transition-all"
          required
        />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <button
        type="submit"
        disabled={!file || uploading}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#1d7874] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#166a66] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {uploading ? 'Przetwarzanie...' : 'Prześlij i przetwórz'}
      </button>
    </form>
  );
}
