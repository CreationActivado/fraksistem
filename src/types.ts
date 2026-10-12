export type AccountType = 'cash' | 'bank_account' | 'debit_card' | 'credit_card' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  active: boolean;
  isReserve?: boolean;
  notes?: string;
  updatedAt: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionStatus = 'confirmed' | 'pending' | 'cancelled';
export type TransactionSource = 'manual' | 'chat' | 'receipt' | 'pending_income' | 'recurrence' | 'changa';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  categoryId?: string;
  subcategoryId?: string;
  paymentMethodId: string; // From account
  toPaymentMethodId?: string; // For transfers
  projectId?: string;
  description: string;
  date: string; // YYYY-MM-DD
  status: TransactionStatus;
  source: TransactionSource;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Subcategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  subcategories: Subcategory[];
  isCustom?: boolean;
}

export type ProjectStatus = 'active' | 'paused' | 'completed';

export interface ProjectContact {
  id: string;
  name: string;
  role?: string;
  phoneOrEmail?: string;
}

export interface ProjectDoc {
  id: string;
  title: string;
  linkOrContent: string;
  date?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  goal?: string;
  budget?: number;
  accumulatedInvestment: number;
  accumulatedIncome: number;
  accumulatedExpenses: number;
  progress: number; // 0 - 100
  notes?: string;
  nextSteps?: string[];
  contacts?: ProjectContact[];
  documents?: ProjectDoc[];
  createdAt: string;
}

export type PendingIncomeStatus = 'pending' | 'received' | 'cancelled';

export interface PendingIncome {
  id: string;
  concept: string;
  amount: number;
  expectedDate?: string;
  origin: string;
  status: PendingIncomeStatus;
  transactionId?: string;
  paymentMethodId?: string;
  notes?: string;
  createdAt: string;
}

export type FutureExpenseStatus = 'pending' | 'paid' | 'cancelled';
export type RecurrenceType = 'none' | 'weekly' | 'monthly' | 'yearly';

export interface FutureExpense {
  id: string;
  concept: string;
  amount: number;
  categoryId?: string;
  subcategoryId?: string;
  expectedDate: string;
  paymentMethodId?: string;
  recurrence?: RecurrenceType;
  status: FutureExpenseStatus;
  notes?: string;
  createdAt: string;
}

export interface Reserve {
  targetAmount: number;
  currentAmount: number;
  percentage: number;
  targetDate?: string;
  accountIds: string[];
  notes?: string;
}

export type GoalStatus = 'in_progress' | 'reached' | 'abandoned';
export type GoalPriority = 'low' | 'medium' | 'high';

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  status: GoalStatus;
  priority: GoalPriority;
  notes?: string;
  createdAt: string;
}

export type MemoryType =
  | 'preference'
  | 'alias'
  | 'category_rule'
  | 'payment_method_alias'
  | 'project_rule'
  | 'financial_rule'
  | 'recurring_pattern'
  | 'correction'
  | 'personal_workflow'
  | 'context'
  | 'work_style';

export type MemoryPriority = 'global' | 'user_preference' | 'learned_rule' | 'temporary_context';

export type MemoryClassification =
  | 'confirmed_fact' // Hecho confirmado explícitamente por el usuario
  | 'user_preference' // Preferencia de organización o comunicación
  | 'observed_pattern' // Patrón detectado con el tiempo
  | 'hypothesis' // Interpretación tentativa pendiente de confirmación
  | 'temporary_context'; // Situación actual que puede cambiar (ej. residencia en España)

export interface UserMemory {
  id: string;
  type: MemoryType;
  priority: MemoryPriority;
  classification?: MemoryClassification;
  key: string; // Trigger o palabra clave
  value: string; // Significado o valor
  targetData?: {
    categoryId?: string;
    subcategoryId?: string;
    paymentMethodId?: string;
    projectId?: string;
  };
  description: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  isTemporary?: boolean; // Marcar información como temporal
}

