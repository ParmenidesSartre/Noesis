/**
 * Browser fingerprinting for anomaly detection
 * Creates a unique fingerprint of the browser/device
 */

import { logAuditEvent, AuditEventType, AuditSeverity } from './auditLogger';

export interface DeviceFingerprint {
  hash: string;
  components: {
    userAgent: string;
    language: string;
    colorDepth: number;
    screenResolution: string;
    timezone: number;
    platform: string;
    plugins: string[];
    canvas: string;
    webgl: string;
    fonts: string[];
    audio: string;
  };
  timestamp: number;
}

/**
 * Generate canvas fingerprint
 */
function generateCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = 200;
    canvas.height = 50;

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Noesis Security', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Canvas Fingerprint', 4, 17);

    return canvas.toDataURL();
  } catch {
    return '';
  }
}

/**
 * Generate WebGL fingerprint
 */
function generateWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return '';

    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return '';

    const vendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    return `${vendor}~${renderer}`;
  } catch {
    return '';
  }
}

/**
 * Get installed plugins (deprecated in modern browsers)
 */
function getPlugins(): string[] {
  try {
    if (!navigator.plugins || navigator.plugins.length === 0) {
      return [];
    }

    return Array.from(navigator.plugins)
      .map((plugin) => plugin.name)
      .sort();
  } catch {
    return [];
  }
}

/**
 * Detect installed fonts using canvas
 */
function detectFonts(): string[] {
  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  const testFonts = [
    'Arial',
    'Verdana',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Palatino',
    'Garamond',
    'Comic Sans MS',
    'Trebuchet MS',
    'Arial Black',
    'Impact',
  ];

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const detectedFonts: string[] = [];

  const baseFontWidths: Record<string, number> = {};
  baseFonts.forEach((font) => {
    ctx.font = `72px ${font}`;
    baseFontWidths[font] = ctx.measureText('mmmmmmmmmmlli').width;
  });

  testFonts.forEach((font) => {
    baseFonts.forEach((baseFont) => {
      ctx.font = `72px ${font}, ${baseFont}`;
      const width = ctx.measureText('mmmmmmmmmmlli').width;

      if (width !== baseFontWidths[baseFont]) {
        if (!detectedFonts.includes(font)) {
          detectedFonts.push(font);
        }
      }
    });
  });

  return detectedFonts.sort();
}

/**
 * Generate audio fingerprint
 */
function generateAudioFingerprint(): string {
  try {
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return '';

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gainNode = context.createGain();
    const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

    gainNode.gain.value = 0; // Mute
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(0);

    let hash = '';
    scriptProcessor.onaudioprocess = (event) => {
      const output = event.outputBuffer.getChannelData(0);
      hash = output.slice(0, 30).join('');
    };

    setTimeout(() => {
      oscillator.stop();
      context.close();
    }, 100);

    return hash;
  } catch {
    return '';
  }
}

/**
 * Simple hash function
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generate complete device fingerprint
 */
export async function generateFingerprint(): Promise<DeviceFingerprint> {
  if (typeof window === 'undefined') {
    throw new Error('Fingerprinting only works in browser environment');
  }

  const components = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    colorDepth: screen.colorDepth,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: new Date().getTimezoneOffset(),
    platform: navigator.platform,
    plugins: getPlugins(),
    canvas: generateCanvasFingerprint(),
    webgl: generateWebGLFingerprint(),
    fonts: detectFonts(),
    audio: generateAudioFingerprint(),
  };

  // Create hash from all components
  const fingerprintString = JSON.stringify(components);
  const hash = simpleHash(fingerprintString);

  const fingerprint: DeviceFingerprint = {
    hash,
    components,
    timestamp: Date.now(),
  };

  // Log fingerprint generation
  logAuditEvent(
    AuditEventType.ENCRYPTION_KEY_GENERATED,
    AuditSeverity.INFO,
    'Device fingerprint generated',
    { hash }
  );

  return fingerprint;
}

/**
 * Store fingerprint in sessionStorage
 */
export function storeFingerprint(fingerprint: DeviceFingerprint): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('device_fingerprint', JSON.stringify(fingerprint));
}

/**
 * Get stored fingerprint
 */
export function getStoredFingerprint(): DeviceFingerprint | null {
  if (typeof window === 'undefined') return null;

  const stored = sessionStorage.getItem('device_fingerprint');
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Compare two fingerprints and return similarity score (0-100)
 */
export function compareFingerprintsSimple(fp1: DeviceFingerprint, fp2: DeviceFingerprint): number {
  return fp1.hash === fp2.hash ? 100 : 0;
}

/**
 * Detect if device has changed (potential security risk)
 */
export async function detectDeviceChange(): Promise<{
  changed: boolean;
  score: number;
  previousFingerprint?: DeviceFingerprint;
  currentFingerprint: DeviceFingerprint;
}> {
  const stored = getStoredFingerprint();
  const current = await generateFingerprint();

  if (!stored) {
    // First time, store fingerprint
    storeFingerprint(current);
    return {
      changed: false,
      score: 100,
      currentFingerprint: current,
    };
  }

  const score = compareFingerprintsSimple(stored, current);
  const changed = score < 100;

  if (changed) {
    logAuditEvent(
      AuditEventType.DEVICE_CHANGE_DETECTED,
      AuditSeverity.WARNING,
      'Device fingerprint change detected',
      {
        previousHash: stored.hash,
        currentHash: current.hash,
        score,
      }
    );
  }

  return {
    changed,
    score,
    previousFingerprint: stored,
    currentFingerprint: current,
  };
}

/**
 * Initialize fingerprinting (call on app start)
 */
export async function initializeFingerprinting(): Promise<DeviceFingerprint> {
  const fingerprint = await generateFingerprint();
  storeFingerprint(fingerprint);
  return fingerprint;
}
