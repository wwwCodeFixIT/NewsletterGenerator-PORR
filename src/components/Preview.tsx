import { useEffect, useRef, useState } from 'react';
import type { DeviceType } from '@/types';

interface PreviewProps {
  html: string;
  activeDevice: DeviceType;
  previewWidth: number;
  onDeviceChange: (device: DeviceType) => void;
  onWidthChange: (width: number) => void;
}

const devices: { id: DeviceType; icon: string; label: string; size: string }[] = [
  { id: 'mobile-sm', icon: '📱', label: 'SE', size: '375' },
  { id: 'mobile-lg', icon: '📱', label: '14', size: '430' },
  { id: 'tablet', icon: '📟', label: 'iPad', size: '768' },
  { id: 'desktop', icon: '🖥️', label: 'PC', size: '1024' },
];

export function Preview({ html, activeDevice, previewWidth, onDeviceChange, onWidthChange }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [contentHeight, setContentHeight] = useState(600);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(html);
    doc.close();

    // Pierwsze pomiarowanie — od razu po wpisaniu HTML
    const measureNow = () => {
      const h = doc.documentElement?.scrollHeight || doc.body?.scrollHeight || 0;
      if (h > 100) setContentHeight(h);
    };
    measureNow();

    // Drugie pomiarowanie po 400ms — obrazy zewnętrzne mogą się jeszcze ładować
    // i zmieniać wysokość layoutu (szczególnie bez wymiarów na img)
    const t = window.setTimeout(measureNow, 400);
    return () => window.clearTimeout(t);
  }, [html]);

  const deviceType = activeDevice.startsWith('mobile') ? 'mobile' : activeDevice === 'tablet' ? 'tablet' : 'desktop';
  const viewLabel = previewWidth <= 480 ? 'Mobile' : previewWidth <= 768 ? 'Tablet' : 'Desktop';
  // Clamp: minimum 300px, maximum 5000px (zapobiega dziwnemu skakaniu przy pierwszym renderze)
  const iframeHeight = Math.min(Math.max(contentHeight, 300), 5000);

  return (
    <div className="flex-1 bg-[#2a2a4a] flex flex-col min-h-0 min-w-0">
      {/* Controls bar */}
      <div className="flex-shrink-0 px-3 pt-2 pb-1.5 border-b border-white/5 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-xs font-semibold text-white/80 flex items-center gap-1.5 whitespace-nowrap">
            👁️ Podgląd
          </h2>

          <div className="flex bg-[#1a1a2e] rounded-lg overflow-hidden">
            {devices.map(d => (
              <button
                key={d.id}
                onClick={() => onDeviceChange(d.id)}
                className={`px-2 py-1 text-center text-[9px] flex items-center gap-1 transition-colors ${
                  activeDevice === d.id
                    ? 'bg-[#143e70] text-[#feed01] font-bold'
                    : 'text-gray-500 hover:bg-[#143e70]/50 hover:text-white'
                }`}
              >
                <span className="text-sm">{d.icon}</span>
                <span className="hidden sm:inline">{d.label}</span>
                <span className="text-[8px] opacity-50 hidden md:inline">{d.size}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-[#1a1a2e] px-2 py-1 rounded-lg">
            <input
              type="range"
              min={320}
              max={1920}
              value={previewWidth}
              onChange={e => onWidthChange(Number(e.target.value))}
              className="w-16 md:w-24"
            />
            <input
              type="number"
              min={320}
              max={1920}
              value={previewWidth}
              onChange={e => onWidthChange(Math.max(320, Math.min(1920, Number(e.target.value))))}
              className="w-12 px-1 py-0.5 bg-[#0f3460] border border-[#143e70] rounded text-white text-[10px] text-center"
            />
            <span className="text-[9px] text-gray-500">px</span>
          </div>

          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            previewWidth <= 600 ? 'bg-[#00d9a5] text-white' : 'bg-[#0078d4] text-white'
          }`}>
            {viewLabel}
          </span>

          <span className="text-[9px] text-gray-600 ml-auto hidden md:block">
            Wysokość: {iframeHeight}px
          </span>
        </div>
      </div>

      {/* Preview area - scrollable */}
      <div className="flex-1 overflow-auto flex justify-center px-2 md:px-4 pb-4">
        <div
          className={`self-start mt-3 transition-all duration-200 ${
            deviceType === 'mobile'
              ? 'bg-[#1a1a2e] rounded-[40px] p-2 pt-10 pb-10 relative shadow-2xl shadow-black/50'
              : deviceType === 'tablet'
              ? 'bg-[#1a1a2e] rounded-[25px] p-3 pt-7 pb-7 shadow-2xl shadow-black/40'
              : 'bg-[#1a1a2e] rounded-xl p-2.5 shadow-2xl shadow-black/30'
          }`}
          style={{ maxWidth: '100%' }}
        >
          {deviceType === 'mobile' && (
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#0f0f1a] rounded-xl" />
          )}

          <div className="bg-white rounded-sm overflow-hidden">
            <iframe
              ref={iframeRef}
              className="block bg-white border-none"
              style={{
                width: previewWidth + 'px',
                height: iframeHeight + 'px',
                maxWidth: '100%',
              }}
              title="Podgląd newslettera"
            />
          </div>

          {deviceType === 'mobile' && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-600 rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
}