export type LifeStage = 'supervivencia' | 'estabilidad' | 'control' | 'generacion' | 'construccion' | 'crecimiento';

export interface UserProfile {
  id: string;
  name: string;
  mainCurrency: string;
  monthlyReserveTarget: number;
  location: string;
  lifeStage: string;
  stageProgression: LifeStage;
  incomeStructure: string;
  activeProjects: string[];
  priorities?: string[];
  operatingRules?: string[];
  communicationStyle: 'directo_practico_firme';
  preferences: {
    confirmHighExpenses: boolean;
    highExpenseThreshold: number;
    askOnAmbiguity: boolean;
    autoLearnRules: boolean;
    prioritizeReserveBeforeGrowth: boolean;
  };
}

export interface TransactionProposal {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  currency: string;
  description: string;
  categoryId?: string;
  categoryName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  paymentMethodId: string;
  paymentMethodName: string;
  projectId?: string;
  projectName?: string;
  date: string; // YYYY-MM-DD
  notes?: string;
  source: 'chat' | 'receipt' | 'pending_income';
  receiptImage?: string;
  status: 'proposed' | 'confirmed' | 'cancelled' | 'editing';
  transactionId?: string;
  pendingIncomeId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  image?: {
    data: string;
    mimeType: string;
    name?: string;
  };
  proposal?: TransactionProposal;
  postItProposal?: PostItProposal;
  taskProposal?: TaskProposal;
  timeBlockProposal?: TimeBlockProposal;
  actionDetails?: {
    actionType: string;
    transactionId?: string;
    summary?: string;
    amount?: number;
    accountName?: string;
    categoryName?: string;
    canUndo?: boolean;
  };
  learningProposal?: {
    ruleType: MemoryType;
    key: string;
    value: string;
    targetData?: {
      categoryId?: string;
      subcategoryId?: string;
      paymentMethodId?: string;
      projectId?: string;
    };
    prompt: string;
  };
  appliedModifications?: SystemModificationRecord[];
}

export interface SystemModificationRecord {
  id: string;
  type:
    | 'account_balance'
    | 'reserve_target'
    | 'user_profile'
    | 'changa'
    | 'memory'
    | 'health_data'
    | 'habit'
    | 'preference'
    | 'task'
    | 'setting';
  label: string;
  field: string;
  previousValue?: any;
  newValue: any;
  timestamp: string;
  details?: string;
}

export type StabilityLevel = 'stable' | 'tight' | 'at_risk';

export interface StabilityMetric {
  status: StabilityLevel; // 🟢 'stable' | 🟡 'tight' | 🔴 'at_risk'
  label: string; // "ESTABLE" | "AJUSTADO" | "EN RIESGO"
  badgeColor: string;
  runwayWeeks: number;
  weeklyBurnRate: number;
  reserveProgressPercent: number;
  reason: string;
  advice: string;
}

export interface CapitalBuckets {
  livingMoney: number; // Dinero para Vivir
  reserveMoney: number; // Dinero para Reserva
  projectsMoney: number; // Dinero para Proyectos
  investMoney: number; // Dinero para Invertir
  availableMoney: number; // Dinero Disponible real
}

export interface FinancialSummary {
  realBalance: number;
  pendingIncomeTotal: number;
  futureExpensesTotal: number;
  projectedPosition: number;
  reserveTarget: number;
  reserveCurrent: number;
  reservePercentage: number;
  stability: StabilityMetric;
  capitalBuckets: CapitalBuckets;
  userProfile?: UserProfile;
  periodStats: {
    period: 'today' | 'week' | 'month';
    income: number;
    expenses: number;
    netBalance: number;
  };
  accounts: Account[];
  alerts: FinancialAlert[];
  realSummary?: RealFinancialSummary;
}

export interface FinancialAlert {
  id: string;
  type: 'warning' | 'info' | 'critical' | 'success';
  title: string;
  message: string;
  date?: string;
}

