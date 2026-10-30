import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Transform, CanvasElement, Vector2D } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(prefix = 'el'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function formatTime(seconds: number, fps = 30): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * fps);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
}

export function parseTime(timeString: string, fps = 30): number {
  const parts = timeString.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 60 + parts[1] + parts[2] / fps;
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parts[0];
}

export function getEasingFunction(easing: string): (t: number) => number {
  const easings: Record<string, (t: number) => number> = {
    linear: (t) => t,
    'ease-in': (t) => t * t,
    'ease-out': (t) => t * (2 - t),
    'ease-in-out': (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    'ease-in-sine': (t) => 1 - Math.cos((t * Math.PI) / 2),
    'ease-out-sine': (t) => Math.sin((t * Math.PI) / 2),
    'ease-in-out-sine': (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    'ease-in-quad': (t) => t * t,
    'ease-out-quad': (t) => t * (2 - t),
    'ease-in-out-quad': (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    'ease-in-cubic': (t) => t * t * t,
    'ease-out-cubic': (t) => 1 - Math.pow(1 - t, 3),
    'ease-in-out-cubic': (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    'ease-in-quart': (t) => t * t * t * t,
    'ease-out-quart': (t) => 1 - Math.pow(1 - t, 4),
    'ease-in-out-quart': (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
    'ease-in-quint': (t) => t * t * t * t * t,
    'ease-out-quint': (t) => 1 - Math.pow(1 - t, 5),
    'ease-in-out-quint': (t) => (t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2),
    'ease-in-expo': (t) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
    'ease-out-expo': (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    'ease-in-out-expo': (t) =>
      t === 0
        ? 0
        : t === 1
        ? 1
        : t < 0.5
        ? Math.pow(2, 20 * t - 10) / 2
        : (2 - Math.pow(2, -20 * t + 10)) / 2,
    'ease-in-circ': (t) => 1 - Math.sqrt(1 - t * t),
    'ease-out-circ': (t) => Math.sqrt(1 - Math.pow(t - 1, 2)),
    'ease-in-out-circ': (t) =>
      t < 0.5
        ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
        : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
    'ease-in-back': (t) => 2.70158 * t * t * t - 1.70158 * t * t,
    'ease-out-back': (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
    'ease-in-out-back': (t) =>
      t < 0.5
        ? (Math.pow(2 * t, 2) * (3.50316 * t - 1.50158)) / 2
        : (Math.pow(2 * t - 2, 2) * (3.50316 * t + 1.50158) + 2) / 2,
    'ease-in-elastic': (t) => {
      if (t === 0) return 0;
      if (t === 1) return 1;
      return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (2 * Math.PI) / 3);
    },
    'ease-out-elastic': (t) => {
      if (t === 0) return 0;
      if (t === 1) return 1;
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
    },
    'ease-in-out-elastic': (t) => {
      if (t === 0) return 0;
      if (t === 1) return 1;
      if (t < 0.5)
        return -Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / 4.5) / 2;
      return Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / 4.5) / 2 + 1;
    },
    'ease-in-bounce': (t) => 1 - easeOutBounce(1 - t),
    'ease-out-bounce': easeOutBounce,
    'ease-in-out-bounce': (t) =>
      t < 0.5
        ? (1 - easeOutBounce(1 - 2 * t)) / 2
        : (1 + easeOutBounce(2 * t - 1)) / 2,
  };

  return easings[easing] || easings.linear;
}

function easeOutBounce(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

export function interpolateTransform(
  start: Transform,
  end: Transform,
  factor: number,
  easing?: (t: number) => number
): Transform {
  const e = easing ? easing(factor) : factor;
  return {
    position: {
      x: lerp(start.position.x, end.position.x, e),
      y: lerp(start.position.y, end.position.y, e),
    },
    rotation: lerp(start.rotation, end.rotation, e),
    scale: {
      x: lerp(start.scale.x, end.scale.x, e),
      y: lerp(start.scale.y, end.scale.y, e),
    },
    opacity: lerp(start.opacity, end.opacity, e),
  };
}

export function getElementBounds(element: CanvasElement): { x: number; y: number; width: number; height: number } {
  const { position, scale } = element.transform;
  const width = element.type === 'text' ? 200 * scale.x : 100 * scale.x;
  const height = element.type === 'text' ? 50 * scale.y : 100 * scale.y;
  return {
    x: position.x - width / 2,
    y: position.y - height / 2,
    width,
    height,
  };
}

export function pointInElement(point: Vector2D, element: CanvasElement): boolean {
  const bounds = getElementBounds(element);
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
}

export function elementsOverlap(el1: CanvasElement, el2: CanvasElement): boolean {
  const b1 = getElementBounds(el1);
  const b2 = getElementBounds(el2);
  return !(
    b1.x + b1.width < b2.x ||
    b2.x + b2.width < b1.x ||
    b1.y + b1.height < b2.y ||
    b2.y + b2.height < b1.y
  );
}

export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

export function snapToObjects(
  value: number,
  objects: CanvasElement[],
  threshold = 10
): number {
  let snapped = value;
  for (const obj of objects) {
    const bounds = getElementBounds(obj);
    const edges = [bounds.x, bounds.x + bounds.width, bounds.y, bounds.y + bounds.height];
    for (const edge of edges) {
      if (Math.abs(value - edge) < threshold) {
        snapped = edge;
      }
    }
  }
  return snapped;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png', quality = 1): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create blob'));
    }, type, quality);
  });
}

export function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export function hexToRgba(hex: string, alpha = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function rgbaToHex(r: number, g: number, b: number, a = 1): string {
  const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${a !== 1 ? toHex(Math.round(a * 255)) : ''}`;
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function isEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}