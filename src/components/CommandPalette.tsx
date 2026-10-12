import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Dumbbell,
  Footprints,
  Wallet,
  Zap,
  StickyNote,
  Smartphone,
  Calendar,
  X,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  Radio,
} from 'lucide-react';
import { activityService } from '../services/activityService';
import { cerebroSync } from '../services/cerebroSyncService';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onOpenNewTransaction: () => void;
  onOpenNewPostIt: () => void;
  onOpenMobileCompanion: () => void;
  onTriggerGym: () => void;
  onTriggerRun: () => void;
  onTriggerSkate: () => void;
  onRefreshData?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenNewTransaction,
  onOpenNewPostIt,
  onOpenMobileCompanion,
  onTriggerGym,
  onTriggerRun,
  onTriggerSkate,
  onRefreshData,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
          setQuery('');
          setSelectedIndex(0);
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'jarvis_chat',
      category: 'JARVIS Core',
      title: 'Abrir Chat con JARVIS (Modificaciones en Vivo)',
      subtitle: 'Pedí cambios de saldos, changas, salud y memoria',
      icon: '💬',
      action: () => {
        onNavigate('chat');
        onClose();
      },
    },
    {
      id: 'act_creko_captacion',
      category: 'Actividad Actual',
      title: 'Iniciar: Creko — Captación de Clientes',
      subtitle: 'Contactar comercios y presupuestos en Logroño',
      icon: '🟣',
      action: async () => {
        await activityService.startActivity({
          title: 'Creko — Captación de clientes',
          category: 'creko',
          categoryLabel: 'CREKO',
          icon: '🟣',
          notes: 'Iniciado desde Command Palette (Ctrl+K)',
        });
        if (onRefreshData) onRefreshData();
        onClose();
      },
    },
    {
      id: 'act_creko_prod',
      category: 'Actividad Actual',
      title: 'Iniciar: Creko — Producción & Máquinas',
      subtitle: 'Taller, plóter y corte',
      icon: '🏭',
      action: async () => {
        await activityService.startActivity({
          title: 'Creko — Producción & Máquinas',
          category: 'creko',
          categoryLabel: 'CREKO',
          icon: '🏭',
          notes: 'Iniciado desde Command Palette',
        });
        if (onRefreshData) onRefreshData();
        onClose();
      },
    },
    {
      id: 'act_burger',
      category: 'Actividad Actual',
      title: 'Iniciar: Burger Palusa — Diseño & Pantallas',
      subtitle: 'Cartelería, indumentaria y packaging ($300 pend.)',
      icon: '🍔',
      action: async () => {
        await activityService.startActivity({
          title: 'Burger Palusa — Diseño & Pantallas',
          category: 'burger_palusa',
          categoryLabel: 'BURGER PALUSA',
          icon: '🍔',
          notes: 'Iniciado desde Command Palette',
        });
        if (onRefreshData) onRefreshData();
        onClose();
      },
    },
    {
      id: 'gym_log',
      category: 'Cuerpo & Hábitos',
      title: '¿Fuiste al Gym? Registrar entrenamiento de fuerza',
      subtitle: 'Series, ejercicios y peso',
      icon: '🏋️‍♂️',
      action: () => {
        onTriggerGym();
        onClose();
      },
    },
    {
      id: 'run_log',
      category: 'Cuerpo & Hábitos',
      title: '¿Saliste a correr? Anotar km y ritmo',
      subtitle: 'Kilómetros, tiempo y ritmo medio',
      icon: '🏃‍♂️',
      action: () => {
        onTriggerRun();
        onClose();
      },
    },
    {
      id: 'skate_log',
      category: 'Cuerpo & Hábitos',
      title: '¿Saliste en skate? Registrar sesión de street',
      subtitle: 'Spots de Logroño, trucos y estilo',
      icon: '🛹',
      action: () => {
        onTriggerSkate();
        onClose();
      },
    },
    {
      id: 'mobile_sync',
      category: 'Conexión PC ⇄ Celular',
      title: 'Vinculación Celular: Escanear QR & Probar Ping',
      subtitle: 'Sincronización en vivo con iPhone (Cerebro Único)',
      icon: '📱',
      action: () => {
        onOpenMobileCompanion();
        onClose();
      },
    },
    {
      id: 'ping_phone',
      category: 'Conexión PC ⇄ Celular',
      title: 'Hacer sonar / vibrar mi celular (Ping instantáneo)',
      subtitle: 'Emite señal SSE al iPhone de Fran',
      icon: '🔔',
      action: async () => {
        await cerebroSync.sendPing('Computadora de Fran (Ctrl+K)');
        onClose();
      },
    },
    {
      id: 'new_tx',
      category: 'Dinero & Finanzas',
      title: 'Registrar nuevo ingreso o gasto (Caja)',
      subtitle: 'Sumar o restar dinero de las cuentas de Logroño',
      icon: '💶',
      action: () => {
        onOpenNewTransaction();
        onClose();
      },
    },
    {
      id: 'new_postit',
      category: 'Organización',
      title: 'Crear nuevo Post-it rápido',
      subtitle: 'Anotar idea, pendiente o cobro',
      icon: '📝',
      action: () => {
        onOpenNewPostIt();
        onClose();
      },
    },
    {
      id: 'nav_inicio',
      category: 'Navegación',
      title: 'Ir a Inicio (Centro de Control)',
      subtitle: 'Saludo, clima, hora y actividad actual',
      icon: '⌂',
      action: () => {
        onNavigate('dashboard');
        onClose();
      },
    },
    {
      id: 'nav_jarvis',
      category: 'Navegación',
      title: 'Abrir ✦ JARVIS Asistente',
      subtitle: 'Consultar contexto, finanzas e inteligencia',
      icon: '✦',
      action: () => {
        onNavigate('chat');
        onClose();
      },
    },
    {
      id: 'nav_burger',
      category: 'Navegación',
      title: 'Ir a Proyecto Burger Palusa',
      subtitle: 'Entregables, post-its y cobro de 300 $',
      icon: '🍔',
      action: () => {
        onNavigate('burger_palusa');
        onClose();
      },
    },
    {
      id: 'nav_creko',
      category: 'Navegación',
      title: 'Ir a Creko OS',
      subtitle: 'Clientes, presupuestos y producción',
      icon: '🟣',
      action: () => {
        onNavigate('creko');
        onClose();
      },
    },
    {
      id: 'nav_changas',
      category: 'Navegación',
      title: 'Ir a Changas & Trabajo',
      subtitle: 'Horas trabajadas y clientes',
      icon: '💼',
      action: () => {
        onNavigate('changas');
        onClose();
      },
    },
    {
      id: 'nav_life_xp',
      category: 'JARVIS Life XP',
      title: 'Abrir Jarvis Life XP (Sistema RPG, Misiones y Rachas)',
      subtitle: 'Nivel, XP, vidas, misiones diarias/semanales y configuración',
      icon: '⚡',
      action: () => {
        onNavigate('life_xp');
        onClose();
      },
    },
  ];

  const filtered = actions.filter((a) => {
    const q = query.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.subtitle.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );
  });

  const handleSelect = (idx: number) => {
    const item = filtered[idx];
    if (item) item.action();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-fade-in">
      <div className="bg-[#0F172A] border border-blue-500/40 rounded-3xl w-full max-w-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                handleSelect(selectedIndex);
              }
            }}
            placeholder="¿Qué querés hacer? (Ej: gym, creko, correr, changa, ping...)"
            className="flex-1 bg-transparent text-white text-base font-semibold placeholder:text-slate-500 focus:outline-none"
            autoFocus
          />
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
            <span>ESC para cerrar</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-sm">
              No se encontraron acciones con &quot;{query}&quot;. Probá con &quot;gym&quot;, &quot;creko&quot; o &quot;ping&quot;.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(idx)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3.5 py-3 rounded-2xl cursor-pointer flex items-center justify-between gap-3 transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 border border-blue-500/50 text-white shadow-sm'
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 shrink-0">
                    {isSelected && (
                      <span className="text-[10px] font-mono font-bold bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded border border-blue-400/40">
                        Enter ↵
                      </span>
                    )}
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : 'text-slate-600'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>↑↓ Navegar</span>
            <span>↵ Ejecutar</span>
            <span>ESC Salir</span>
          </div>
          <div className="flex items-center gap-1 text-blue-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>JARVIS Desktop Command Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