export interface UndoableAction {
  id: string;
  timestamp: string;
  description: string;
  inverseAction: {
    type: 'delete_transaction' | 'restore_transaction' | 'update_balance' | 'unmark_pending_income';
    payload: any;
  };
}

// --- POST-IT INTELLIGENCE SYSTEM ---
export type PostItColorPriority = 'purple' | 'orange' | 'blue' | 'red' | 'yellow' | 'green';
// 🟣 PURPLE = Creko
// 🟠 ORANGE = Burger Palusa
// 🔵 BLUE = Sowfts (Software en desarrollo)
// 🔴 RED = Urgencias (Crítico)
// 🟡 YELLOW = Personalizado (Título libre / Notas generales)
// 🟢 GREEN = Metas & Ocio (Hábitos, meditar, metas de ahorro/ingresos)

export interface PostItChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface PostIt {
  id: string;
  title: string;
  description?: string;
  colorPriority: PostItColorPriority;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm
  projectId?: string;
  goalId?: string;
  contactName?: string;
  moneyAmount?: number;
  checklist?: PostItChecklistItem[];
  reminder?: string;
  status: 'active' | 'completed' | 'trashed' | 'archived';
  trashedAt?: string;
  completedAt?: string;
  isPinned?: boolean;
  convertedTo?: {
    type: 'task' | 'transaction' | 'pending_income' | 'future_expense';
    referenceId: string;
  };
  createdAt: string;
  updatedAt: string;
}

// --- TASK ENGINE ---
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type TaskEffort = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  projectId?: string;
  goalId?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string; // YYYY-MM-DD
  durationMinutes?: number;
  effort?: TaskEffort;
  financialImpact?: {
    type: 'income_driver' | 'expense_saver' | 'neutral';
    expectedAmount?: number;
  };
  dependency?: string;
  notes?: string;
  postItId?: string;
  createdAt: string;
  updatedAt: string;
}

// --- TIME BLOCKING ARCHITECTURE ---
export type TimeBlockArea = 'creko' | 'producto' | 'empleo' | 'changa' | 'personal' | 'organizacion';
export type TimeBlockStatus = 'pending' | 'in_progress' | 'completed' | 'moved' | 'cancelled';

export interface TimeBlock {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "08:30"
  endTime: string; // e.g. "09:00"
  area: TimeBlockArea;
  focus: string; // e.g. "Captación", "Mensajes", "Creatividad", "Producción", "Prototipo", "Búsqueda", "Gimnasio", "Presupuestos"
  title: string; // e.g. "CREKO — Captación"
  objective: string; // e.g. "Preparar prospectos y conseguir 15 nuevos locales"
  suggestedTasks: string[];
  status: TimeBlockStatus;
  resultNotes?: string; // Registro real: "18 nuevos prospectos", "25 mensajes enviados", etc.
  actualMinutes?: number;
  color: string; // hex code
  colorPriority: 'purple' | 'orange' | 'blue' | 'red' | 'yellow' | 'green';
  projectId?: string;
  isFixed?: boolean; // Bloque inamovible (reuniones con hora fija, clientes, changas)
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimeBlockExecutionLog {
  id: string;
  blockId: string;
  date: string;
  title: string;
  area: TimeBlockArea;
  plannedMinutes: number;
  actualMinutes?: number;
  status: TimeBlockStatus;
  resultNotes?: string;
  completedAt?: string;
}

// --- CALENDAR UNIFIED AGENDA ---
export interface CalendarUnifiedItem {
  id: string;
  title: string;
  type: 'future_expense' | 'pending_income' | 'task' | 'postit' | 'time_block';
  date: string; // YYYY-MM-DD
  time?: string; // e.g. "08:30–09:00"
  startTime?: string; // "08:30"
  endTime?: string; // "09:00"
  area?: string; // "creko" | "producto" | "empleo" | "changa" | "personal" | "organizacion"
  objective?: string;
  suggestedTasks?: string[];
  resultNotes?: string;
  amount?: number;
  status: string;
  color: string;
  colorPriority?: 'purple' | 'orange' | 'blue' | 'red' | 'yellow' | 'green' | string;
  referenceId: string;
  subtitle?: string;
  notes?: string;
  isUrgent?: boolean;
  isCompleted?: boolean;
  isFixed?: boolean;
  order?: number;
}

// --- PRESENCE & DASHBOARD CONFIG ---
export type PresenceMode = 'companion' | 'workstation';

export type DashboardWidgetId =
  | 'welcome_hero'
  | 'money'
  | 'quick_actions'
  | 'postits'
  | 'tasks'
  | 'projects'
  | 'goals'
  | 'calendar'
  | 'alerts'
  | 'jarvis'
  | 'checkin'
  | 'habits'
  | 'creko'
  | 'spain_process'
  | 'missions'
  | 'changas'
  | 'mi_cabeza'
  | string;

export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  label: string;
  enabled: boolean;
}

