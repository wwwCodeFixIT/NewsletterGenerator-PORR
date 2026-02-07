import { useRef, useState } from 'react';
import { cn } from '@/utils/cn';

interface ImageUploadProps {
  label: string;
  currentUrl: string;
  onUpload: (dataUrl: string) => void;
}

export function ImageUpload({ label, currentUrl, onUpload }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) return; // 5MB limit
    const reader = new FileReader();
    reader.onload = ev => { if (ev.target?.result) onUpload(ev.target.result as string); };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) processFile(file);
  };

  const hasPreview = currentUrl?.startsWith('data:');

  return (
    <div className="mb-1.5">
      <label className="mb-0.5 block text-[10px] font-medium text-gray-500">{label}</label>
      <div
        className={cn(
          'relative cursor-pointer rounded-lg border-2 border-dashed p-2 text-center transition-all',
          isDragging ? 'border-[#feed01]/50 bg-[#feed01]/5' : 'border-white/[0.06] bg-[#0d1b2a]/30 hover:border-white/12'
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
        {hasPreview ? (
          <div className="flex items-center gap-2">
            <img src={currentUrl} alt="Preview" className="h-8 w-12 rounded object-cover border border-white/10" />
            <span className="text-[8px] text-gray-500">Kliknij aby zmienić</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 py-0.5">
            <span className="text-sm">{isDragging ? '📥' : '🖼️'}</span>
            <div className="text-left">
              <p className="text-[9px] font-medium text-gray-400">{isDragging ? 'Upuść tutaj!' : 'Kliknij lub upuść'}</p>
              <p className="text-[7px] text-gray-600">PNG, JPG do 5MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
