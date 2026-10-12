// Servicio de Sincronización en Tiempo Real "Cerebro Único"
// Mantiene sincronizado el móvil y la computadora en tiempo real mediante SSE + Heartbeat

export interface SyncEvent {
  id: string;
  type:
    | 'skate_logged'
    | 'run_logged'
    | 'workout_logged'
    | 'postit_updated'
    | 'income_split'
    | 'haptic_ping'
    | 'device_connected'
    | 'activity_started'
    | 'activity_finished'
    | 'changa_logged'
    | 'health_synced'
    | 'general';
  label: string;
  device?: string;
  timestamp: number;
  payload?: any;
}

export interface ConnectedDevice {
  id: string;
  name: string;
  type: 'mobile' | 'desktop';
  lastSeen: number;
  battery?: string;
  platform?: string;
  ip?: string;
}

type SyncListener = (event: SyncEvent) => void;
type DeviceListener = (devices: ConnectedDevice[]) => void;

function playSyncChime(kind: 'ping' | 'action' = 'action') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (kind === 'ping') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {}
}

class CerebroSyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<SyncListener> = new Set();
  private deviceListeners: Set<DeviceListener> = new Set();
  private lastTimestamp = Date.now();
  private pollInterval: any = null;
  private heartbeatInterval: any = null;
  private eventSource: EventSource | null = null;
  private deviceName: string = '';
  private deviceId: string = '';
  private isMobileDevice: boolean = false;
  private activeDevices: ConnectedDevice[] = [];

  constructor() {
    if (typeof window === 'undefined') return;

    // Detect device type & ID
    this.isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const storedId = localStorage.getItem('jarvis_device_id');
    this.deviceId = storedId || `dev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem('jarvis_device_id', this.deviceId);

    this.deviceName = this.isMobileDevice
      ? /iPhone/i.test(navigator.userAgent) ? 'iPhone de Fran' : 'Celular de Fran'
      : 'Computadora de Fran';

    // 1. BroadcastChannel for instant same-browser tabs sync
    if ('BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('jarvis_brain_sync');
        this.channel.onmessage = (ev) => {
          if (ev.data && ev.data.type) {
            this.notifyListeners(ev.data, false);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel no disponible:', e);
      }
    }

    // 2. Storage event fallback
    window.addEventListener('storage', (e) => {
      if (e.key === 'jarvis_last_sync_event' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          this.notifyListeners(parsed, false);
        } catch {}
      }
    });

    // 3. Connect to SSE Stream for 0ms Server-to-Client Push
    this.initSSE();

    // 4. Heartbeat and device presence
    this.sendHeartbeat();
    this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), 20000);

    // 5. Fallback polling every 5s if SSE disconnects
    this.startPolling();
  }

  private initSSE() {
    if (typeof window === 'undefined' || !('EventSource' in window)) return;
    try {
      this.eventSource = new EventSource('/api/sync/stream');

      this.eventSource.onmessage = (e) => {
        try {
          const event: SyncEvent = JSON.parse(e.data);
          if (event && event.type && event.timestamp > this.lastTimestamp) {
            this.notifyListeners(event, true);
            this.lastTimestamp = event.timestamp;
          }
        } catch {}
      };

      this.eventSource.onerror = () => {
        // SSE disconnected, wait and reconnect
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        setTimeout(() => this.initSSE(), 8000);
      };
    } catch (err) {
      console.warn('SSE initialization error:', err);
    }
  }

  private async sendHeartbeat() {
    if (typeof window === 'undefined') return;
    try {
      let batteryLevel: string | undefined = undefined;
      if ('getBattery' in navigator) {
        try {
          const battery: any = await (navigator as any).getBattery();
          batteryLevel = `${Math.round(battery.level * 100)}%`;
        } catch {}
      }

      const res = await fetch('/api/sync/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: this.deviceId,
          name: this.deviceName,
          type: this.isMobileDevice ? 'mobile' : 'desktop',
          battery: batteryLevel,
          platform: navigator.platform || (this.isMobileDevice ? 'iOS/Android' : 'Desktop'),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.activeDevices) {
          this.activeDevices = data.activeDevices;
          this.notifyDeviceListeners(data.activeDevices);
        }
      }
    } catch {}
  }

  private startPolling() {
    if (typeof window === 'undefined') return;
    this.pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sync/events?since=${this.lastTimestamp}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.events && Array.isArray(data.events) && data.events.length > 0) {
          data.events.forEach((ev: SyncEvent) => {
            if (ev.timestamp > this.lastTimestamp) {
              this.notifyListeners(ev, true);
            }
          });
          this.lastTimestamp = data.serverTime || Date.now();
        }
      } catch {}
    }, 4500);
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public subscribeDevices(listener: DeviceListener): () => void {
    this.deviceListeners.add(listener);
    // Send current active devices immediately
    if (this.activeDevices.length > 0) {
      listener(this.activeDevices);
    }
    return () => this.deviceListeners.delete(listener);
  }

  private notifyDeviceListeners(devices: ConnectedDevice[]) {
    this.deviceListeners.forEach((fn) => {
      try {
        fn(devices);
      } catch {}
    });
  }

  private notifyListeners(event: SyncEvent, playSound = true) {
    // Sound & Haptics
    if (playSound) {
      if (event.type === 'haptic_ping') {
        playSyncChime('ping');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate([40, 60, 40, 60, 80]);
          } catch {}
        }
      } else {
        playSyncChime('action');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(25);
          } catch {}
        }
      }
    }

    this.listeners.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        console.error('Error en listener de sincronización:', err);
      }
    });
  }

  public async emit(type: SyncEvent['type'], label: string, payload?: any) {
    const event: SyncEvent = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      label,
      device: this.deviceName,
      timestamp: Date.now(),
      payload,
    };

    this.lastTimestamp = event.timestamp;

    // 1. BroadcastChannel (0ms)
    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch {}
    }

    // 2. LocalStorage (instant across windows)
    try {
      localStorage.setItem('jarvis_last_sync_event', JSON.stringify(event));
    } catch {}

    // 3. Server relay (reaches mobile phone from computer & vice-versa)
    try {
      await fetch('/api/sync/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch {}

    return event;
  }

  public async sendPing(fromName?: string) {
    const sender = fromName || this.deviceName;
    try {
      await fetch('/api/sync/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: sender }),
      });
    } catch {}
  }

  public getDeviceName(): string {
    return this.deviceName;
  }

  public getIsMobile(): boolean {
    return this.isMobileDevice;
  }

  public getActiveDevices(): ConnectedDevice[] {
    return this.activeDevices;
  }

  public destroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.channel) this.channel.close();
    if (this.eventSource) this.eventSource.close();
  }
}

export const cerebroSync = new CerebroSyncManager();