export interface PostItProposal {
  id: string;
  title: string;
  description?: string;
  colorPriority: PostItColorPriority;
  projectId?: string;
  moneyAmount?: number;
  date?: string;
  status: 'proposed' | 'confirmed' | 'cancelled';
}

export interface TaskProposal {
  id: string;
  title: string;
  projectId?: string;
  priority: TaskPriority;
  dueDate?: string;
  financialImpact?: {
    type: 'income_driver' | 'expense_saver' | 'neutral';
    expectedAmount?: number;
  };
  status: 'proposed' | 'confirmed' | 'cancelled';
}

export interface TimeBlockProposal {
  id: string;
  action: 'create' | 'modify' | 'complete' | 'move' | 'delete';
  targetBlockId?: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  area: TimeBlockArea;
  objective?: string;
  status: 'proposed' | 'confirmed' | 'cancelled';
  explanation?: string;
  previousTime?: string;
}

// --- JARVIS 2.0 ECOSYSTEM EXTENSIONS ---

export interface Habit {
  id: string;
  title: string;
  icon?: string;
  category: 'fitness' | 'mind' | 'creko' | 'habits';
  streak: number;
  completedToday: boolean;
  createdAt: string;
}

export interface DailyCheckin {
  id: string;
  date: string; // YYYY-MM-DD
  mood: number; // 0 - 10
  energy: number; // 0 - 10
  stress: number; // 0 - 10
  sleep: number; // 0 - 10
  motivation: number; // 0 - 10
  mindNotes?: string;
  worries?: string;
  habitsCompleted: string[]; // habit IDs
  createdAt: string;
}

export type CrekoLeadStatus =
  | 'lead'
  | 'contacted'
  | 'replied'
  | 'interested'
  | 'quote'
  | 'negotiation'
  | 'closed'
  | 'delivered'
  | 'followup';

export interface CrekoLead {
  id: string;
  name: string;
  company?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  source: 'google_maps' | 'instagram' | 'referral' | 'in_person' | 'other';
  status: CrekoLeadStatus;
  potentialValue: number; // €
  probability: number; // 0 - 100
  lastContactDate?: string;
  nextContactDate?: string;
  notes?: string;
  quoteId?: string;
  createdAt: string;
  updatedAt: string;
}

export type QuoteStatus = 'draft' | 'sent' | 'waiting' | 'accepted' | 'rejected' | 'expired';

export interface CrekoQuote {
  id: string;
  code: string; // ej. PRE-2026-001
  clientName: string;
  concept: string;
  amount: number;
  status: QuoteStatus;
  sentDate?: string;
  followUpDate?: string;
  notes?: string;
  needsFollowUp?: boolean;
  createdAt: string;
}

