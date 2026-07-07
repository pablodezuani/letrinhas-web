'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { ImagePlus, X } from 'lucide-react';

const MAX_SIZE = 2 * 1024 * 1024;

interface ImageUploadProps {
  value?: string | null;
  onChange: (dataUrl: string) => void;
  label?: string;
  shape?: 'square' | 'circle';
}

export function ImageUpload({ value, onChange, label, shape = 'square' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFile(file: File | undefined) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem.');
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error('Imagem muito grande (máx. 2MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <p className="text-sm font-medium" style={{ color: '#305F72' }}>{label}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`relative flex items-center justify-center overflow-hidden cursor-pointer transition-colors ${
          shape === 'circle' ? 'rounded-full w-20 h-20' : 'rounded-xl w-full h-32'
        }`}
        style={{
          background: '#FFF8F4',
          border: dragOver ? '2px dashed #305F72' : '2px dashed rgba(48,95,114,0.2)',
        }}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(31,67,82,0.7)' }}
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 px-2 text-center">
            <ImagePlus className="h-5 w-5" style={{ color: '#98A5AB' }} />
            <span className="text-xs" style={{ color: '#98A5AB' }}>
              Clique ou arraste uma imagem
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
