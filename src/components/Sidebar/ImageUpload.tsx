import { useRef, useState } from 'react';
import { cn } from '@/utils/cn';

interface ImageUploadProps {
  label: string;
  currentUrl: string;
  onUpload: (dataUrl: string) => void;
}

const MAX_UPLOAD_SIZE = 12 * 1024 * 1024;
const MAX_IMAGE_WIDTH = 1600;
const MAX_IMAGE_HEIGHT = 1100;
const JPEG_QUALITY = 0.82;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Nie udało się odczytać pliku.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Nie udało się wczytać obrazu.'));
    img.src = src;
  });
}

async function optimizeImage(file: File): Promise<string> {
  const originalDataUrl = await readFileAsDataUrl(file);
  const img = await loadImage(originalDataUrl);

  const scale = Math.min(
    MAX_IMAGE_WIDTH / img.naturalWidth,
    MAX_IMAGE_HEIGHT / img.naturalHeight,
    1
  );

  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return originalDataUrl;

  ctx.drawImage(img, 0, 0, width, height);

  // Dla PNG zachowujemy PNG, żeby nie popsuć przezroczystości logo.
  // Zdjęcia JPG/JPEG/WebP konwertujemy do JPEG, co znacząco zmniejsza rozmiar draftu Outlooka.
  if (file.type === 'image/png') {
    return canvas.toDataURL('image/png');
  }

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}

export function ImageUpload({ label, currentUrl, onUpload }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = async (file: File) => {
    setError('');

    if (!file.type.startsWith('image/')) {
      setError('Wybierz plik graficzny.');
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      setError('Obraz jest za duży. Maksymalnie 12 MB przed kompresją.');
      return;
    }

    try {
      setIsProcessing(true);
      const optimizedDataUrl = await optimizeImage(file);
      onUpload(optimizedDataUrl);
    } catch {
      setError('Nie udało się przetworzyć obrazu. Spróbuj użyć JPG lub PNG.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void processFile(file);
  };

  const hasPreview = currentUrl?.startsWith('data:');

  return (
    <div className="mb-1.5">
      <label className="mb-0.5 block text-[10px] font-medium text-gray-500">{label}</label>
      <div
        className={cn(
          'relative cursor-pointer rounded-lg border-2 border-dashed p-2 text-center transition-all',
          isDragging ? 'border-[#feed01]/50 bg-[#feed01]/5' : 'border-white/[0.06] bg-[#0d1b2a]/30 hover:border-white/12',
          isProcessing && 'pointer-events-none opacity-70'
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleChange} className="hidden" />
        {hasPreview ? (
          <div className="flex items-center gap-2">
            <img src={currentUrl} alt="Preview" className="h-8 w-12 rounded object-cover border border-white/10" />
            <span className="text-[8px] text-gray-500">{isProcessing ? 'Optymalizacja...' : 'Kliknij aby zmienić'}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 py-0.5">
            <span className="text-sm">{isProcessing ? '⏳' : isDragging ? '📥' : '🖼️'}</span>
            <div className="text-left">
              <p className="text-[9px] font-medium text-gray-400">
                {isProcessing ? 'Optymalizuję...' : isDragging ? 'Upuść tutaj!' : 'Kliknij lub upuść'}
              </p>
              <p className="text-[7px] text-gray-600">PNG/JPG/WebP do 12 MB, auto-kompresja</p>
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-[8px] leading-tight text-red-400">{error}</p>}
    </div>
  );
}