export interface GoogleMapsOpportunity {
  id: string;
  name: string;
  category: string; // ej. Bar, Gimnasio, Peluquería, Tienda
  area: string;
  potentialAmount: number;
  status: 'discovered' | 'contacted' | 'converted' | 'discarded';
  suggestedAction: string;
  phoneOrIG?: string;
  notes?: string;
  leadId?: string;
  taskId?: string;
  createdAt: string;
}

export interface SpainProcessDoc {
  id: string;
  title: string;
  category: 'rotuprint' | 'regularizacion' | 'legalizacion' | 'documentos';
  status: 'pending' | 'in_progress' | 'ready' | 'submitted' | 'resolved';
  requiresApostille?: boolean;
  dueDate?: string;
  submissionDate?: string;
  notes?: string;
  officialSource?: string;
  updatedAt: string;
}

export interface Mission {
  id: string;
  title: string;
  level: 'vida' | 'finanzas' | 'creko' | 'personal' | 'profesional';
  currentAmount: number;
  targetAmount: number;
  unit: string; // ej. '€', 'leads', 'días'
  status: 'active' | 'completed';
  deadline?: string;
  description?: string;
  nextMissionPreview?: string;
}

export type JarvisIntensity = 'silent' | 'normal' | 'proactive';

export interface JarvisSettings {
  intensity: JarvisIntensity;
  confirmHighExpenses: boolean;
  highExpenseThreshold: number;
  enableDailyCheckinReminder: boolean;
  activeModules: DashboardWidgetId[];
  userCity?: string;
  userTemperature?: string;
  userWeatherCondition?: string;
  faceRecognitionEnabled?: boolean;
}

// --- CHANGAS (INGRESOS OCASIONALES) ---
export interface Changa {
  id: string;
  title?: string;
  categoryName?: string; // 'DejaVu', 'Josu / Electricidad', o personalizada
  clientOrPerson?: string;
  client?: string;
  category?: string;
  amount: number;
  paid?: boolean;
  status?: 'pending' | 'paid';
  hours?: number;
  date: string; // YYYY-MM-DD
  paymentMethodId?: string;
  notes?: string;
  transactionId?: string;
  createdAt: string;
}

// --- CREKO PILAR 2 & 3: PRODUCCIÓN Y CONTENIDO ---
export type CrekoProductionStep =
  | 'pedido'
  | 'diseno'
  | 'archivos'
  | 'materiales'
  | 'dtf'
  | 'serigrafia'
  | 'produccion'
  | 'control'
  | 'packaging'
  | 'entrega';

export type CrekoProductionStatus =
  | 'pending'
  | 'in_progress'
  | 'in_production'
  | 'ready'
  | 'completed'
  | 'delivered';

export interface CrekoProductionOrder {
  id: string;
  clientName: string;
  product?: string;
  description?: string;
  quantity?: number;
  step?: CrekoProductionStep;
  status?: CrekoProductionStatus;
  dueDate?: string;
  deliveryDate?: string;
  assignedTo?: string;
  notes?: string;
  amount?: number;
  totalAmount?: number;
  paidAmount?: number;
  createdAt: string;
  updatedAt?: string;
}

export type CrekoContentType = 'idea' | 'historia' | 'reel' | 'post' | 'campana' | 'story' | 'carrousel' | string;
export type CrekoContentStatus =
  | 'idea'
  | 'pendiente'
  | 'guionado'
  | 'scripted'
  | 'grabado'
  | 'recorded'
  | 'editado'
  | 'edited'
  | 'publicado'
  | 'published';

export interface CrekoContentItem {
  id: string;
  title: string;
  type?: CrekoContentType;
  format?: string;
  platform?: string;
  status: CrekoContentStatus;
  scheduledDate?: string;
  publishDate?: string;
  caption?: string;
  notes?: string;
  createdAt: string;
}

