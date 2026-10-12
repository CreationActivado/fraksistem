import {
  Account,
  CalendarUnifiedItem,
  Category,
  Changa,
  CrekoContentItem,
  CrekoLead,
  CrekoProductionOrder,
  CrekoQuote,
  CustomAiModule,
  DailyCheckin,
  DayClosing,
  DetectedReceipt,
  FinancialGoal,
  FinancialSummary,
  FutureExpense,
  GoogleMapsOpportunity,
  Habit,
  JarvisSettings,
  Mission,
  PendingIncome,
  PostIt,
  Project,
  Reserve,
  SpainProcessDoc,
  Task,
  Transaction,
  UndoableAction,
  UserMemory,
  HealthDailySummary,
  HealthConnectionStatus,
  SpotifyState,
  WeatherOutfitReport,
  AppWelcomeReport,
  TimeBlock,
  TimeBlockExecutionLog,
  TimeBlockStatus,
  RpgState,
  SmokeLogEntry,
  RpgMissionItem,
  RpgConfig,
} from '../types';

export const api = {
  // Ultra-fast single-roundtrip bootstrap (collapses 24 network calls into 1)
  async getBootstrapData(period: string = 'month') {
    const res = await fetch(`/api/app/bootstrap?period=${period}`);
    if (!res.ok) throw new Error('Error al cargar datos bootstrap');
    return res.json();
  },
  // Post-It Intelligence System
  async getPostIts(): Promise<PostIt[]> {
    const res = await fetch('/api/postits');
    if (!res.ok) throw new Error('Error al obtener post-its');
    return res.json();
  },

  async createPostIt(data: Omit<PostIt, 'id' | 'createdAt' | 'updatedAt'>): Promise<PostIt> {
    const res = await fetch('/api/postits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear post-it');
    return res.json();
  },

  async updatePostIt(id: string, updates: Partial<PostIt>): Promise<PostIt> {
    const res = await fetch(`/api/postits/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar post-it');
    return res.json();
  },

  async deletePostIt(id: string): Promise<void> {
    const res = await fetch(`/api/postits/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar post-it');
  },

  async trashPostIt(id: string, reason: 'completed' | 'discarded' = 'completed'): Promise<PostIt> {
    const res = await fetch(`/api/postits/${id}/trash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error('Error al enviar post-it al tacho');
    return res.json();
  },

  async restorePostIt(id: string): Promise<PostIt> {
    const res = await fetch(`/api/postits/${id}/restore`, { method: 'POST' });
    if (!res.ok) throw new Error('Error al restaurar post-it del tacho');
    return res.json();
  },

  async emptyPostItTrash(): Promise<{ deletedCount: number }> {
    const res = await fetch('/api/postits/empty-trash', { method: 'POST' });
    if (!res.ok) throw new Error('Error al vaciar el tacho de basura');
    return res.json();
  },

  async togglePostItChecklist(id: string, itemId: string): Promise<PostIt> {
    const res = await fetch(`/api/postits/${id}/toggle-checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    });
    if (!res.ok) throw new Error('Error al actualizar checklist');
    return res.json();
  },

  async convertPostItToTask(id: string): Promise<{ task: Task; postIt: PostIt }> {
    const res = await fetch(`/api/postits/${id}/convert-to-task`, { method: 'POST' });
    if (!res.ok) throw new Error('Error al convertir post-it a tarea');
    return res.json();
  },

  async getPostItCleanupAnalysis(): Promise<any> {
    const res = await fetch('/api/postits/cleanup-analysis');
    if (!res.ok) throw new Error('Error al obtener análisis de limpieza');
    return res.json();
  },

  // Task Engine
  async getTasks(): Promise<Task[]> {
    const res = await fetch('/api/tasks');
    if (!res.ok) throw new Error('Error al obtener tareas');
    return res.json();
  },

  async createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear tarea');
    return res.json();
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar tarea');
    return res.json();
  },

  async deleteTask(id: string): Promise<void> {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar tarea');
  },

  async toggleTaskStatus(id: string): Promise<Task> {
    const res = await fetch(`/api/tasks/${id}/toggle`, { method: 'POST' });
    if (!res.ok) throw new Error('Error al alternar estado de tarea');
    return res.json();
  },

  // Unified Calendar
  async getUnifiedCalendar(): Promise<CalendarUnifiedItem[]> {
    const res = await fetch('/api/calendar/unified');
    if (!res.ok) throw new Error('Error al obtener agenda de calendario');
    return res.json();
  },
  // Summary
  async getSummary(period: 'today' | 'week' | 'month' = 'month'): Promise<FinancialSummary> {
    const res = await fetch(`/api/summary?period=${period}`);
    if (!res.ok) throw new Error('Error al obtener el resumen financiero');
    return res.json();
  },

  // Accounts
  async getAccounts(): Promise<Account[]> {
    const res = await fetch('/api/accounts');
    if (!res.ok) throw new Error('Error al obtener cuentas');
    return res.json();
  },

  async createAccount(data: Omit<Account, 'id' | 'updatedAt'>): Promise<Account> {
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear cuenta');
    return res.json();
  },

  async updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
    const res = await fetch(`/api/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar cuenta');
    return res.json();
  },

  // Transactions
  async getTransactions(filters?: {
    type?: string;
    accountId?: string;
    projectId?: string;
    categoryId?: string;
    search?: string;
    period?: string;
  }): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.append(k, v);
      });
    }
    const res = await fetch(`/api/transactions?${params.toString()}`);
    if (!res.ok) throw new Error('Error al obtener transacciones');
    return res.json();
  },

  async createTransaction(
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
  ): Promise<{ transaction: Transaction; undoAction: UndoableAction }> {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al registrar transacción');
    return res.json();
  },

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<any> {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar transacción');
    return res.json();
  },

  async deleteTransaction(id: string): Promise<void> {
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar transacción');
  },

  // Undo
  async undo(): Promise<{ success: boolean; description?: string }> {
    const res = await fetch('/api/undo', { method: 'POST' });
    if (!res.ok) throw new Error('Error al deshacer');
    return res.json();
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('Error al obtener categorías');
    return res.json();
  },

  async createCategory(
    name: string,
    subcategories: string[] = [],
    icon?: string,
    color?: string
  ): Promise<Category> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, subcategories, icon, color }),
    });
    if (!res.ok) throw new Error('Error al crear categoría');
    return res.json();
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar categoría');
    return res.json();
  },

  async deleteCategory(id: string): Promise<void> {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar categoría');
  },

  async addSubcategory(categoryId: string, name: string): Promise<void> {
    const res = await fetch(`/api/categories/${categoryId}/subcategories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Error al añadir subcategoría');
  },

  async deleteSubcategory(categoryId: string, subcategoryId: string): Promise<void> {
    const res = await fetch(`/api/categories/${categoryId}/subcategories/${subcategoryId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar subcategoría');
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error('Error al obtener proyectos');
    return res.json();
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear proyecto');
    return res.json();
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar proyecto');
    return res.json();
  },

  // Pending Income
  async getPendingIncomes(): Promise<PendingIncome[]> {
    const res = await fetch('/api/pending-incomes');
    if (!res.ok) throw new Error('Error al obtener cobros pendientes');
    return res.json();
  },

  async createPendingIncome(data: Partial<PendingIncome>): Promise<PendingIncome> {
    const res = await fetch('/api/pending-incomes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear ingreso pendiente');
    return res.json();
  },

  async markIncomeReceived(id: string, paymentMethodId: string): Promise<any> {
    const res = await fetch(`/api/pending-incomes/${id}/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethodId }),
    });
    if (!res.ok) throw new Error('Error al marcar cobro como recibido');
    return res.json();
  },

  async deletePendingIncome(id: string): Promise<void> {
    const res = await fetch(`/api/pending-incomes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar cobro pendiente');
  },

  // Future Expenses
  async getFutureExpenses(): Promise<FutureExpense[]> {
    const res = await fetch('/api/future-expenses');
    if (!res.ok) throw new Error('Error al obtener gastos futuros');
    return res.json();
  },

  async createFutureExpense(data: Partial<FutureExpense>): Promise<FutureExpense> {
    const res = await fetch('/api/future-expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear gasto futuro');
    return res.json();
  },

  async markFutureExpensePaid(id: string, paymentMethodId?: string): Promise<void> {
    const res = await fetch(`/api/future-expenses/${id}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethodId }),
    });
    if (!res.ok) throw new Error('Error al pagar gasto futuro');
  },

  async deleteFutureExpense(id: string): Promise<void> {
    const res = await fetch(`/api/future-expenses/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar gasto futuro');
  },

  // Reserve & Goals
  async getReserve(): Promise<Reserve> {
    const res = await fetch('/api/reserve');
    if (!res.ok) throw new Error('Error al obtener reserva');
    return res.json();
  },

  async updateReserve(data: Partial<Reserve>): Promise<Reserve> {
    const res = await fetch('/api/reserve', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar reserva');
    return res.json();
  },

  async getGoals(): Promise<FinancialGoal[]> {
    const res = await fetch('/api/goals');
    if (!res.ok) throw new Error('Error al obtener objetivos');
    return res.json();
  },

  async createGoal(data: Partial<FinancialGoal>): Promise<FinancialGoal> {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear objetivo');
    return res.json();
  },

  async updateGoal(id: string, updates: Partial<FinancialGoal>): Promise<FinancialGoal> {
    const res = await fetch(`/api/goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar objetivo');
    return res.json();
  },

  // User Profile & Context
  async getProfile(): Promise<any> {
    const res = await fetch('/api/profile');
    if (!res.ok) throw new Error('Error al obtener perfil');
    return res.json();
  },

  async updateProfile(updates: any): Promise<any> {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar perfil');
    return res.json();
  },

  // User Memory ("Mi Cerebro")
  async getMemory(): Promise<UserMemory[]> {
    const res = await fetch('/api/memory');
    if (!res.ok) throw new Error('Error al obtener reglas de memoria');
    return res.json();
  },

  async createMemory(data: Partial<UserMemory>): Promise<UserMemory> {
    const res = await fetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al guardar regla');
    return res.json();
  },

  async updateMemory(id: string, updates: Partial<UserMemory>): Promise<UserMemory> {
    const res = await fetch(`/api/memory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar regla');
    return res.json();
  },

  async deleteMemory(id: string): Promise<void> {
    const res = await fetch(`/api/memory/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar regla');
  },

  // Chat Assistant
  async sendChatMessage(
    message: string,
    image?: { data: string; mimeType: string; name?: string }
  ): Promise<any> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, image }),
    });
    if (!res.ok) throw new Error('Error al consultar al asistente');
    return res.json();
  },

  async getVoiceBriefing(): Promise<{
    text: string;
    energyLevel: string;
    focusMessage: string;
    keyNumbers: { balance: number; pending: number; steps: number };
  }> {
    const res = await fetch('/api/voice/briefing');
    if (!res.ok) throw new Error('Error al obtener el briefing por voz');
    return res.json();
  },

  // --- JARVIS 2.0 CLIENT SERVICES ---

  // Habits
  async getHabits(): Promise<Habit[]> {
    const res = await fetch('/api/habits');
    if (!res.ok) throw new Error('Error al obtener hábitos');
    return res.json();
  },

  async createHabit(data: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completedToday'>): Promise<Habit> {
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear hábito');
    return res.json();
  },

  async toggleHabit(id: string): Promise<Habit> {
    const res = await fetch(`/api/habits/${id}/toggle`, { method: 'POST' });
    if (!res.ok) throw new Error('Error al cambiar estado del hábito');
    return res.json();
  },

  async deleteHabit(id: string): Promise<void> {
    const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar hábito');
  },

  // Checkins / Mood
  async getCheckins(): Promise<DailyCheckin[]> {
    const res = await fetch('/api/checkins');
    if (!res.ok) throw new Error('Error al obtener check-ins');
    return res.json();
  },

  async getLatestCheckin(): Promise<DailyCheckin | null> {
    const res = await fetch('/api/checkins/latest');
    if (!res.ok) throw new Error('Error al obtener último check-in');
    return res.json();
  },

  async saveCheckin(data: Omit<DailyCheckin, 'id' | 'createdAt'>): Promise<DailyCheckin> {
    const res = await fetch('/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al guardar check-in');
    return res.json();
  },

  // Creko Leads
  async getCrekoLeads(): Promise<CrekoLead[]> {
    const res = await fetch('/api/creko/leads');
    if (!res.ok) throw new Error('Error al obtener leads de Creko');
    return res.json();
  },

  async createCrekoLead(data: Omit<CrekoLead, 'id' | 'createdAt' | 'updatedAt'>): Promise<CrekoLead> {
    const res = await fetch('/api/creko/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear lead');
    return res.json();
  },

  async updateCrekoLead(id: string, updates: Partial<CrekoLead>): Promise<CrekoLead> {
    const res = await fetch(`/api/creko/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar lead');
    return res.json();
  },

  async deleteCrekoLead(id: string): Promise<void> {
    const res = await fetch(`/api/creko/leads/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar lead');
  },

  // Creko Quotes
  async getCrekoQuotes(): Promise<CrekoQuote[]> {
    const res = await fetch('/api/creko/quotes');
    if (!res.ok) throw new Error('Error al obtener presupuestos');
    return res.json();
  },

  async createCrekoQuote(data: Omit<CrekoQuote, 'id' | 'createdAt'>): Promise<CrekoQuote> {
    const res = await fetch('/api/creko/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear presupuesto');
    return res.json();
  },

  async updateCrekoQuote(id: string, updates: Partial<CrekoQuote>): Promise<CrekoQuote> {
    const res = await fetch(`/api/creko/quotes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar presupuesto');
    return res.json();
  },

  async deleteCrekoQuote(id: string): Promise<void> {
    const res = await fetch(`/api/creko/quotes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar presupuesto');
  },

  // Creko Opportunities (Google Maps)
  async getCrekoOpportunities(): Promise<GoogleMapsOpportunity[]> {
    const res = await fetch('/api/creko/opportunities');
    if (!res.ok) throw new Error('Error al obtener oportunidades');
    return res.json();
  },

  async createCrekoOpportunity(data: Omit<GoogleMapsOpportunity, 'id' | 'createdAt'>): Promise<GoogleMapsOpportunity> {
    const res = await fetch('/api/creko/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear oportunidad');
    return res.json();
  },

  async convertOpportunity(id: string, target: 'lead' | 'task'): Promise<{ opportunity: GoogleMapsOpportunity; lead?: CrekoLead; task?: Task }> {
    const res = await fetch(`/api/creko/opportunities/${id}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target }),
    });
    if (!res.ok) throw new Error('Error al convertir oportunidad');
    return res.json();
  },

  // Spain Process Docs (Rotuprint / Regularización)
  async getSpainDocs(): Promise<SpainProcessDoc[]> {
    const res = await fetch('/api/spain-docs');
    if (!res.ok) throw new Error('Error al obtener trámites de España');
    return res.json();
  },

  async createSpainDoc(data: Omit<SpainProcessDoc, 'id' | 'updatedAt'>): Promise<SpainProcessDoc> {
    const res = await fetch('/api/spain-docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear trámite');
    return res.json();
  },

  async updateSpainDoc(id: string, updates: Partial<SpainProcessDoc>): Promise<SpainProcessDoc> {
    const res = await fetch(`/api/spain-docs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar trámite');
    return res.json();
  },

  async deleteSpainDoc(id: string): Promise<void> {
    const res = await fetch(`/api/spain-docs/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar trámite');
  },

  // Missions
  async getMissions(): Promise<Mission[]> {
    const res = await fetch('/api/missions');
    if (!res.ok) throw new Error('Error al obtener misiones');
    return res.json();
  },

  async createMission(data: Omit<Mission, 'id'>): Promise<Mission> {
    const res = await fetch('/api/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear misión');
    return res.json();
  },

  async updateMission(id: string, updates: Partial<Mission>): Promise<Mission> {
    const res = await fetch(`/api/missions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar misión');
    return res.json();
  },

  // Jarvis Settings
  async getJarvisSettings(): Promise<JarvisSettings> {
    const res = await fetch('/api/settings/jarvis');
    if (!res.ok) throw new Error('Error al obtener ajustes de JARVIS');
    return res.json();
  },

  async updateJarvisSettings(updates: Partial<JarvisSettings>): Promise<JarvisSettings> {
    const res = await fetch('/api/settings/jarvis', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar ajustes de JARVIS');
    return res.json();
  },

  // Strategy Decisions: "¿Qué hago hoy?" & "Generar Dinero"
  async getDailyPlan(): Promise<{
    topActions: Array<{
      id: string;
      type: string;
      title: string;
      amount?: number;
      urgency: string;
      reason: string;
    }>;
    blocks: Array<{
      slot: string;
      focus: string;
      tasks: string[];
    }>;
    why: string;
  }> {
    const res = await fetch('/api/strategy/daily-plan');
    if (!res.ok) throw new Error('Error al obtener plan diario');
    return res.json();
  },

  async getMakeMoneyActions(duration: '30m' | '1h' | '2h' | '4h' | 'allday'): Promise<{
    duration: string;
    actions: Array<{
      title: string;
      category: string;
      potentialAmount: number;
      estimatedTime: string;
      actionType: string;
    }>;
    estimatedPotential: number;
    message: string;
  }> {
    const res = await fetch(`/api/strategy/make-money?duration=${duration}`);
    if (!res.ok) throw new Error('Error al obtener acciones monetizables');
    return res.json();
  },

  // Receipt OCR / Gasto Detectado
  async ocrReceipt(image: string, mimeType: string = 'image/jpeg'): Promise<DetectedReceipt> {
    const res = await fetch('/api/ocr-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, mimeType }),
    });
    if (!res.ok) throw new Error('Error al procesar el ticket');
    return res.json();
  },

  // Changas
  async getChangas(): Promise<Changa[]> {
    const res = await fetch('/api/changas');
    if (!res.ok) throw new Error('Error al obtener changas');
    return res.json();
  },

  async createChanga(data: Omit<Changa, 'id' | 'createdAt'>): Promise<Changa> {
    const res = await fetch('/api/changas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al registrar changa');
    return res.json();
  },

  async toggleChangaPaid(id: string, paymentMethodId?: string): Promise<Changa> {
    const res = await fetch(`/api/changas/${id}/toggle-paid`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethodId }),
    });
    if (!res.ok) throw new Error('Error al actualizar estado de pago de la changa');
    return res.json();
  },

  async deleteChanga(id: string): Promise<void> {
    const res = await fetch(`/api/changas/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar changa');
  },

  // Creko Pilar 2: Producción
  async getCrekoProduction(): Promise<CrekoProductionOrder[]> {
    const res = await fetch('/api/creko/production');
    if (!res.ok) throw new Error('Error al obtener pedidos de producción');
    return res.json();
  },

  async createCrekoProduction(
    data: Omit<CrekoProductionOrder, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CrekoProductionOrder> {
    const res = await fetch('/api/creko/production', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear pedido de producción');
    return res.json();
  },

  async updateCrekoProduction(
    id: string,
    updates: Partial<CrekoProductionOrder>
  ): Promise<CrekoProductionOrder> {
    const res = await fetch(`/api/creko/production/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar pedido de producción');
    return res.json();
  },

  async deleteCrekoProduction(id: string): Promise<void> {
    const res = await fetch(`/api/creko/production/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar pedido de producción');
  },

  // Creko Pilar 3: Contenido
  async getCrekoContent(): Promise<CrekoContentItem[]> {
    const res = await fetch('/api/creko/content');
    if (!res.ok) throw new Error('Error al obtener items de contenido');
    return res.json();
  },

  async createCrekoContent(data: Omit<CrekoContentItem, 'id' | 'createdAt'>): Promise<CrekoContentItem> {
    const res = await fetch('/api/creko/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear item de contenido');
    return res.json();
  },

  async updateCrekoContent(id: string, updates: Partial<CrekoContentItem>): Promise<CrekoContentItem> {
    const res = await fetch(`/api/creko/content/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar item de contenido');
    return res.json();
  },

  async deleteCrekoContent(id: string): Promise<void> {
    const res = await fetch(`/api/creko/content/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar item de contenido');
  },

  // Módulos dinámicos con IA
  async getCustomModules(): Promise<CustomAiModule[]> {
    const res = await fetch('/api/custom-modules');
    if (!res.ok) throw new Error('Error al obtener módulos');
    return res.json();
  },

  async createCustomModule(data: Omit<CustomAiModule, 'id' | 'createdAt'>): Promise<CustomAiModule> {
    const res = await fetch('/api/custom-modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear módulo');
    return res.json();
  },

  async addCustomModuleItem(id: string, itemData: Record<string, any>): Promise<CustomAiModule> {
    const res = await fetch(`/api/custom-modules/${id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });
    if (!res.ok) throw new Error('Error al agregar elemento al módulo');
    return res.json();
  },

  async deleteCustomModule(id: string): Promise<void> {
    const res = await fetch(`/api/custom-modules/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar módulo');
  },

  async generateCustomModuleWithAi(prompt: string): Promise<CustomAiModule> {
    const res = await fetch('/api/custom-modules/generate-with-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error('Error al generar módulo con IA');
    return res.json();
  },

  // Cierre del Día
  async getDayClosings(): Promise<DayClosing[]> {
    const res = await fetch('/api/day-closings');
    if (!res.ok) throw new Error('Error al obtener cierres del día');
    return res.json();
  },

  async createDayClosing(data: Omit<DayClosing, 'id' | 'createdAt'>): Promise<DayClosing> {
    const res = await fetch('/api/day-closings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al registrar cierre del día');
    return res.json();
  },

  // Dispersión y Resumen Semanal
  async getDispersalAnalysis(): Promise<{
    activeCount: number;
    isDispersed: boolean;
    mainFocus: string[];
    waitingProjects: string[];
    warningMessage?: string;
    advice: string;
  }> {
    const res = await fetch('/api/dispersal-analysis');
    if (!res.ok) throw new Error('Error al obtener análisis de dispersión');
    return res.json();
  },

  async getWeekSummary(): Promise<any> {
    const res = await fetch('/api/week-summary');
    if (!res.ok) throw new Error('Error al obtener resumen semanal');
    return res.json();
  },

  // Reset database
  async resetDatabase(): Promise<void> {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Error al reiniciar base de datos');
  },

  // Health & Life (Apple HealthKit)
  async getHealthStatus(): Promise<HealthConnectionStatus> {
    const res = await fetch('/api/health/status');
    if (!res.ok) throw new Error('Error al obtener estado de salud');
    return res.json();
  },

  async getTodayHealth(date?: string): Promise<{ summary: HealthDailySummary | null; status: HealthConnectionStatus }> {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    const res = await fetch(`/api/health/today${query}`);
    if (!res.ok) throw new Error('Error al obtener métricas de salud de hoy');
    return res.json();
  },

  async getHealthHistory(days: number = 7): Promise<HealthDailySummary[]> {
    const res = await fetch(`/api/health/history?days=${days}`);
    if (!res.ok) throw new Error('Error al obtener historial de salud');
    return res.json();
  },

  async syncHealthKit(data: Partial<HealthDailySummary>): Promise<{ success: boolean; summary: HealthDailySummary; message: string }> {
    const res = await fetch('/api/healthkit/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Error al sincronizar datos de HealthKit');
    }
    return res.json();
  },

  async updateHealthTarget(targets: { dailyStepTarget?: number; weeklyWorkoutTarget?: number }): Promise<HealthConnectionStatus> {
    const res = await fetch('/api/health/target', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(targets),
    });
    if (!res.ok) throw new Error('Error al actualizar metas de salud');
    return res.json();
  },

  async disconnectHealth(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/health/disconnect', { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al desconectar Apple Salud');
    return res.json();
  },

  // --- WELCOME REPORT (OUTFIT + SPOTIFY + PENDIENTES) ---
  async getWelcomeReport(): Promise<AppWelcomeReport> {
    const res = await fetch('/api/welcome-report');
    if (!res.ok) throw new Error('Error al obtener reporte de bienvenida');
    return res.json();
  },

  // Weather & Outfit
  async getWeatherOutfit(city?: string): Promise<WeatherOutfitReport> {
    const query = city ? `?city=${encodeURIComponent(city)}` : '';
    const res = await fetch(`/api/weather-outfit${query}`);
    if (!res.ok) throw new Error('Error al obtener reporte meteorológico y de vestimenta');
    return res.json();
  },

  // Spotify Control
  async getSpotifyState(): Promise<SpotifyState> {
    const res = await fetch('/api/spotify/state');
    if (!res.ok) throw new Error('Error al obtener estado de Spotify');
    return res.json();
  },

  async updateSpotifyState(patch: Partial<SpotifyState>): Promise<SpotifyState> {
    const res = await fetch('/api/spotify/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error('Error al actualizar Spotify');
    return res.json();
  },

  async toggleSpotifyPlayback(): Promise<SpotifyState> {
    const res = await fetch('/api/spotify/toggle-play', { method: 'POST' });
    if (!res.ok) throw new Error('Error al controlar reproducción de Spotify');
    return res.json();
  },

  async getSpotifyAuthUrl(): Promise<{ configured: boolean; url: string | null; redirectUri: string; message?: string }> {
    const res = await fetch('/api/auth/spotify/url');
    if (!res.ok) throw new Error('Error al obtener URL de autenticación de Spotify');
    return res.json();
  },

  // --- TIME BLOCKING SYSTEM API ---
  async getTimeBlocks(date?: string): Promise<{
    blocks: TimeBlock[];
    currentBlock: TimeBlock | null;
    nextBlock: TimeBlock | null;
    completedCount: number;
    backlog: { id: string; title: string; area: string; reason?: string }[];
  }> {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    const res = await fetch(`/api/time-blocks${query}`);
    if (!res.ok) throw new Error('Error al obtener bloques de tiempo');
    return res.json();
  },

  async createTimeBlock(data: Partial<TimeBlock>): Promise<TimeBlock> {
    const res = await fetch('/api/time-blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear bloque de tiempo');
    return res.json();
  },

  async updateTimeBlock(id: string, updates: Partial<TimeBlock>): Promise<TimeBlock> {
    const res = await fetch(`/api/time-blocks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar bloque de tiempo');
    return res.json();
  },

  async deleteTimeBlock(id: string): Promise<boolean> {
    const res = await fetch(`/api/time-blocks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar bloque de tiempo');
    return true;
  },

  async updateTimeBlockStatus(
    id: string,
    status: TimeBlockStatus,
    resultNotes?: string,
    actualMinutes?: number
  ): Promise<{ updated: TimeBlock; nextBlock: TimeBlock | null }> {
    const res = await fetch(`/api/time-blocks/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, resultNotes, actualMinutes }),
    });
    if (!res.ok) throw new Error('Error al actualizar estado del bloque');
    return res.json();
  },

  async extendTimeBlock(id: string, minutes: number = 15): Promise<{ extendedBlock: TimeBlock; shiftedBlocks: TimeBlock[] }> {
    const res = await fetch(`/api/time-blocks/${id}/extend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minutes }),
    });
    if (!res.ok) throw new Error('Error al extender bloque');
    return res.json();
  },

  async generateDailyTimeBlocks(date?: string, forceRegenerate?: boolean): Promise<TimeBlock[]> {
    const res = await fetch('/api/time-blocks/generate-day', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, forceRegenerate }),
    });
    if (!res.ok) throw new Error('Error al generar agenda de bloques');
    return res.json();
  },

  async shiftUpcomingBlocks(fromTime: string, shiftMinutes: number = 15, date?: string): Promise<TimeBlock[]> {
    const res = await fetch('/api/time-blocks/shift-upcoming', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromTime, shiftMinutes, date }),
    });
    if (!res.ok) throw new Error('Error al reorganizar bloques');
    return res.json();
  },

  async getTimeBlockLogs(limit: number = 25): Promise<TimeBlockExecutionLog[]> {
    const res = await fetch(`/api/time-blocks/logs?limit=${limit}`);
    if (!res.ok) throw new Error('Error al obtener registro de bloques');
    return res.json();
  },

  // --- ⚡ JARVIS LIFE XP & RPG DE VIDA ---
  async getRpgState(): Promise<RpgState> {
    const res = await fetch('/api/rpg');
    if (!res.ok) throw new Error('Error al obtener estado RPG');
    return res.json();
  },

  async recordRpgAction(action: string, xpChange: number, reason: string, livesChange?: number): Promise<RpgState> {
    const res = await fetch('/api/rpg/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, xpChange, reason, livesChange }),
    });
    if (!res.ok) throw new Error('Error al registrar acción RPG');
    return res.json();
  },

  async recordSmoke(quantity: number = 1, notes?: string): Promise<{ rpg: RpgState; entry: SmokeLogEntry }> {
    const res = await fetch('/api/rpg/smoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity, notes }),
    });
    if (!res.ok) throw new Error('Error al registrar cigarrillo');
    return res.json();
  },

  async getTobaccoStats(): Promise<any> {
    const res = await fetch('/api/rpg/tobacco/stats');
    if (!res.ok) throw new Error('Error al obtener estadísticas de tabaco');
    return res.json();
  },

  async toggleRpgMission(id: string): Promise<RpgState> {
    const res = await fetch(`/api/rpg/missions/${id}/toggle`, { method: 'POST' });
    if (!res.ok) throw new Error('Error al alternar misión RPG');
    return res.json();
  },

  async createRpgMission(mission: Partial<RpgMissionItem>): Promise<RpgState> {
    const res = await fetch('/api/rpg/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mission),
    });
    if (!res.ok) throw new Error('Error al crear misión RPG');
    return res.json();
  },

  async updateRpgMission(id: string, updates: Partial<RpgMissionItem>): Promise<RpgState> {
    const res = await fetch(`/api/rpg/missions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar misión RPG');
    return res.json();
  },

  async deleteRpgMission(id: string): Promise<RpgState> {
    const res = await fetch(`/api/rpg/missions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar misión RPG');
    return res.json();
  },

  async updateRpgConfig(config: Partial<RpgConfig>): Promise<RpgConfig> {
    const res = await fetch('/api/rpg/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Error al actualizar configuración RPG');
    return res.json();
  },

  async triggerNfc(type: 'gym' | 'reading' | 'smoke' | 'work' | 'finance'): Promise<{ success: boolean; message: string; payload: any }> {
    const res = await fetch('/api/nfc/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    if (!res.ok) throw new Error('Error al disparar acción NFC');
    return res.json();
  },
};
