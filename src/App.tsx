import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { ChatView } from './components/ChatView';
import { TransactionsView } from './components/TransactionsView';
import { AccountsView } from './components/AccountsView';
import { ProjectsView } from './components/ProjectsView';
import { GoalsReserveView } from './components/GoalsReserveView';
import { MemorySettingsView } from './components/MemorySettingsView';
import { JarvisBoardView } from './components/JarvisBoardView';
import { TasksView } from './components/TasksView';
import { CalendarView } from './components/CalendarView';
import { TransactionModal } from './components/TransactionModal';
import { TransferModal } from './components/TransferModal';
import { PendingIncomeModal } from './components/PendingIncomeModal';
import { FutureExpenseModal } from './components/FutureExpenseModal';
import { PostItModal } from './components/PostItModal';
import { TaskModal } from './components/TaskModal';
import { CrekoOSView } from './components/CrekoOSView';
import { SpainProcessView } from './components/SpainProcessView';
import { ChangasView } from './components/ChangasView';
import { CustomModulesView } from './components/CustomModulesView';
import { WhatToDoModal } from './components/WhatToDoModal';
import { MakeMoneyModal } from './components/MakeMoneyModal';
import { DailyCheckinModal } from './components/DailyCheckinModal';
import { DesignerSettingsModal } from './components/DesignerSettingsModal';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { DayClosingModal } from './components/DayClosingModal';
import { QuickChangaModal } from './components/QuickChangaModal';
import { HealthView } from './components/HealthView';
import { InversionesFinanzasView } from './components/InversionesFinanzasView';
import { BurgerPalusaView } from './components/BurgerPalusaView';
import { MobileCompanionModal } from './components/MobileCompanionModal';
import { MobileQuickActionBar } from './components/MobileQuickActionBar';
import { CommandPalette } from './components/CommandPalette';
import { MobileSyncHubView } from './components/MobileSyncHubView';
import { JarvisLifeXpView } from './components/JarvisLifeXpView';
import { TobaccoControlModal } from './components/TobaccoControlModal';
import { NfcManagerModal } from './components/NfcManagerModal';
import { cerebroSync, SyncEvent } from './services/cerebroSyncService';
import { activityService } from './services/activityService';
import { api } from './services/api';
import {
  FinancialSummary,
  Account,
  Transaction,
  Category,
  Project,
  PendingIncome,
  FutureExpense,
  Reserve,
  FinancialGoal,
  UserMemory,
  ChatMessage,
  PostIt,
  Task,
  CalendarUnifiedItem,
  PostItColorPriority,
  Habit,
  DailyCheckin,
  CrekoLead,
  CrekoQuote,
  GoogleMapsOpportunity,
  CrekoProductionOrder,
  CrekoContentItem,
  SpainProcessDoc,
  Mission,
  JarvisSettings,
  Changa,
  CustomAiModule,
  DayClosing,
  CurrentActivity,
  RpgState,
} from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('month');

  // Core state
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pendingIncomes, setPendingIncomes] = useState<PendingIncome[]>([]);
  const [futureExpenses, setFutureExpenses] = useState<FutureExpense[]>([]);
  const [reserve, setReserve] = useState<Reserve | null>(null);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [memory, setMemory] = useState<UserMemory[]>([]);

  // JARVIS OS: Post-It, Task & Calendar state
  const [postits, setPostIts] = useState<PostIt[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [calendarItems, setCalendarItems] = useState<CalendarUnifiedItem[]>([]);

  // JARVIS 2.0 State
  const [habits, setHabits] = useState<Habit[]>([]);
  const [crekoLeads, setCrekoLeads] = useState<CrekoLead[]>([]);
  const [crekoQuotes, setCrekoQuotes] = useState<CrekoQuote[]>([]);
  const [crekoOpportunities, setCrekoOpportunities] = useState<GoogleMapsOpportunity[]>([]);
  const [crekoProduction, setCrekoProduction] = useState<CrekoProductionOrder[]>([]);
  const [crekoContent, setCrekoContent] = useState<CrekoContentItem[]>([]);
  const [changas, setChangas] = useState<Changa[]>([]);
  const [customModules, setCustomModules] = useState<CustomAiModule[]>([]);
  const [dayClosings, setDayClosings] = useState<DayClosing[]>([]);
  const [spainDocs, setSpainDocs] = useState<SpainProcessDoc[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [jarvisSettings, setJarvisSettings] = useState<JarvisSettings | null>(null);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [isFutureModalOpen, setIsFutureModalOpen] = useState(false);
  const [isPostItModalOpen, setIsPostItModalOpen] = useState(false);
  const [selectedPostIt, setSelectedPostIt] = useState<PostIt | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // JARVIS 2.0 Modals
  const [isWhatToDoModalOpen, setIsWhatToDoModalOpen] = useState(false);
  const [isMakeMoneyModalOpen, setIsMakeMoneyModalOpen] = useState(false);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [isDesignerModalOpen, setIsDesignerModalOpen] = useState(false);
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
  const [isDayClosingOpen, setIsDayClosingOpen] = useState(false);
  const [isQuickChangaModalOpen, setIsQuickChangaModalOpen] = useState(false);
  const [isTobaccoModalOpen, setIsTobaccoModalOpen] = useState(false);
  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);
  const [rpg, setRpg] = useState<RpgState | null>(null);

  // Cerebro Único & Mobile Companion states
  const [isMobileCompanionOpen, setIsMobileCompanionOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [externalTriggerAction, setExternalTriggerAction] = useState<'run' | 'skate' | 'workout' | 'health' | null>(null);
  const [syncToast, setSyncToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [currentActivity, setCurrentActivity] = useState<CurrentActivity | null>(null);

  // Global Ctrl+K / Cmd+K listener for desktop OS feeling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Assistant messages state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_msg',
      role: 'assistant',
      content: `👋 **JARVIS en línea. Sistema Operativo Personal & Financiero activado.**

Principios de operación:
1. **Primero Estabilidad** → Construcción y crecimiento con base firme.
2. **Potente por dentro, simple por fuera** → Gestión unificada de finanzas, tareas, proyectos y tablero de post-its.
3. **JARVIS propone, vos confirmás** → Control absoluto de tus decisiones.

¿Qué movimiento, nota en el tablero o tarea coordinamos hoy?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load all app data in a single ultra-fast roundtrip
  const loadData = useCallback(async (currentPeriod = period) => {
    setIsRefreshing(true);
    try {
      const data = await api.getBootstrapData(currentPeriod);
      setSummary(data.summary);
      setAccounts(data.accounts);
      setTransactions(data.transactions);
      setCategories(data.categories);
      setProjects(data.projects);
      setPendingIncomes(data.pendingIncomes);
      setFutureExpenses(data.futureExpenses);
      setReserve(data.reserve);
      setGoals(data.goals);
      setMemory(data.memory);
      setPostIts(data.postits);
      setTasks(data.tasks);
      setCalendarItems(data.calendar);
      setHabits(data.habits);
      setCrekoLeads(data.crekoLeads);
      setCrekoQuotes(data.crekoQuotes);
      setCrekoOpportunities(data.crekoOpportunities);
      setSpainDocs(data.spainDocs);
      setMissions(data.missions);
      setJarvisSettings(data.settings);
      setChangas(data.changas);
      setCrekoProduction(data.crekoProduction);
      setCrekoContent(data.crekoContent);
      setCustomModules(data.customModules);
      setDayClosings(data.dayClosings);
      if (data.rpg) setRpg(data.rpg);

      try {
        const act = await activityService.getCurrentActivity();
        setCurrentActivity(act);
      } catch {}
    } catch (err) {
      console.error('Error fetching data from JARVIS server:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    loadData(period);
  }, [loadData, period]);

  // NFC Quick Access Detector via URL (?nfc=gym | reading | smoke | finance | work)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const nfcAction = params.get('nfc');
    if (nfcAction) {
      window.history.replaceState({}, '', window.location.pathname);
      if (nfcAction === 'gym') {
        setCurrentView('dashboard');
        setExternalTriggerAction('workout');
        api.recordRpgAction('Entrenamiento Gimnasio (NFC)', 100, 'NFC Tag Gimnasio escaneado').then(() => loadData());
      } else if (nfcAction === 'reading') {
        setCurrentView('dashboard');
        api.recordRpgAction('Lectura 20 min (NFC)', 100, 'NFC Tag Lectura escaneado').then(() => loadData());
      } else if (nfcAction === 'smoke') {
        setIsTobaccoModalOpen(true);
      } else if (nfcAction === 'finance') {
        setIsTxModalOpen(true);
      } else if (nfcAction === 'work') {
        setCurrentView('tasks');
        activityService.startActivity({
          title: 'Bloque de Trabajo Enfocado (NFC)',
          category: 'trabajo',
          icon: '💼',
          categoryLabel: 'TRABAJO',
          categoryColor: '#3b82f6',
        }).then(() => loadData());
      }
    }
  }, [loadData]);

  // Subscribe to real-time sync events from companion device
  useEffect(() => {
    const unsub = cerebroSync.subscribe((event: SyncEvent) => {
      setSyncToast({ message: `⚡ Cerebro Sincronizado: ${event.label}`, visible: true });
      loadData();
      const timer = setTimeout(() => {
        setSyncToast((prev) => ({ ...prev, visible: false }));
      }, 4000);
      return () => clearTimeout(timer);
    });
    return () => unsub();
  }, [loadData]);

  // Quick Chat trigger
  const handleQuickChat = async (promptText: string) => {
    setCurrentView('chat');
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await api.sendChatMessage(promptText);
      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        proposal: response.proposal,
        actionDetails: response.actionDetails,
        learningProposal: response.learningProposal,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      loadData();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: 'Ocurrió un error al procesar la solicitud con JARVIS.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  // Post-It Actions
  const handleSavePostIt = async (data: any) => {
    if (selectedPostIt) {
      await api.updatePostIt(selectedPostIt.id, data);
    } else {
      await api.createPostIt(data);
    }
    loadData();
  };

  const handleDeletePostIt = async (id: string) => {
    await api.deletePostIt(id);
    loadData();
  };

  const handleTrashPostIt = async (id: string, reason: 'completed' | 'discarded' = 'completed') => {
    await api.trashPostIt(id, reason);
    loadData();
  };

  const handleRestorePostIt = async (id: string) => {
    await api.restorePostIt(id);
    loadData();
  };

  const handleEmptyPostItTrash = async () => {
    await api.emptyPostItTrash();
    loadData();
  };

  const handleTogglePostItChecklist = async (postItId: string, itemId: string) => {
    await api.togglePostItChecklist(postItId, itemId);
    loadData();
  };

  const handleConvertPostItToTask = async (id: string) => {
    await api.convertPostItToTask(id);
    loadData();
  };

  const handleQuickCreatePostIt = async (data: {
    title: string;
    colorPriority: PostItColorPriority;
    moneyAmount?: number;
    projectId?: string;
  }) => {
    await api.createPostIt({
      ...data,
      status: 'active',
      date: new Date().toISOString().split('T')[0],
    });
    loadData();
  };

  const handleUpdatePostItInline = async (id: string, updates: Partial<PostIt>) => {
    await api.updatePostIt(id, updates);
    loadData();
  };

  // Task Actions
  const handleSaveTask = async (data: any) => {
    if (selectedTask) {
      await api.updateTask(selectedTask.id, data);
    } else {
      await api.createTask(data);
    }
    loadData();
  };

  const handleDeleteTask = async (id: string) => {
    await api.deleteTask(id);
    loadData();
  };

  const handleToggleTaskStatus = async (id: string) => {
    await api.toggleTaskStatus(id);
    loadData();
  };

  const handleQuickCreateTask = async (data: {
    title: string;
    priority: any;
    dueDate?: string;
    projectId?: string;
  }) => {
    await api.createTask({
      ...data,
      status: 'todo',
    });
    loadData();
  };

  // Habit Actions
  const handleToggleHabit = async (id: string) => {
    await api.toggleHabit(id);
    loadData();
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 flex flex-col font-sans selection:bg-blue-600 selection:text-white max-w-full overflow-x-hidden relative">
      {/* Real-time Sync Toast Notification between Mobile & Desktop */}
      {syncToast.visible && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 animate-bounce bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl border border-blue-400/40 flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{syncToast.message}</span>
        </div>
      )}

      {/* Desktop Sidebar (Fixed Left) */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        summary={summary}
        currentActivity={currentActivity}
        onOpenNewTransaction={() => setIsTxModalOpen(true)}
        onOpenNewPostIt={() => {
          setSelectedPostIt(null);
          setIsPostItModalOpen(true);
        }}
        onOpenMobileCompanion={() => setIsMobileCompanionOpen(true)}
        onTriggerSkate={() => {
          setCurrentView('dashboard');
          setExternalTriggerAction('skate');
        }}
        onTriggerRun={() => {
          setCurrentView('dashboard');
          setExternalTriggerAction('run');
        }}
        onTriggerWorkout={() => {
          setCurrentView('dashboard');
          setExternalTriggerAction('workout');
        }}
      />

      {/* Main Content Layout with Left Padding for Desktop Sidebar */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 transition-all">
        {/* Clean Top Header (Status, Clock, Quick Actions - NO DUPLICATE NAV LINKS) */}
        <TopHeader
          currentView={currentView}
          setCurrentView={setCurrentView}
          summary={summary}
          currentActivity={currentActivity}
          onRefresh={() => loadData()}
          onOpenNewTransaction={() => setIsTxModalOpen(true)}
          onOpenNewPostIt={() => {
            setSelectedPostIt(null);
            setIsPostItModalOpen(true);
          }}
          onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
          onOpenDayClosing={() => setIsDayClosingOpen(true)}
          onOpenMobileCompanion={() => setIsMobileCompanionOpen(true)}
          onOpenHealthSync={() => setCurrentView('health')}
          onOpenActivityModal={() => setCurrentView('dashboard')}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          isRefreshing={isRefreshing}
        />

        {/* Main View Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 pb-24 md:pb-12 overflow-x-hidden">
          {currentView === 'dashboard' && (
            <DashboardView
              summary={summary}
              projects={projects}
              goals={goals}
              postits={postits}
              tasks={tasks}
              changas={changas}
              currentActivity={currentActivity}
              rpg={rpg}
              period={period}
              setPeriod={(newP) => {
                setPeriod(newP);
                loadData(newP);
              }}
              onNavigate={setCurrentView}
              onQuickChat={handleQuickChat}
              onRefreshData={() => loadData()}
              onOpenNewTransaction={() => setIsTxModalOpen(true)}
              onOpenNewPostIt={() => {
                setSelectedPostIt(null);
                setIsPostItModalOpen(true);
              }}
              onOpenTobaccoModal={() => setIsTobaccoModalOpen(true)}
              onOpenNfcModal={() => setIsNfcModalOpen(true)}
              externalTriggerAction={externalTriggerAction}
              onClearTrigger={() => setExternalTriggerAction(null)}
            />
          )}

          {(currentView === 'cuerpo_skate' || currentView === 'cuerpo_run' || currentView === 'cuerpo_gym') && (
            <DashboardView
              summary={summary}
              projects={projects}
              goals={goals}
              postits={postits}
              tasks={tasks}
              changas={changas}
              rpg={rpg}
              period={period}
              setPeriod={(newP) => {
                setPeriod(newP);
                loadData(newP);
              }}
              onNavigate={setCurrentView}
              onQuickChat={handleQuickChat}
              onRefreshData={() => loadData()}
              onOpenNewTransaction={() => setIsTxModalOpen(true)}
              onOpenNewPostIt={() => {
                setSelectedPostIt(null);
                setIsPostItModalOpen(true);
              }}
              onOpenTobaccoModal={() => setIsTobaccoModalOpen(true)}
              onOpenNfcModal={() => setIsNfcModalOpen(true)}
              externalTriggerAction={
                currentView === 'cuerpo_skate'
                  ? 'skate'
                  : currentView === 'cuerpo_run'
                  ? 'run'
                  : 'workout'
              }
              onClearTrigger={() => setCurrentView('dashboard')}
            />
          )}

          {currentView === 'creko' && (
            <CrekoOSView
              leads={crekoLeads}
              quotes={crekoQuotes}
              opportunities={crekoOpportunities}
              productionOrders={crekoProduction}
              contentItems={crekoContent}
              onRefresh={() => loadData()}
              onOpenNewTransaction={() => setIsTxModalOpen(true)}
            />
          )}

          {currentView === 'burger_palusa' && (
            <BurgerPalusaView
              postits={postits}
              tasks={tasks}
              onRefreshData={() => loadData()}
              onOpenNewPostIt={() => {
                setSelectedPostIt(null);
                setIsPostItModalOpen(true);
              }}
              onOpenNewTransaction={() => setIsTxModalOpen(true)}
              onStartActivity={async (title, category, icon) => {
                await activityService.startActivity({
                  title,
                  category,
                  icon,
                  categoryLabel: 'BURGER PALUSA',
                  categoryColor: '#f97316',
                });
                loadData();
              }}
            />
          )}

          {currentView === 'changas' && (
            <ChangasView
              changas={changas}
              accounts={accounts}
              onRefreshData={() => loadData()}
            />
          )}

          {currentView === 'custom_modules' && (
            <CustomModulesView
              customModules={customModules}
              onRefreshData={() => loadData()}
            />
          )}

          {currentView === 'spain_process' && (
            <SpainProcessView docs={spainDocs} onRefresh={() => loadData()} />
          )}

          {currentView === 'postits' && (
            <JarvisBoardView
              postits={postits}
              projects={projects}
              onOpenNewPostIt={() => {
                setSelectedPostIt(null);
                setIsPostItModalOpen(true);
              }}
              onEditPostIt={(p) => {
                setSelectedPostIt(p);
                setIsPostItModalOpen(true);
              }}
              onDeletePostIt={handleDeletePostIt}
              onToggleChecklist={handleTogglePostItChecklist}
              onConvertToTask={handleConvertPostItToTask}
              onOpenNewTransactionWithPostIt={(p) => {
                setIsTxModalOpen(true);
              }}
              onRefreshData={() => loadData()}
              onQuickCreatePostIt={handleQuickCreatePostIt}
              onUpdatePostItInline={handleUpdatePostItInline}
              onTrashPostIt={handleTrashPostIt}
              onRestorePostIt={handleRestorePostIt}
              onEmptyTrash={handleEmptyPostItTrash}
            />
          )}

          {currentView === 'tasks' && (
            <TasksView
              tasks={tasks}
              projects={projects}
              onOpenNewTask={() => {
                setSelectedTask(null);
                setIsTaskModalOpen(true);
              }}
              onEditTask={(t) => {
                setSelectedTask(t);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onToggleTaskStatus={handleToggleTaskStatus}
              onQuickCreateTask={handleQuickCreateTask}
              onOpenNewTransaction={() => setIsTxModalOpen(true)}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView
              items={calendarItems}
              onOpenNewTask={() => {
                setSelectedTask(null);
                setIsTaskModalOpen(true);
              }}
              onOpenNewPostIt={() => {
                setSelectedPostIt(null);
                setIsPostItModalOpen(true);
              }}
              onOpenNewTransaction={() => setIsTxModalOpen(true)}
              onRefreshData={() => loadData()}
            />
          )}

          {currentView === 'chat' && (
            <ChatView
              messages={messages}
              setMessages={setMessages}
              accounts={accounts}
              categories={categories}
              projects={projects}
              onRefreshData={() => loadData()}
            />
          )}

          {currentView === 'inversiones' && (
            <InversionesFinanzasView
              initialTab="regla4060"
              summary={summary}
              accounts={accounts}
              transactions={transactions}
              pendingIncomes={pendingIncomes}
              futureExpenses={futureExpenses}
              projects={projects}
              onRefreshData={() => loadData()}
              onOpenNewTransaction={() => setIsTxModalOpen(true)}
              onOpenNewPendingIncome={() => setIsPendingModalOpen(true)}
            />
          )}

          {(currentView === 'finances' || currentView === 'transactions') && (
            <InversionesFinanzasView
              initialTab="movimientos"
              summary={summary}
              accounts={accounts}
              transactions={transactions}
              pendingIncomes={pendingIncomes}
              futureExpenses={futureExpenses}
              projects={projects}
              onRefreshData={() => loadData()}
              onOpenNewTransaction={() => setIsTxModalOpen(true)}
              onOpenNewPendingIncome={() => setIsPendingModalOpen(true)}
            />
          )}

          {currentView === 'accounts' && (
            <AccountsView
              accounts={accounts}
              onRefreshData={() => loadData()}
              onOpenTransfer={() => setIsTransferModalOpen(true)}
            />
          )}

          {currentView === 'projects' && (
            <ProjectsView
              projects={projects}
              transactions={transactions}
              onRefreshData={() => loadData()}
              onOpenNewTransaction={() => setIsTxModalOpen(true)}
            />
          )}

          {currentView === 'goals' && (
            <GoalsReserveView
              reserve={reserve}
              goals={goals}
              accounts={accounts}
              onRefreshData={() => loadData()}
            />
          )}

          {currentView === 'settings' && (
            <MemorySettingsView
              memory={memory}
              categories={categories}
              accounts={accounts}
              projects={projects}
              onRefreshData={() => loadData()}
            />
          )}

          {currentView === 'health' && (
            <HealthView onOpenCheckin={() => setIsCheckinModalOpen(true)} />
          )}

          {currentView === 'vinculacion_celular' && (
            <MobileSyncHubView
              onRefreshData={() => loadData()}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'life_xp' && (
            <JarvisLifeXpView
              rpg={rpg}
              onRefreshRpg={() => loadData()}
              onOpenTobaccoModal={() => setIsTobaccoModalOpen(true)}
              onOpenNfcModal={() => setIsNfcModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Mobile-first bottom navigation bar & Quick Action bar */}
      <MobileQuickActionBar
        onOpenSkate={() => {
          setCurrentView('dashboard');
          setExternalTriggerAction('skate');
        }}
        onOpenRun={() => {
          setCurrentView('dashboard');
          setExternalTriggerAction('run');
        }}
        onOpenWorkout={() => {
          setCurrentView('dashboard');
          setExternalTriggerAction('workout');
        }}
        onOpenHealth={() => {
          setCurrentView('dashboard');
          setExternalTriggerAction('health');
        }}
        onOpenPostIt={() => {
          setSelectedPostIt(null);
          setIsPostItModalOpen(true);
        }}
        onNavigateFinances={() => setCurrentView('finances')}
      />

      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        accounts={accounts}
        categories={categories}
        projects={projects}
        onSuccess={() => loadData()}
        onCategoryCreated={(newCat) => {
          setCategories((prev) => (prev.some((c) => c.id === newCat.id) ? prev : [...prev, newCat]));
          loadData();
        }}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        accounts={accounts}
        onSuccess={() => loadData()}
      />

      <PendingIncomeModal
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        projects={projects}
        onSuccess={() => loadData()}
      />

      <FutureExpenseModal
        isOpen={isFutureModalOpen}
        onClose={() => setIsFutureModalOpen(false)}
        categories={categories}
        projects={projects}
        onSuccess={() => loadData()}
        onCategoryCreated={(newCat) => {
          setCategories((prev) => (prev.some((c) => c.id === newCat.id) ? prev : [...prev, newCat]));
          loadData();
        }}
      />

      <PostItModal
        isOpen={isPostItModalOpen}
        onClose={() => setIsPostItModalOpen(false)}
        postIt={selectedPostIt}
        projects={projects}
        onSave={handleSavePostIt}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        projects={projects}
        onSave={handleSaveTask}
      />

      {/* JARVIS 2.0 Strategic Modals */}
      <WhatToDoModal
        isOpen={isWhatToDoModalOpen}
        onClose={() => setIsWhatToDoModalOpen(false)}
        onSelectAction={(action) => {
          setIsWhatToDoModalOpen(false);
          handleQuickChat(`JARVIS, organicemos la siguiente acción prioritaria del día: ${action}`);
        }}
      />

      <MakeMoneyModal
        isOpen={isMakeMoneyModalOpen}
        onClose={() => setIsMakeMoneyModalOpen(false)}
        onSelectOpportunity={(opp) => {
          setIsMakeMoneyModalOpen(false);
          handleQuickChat(`JARVIS, activemos esta vía para generar ingresos hoy: ${opp}`);
        }}
      />

      <DailyCheckinModal
        isOpen={isCheckinModalOpen}
        onClose={() => setIsCheckinModalOpen(false)}
        habits={habits}
        onSuccess={() => loadData()}
      />

      {jarvisSettings && (
        <DesignerSettingsModal
          isOpen={isDesignerModalOpen}
          onClose={() => setIsDesignerModalOpen(false)}
          settings={jarvisSettings}
          onSettingsUpdated={async () => {
            loadData();
          }}
        />
      )}

      {/* JARVIS 2.0 Ticket OCR & Day Closing Modals */}
      <ReceiptScannerModal
        isOpen={isReceiptScannerOpen}
        onClose={() => setIsReceiptScannerOpen(false)}
        accounts={accounts}
        categories={categories}
        onSuccess={() => loadData()}
      />

      <DayClosingModal
        isOpen={isDayClosingOpen}
        onClose={() => setIsDayClosingOpen(false)}
        tasks={tasks}
        onSuccess={() => loadData()}
      />

      <QuickChangaModal
        isOpen={isQuickChangaModalOpen}
        onClose={() => setIsQuickChangaModalOpen(false)}
        accounts={accounts}
        onSuccess={() => loadData()}
      />

      <MobileCompanionModal
        isOpen={isMobileCompanionOpen}
        onClose={() => setIsMobileCompanionOpen(false)}
      />

      <TobaccoControlModal
        isOpen={isTobaccoModalOpen}
        onClose={() => setIsTobaccoModalOpen(false)}
        onLogged={() => loadData()}
      />

      <NfcManagerModal
        isOpen={isNfcModalOpen}
        onClose={() => setIsNfcModalOpen(false)}
        onTriggerAction={(type) => {
          if (type === 'gym') {
            setCurrentView('dashboard');
            setExternalTriggerAction('workout');
            loadData();
          } else if (type === 'smoke') {
            setIsNfcModalOpen(false);
            setIsTobaccoModalOpen(true);
          } else if (type === 'finance') {
            setIsNfcModalOpen(false);
            setIsTxModalOpen(true);
          } else if (type === 'work') {
            setCurrentView('tasks');
            loadData();
          } else if (type === 'reading') {
            setCurrentView('dashboard');
            loadData();
          }
        }}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setCurrentView}
        onOpenNewTransaction={() => setIsTxModalOpen(true)}
        onOpenNewPostIt={() => {
          setSelectedPostIt(null);
          setIsPostItModalOpen(true);
        }}
        onOpenMobileCompanion={() => setIsMobileCompanionOpen(true)}
        onTriggerGym={() => {
          setCurrentView('dashboard');
          setExternalTriggerAction('workout');
        }}
        onTriggerRun={() => {
          setCurrentView('dashboard');
          setExternalTriggerAction('run');
        }}
        onTriggerSkate={() => {
          setCurrentView('dashboard');
          setExternalTriggerAction('skate');
        }}
        onRefreshData={() => loadData()}
      />
    </div>
  );
}