// --- CIERRE DEL DÍA & RESUMEN SEMANAL ---
export interface DayClosing {
  id: string;
  date: string;
  totalSpent: number;
  totalIncome: number;
  revenueGenerated?: number;
  tasksCompleted: number;
  tasksPending: number;
  crekoProgress?: string;
  habitsScore?: number; // e.g. 5/7
  moodScore?: number;
  rating?: number;
  achievements?: string;
  notes?: string;
  whatWentWell?: string;
  whatRemains?: string;
  learning?: string;
  tomorrowFocus?: string;
  jarvisNotesForTomorrow?: string;
  createdAt: string;
}

// --- RECEIPT OCR / GASTO DETECTADO ---
export interface DetectedReceipt {
  merchant: string;
  total: number;
  date: string;
  time?: string;
  categoryId?: string;
  categoryName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  suggestedAccount: string;
  items?: { name: string; price: number }[];
  vatAmount?: number;
  confidence: number;
  rawNotes?: string;
}

// --- MÓDULOS GENERADOS CON IA ---
export interface CustomAiModuleField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'status' | 'date';
}

export interface CustomAiModule {
  id: string;
  title: string;
  icon: string;
  description: string;
  fields: CustomAiModuleField[];
  items: Record<string, any>[];
  createdAt: string;
}

// --- JARVIS HEALTH & LIFE (APPLE HEALTHKIT INTEGRATION) ---
export interface HealthWorkout {
  id: string;
  type: string; // 'Gym / Fuerza' | 'Running' | 'Caminata' | 'Ciclismo' | 'Otro'
  durationMinutes: number;
  activeEnergyKcal?: number;
  distanceKm?: number;
  startedAt?: string;
  source?: string;
}

export interface HealthDailySummary {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  steps?: number;
  walkingRunningDistanceKm?: number;
  activeEnergyKcal?: number;
  workoutCount?: number;
  workoutMinutes?: number;
  workouts?: HealthWorkout[];
  syncedAt: string;
  source: 'apple_health';
  device?: string;
  // Prepared for Phase 2:
  sleepHours?: number;
  restingHeartRate?: number;
  heartRateAverage?: number;
}

export type HealthConnectionState =
  | 'NOT_CONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'PARTIAL_ACCESS'
  | 'ERROR';

export interface HealthConnectionStatus {
  state: HealthConnectionState;
  lastSyncedAt?: string;
  device?: string; // 'iPhone' | 'Apple Watch'
  availableDataTypes: string[];
  dailyStepTarget: number;
  weeklyWorkoutTarget: number;
  errorMessage?: string;
}

// --- SPOTIFY INTEGRATION ---
export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt?: string;
  durationMs?: number;
  uri?: string;
  externalUrl?: string;
}

export interface SpotifyState {
  isConnected: boolean;
  isPlaying: boolean;
  currentTrack?: SpotifyTrack;
  playlistName?: string;
  playlistUri?: string;
  device?: string;
  profileName?: string;
  lastUpdated?: string;
}

// --- WEATHER & OUTFIT RECOMMENDATION ---
export interface WeatherOutfitReport {
  city: string;
  temperatureC: number;
  feelsLikeC: number;
  condition: string; // e.g. 'Soleado', 'Nublado', 'Lluvia leve', 'Frío', 'Ventoso'
  icon: string; // 'sun' | 'cloud-rain' | 'cloud' | 'wind' | 'snowflake'
  humidity: number;
  windSpeedKmh: number;
  outfitRecommendation: {
    title: string;
    summary: string;
    top: string;
    bottom: string;
    footwear: string;
    accessories: string;
    tip: string;
  };
}

// --- DAILY WELCOME BRIEFING (VOICE + OUTFIT + PENDIENTES + SPOTIFY) ---
export interface AppWelcomeReport {
  timestamp: string;
  weather: WeatherOutfitReport;
  pendingTasksSummary: {
    urgentCount: number;
    todayCount: number;
    moneyPendingAmount: number;
    topPriorities: string[];
  };
  spotify: SpotifyState;
  greetingText: string;
  spokenScript: string;
}

