// Servicio de Actividad Actual y Línea de Tiempo de JARVIS Personal OS
import { CurrentActivity, TimelineEntry, ActivityCategory } from '../types';

export interface ActivityPreset {
  id: string;
  title: string;
  category: ActivityCategory;
  categoryLabel: string;
  categoryColor: string;
  icon: string;
  defaultNotes?: string;
  nfcTag?: string;
}

export const ACTIVITY_PRESETS: ActivityPreset[] = [
  {
    id: 'creko_captacion',
    title: 'Creko — Captación de clientes',
    category: 'creko',
    categoryLabel: 'CREKO',
    categoryColor: '#a855f7',
    icon: '🟣',
    defaultNotes: 'Prospección en Logroño, contactos y propuestas de valor',
    nfcTag: 'NFC Escritorio',
  },
  {
    id: 'creko_mensajes',
    title: 'Creko — Mensajes & Presupuestos',
    category: 'creko',
    categoryLabel: 'CREKO',
    categoryColor: '#a855f7',
    icon: '💬',
    defaultNotes: 'Cotizaciones, seguimiento y respuestas a clientes',
  },
  {
    id: 'creko_produccion',
    title: 'Creko — Producción & Máquinas',
    category: 'creko',
    categoryLabel: 'CREKO',
    categoryColor: '#a855f7',
    icon: '🏭',
    defaultNotes: 'Taller, ploters, armado y corte de vinilos',
    nfcTag: 'NFC Máquinas',
  },
  {
    id: 'burger_palusa',
    title: 'Burger Palusa — Diseño & Pantallas',
    category: 'burger_palusa',
    categoryLabel: 'BURGER PALUSA',
    categoryColor: '#f97316',
    icon: '🍔',
    defaultNotes: 'Packaging, cartelería exterior, pantallas y camisetas',
  },
  {
    id: 'changa_dejavu',
    title: 'Changa — Turno DejaVu',
    category: 'trabajo',
    categoryLabel: 'TRABAJO',
    categoryColor: '#e11d48',
    icon: '💰',
    defaultNotes: 'Servicio en barra 20:00 a 00:00',
    nfcTag: 'NFC Mochila',
  },
  {
    id: 'trabajo_rotuprint',
    title: 'Trabajo — Búsqueda & Rotuprint',
    category: 'trabajo',
    categoryLabel: 'TRABAJO',
    categoryColor: '#38bdf8',
    icon: '💼',
    defaultNotes: 'Trámites, oficios y oportunidades laborales',
  },
  {
    id: 'cuerpo_correr',
    title: 'Correr — Running en calle',
    category: 'cuerpo',
    categoryLabel: 'CUERPO',
    categoryColor: '#3b82f6',
    icon: '🏃',
    defaultNotes: 'Sesión de carrera continua y resistencia',
  },
  {
    id: 'cuerpo_skate',
    title: 'Skate — Sesión de street & trucos',
    category: 'cuerpo',
    categoryLabel: 'CUERPO',
    categoryColor: '#f59e0b',
    icon: '🛹',
    defaultNotes: 'Práctica de trucos, líneas y spots urbanos',
  },
  {
    id: 'cuerpo_gym',
    title: 'Entrenamiento — Gym & Fuerza',
    category: 'cuerpo',
    categoryLabel: 'CUERPO',
    categoryColor: '#10b981',
    icon: '🏋️',
    defaultNotes: 'Rutina de fuerza, hipertrofia o funcional',
    nfcTag: 'NFC Gimnasio',
  },
  {
    id: 'vida_inicio',
    title: 'Inicio del día & Despertar',
    category: 'vida',
    categoryLabel: 'VIDA',
    categoryColor: '#eab308',
    icon: '☀️',
    defaultNotes: 'Agua, luz natural, organización mental',
    nfcTag: 'NFC Cama',
  },
  {
    id: 'vida_pausa',
    title: 'Pausa & Almuerzo',
    category: 'vida',
    categoryLabel: 'VIDA',
    categoryColor: '#64748b',
    icon: '🍝',
    defaultNotes: 'Comida, descanso y desconexión breve',
  },
  {
    id: 'ideas_software',
    title: 'Ideas & Desarrollo de Software',
    category: 'ideas',
    categoryLabel: 'IDEAS',
    categoryColor: '#8b5cf6',
    icon: '💡',
    defaultNotes: 'Nuevas soluciones, automatizaciones o código',
  },
];

export const activityService = {
  async getCurrentActivity(): Promise<CurrentActivity> {
    try {
      const res = await fetch('/api/activity/current');
      if (res.ok) return await res.json();
    } catch {}
    return {
      id: 'act_default',
      title: 'Creko — Captación de clientes',
      category: 'creko',
      categoryLabel: 'CREKO',
      categoryColor: '#a855f7',
      icon: '🟣',
      startTime: '09:12',
      startTimestamp: Date.now() - 42 * 60 * 1000,
      durationMinutes: 42,
      notes: 'Prospección en Logroño, contactos y presupuestos',
      isActive: true,
    };
  },

  async startActivity(data: Partial<CurrentActivity>): Promise<CurrentActivity> {
    const res = await fetch('/api/activity/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al iniciar actividad');
    return res.json();
  },

  async finishActivity(notes?: string): Promise<{ success: boolean; activity: CurrentActivity }> {
    const res = await fetch('/api/activity/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    if (!res.ok) throw new Error('Error al finalizar actividad');
    return res.json();
  },

  async getTimeline(period: 'today' | 'week' | 'month' = 'today'): Promise<{ timeline: TimelineEntry[]; currentActivity: CurrentActivity }> {
    try {
      const res = await fetch(`/api/activity/timeline?period=${period}`);
      if (res.ok) return await res.json();
    } catch {}
    return {
      timeline: [],
      currentActivity: await this.getCurrentActivity(),
    };
  },

  async addTimelineEntry(entry: Partial<TimelineEntry>): Promise<TimelineEntry> {
    const res = await fetch('/api/activity/timeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error('Error al agregar hito al timeline');
    return res.json();
  },
};
