import { useEffect, useRef, useState, useCallback } from 'react';
import type { DeviceType, DeviceInfo } from '@/types';
import { cn } from '@/utils/cn';

const devices: Record<DeviceType, DeviceInfo> = {
  'mobile-sm': { width: 375, type: 'mobile', label: 'iPhone SE' },
  'mobile-lg': { width: 430, type: 'mobile', label: 'iPhone 14' },
  'tablet': { width: 768, type: 'tablet', label: 'iPad' },
  'desktop': { width: 1024, type: 'desktop', label: 'Desktop' },
};

const deviceButtons: { id: DeviceType; icon: string; label: string; shortLabel: string; size: string }[] = [
  { id: 'mobile-sm', icon: '📱', label: 'iPhone SE', shortLabel: 'SE', size: '375' },
  { id: 'mobile-lg', icon: '📱', label: 'iPhone 14', shortLabel: '14', size: '430' },
  { id: 'tablet', icon: '📟', label: 'iPad', shortLabel: 'Tab', size: '768' },
  { id: 'desktop', icon: '🖥️', label: 'Desktop', shortLabel: 'PC', size: '1024' },
];

interface PreviewProps {
  html: string;
}

export function Preview({ html }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const [currentDevice, setCurrentDevice] = useState<DeviceType>('desktop');
  const [customWidth, setCustomWidth] = useState(1024);
  const [autoScale, setAutoScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const device = devices[currentDevice];

  // Write HTML to iframe
  const updateIframe = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [html]);

  useEffect(() => {
    updateIframe();
  }, [updateIframe]);

  // Auto-scale to fit
  useEffect(() => {
    const calc = () => {
      const area = areaRef.current;
      if (!area) return;
      const avail = area.clientWidth - 32;
      const framePad = device.type === 'mobile' ? 28 : device.type === 'tablet' ? 28 : 20;
      const needed = customWidth + framePad;
      setAutoScale(needed > avail && avail > 0 ? Math.max(0.2, avail / needed) : 1);
    };
    calc();
    const obs = new ResizeObserver(calc);
    if (areaRef.current) obs.observe(areaRef.current);
    return () => obs.disconnect();
  }, [customWidth, device.type]);

  const handleDeviceChange = (id: DeviceType) => {
    setCurrentDevice(id);
    setCustomWidth(devices[id].width);
  };

  const handleWidthChange = (w: number) => {
    const c = Math.max(320, Math.min(1920, w || 320));
    setCustomWidth(c);
    if (c <= 400) setCurrentDevice('mobile-sm');
    else if (c <= 500) setCurrentDevice('mobile-lg');
    else if (c <= 800) setCurrentDevice('tablet');
    else setCurrentDevice('desktop');
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  const viewLabel = customWidth <= 480 ? 'Mobile' : customWidth <= 768 ? 'Tablet' : 'Desktop';
  const iframeHeight = Math.max(600, customWidth * 1.3);

  return (
    <div ref={containerRef} className="flex flex-1 flex-col overflow-hidden bg-gradient-to-br from-[#0d1521] to-[#0a0f1a]">
      {/* Controls */}
      <div className="shrink-0 border-b border-white/[0.04] bg-[#0b1220]/95 px-2 sm:px-3 py-1.5">
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          {/* Device buttons */}
          <div className="flex overflow-hidden rounded-lg border border-white/[0.05] bg-black/30">
            {deviceButtons.map(d => (
              <button
                key={d.id}
                onClick={() => handleDeviceChange(d.id)}
                className={cn(
                  'flex items-center gap-1 px-1.5 sm:px-2.5 py-1.5 text-[9px] transition-all',
                  currentDevice === d.id
                    ? 'bg-[#feed01]/10 text-[#feed01] border-b-2 border-[#feed01]/60'
                    : 'text-gray-600 hover:bg-white/[0.03] hover:text-gray-400'
                )}
                title={`${d.label} (${d.size}px)`}
              >
                <span className="text-[10px]">{d.icon}</span>
                <span className="hidden sm:inline text-[8px] font-medium">{d.shortLabel}</span>
              </button>
            ))}
          </div>

          {/* Width slider - hide on small screens */}
          <div className="hidden md:flex items-center gap-1 rounded-lg border border-white/[0.05] bg-black/30 px-2 py-1">
            <input
              type="range" min={320} max={1920} value={customWidth}
              onChange={e => handleWidthChange(parseInt(e.target.value))}
              className="w-14 lg:w-20"
            />
            <input
              type="number" min={320} max={1920} value={customWidth}
              onChange={e => handleWidthChange(parseInt(e.target.value))}
              className="w-11 rounded border border-white/8 bg-black/40 px-1 py-0.5 text-center text-[9px] tabular-nums text-white focus:border-[#feed01]/30 focus:outline-none"
            />
            <span className="text-[8px] text-gray-600">px</span>
          </div>

          {/* Scale */}
          {autoScale < 1 && (
            <span className="rounded-full bg-amber-500/10 border border-amber-500/15 px-1.5 py-0.5 text-[8px] font-bold tabular-nums text-amber-400">
              {Math.round(autoScale * 100)}%
            </span>
          )}

          {/* Badge */}
          <span className={cn(
            'rounded-full px-1.5 py-0.5 text-[8px] font-bold border',
            customWidth <= 600
              ? 'bg-emerald-500/8 text-emerald-400 border-emerald-500/15'
              : customWidth <= 768
                ? 'bg-purple-500/8 text-purple-400 border-purple-500/15'
                : 'bg-blue-500/8 text-blue-400 border-blue-500/15'
          )}>
            {viewLabel} · {customWidth}px
          </span>

          <div className="flex-1" />

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="rounded-lg border border-white/[0.05] bg-black/30 px-2 py-1 text-[9px] text-gray-500 hover:bg-white/[0.04] hover:text-white transition-colors active:scale-95"
            title={isFullscreen ? 'Wyjdź z pełnego ekranu' : 'Pełny ekran'}
          >
            {isFullscreen ? '⊟' : '⊞'}
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div ref={areaRef} className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 touch-scroll">
        <div className="flex justify-center" style={{ minHeight: '100%' }}>
          <div
            className="preview-scale-container"
            style={{ transform: `scale(${autoScale})`, transformOrigin: 'top center' }}
          >
            {/* Device frame */}
            <div className={cn(
              'transition-all duration-300',
              device.type === 'mobile'
                ? 'rounded-[36px] bg-gradient-to-b from-[#1a1a2e] to-[#12121e] p-3 pt-[44px] pb-[44px] shadow-2xl shadow-black/60 relative ring-1 ring-white/8'
                : device.type === 'tablet'
                  ? 'rounded-[20px] bg-gradient-to-b from-[#1a1a2e] to-[#12121e] p-3 pt-7 pb-7 shadow-2xl shadow-black/60 ring-1 ring-white/8'
                  : 'rounded-xl bg-gradient-to-b from-[#1a1a2e] to-[#12121e] p-2 shadow-2xl shadow-black/60 ring-1 ring-white/8'
            )}>
              {/* Mobile notch */}
              {device.type === 'mobile' && (
                <div className="absolute left-1/2 top-3 -translate-x-1/2">
                  <div className="h-5 w-[70px] rounded-[10px] bg-black/80 ring-1 ring-white/5" />
                </div>
              )}

              {/* Desktop title bar */}
              {device.type === 'desktop' && (
                <div className="mb-1 flex items-center gap-1 px-1.5 py-0.5">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-[#ff5f57]/70" />
                    <div className="h-2 w-2 rounded-full bg-[#febc2e]/70" />
                    <div className="h-2 w-2 rounded-full bg-[#28c840]/70" />
                  </div>
                  <div className="ml-2 flex-1 rounded bg-black/30 px-2 py-0.5">
                    <span className="text-[7px] text-gray-600 font-mono">newsletter-porr.html</span>
                  </div>
                </div>
              )}

              {/* Screen */}
              <div className={cn(
                'overflow-hidden bg-white',
                device.type === 'mobile' ? 'rounded-lg' : device.type === 'tablet' ? 'rounded-md' : 'rounded-md'
              )}>
                <iframe
                  ref={iframeRef}
                  className="block border-none bg-white"
                  style={{ width: customWidth + 'px', height: iframeHeight + 'px' }}
                  title="Newsletter Preview"
                />
              </div>

              {/* Mobile home indicator */}
              {device.type === 'mobile' && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                  <div className="h-1 w-16 rounded-full bg-white/15" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