// --- ACTIVIDAD ACTUAL & TIMELINE DE VIDA (JARVIS PERSONAL OS) ---
export type ActivityCategory =
  | 'creko'
  | 'burger_palusa'
  | 'trabajo'
  | 'cuerpo'
  | 'vida'
  | 'ideas'
  | 'finanzas';

export interface CurrentActivity {
  id: string;
  title: string;
  category: ActivityCategory;
  categoryLabel: string;
  categoryColor: string;
  icon: string;
  startTime: string; // e.g. "09:12"
  startTimestamp: number;
  durationMinutes?: number;
  notes?: string;
  client?: string;
  isActive: boolean;
}

export interface TimelineEntry {
  id: string;
  time: string; // e.g. "07:18"
  date: string; // "YYYY-MM-DD"
  icon: string; // e.g. "🎯", "☀️", "🏃"
  title: string;
  category: ActivityCategory;
  duration?: string; // e.g. "42 min", "1h 46m"
  durationMinutes?: number;
  notes?: string;
  client?: string;
}

// --- SISTEMA FINANCIERO PATRIMONIO REAL ---
export interface RealFinancialSummary {
  // A) Efectivo
  cashAmount: number; // 50 €
  // B) Dinero Digital Disponible (ARQ)
  digitalAmount: number; // 32 €
  // TOTAL DISPONIBLE (Efectivo + ARQ)
  totalAvailable: number; // 82 €

  // C) Inversiones (NO disponibles para gastar)
  investments: {
    bingxEur: number; // ~80 €
    cocosUsd: number; // ~100 USD
    cocosEurApprox: number; // ~92 €
    totalEurApprox: number; // ~172 €
  };

  // D) Dinero Pendiente de Recibir / Cobrar
  pending: {
    ikualoEur: number; // 40 €
    dejavuPending: boolean; // true
    dejavuNotes: string; // 'Pendiente de confirmación'
    totalConfirmedPendingEur: number; // 40 €
  };

  // E) Total Patrimonial Real (Confirmado: Disponible + Inversiones)
  realPatrimonyConfirmedEur: number; // ~254 €
  usdToEurRate: number; // ~0.92

  // Gastos controlados
  spentToday: number;
  spentThisWeek: number;
  spentThisMonth: number;
}

// --- ⚡ JARVIS LIFE XP (SISTEMA RPG DE VIDA) ---
export interface RpgMissionItem {
  id: string;
  title: string;
  category: 'diaria' | 'semanal' | 'recuperacion';
  xp: number;
  completed: boolean;
  frequency: 'daily' | 'weekly' | 'recovery';
  createdAt?: string;
  completedAt?: string;
}

export interface RpgStreakItem {
  id: string;
  name: string;
  icon: string;
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate?: string;
}

export interface SmokeLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  timestamp: number;
  quantity: number;
  notes?: string;
  xpDeducted: number;
}

export interface RpgHistoryEntry {
  id: string;
  action: string;
  xpChange: number;
  timestamp: number;
  reason: string;
  livesChange?: number;
  createdAt: string;
}

export interface RpgConfig {
  xpValues: {
    gym: number;
    run: number;
    football: number;
    read: number;
    meditate: number;
    jobSearch: number;
    getClient: number;
    organizeTasks: number;
    smokePenalty: number;
    missImportantMission: number;
    breakStreak: number;
  };
  streakBonus: {
    threeDays: number;
    sevenDays: number;
    fourteenDays: number;
    thirtyDays: number;
  };
}

export interface RpgState {
  totalXp: number;
  level: number;
  levelName: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  lives: number;
  maxLives: number;
  streaks: RpgStreakItem[];
  dailyMissions: RpgMissionItem[];
  weeklyMissions: RpgMissionItem[];
  recoveryMissions: RpgMissionItem[];
  smokeLog: SmokeLogEntry[];
  history: RpgHistoryEntry[];
  config: RpgConfig;
  lastUpdated: string;
}

