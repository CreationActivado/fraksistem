import fs from 'fs';
import path from 'path';
import {
  Account,
  Category,
  Changa,
  CrekoContentItem,
  CrekoLead,
  CrekoProductionOrder,
  CrekoQuote,
  CustomAiModule,
  DailyCheckin,
  DayClosing,
  FinancialGoal,
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
  UserProfile,
  HealthDailySummary,
  HealthConnectionStatus,
  SpotifyState,
  WeatherOutfitReport,
  AppWelcomeReport,
  TimeBlock,
  TimeBlockExecutionLog,
  TimeBlockArea,
  TimeBlockStatus,
  CurrentActivity,
  TimelineEntry,
  ActivityCategory,
  RealFinancialSummary,
  RpgState,
  RpgMissionItem,
  RpgStreakItem,
  SmokeLogEntry,
  RpgHistoryEntry,
  RpgConfig,
} from '../src/types';

export interface DatabaseSchema {
  user: UserProfile;
  accounts: Account[];
  categories: Category[];
  projects: Project[];
  transactions: Transaction[];
  pendingIncomes: PendingIncome[];
  futureExpenses: FutureExpense[];
  reserve: Reserve;
  goals: FinancialGoal[];
  memory: UserMemory[];
  undoStack: UndoableAction[];
  postits: PostIt[];
  tasks: Task[];
  timeBlocks: TimeBlock[];
  timeBlockHistory: TimeBlockExecutionLog[];
  habits: Habit[];
  checkins: DailyCheckin[];
  crekoLeads: CrekoLead[];
  crekoQuotes: CrekoQuote[];
  crekoOpportunities: GoogleMapsOpportunity[];
  spainDocs: SpainProcessDoc[];
  missions: Mission[];
  settings: JarvisSettings;
  changas: Changa[];
  crekoProductionOrders: CrekoProductionOrder[];
  crekoContentItems: CrekoContentItem[];
  customModules: CustomAiModule[];
  dayClosings: DayClosing[];
  healthSummaries: HealthDailySummary[];
  healthConnection: HealthConnectionStatus;
  spotify: SpotifyState;
  weatherLocation: string;
  currentActivity?: CurrentActivity;
  timelineEntries?: TimelineEntry[];
  rpg?: RpgState;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'finance_db.json');

const INITIAL_DATA: DatabaseSchema = {
  user: {
    id: 'usr_main',
    name: 'Fran Albornoz',
    mainCurrency: 'EUR',
    monthlyReserveTarget: 1000,
    location: 'España / Logroño',
    lifeStage: 'Estabilidad económica + crecimiento',
    stageProgression: 'construccion',
    incomeStructure: 'Múltiples fuentes variables: changas, oficios (electricidad), Rotuprint, software para clientes y plataformas de producción',
    activeProjects: [
      'Creko (Prioridad alta)',
      'Rotuprint (Trámite en curso)',
      'CTC (En desarrollo)',
      'Burger Palusa (Creativo)',
      'Suite Solutions (Oportunidad)',
      'Software',
      'Ciudad Gráfica (Histórico)',
      'Goloso (En espera)',
    ],
    priorities: [
      'Generar ingresos diarios/semanales',
      'Creko',
      'Resolver Rotuprint',
      'Cuidar salud (gym, comida)',
      'No dispersarse con proyectos nuevos',
      'Regular weed',
    ],
    operatingRules: [
      'Ser directo',
      'Respuestas cortas',
      'No humo',
      'Pensar como socio/director',
      'Cuidar el dinero',
    ],
    communicationStyle: 'directo_practico_firme',
    preferences: {
      confirmHighExpenses: true,
      highExpenseThreshold: 300,
      askOnAmbiguity: true,
      autoLearnRules: true,
      prioritizeReserveBeforeGrowth: true,
    },
  },
  accounts: [
    {
      id: 'acc_cash',
      name: 'Efectivo',
      type: 'cash',
      balance: 50,
      currency: 'EUR',
      active: true,
      updatedAt: new Date().toISOString(),
      notes: 'Dinero disponible en mano / billetera (50 €)',
    },
    {
      id: 'acc_arq',
      name: 'ARQ',
      type: 'bank_account',
      balance: 32,
      currency: 'EUR',
      active: true,
      updatedAt: new Date().toISOString(),
      notes: 'Dinero digital disponible en cuenta ARQ (32 €)',
    },
    {
      id: 'acc_bingx',
      name: 'BingX (Copy Trading)',
      type: 'other',
      balance: 80,
      currency: 'EUR',
      active: true,
      updatedAt: new Date().toISOString(),
      notes: 'Inversión en Copy Trading en BingX (~80 €). NO disponible para gastar.',
    },
    {
      id: 'acc_cocos',
      name: 'Cocos Capital (Acciones)',
      type: 'other',
      balance: 100,
      currency: 'USD',
      active: true,
      updatedAt: new Date().toISOString(),
      notes: '100 USD destinados a inversión (S&P 500, ETH, NVDA, MELI, Litio). Comprar el lunes.',
    },
  ],
  categories: [
    {
      id: 'cat_casa',
      name: 'Casa',
      icon: 'Home',
      color: '#3b82f6',
      subcategories: [
        { id: 'sub_alquiler', name: 'Alquiler' },
        { id: 'sub_luz', name: 'Luz' },
        { id: 'sub_agua', name: 'Agua' },
        { id: 'sub_internet', name: 'Internet' },
        { id: 'sub_casa_otros', name: 'Otros' },
      ],
    },
    {
      id: 'cat_alim',
      name: 'Alimentación',
      icon: 'Utensils',
      color: '#10b981',
      subcategories: [
        { id: 'sub_super', name: 'Supermercado' },
        { id: 'sub_comida', name: 'Comida' },
        { id: 'sub_restaurantes', name: 'Restaurantes' },
        { id: 'sub_alim_otros', name: 'Otros' },
      ],
    },
    {
      id: 'cat_personal',
      name: 'Personal',
      icon: 'User',
      color: '#8b5cf6',
      subcategories: [
        { id: 'sub_celular', name: 'Celular' },
        { id: 'sub_higiene', name: 'Higiene' },
        { id: 'sub_ropa', name: 'Ropa' },
        { id: 'sub_ocio', name: 'Ocio' },
        { id: 'sub_pers_otros', name: 'Otros' },
      ],
    },
    {
      id: 'cat_transporte',
      name: 'Transporte',
      icon: 'Car',
      color: '#f59e0b',
      subcategories: [
        { id: 'sub_transporte_pub', name: 'Transporte público' },
        { id: 'sub_combustible', name: 'Combustible' },
        { id: 'sub_viajes', name: 'Viajes' },
        { id: 'sub_trans_otros', name: 'Otros' },
      ],
    },
    {
      id: 'cat_gen_ingresos',
      name: 'Generación de ingresos',
      icon: 'Briefcase',
      color: '#ec4899',
      subcategories: [
        { id: 'sub_dejavu', name: 'Changa / Bar Dejavu' },
        { id: 'sub_electricidad', name: 'Electricidad / Oficios' },
        { id: 'sub_herramientas', name: 'Herramientas de trabajo' },
        { id: 'sub_trabajo_otros', name: 'Otros' },
      ],
    },
    {
      id: 'cat_rotuprint',
      name: 'Rotuprint',
      icon: 'Printer',
      color: '#6366f1',
      subcategories: [
        { id: 'sub_materiales', name: 'Materiales' },
        { id: 'sub_maquinaria', name: 'Maquinaria' },
        { id: 'sub_rotu_otros', name: 'Otros' },
      ],
    },
    {
      id: 'cat_software',
      name: 'Software',
      icon: 'Code',
      color: '#06b6d4',
      subcategories: [
        { id: 'sub_licencias', name: 'Licencias' },
        { id: 'sub_hosting', name: 'Servidores & Cloud' },
        { id: 'sub_soft_otros', name: 'Otros' },
      ],
    },
    {
      id: 'cat_inversiones',
      name: 'Inversiones',
      icon: 'TrendingUp',
      color: '#14b8a6',
      subcategories: [
        { id: 'sub_crecimiento', name: 'Crecimiento' },
        { id: 'sub_educacion', name: 'Educación & Cursos' },
        { id: 'sub_inv_otros', name: 'Otros' },
      ],
    },
    {
      id: 'cat_otros',
      name: 'Otros',
      icon: 'Layers',
      color: '#6b7280',
      subcategories: [
        { id: 'sub_imprevistos', name: 'Imprevistos' },
        { id: 'sub_varios', name: 'Varios' },
      ],
    },
  ],
  projects: [
    {
      id: 'proj_creko',
      name: 'Creko',
      description: 'Proyecto principal de merch junto con Thiago. Pilares: 1. Captación y venta, 2. Sistema de producción, 3. Sistema de contenido.',
      status: 'active',
      goal: 'Hacerlo crecer y convertirlo en una empresa organizada y escalable',
      accumulatedInvestment: 0,
      accumulatedIncome: 0,
      accumulatedExpenses: 0,
      progress: 45,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'proj_burger_palusa',
      name: 'Burger Palusa',
      description: 'Proyecto creativo y colaboración familiar (padre socio). Indumentaria, remeras, camperas, tote bags y videos publicitarios para pantallas de calle en Argentina.',
      status: 'active',
      goal: 'Diseños de camisetas, ediciones especiales y piezas creativas',
      accumulatedInvestment: 0,
      accumulatedIncome: 0,
      accumulatedExpenses: 0,
      progress: 80,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'proj_ctc',
      name: 'CTC',
      description: 'Proyecto con Tomás de Luna. Cerebro digital para agencias y creadores para generar contenido coherente (Reels, calendario, métricas).',
      status: 'active',
      goal: 'Sistema de organización de contenido y cerebro de marca',
      accumulatedInvestment: 0,
      accumulatedIncome: 0,
      accumulatedExpenses: 0,
      progress: 35,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'proj_soft_desarrollo',
      name: 'Sowfts (Software en desarrollo)',
      description: 'Desarrollo de páginas web, software, sistemas y experimentos digitales con foco en monetización y clientes.',
      status: 'active',
      goal: 'Crear herramientas útiles y fuentes de ingresos recurrentes',
      accumulatedInvestment: 0,
      accumulatedIncome: 0,
      accumulatedExpenses: 0,
      progress: 50,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'proj_ciudad_grafica',
      name: 'Ciudad Gráfica',
      description: 'Proyecto histórico / profesional / familiar. Raíces del camino emprendedor de Fran: indumentaria, confección, serigrafía, DTF, marketing. Departamento en manos de su hermana.',
      status: 'completed',
      goal: 'Conservar la historia profesional y aprendizajes de sistemas',
      accumulatedInvestment: 0,
      accumulatedIncome: 0,
      accumulatedExpenses: 0,
      progress: 100,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'proj_suite_solutions',
      name: 'Suite Solutions',
      description: 'Negocio de Juanchi Frías (hotelería y apartamentos). Fran participa 2h diarias en captación de lunes a viernes: 250 €/mes + comisiones por clientes cerrados.',
      status: 'active',
      goal: 'Generación de ingresos: 250 €/mes + comisiones de captación',
      accumulatedInvestment: 0,
      accumulatedIncome: 0,
      accumulatedExpenses: 0,
      progress: 30,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'proj_rotuprint',
      name: 'Rotuprint',
      description: 'PRIORIDAD ADMINISTRATIVA Y LABORAL. Precontrato existente. Trámite pendiente con SEPE y Extranjería. Trabajo con abogada (coste ~300 €).',
      status: 'active',
      goal: 'Finalización de trámites SEPE y presentación formal ante Extranjería',
      accumulatedInvestment: 0,
      accumulatedIncome: 0,
      accumulatedExpenses: 0,
      progress: 65,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'proj_espana',
      name: 'España OS',
      description: 'Regularización, documentos, legalizaciones, apostillas, cita de extranjería y gestión integral de residencia.',
      status: 'active',
      goal: 'Estabilidad legal completa en España',
      accumulatedInvestment: 0,
      accumulatedIncome: 0,
      accumulatedExpenses: 0,
      progress: 60,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'proj_goloso',
      name: 'Goloso',
      description: 'Proyecto de comida/hot dogs en Logroño (Fran, Tomás, Juanchi, Thiago). Imagen desarrollada. Estado WAITING/FUTURO para evitar dispersión.',
      status: 'paused',
      goal: 'En espera de capital y tiempo propicio (sacado del foco diario)',
      accumulatedInvestment: 0,
      accumulatedIncome: 0,
      accumulatedExpenses: 0,
      progress: 15,
      createdAt: new Date().toISOString(),
    },
  ],
  transactions: [],
  pendingIncomes: [
    {
      id: 'pend_ikualo',
      concept: 'Ikualo — Transferencia en camino',
      amount: 40,
      expectedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      origin: 'Ikualo',
      status: 'pending',
      notes: 'Aprox 40 € pendientes de recibir entre lunes y martes. NO disponible hasta que llegue efectivamente.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pend_dejavu',
      concept: 'DejaVu — Turnos de trabajo pendientes',
      amount: 0,
      expectedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      origin: 'DejaVu',
      status: 'pending',
      notes: 'Pago pendiente de DejaVu. No introducir monto inventado hasta que Fran confirme cuánto cobró.',
      createdAt: new Date().toISOString(),
    },
  ],
  futureExpenses: [
    {
      id: 'fut_servicios_95',
      concept: 'Servicios e internet',
      amount: 95,
      categoryId: 'cat_casa',
      subcategoryId: 'sub_internet',
      expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recurrence: 'monthly',
      status: 'pending',
      notes: 'Pago mensual de servicios del hogar',
      createdAt: new Date().toISOString(),
    },
  ],
  reserve: {
    targetAmount: 1000,
    currentAmount: 0,
    percentage: 0,
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    accountIds: [],
    notes: 'Reserva de seguridad personal',
  },
  goals: [
    {
      id: 'goal_reserva_1000',
      name: 'Llegar a 1.000 € de reserva',
      targetAmount: 1000,
      currentAmount: 0,
      status: 'in_progress',
      priority: 'high',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'goal_rotuprint_stock',
      name: 'Invertir en insumos Rotuprint',
      targetAmount: 500,
      currentAmount: 80,
      status: 'in_progress',
      priority: 'medium',
      createdAt: new Date().toISOString(),
    },
  ],
  memory: [
    {
      id: 'mem_context_espana',
      type: 'context',
      priority: 'global',
      classification: 'confirmed_fact',
      key: 'ubicacion_espana',
      value: 'El usuario reside en España y está construyendo su etapa de estabilidad y permanencia.',
      description: 'Contexto real: intentando radicarse y estabilizarse en España (no es un simple viaje)',
      usageCount: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mem_work_variable_incomes',
      type: 'work_style',
      priority: 'global',
      classification: 'confirmed_fact',
      key: 'ingresos_variables',
      value: 'Ingresos variables por múltiples vías: changas, oficios/electricidad, Rotuprint, software para clientes y plataformas propias.',
      description: 'Estructura de ingresos no lineal: la estabilidad se evalúa semana a semana y mes a mes.',
      usageCount: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mem_ctc_rule_fundamental',
      type: 'financial_rule',
      priority: 'global',
      classification: 'confirmed_fact',
      key: 'regla_ctc_no_es_ingreso',
      value: 'CTC es un PROYECTO. No debe aparecer como ingreso simplemente porque exista. Solo cuenta ante transacciones reales.',
      description: 'Separación estricta entre proyectos y fuentes de ingreso automático.',
      usageCount: 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mem_rule_stability_first',
      type: 'financial_rule',
      priority: 'global',
      classification: 'confirmed_fact',
      key: 'primero_estabilidad_despues_crecimiento',
      value: 'Primero estar estable. Después generar. Después construir. Después crecer. Nunca sacrificar la reserva básica por proyectos.',
      description: 'Regla maestra de toma de decisiones financieras.',
      usageCount: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mem_pref_communication',
      type: 'preference',
      priority: 'user_preference',
      classification: 'user_preference',
      key: 'comunicacion_directa_firme',
      value: 'Directo, claro, práctico, informal, en español y firme. No complaciente: avisar si no conviene gastar.',
      description: 'Estilo de respuesta del asistente.',
      usageCount: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mem_etapa_construccion',
      type: 'context',
      priority: 'temporary_context',
      classification: 'temporary_context',
      isTemporary: true,
      key: 'etapa_construccion_espana',
      value: 'Convirtiendo una situación todavía inestable en una situación estable.',
      description: 'Momento vital actual del usuario.',
      usageCount: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mem_naranja',
      type: 'payment_method_alias',
      priority: 'user_preference',
      classification: 'user_preference',
      key: 'la naranja',
      value: 'Tarjeta Naranja',
      targetData: { paymentMethodId: 'acc_naranja' },
      description: 'Mapea la expresión coloquial "la Naranja" a Tarjeta Naranja',
      usageCount: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mem_galicia',
      type: 'payment_method_alias',
      priority: 'user_preference',
      classification: 'user_preference',
      key: 'galicia',
      value: 'Tarjeta Galicia',
      targetData: { paymentMethodId: 'acc_galicia' },
      description: 'Mapea la expresión coloquial "Galicia" a Tarjeta Galicia',
      usageCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mem_efectivo',
      type: 'payment_method_alias',
      priority: 'user_preference',
      classification: 'user_preference',
      key: 'efectivo',
      value: 'Efectivo',
      targetData: { paymentMethodId: 'acc_cash' },
      description: 'Mapea "efectivo" o "en mano" a la cuenta Efectivo',
      usageCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mem_nafta',
      type: 'category_rule',
      priority: 'user_preference',
      classification: 'user_preference',
      key: 'nafta',
      value: 'Transporte → Combustible',
      targetData: { categoryId: 'cat_transporte', subcategoryId: 'sub_combustible' },
      description: 'Mapea "nafta" o "combustible" o "gasolina" a Transporte / Combustible',
      usageCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mem_super',
      type: 'category_rule',
      priority: 'user_preference',
      classification: 'user_preference',
      key: 'super',
      value: 'Alimentación → Supermercado',
      targetData: { categoryId: 'cat_alim', subcategoryId: 'sub_super' },
      description: 'Mapea "super" o "supermercado" a Alimentación / Supermercado',
      usageCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mem_rotuprint_proj',
      type: 'project_rule',
      priority: 'user_preference',
      classification: 'user_preference',
      key: 'rotuprint',
      value: 'Proyecto Rotuprint',
      targetData: { projectId: 'proj_rotuprint', categoryId: 'cat_rotuprint' },
      description: 'Mapea menciones de "Rotuprint" o "materiales para Rotuprint" al proyecto Rotuprint',
      usageCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'mem_ctc_proj',
      type: 'project_rule',
      priority: 'user_preference',
      classification: 'user_preference',
      key: 'ctc',
      value: 'Proyecto CTC',
      targetData: { projectId: 'proj_ctc' },
      description: 'Proyecto CTC (recuerda que NO es fuente automática de ingresos)',
      usageCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  undoStack: [],
  postits: [
    {
      id: 'postit_burger_palusa_300',
      title: 'Burger Palusa: Pago Pendiente 300 $ (Para Invertir)',
      description: 'Tengo un pago pendiente de 300 dólares por los diseños gráficos. Esos 300 dólares después seguramente los voy a invertir (Regla 60% Inversión), pero todavía no ingresaron.',
      colorPriority: 'orange',
      projectId: 'proj_burger_palusa',
      moneyAmount: 275,
      status: 'active',
      isPinned: true,
      checklist: [
        { id: 'bp_1', text: 'Entrega de diseños acordados (300 USD)', done: false },
        { id: 'bp_2', text: 'Cobro de 300 $ pendientes', done: false },
        { id: 'bp_3', text: 'Asignar 60% (180 $) a inversión y 40% (120 $) a bolsillo', done: false },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'postit_dejavu_turnos',
      title: 'DejaVu: Pago Pendiente Turnos Nocturnos',
      description: 'Pago pendiente que seguramente me lo van a pagar la semana que viene o a fin de semana. Estuve trabajando todos los días más o menos a la noche. Va a sumar para el alquiler de eso o en otra cosa que yo quiera (monto editable).',
      colorPriority: 'purple',
      moneyAmount: 220,
      contactName: 'DejaVu',
      status: 'active',
      isPinned: true,
      checklist: [
        { id: 'dj_1', text: 'Cierre de horas de los turnos de la semana', done: false },
        { id: 'dj_2', text: 'Cobro de liquidación fin de semana / semana entrante', done: false },
        { id: 'dj_3', text: 'Separar parte para el alquiler y gastos esenciales', done: false },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  tasks: [
    {
      id: 'task_burger_palusa_diseno',
      title: 'Terminar paquete de diseños para Burger Palusa (300 $)',
      projectId: 'proj_burger_palusa',
      priority: 'urgent',
      status: 'in_progress',
      dueDate: new Date().toISOString().split('T')[0],
      durationMinutes: 180,
      effort: 'medium',
      financialImpact: { type: 'income_driver', expectedAmount: 275 },
      notes: 'Paquete de piezas creativas acordado por 300 USD (~275 €). Entregar mockups y archivos finales.',
      postItId: 'postit_burger_palusa_diseno',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task_dejavu_turno',
      title: 'Turno de trabajo en DejaVu de 20:00 a 00:00 (12 de la noche)',
      priority: 'high',
      status: 'todo',
      dueDate: new Date().toISOString().split('T')[0],
      durationMinutes: 240,
      effort: 'medium',
      financialImpact: { type: 'income_driver', expectedAmount: 60 },
      notes: 'Turno nocturno seguro en DejaVu (4 horas en barra/sala)',
      postItId: 'postit_changas_dejavu',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task_cobrar_josu',
      title: 'Cobrar 180 € de trabajo de electricidad a Josu',
      priority: 'high',
      status: 'todo',
      dueDate: new Date().toISOString().split('T')[0],
      durationMinutes: 15,
      effort: 'low',
      financialImpact: { type: 'income_driver', expectedAmount: 180 },
      notes: 'Impacto directo en caja disponible',
      postItId: 'postit_changas_dejavu',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task_presupuesto_velvet',
      title: 'Seguimiento de presupuesto de rotulación Peluquería Velvet (375 €)',
      projectId: 'proj_creko',
      priority: 'medium',
      status: 'todo',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      durationMinutes: 30,
      effort: 'low',
      financialImpact: { type: 'income_driver', expectedAmount: 375 },
      notes: 'Propuesta de vinilos y 25 remeras oversize',
      postItId: 'postit_creko_rotulacion',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task_abogada_rotuprint',
      title: 'Seguimiento trámite regularización laboral con abogada (SEPE / Extranjería)',
      projectId: 'proj_rotuprint',
      priority: 'medium',
      status: 'in_progress',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      durationMinutes: 30,
      effort: 'low',
      notes: 'Expediente de contratación y regularización en Logroño',
      postItId: 'postit_rotuprint_empleo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task_cierre_caja',
      title: 'Cierre diario de caja y balance financiero de la jornada',
      priority: 'medium',
      status: 'todo',
      dueDate: new Date().toISOString().split('T')[0],
      durationMinutes: 15,
      effort: 'low',
      notes: 'Verificar efectivo real en mano (145 €) y registrar movimientos',
      postItId: 'postit_sowfts_plataforma',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  habits: [
    { id: 'hab_entrenar', title: '¿Entrenaste?', icon: 'Dumbbell', category: 'fitness', streak: 4, completedToday: false, createdAt: new Date().toISOString() },
    { id: 'hab_leer', title: '¿Leíste?', icon: 'BookOpen', category: 'mind', streak: 2, completedToday: false, createdAt: new Date().toISOString() },
    { id: 'hab_meditar', title: '¿Meditaste?', icon: 'Sparkles', category: 'mind', streak: 1, completedToday: false, createdAt: new Date().toISOString() },
    { id: 'hab_correr', title: '¿Corriste?', icon: 'Footprints', category: 'fitness', streak: 0, completedToday: false, createdAt: new Date().toISOString() },
    { id: 'hab_creko', title: '¿Trabajaste en Creko?', icon: 'Rocket', category: 'creko', streak: 5, completedToday: true, createdAt: new Date().toISOString() },
    { id: 'hab_captacion', title: '¿Hiciste captación?', icon: 'Target', category: 'creko', streak: 3, completedToday: false, createdAt: new Date().toISOString() },
    { id: 'hab_dormir', title: '¿Dormiste bien?', icon: 'Moon', category: 'mind', streak: 3, completedToday: true, createdAt: new Date().toISOString() },
  ],
  checkins: [
    {
      id: 'chk_init',
      date: new Date().toISOString().split('T')[0],
      mood: 8,
      energy: 8,
      stress: 4,
      sleep: 7,
      motivation: 9,
      mindNotes: 'Enfocado en cerrar cobros y avanzar con propuestas de Creko.',
      worries: 'Seguimiento de documentación en España y precontrato Rotuprint.',
      habitsCompleted: ['hab_creko', 'hab_dormir'],
      createdAt: new Date().toISOString(),
    },
  ],
  crekoLeads: [
    {
      id: 'lead_la_esquina',
      name: 'Bar La Esquina',
      company: 'La Esquina Gastro',
      contactPerson: 'Manuel',
      phone: '+34 611 223 344',
      instagram: '@barlaesquina',
      source: 'google_maps',
      status: 'contacted',
      potentialValue: 300,
      probability: 60,
      lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nextContactDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Interesados en rotulación exterior y carta digital.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'lead_gimnasio_atlas',
      name: 'Gimnasio Atlas',
      company: 'Atlas Fitness SL',
      contactPerson: 'Carla',
      phone: '+34 622 334 455',
      instagram: '@atlas_fit',
      source: 'in_person',
      status: 'interested',
      potentialValue: 450,
      probability: 75,
      lastContactDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nextContactDate: new Date().toISOString().split('T')[0],
      notes: 'Quieren presupuesto para indumentaria de entrenadores y vinilos de sala.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'lead_velvet',
      name: 'Peluquería Velvet',
      company: 'Velvet Style',
      contactPerson: 'Sonia',
      phone: '+34 633 445 566',
      instagram: '@velvet_hair',
      source: 'instagram',
      status: 'quote',
      potentialValue: 220,
      probability: 80,
      lastContactDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Presupuesto PRE-2026-001 enviado. Hace 3 días sin respuesta, ¡necesita seguimiento hoy!',
      quoteId: 'quote_velvet_001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  crekoQuotes: [
    {
      id: 'quote_velvet_001',
      code: 'PRE-2026-001',
      clientName: 'Peluquería Velvet',
      concept: 'Diseño de identidad, vinilo para cristalera y tarjetas de visita',
      amount: 220,
      status: 'waiting',
      sentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      followUpDate: new Date().toISOString().split('T')[0],
      notes: 'Presupuesto entregado por WhatsApp. Falta confirmación.',
      needsFollowUp: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'quote_la_esquina_002',
      code: 'PRE-2026-002',
      clientName: 'Bar La Esquina',
      concept: 'Rotulación exterior y diseño de menú con QR',
      amount: 300,
      status: 'draft',
      sentDate: undefined,
      notes: 'Pendiente de definir medidas exactas del escaparate.',
      needsFollowUp: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'quote_rotuprint_003',
      code: 'PRE-2026-003',
      clientName: 'Producción Gráfica Industrial',
      concept: 'Lote de corte vinilo y packaging personalizado',
      amount: 480,
      status: 'accepted',
      sentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Aceptado. Programar producción.',
      needsFollowUp: false,
      createdAt: new Date().toISOString(),
    },
  ],
  crekoOpportunities: [
    {
      id: 'opp_cerveceria_puerto',
      name: 'Cervecería El Puerto',
      category: 'Bar / Gastronomía',
      area: 'Zona Centro',
      potentialAmount: 350,
      status: 'discovered',
      suggestedAction: 'Enviar propuesta de cartelería y uniformes estampados',
      phoneOrIG: '@cerveceriaelpuerto',
      notes: 'Local con mucho tráfico, cartelería desgastada.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'opp_crossfit_norte',
      name: 'CrossFit Box Norte',
      category: 'Gimnasio',
      area: 'Polígono Norte',
      potentialAmount: 500,
      status: 'discovered',
      suggestedAction: 'Proponer merch para socios y camisetas del personal',
      phoneOrIG: '@crossfitboxnorte',
      notes: 'Comunidad activa, abrieron hace 4 meses.',
      createdAt: new Date().toISOString(),
    },
  ],
  spainDocs: [
    {
      id: 'doc_rotuprint_precontrato',
      title: 'Precontrato laboral Rotuprint',
      category: 'rotuprint',
      status: 'in_progress',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'En revisión por la asesoría laboral de Rotuprint para regularización.',
      officialSource: 'Gestoría Rotuprint',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'doc_penales_apostilla',
      title: 'Certificado de antecedentes penales legalizado y apostillado',
      category: 'legalizacion',
      status: 'ready',
      requiresApostille: true,
      notes: 'Documento original con apostilla de La Haya en regla.',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'doc_padron',
      title: 'Certificado de empadronamiento actualizado',
      category: 'regularizacion',
      status: 'ready',
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Vigencia de 3 meses. Solicitar renovación antes de la cita si expira.',
      officialSource: 'Ayuntamiento',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'doc_cita_extranjeria',
      title: 'Cita previa en oficina de extranjería',
      category: 'regularizacion',
      status: 'pending',
      notes: 'Revisar la sede electrónica semanalmente para conseguir turno.',
      officialSource: 'Sede Electrónica Administraciones Públicas',
      updatedAt: new Date().toISOString(),
    },
  ],
  missions: [
    {
      id: 'mis_reserva_1000',
      title: 'Construir 1.000 € de Reserva de Seguridad',
      level: 'finanzas',
      currentAmount: 145,
      targetAmount: 1000,
      unit: '€',
      status: 'active',
      deadline: '2026-10-31',
      description: 'Prioridad absoluta. Ningún gasto no esencial hasta consolidar el colchón de 1.000 €.',
      nextMissionPreview: 'Misión: Escalar reserva a 2.500 € (3 meses de costes fijos)',
    },
    {
      id: 'mis_creko_5_clientes',
      title: 'Cerrar los primeros 5 clientes recurrentes de Creko',
      level: 'creko',
      currentAmount: 2,
      targetAmount: 5,
      unit: 'clientes',
      status: 'active',
      description: 'Generar tracción propia y recurrencia en producción y branding.',
      nextMissionPreview: 'Misión: Facturación mensual estable de 1.500 € en Creko',
    },
    {
      id: 'mis_regularizacion_espana',
      title: 'Completar expediente de regularización en España',
      level: 'profesional',
      currentAmount: 3,
      targetAmount: 5,
      unit: 'hitos',
      status: 'active',
      description: 'Rotuprint + antecedentes + empadronamiento + presentación formal.',
      nextMissionPreview: 'Misión: Alta en régimen laboral y cuenta bancaria definitiva',
    },
  ],
  settings: {
    intensity: 'normal',
    confirmHighExpenses: true,
    highExpenseThreshold: 300,
    enableDailyCheckinReminder: true,
    activeModules: [
      'welcome_hero',
      'money',
      'quick_actions',
      'mi_cabeza',
      'changas',
      'creko',
      'spain_process',
      'tasks',
      'postits',
      'habits',
      'missions',
      'calendar',
      'alerts',
      'jarvis',
    ],
    userCity: 'Logroño',
    userTemperature: '22°C',
    userWeatherCondition: 'Soleado',
    faceRecognitionEnabled: true,
  },
  changas: [
    {
      id: 'changa_dejavu_hoy',
      title: 'Turno en DejaVu (20:00 a 00:00)',
      categoryName: 'DejaVu',
      category: 'DejaVu',
      client: 'Bar / Discoteca DejaVu',
      clientOrPerson: 'Bar / Discoteca DejaVu',
      amount: 60,
      paid: false,
      status: 'pending',
      hours: 4,
      date: new Date().toISOString().split('T')[0],
      paymentMethodId: 'acc_cash',
      notes: 'Turno de noche hoy de 20:00 a 00:00 (12 de la noche). 4 horas de servicio seguras.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'changa_dejavu_previo_01',
      title: 'Turno fin de semana en barra DejaVu',
      categoryName: 'DejaVu',
      category: 'DejaVu',
      client: 'Bar / Discoteca DejaVu',
      clientOrPerson: 'Bar / Discoteca DejaVu',
      amount: 80,
      paid: true,
      status: 'paid',
      hours: 5,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentMethodId: 'acc_cash',
      notes: 'Turno de fin de semana en barra y apoyo.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'changa_dejavu_previo_02',
      title: 'Turno nocturno entre semana DejaVu',
      categoryName: 'DejaVu',
      category: 'DejaVu',
      client: 'Bar / Discoteca DejaVu',
      clientOrPerson: 'Bar / Discoteca DejaVu',
      amount: 60,
      paid: true,
      status: 'paid',
      hours: 4,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentMethodId: 'acc_cash',
      notes: 'Turno nocturno entre semana.',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'changa_josu_02',
      title: 'Instalación de luminarias y cuadro secundario',
      categoryName: 'Josu / Electricidad',
      category: 'Electricidad',
      client: 'Josu',
      clientOrPerson: 'Josu',
      amount: 180,
      paid: false,
      status: 'pending',
      hours: 6,
      date: new Date().toISOString().split('T')[0],
      notes: 'Instalación de luminarias y cuadro secundario. Pendiente de cobro.',
      createdAt: new Date().toISOString(),
    },
  ],
  crekoProductionOrders: [
    {
      id: 'prod_velvet_remeras',
      clientName: 'Peluquería Velvet',
      product: '25 Remeras Oversize Premium con estampa espalda DTF',
      quantity: 25,
      step: 'archivos',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalAmount: 375,
      notes: 'Archivos vectoriales preparados en Corel/Photoshop con semitonos.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod_atlas_totes',
      clientName: 'Gimnasio Atlas',
      product: '50 Tote bags de lienzo serigrafiadas a 1 color',
      quantity: 50,
      step: 'diseno',
      dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalAmount: 250,
      notes: 'Definiendo mockup final con Carla.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  crekoContentItems: [
    {
      id: 'cont_story_behind_scenes',
      title: '3 Historias mostrando el proceso de DTF y calidad de tela',
      type: 'historia',
      status: 'pendiente',
      scheduledDate: new Date().toISOString().split('T')[0],
      caption: 'Cómo estampamos sin perder el tacto suave de la prenda.',
      notes: 'Mostrar detalle del despegue y textura final.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cont_reel_sistema_merch',
      title: 'Reel: Por qué el merch barato le cuesta clientes a tu marca',
      type: 'reel',
      status: 'idea',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      caption: 'Diferencia entre merchandising promocional genérico y prendas que la gente realmente quiere usar en la calle.',
      notes: 'Grabación en taller con Thiago.',
      createdAt: new Date().toISOString(),
    },
  ],
  customModules: [
    {
      id: 'mod_clientes_contactados',
      title: 'Control de Prospección Diaria',
      icon: 'Target',
      description: 'Registro rápido de comercios y marcas contactadas por día para Creko y Suite Solutions.',
      fields: [
        { key: 'businessName', label: 'Comercio / Marca', type: 'text' },
        { key: 'channel', label: 'Canal (Maps, IG, Presencial)', type: 'text' },
        { key: 'status', label: 'Estado (Respondido, Silencio, Interesado)', type: 'status' },
        { key: 'date', label: 'Fecha', type: 'date' },
      ],
      items: [
        { businessName: 'Café del Centro', channel: 'Maps / WhatsApp', status: 'Interesado', date: new Date().toISOString().split('T')[0] },
        { businessName: 'Barbería 90s', channel: 'Instagram DM', status: 'Respondido', date: new Date().toISOString().split('T')[0] },
      ],
      createdAt: new Date().toISOString(),
    },
  ],
  dayClosings: [],
  timeBlocks: [
    {
      id: 'tb_creko_captacion',
      date: new Date().toISOString().split('T')[0],
      startTime: '08:30',
      endTime: '09:00',
      area: 'creko',
      focus: 'Captación',
      title: 'CREKO — Captación',
      objective: 'Preparar prospectos y detectar 15 nuevos locales comerciales en Google Maps.',
      suggestedTasks: [
        'Buscar comercios en Logroño centro en Google Maps',
        'Extraer números de WhatsApp e Instagram',
        'Anotar tipo de cartelería actual para propuesta personalizada',
      ],
      status: 'completed',
      resultNotes: '18 nuevos prospectos detectados y agendados.',
      actualMinutes: 30,
      color: '#a855f7',
      colorPriority: 'purple',
      projectId: 'proj_creko',
      isFixed: false,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tb_creko_mensajes',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      area: 'creko',
      focus: 'Mensajes',
      title: 'CREKO — Mensajes',
      objective: 'Enviar mensajes directos y registrar respuestas de los comercios.',
      suggestedTasks: [
        'Enviar mensajes personalizados a prospectos detectados',
        'Seguimiento a Peluquería Velvet (PRE-2026-001)',
        'Registrar respuestas en el embudo de captación',
      ],
      status: 'completed',
      resultNotes: '25 mensajes enviados. 3 respuestas positivas en curso.',
      actualMinutes: 60,
      color: '#a855f7',
      colorPriority: 'purple',
      projectId: 'proj_creko',
      isFixed: false,
      order: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tb_empleo_busqueda',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '10:40',
      area: 'empleo',
      focus: 'Búsqueda',
      title: 'EMPLEO — Búsqueda & Trámites',
      objective: 'Buscar ofertas, investigar oportunidades y seguimiento de expediente de regularización.',
      suggestedTasks: [
        'Explorar InfoJobs y ofertas de rotulación en Logroño',
        'Guardar ofertas interesantes',
        'Seguimiento expediente laboral con abogada',
      ],
      status: 'completed',
      resultNotes: 'Revisión completada.',
      actualMinutes: 40,
      color: '#38bdf8',
      colorPriority: 'blue',
      isFixed: false,
      order: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tb_descanso_cafe',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:40',
      endTime: '11:00',
      area: 'personal',
      focus: 'Descanso',
      title: 'Descanso & Café',
      objective: 'Pausa de 20 minutos sin pantallas, hidratación y recarga de enfoque.',
      suggestedTasks: ['Café/Agua', 'Desconectar ojos de pantalla', 'Estiramiento breve'],
      status: 'completed',
      color: '#10b981',
      colorPriority: 'green',
      isFixed: false,
      order: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tb_creko_produccion',
      date: new Date().toISOString().split('T')[0],
      startTime: '11:00',
      endTime: '12:30',
      area: 'creko',
      focus: 'Producción',
      title: 'CREKO — Producción & DTF UV',
      objective: 'Generar los artes vectoriales definidos y preparar presupuestos de taller.',
      suggestedTasks: [
        'Exportar vectoriales con semitonos para DTF UV',
        'Preparar propuesta de 25 remeras oversize Peluquería Velvet',
        'Coordinar tiempos de producción con Thiago',
      ],
      status: 'completed',
      resultNotes: 'Archivos preparados.',
      actualMinutes: 90,
      color: '#a855f7',
      colorPriority: 'purple',
      projectId: 'proj_creko',
      isFixed: false,
      order: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tb_almuerzo',
      date: new Date().toISOString().split('T')[0],
      startTime: '12:30',
      endTime: '14:00',
      area: 'personal',
      focus: 'Comida',
      title: 'Comida & Descanso',
      objective: 'Alimentación nutritiva y desconexión.',
      suggestedTasks: ['Comida sana', 'Descanso'],
      status: 'completed',
      color: '#10b981',
      colorPriority: 'green',
      isFixed: false,
      order: 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tb_burger_palusa_diseno',
      date: new Date().toISOString().split('T')[0],
      startTime: '15:30',
      endTime: '18:30',
      area: 'producto',
      focus: 'Diseños Gráficos',
      title: 'BURGER PALUSA — Diseños Gráficos (300 $)',
      objective: 'Crear paquete de diseños para Burger Palusa: packaging, remeras, pantalla y menú. Trabajo acordado por 300 USD (~275 €).',
      suggestedTasks: [
        'Definir piezas requeridas para campaña gastronómica',
        'Diseñar propuestas y mockups en Photoshop/Corel',
        'Exportar archivos listos para imprenta y pantallas',
        'Enviar artes finales y coordinar cobro de 300 $',
      ],
      status: 'in_progress',
      color: '#f97316',
      colorPriority: 'orange',
      projectId: 'proj_burger_palusa',
      isFixed: false,
      order: 7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tb_personal_descanso_previo',
      date: new Date().toISOString().split('T')[0],
      startTime: '18:30',
      endTime: '19:30',
      area: 'personal',
      focus: 'Preparación',
      title: 'PERSONAL — Descanso & Preparación Previa',
      objective: 'Merienda ligera, descanso visual, ducha y preparación para el turno nocturno en DejaVu.',
      suggestedTasks: ['Merienda e hidratación', 'Estiramiento', 'Alistarse para salir'],
      status: 'pending',
      color: '#10b981',
      colorPriority: 'green',
      isFixed: false,
      order: 8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tb_cierre_organizacion',
      date: new Date().toISOString().split('T')[0],
      startTime: '19:30',
      endTime: '20:00',
      area: 'organizacion',
      focus: 'Cierre de Caja',
      title: 'ORGANIZACIÓN — Control de Caja & Finanzas',
      objective: 'Control de saldo diario (145 € en mano), registro de movimientos y revisión de jornada antes de salir hacia DejaVu.',
      suggestedTasks: [
        'Verificar saldo real en efectivo (145 €) antes de salir',
        'Anotar estado de diseños Burger Palusa (300 $)',
        'Dejar agenda de mañana alineada',
      ],
      status: 'pending',
      color: '#eab308',
      colorPriority: 'yellow',
      isFixed: false,
      order: 9,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tb_changa_dejavu_noche',
      date: new Date().toISOString().split('T')[0],
      startTime: '20:00',
      endTime: '00:00',
      area: 'changa',
      focus: 'Turno Nocturno',
      title: 'CHANGAS — Turno en DejaVu (20:00 a 00:00)',
      objective: 'Turno de trabajo nocturno seguro en DejaVu de 20:00 a 12:00 de la noche (00:00). 4 horas de servicio.',
      suggestedTasks: [
        'Ingreso puntual al turno a las 20:00',
        'Servicio en barra / sala según requerimiento',
        'Cierre de turno a las 00:00 y registro de liquidación',
      ],
      status: 'pending',
      color: '#ef4444',
      colorPriority: 'red',
      isFixed: true,
      order: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  timeBlockHistory: [
    {
      id: 'tb_log_01',
      blockId: 'tb_creko_captacion',
      date: new Date().toISOString().split('T')[0],
      title: 'CREKO — Captación',
      area: 'creko',
      plannedMinutes: 30,
      actualMinutes: 30,
      status: 'completed',
      resultNotes: '18 nuevos prospectos',
      completedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    },
    {
      id: 'tb_log_02',
      blockId: 'tb_creko_mensajes',
      date: new Date().toISOString().split('T')[0],
      title: 'CREKO — Mensajes',
      area: 'creko',
      plannedMinutes: 60,
      actualMinutes: 60,
      status: 'completed',
      resultNotes: '25 mensajes enviados',
      completedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
  ],
  healthSummaries: [],
  healthConnection: {
    state: 'NOT_CONNECTED',
    availableDataTypes: ['steps', 'distance', 'energy', 'workouts'],
    dailyStepTarget: 8000,
    weeklyWorkoutTarget: 4,
  },
  spotify: {
    isConnected: false,
    isPlaying: false,
    playlistName: 'Enfoque & Flow Operativo',
    currentTrack: {
      id: 'track_default',
      name: 'Flow de Alta Energía',
      artist: 'Spotify Daily Mix',
      album: 'Focus Sessions',
      albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&auto=format&fit=crop&q=80',
    },
    device: 'iPhone de Fran',
    profileName: 'Fran Albornoz',
    lastUpdated: new Date().toISOString(),
  },
  weatherLocation: 'Logroño',
  currentActivity: {
    id: 'act_creko_captacion',
    title: 'Creko — Captación de clientes',
    category: 'creko',
    categoryLabel: 'CREKO',
    categoryColor: '#a855f7',
    icon: '🟣',
    startTime: '09:12',
    startTimestamp: Date.now() - 42 * 60000,
    durationMinutes: 42,
    notes: 'Prospección activa de comercios en Logroño y presupuestos',
    client: 'Comercios Logroño',
    isActive: true,
  },
  timelineEntries: [
    { id: 'tl_1', time: '07:12', date: new Date().toISOString().split('T')[0], icon: '☀️', title: 'Día iniciado', category: 'vida', notes: 'Rutina matutina en Logroño' },
    { id: 'tl_2', time: '07:18', date: new Date().toISOString().split('T')[0], icon: '🎯', title: 'Creko / Captación', category: 'creko', duration: '45 min', durationMinutes: 45, notes: 'Contactos y mensajes' },
    { id: 'tl_3', time: '09:04', date: new Date().toISOString().split('T')[0], icon: '💬', title: 'Creko / Mensajes y presupuestos', category: 'creko', duration: '1h 17m', durationMinutes: 77 },
    { id: 'tl_4', time: '10:21', date: new Date().toISOString().split('T')[0], icon: '💡', title: 'Burger Palusa / Diseño & Packaging', category: 'burger_palusa', duration: '49 min', durationMinutes: 49, notes: 'Packaging y cartelería digital ($300 pend.)' },
    { id: 'tl_5', time: '11:10', date: new Date().toISOString().split('T')[0], icon: '💼', title: 'Búsqueda laboral & Rotuprint', category: 'trabajo', duration: '1h 20m', durationMinutes: 80 },
    { id: 'tl_6', time: '13:30', date: new Date().toISOString().split('T')[0], icon: '🍝', title: 'Pausa & Almuerzo', category: 'vida', duration: '1h 32m', durationMinutes: 92 },
    { id: 'tl_7', time: '15:02', date: new Date().toISOString().split('T')[0], icon: '🏭', title: 'Creko / Producción y taller', category: 'creko', duration: '2h 38m', durationMinutes: 158 },
    { id: 'tl_8', time: '17:40', date: new Date().toISOString().split('T')[0], icon: '🏃', title: 'Correr / Rendimiento', category: 'cuerpo', duration: '45 min', durationMinutes: 45, notes: '5.4 km por ribera del Ebro' },
    { id: 'tl_9', time: '18:25', date: new Date().toISOString().split('T')[0], icon: '✓', title: 'Entrenamiento completado', category: 'cuerpo' },
    { id: 'tl_10', time: '20:10', date: new Date().toISOString().split('T')[0], icon: '💰', title: 'Changa registrada (Turno DejaVu)', category: 'trabajo', notes: 'Servicio en barra 20:00 - 00:00' },
  ],
  rpg: {
    totalXp: 2780,
    level: 3,
    levelName: 'Control',
    currentLevelXp: 780,
    nextLevelXp: 1300,
    progressPercent: 60,
    lives: 5,
    maxLives: 5,
    streaks: [
      { id: 'strk_gym', name: 'Gimnasio', icon: '🏋️', currentStreak: 4, bestStreak: 7, lastCompletedDate: '2026-09-27' },
      { id: 'strk_read', name: 'Lectura', icon: '📖', currentStreak: 2, bestStreak: 5, lastCompletedDate: '2026-09-27' },
      { id: 'strk_work', name: 'Buscar trabajo', icon: '💼', currentStreak: 3, bestStreak: 4, lastCompletedDate: '2026-09-27' },
      { id: 'strk_nosmoke', name: 'Sin fumar', icon: '🚭', currentStreak: 1, bestStreak: 3, lastCompletedDate: '2026-09-27' },
    ],
    dailyMissions: [
      { id: 'm_gym', title: 'Gimnasio o entrenamiento', category: 'diaria', xp: 100, completed: false, frequency: 'daily' },
      { id: 'm_read', title: 'Leer 20 minutos', category: 'diaria', xp: 100, completed: false, frequency: 'daily' },
      { id: 'm_job', title: 'Buscar trabajo 40 minutos', category: 'diaria', xp: 150, completed: false, frequency: 'daily' },
      { id: 'm_creko', title: 'Trabajar en Creko (Captación / Producción)', category: 'diaria', xp: 120, completed: false, frequency: 'daily' },
      { id: 'm_fin', title: 'Organizar finanzas y gastos del día', category: 'diaria', xp: 50, completed: false, frequency: 'daily' },
      { id: 'm_med', title: 'Meditar o desconexión mental', category: 'diaria', xp: 75, completed: false, frequency: 'daily' },
    ],
    weeklyMissions: [
      { id: 'wm_run', title: 'Correr 2 a 3 veces esta semana', category: 'semanal', xp: 300, completed: false, frequency: 'weekly' },
      { id: 'wm_leads', title: 'Conseguir contactos o prospectos laborales/comerciales', category: 'semanal', xp: 250, completed: false, frequency: 'weekly' },
      { id: 'wm_clients', title: 'Cerrar clientes o changas de valor', category: 'semanal', xp: 350, completed: false, frequency: 'weekly' },
      { id: 'wm_income', title: 'Generar ingresos directos de la semana', category: 'semanal', xp: 200, completed: false, frequency: 'weekly' },
      { id: 'wm_budget', title: 'Mantener gastos controlados y sin fugas', category: 'semanal', xp: 150, completed: false, frequency: 'weekly' },
    ],
    recoveryMissions: [
      { id: 'rm_walk', title: 'Caminar 30 minutos al aire libre', category: 'recuperacion', xp: 50, completed: false, frequency: 'recovery' },
      { id: 'rm_train', title: 'Entrenar 40 minutos de manera saludable', category: 'recuperacion', xp: 75, completed: false, frequency: 'recovery' },
      { id: 'rm_room', title: 'Ordenar habitación y espacio personal', category: 'recuperacion', xp: 50, completed: false, frequency: 'recovery' },
      { id: 'rm_read', title: 'Leer 20 minutos con foco', category: 'recuperacion', xp: 50, completed: false, frequency: 'recovery' },
      { id: 'rm_task', title: 'Completar 1 tarea pendiente prioritaria', category: 'recuperacion', xp: 50, completed: false, frequency: 'recovery' },
      { id: 'rm_job', title: 'Buscar trabajo o enviar solicitudes 40 minutos', category: 'recuperacion', xp: 100, completed: false, frequency: 'recovery' },
    ],
    smokeLog: [],
    history: [
      { id: 'h_init_1', action: 'Gimnasio', xpChange: 100, timestamp: 1790490000000, reason: 'Entrenamiento completado', createdAt: '2026-09-27T18:25:00.000Z' },
      { id: 'h_init_2', action: 'Buscar trabajo', xpChange: 150, timestamp: 1790480000000, reason: 'Búsqueda y gestión de oportunidades', createdAt: '2026-09-27T12:00:00.000Z' },
    ],
    config: {
      xpValues: {
        gym: 100,
        run: 150,
        football: 100,
        read: 100,
        meditate: 75,
        jobSearch: 150,
        getClient: 250,
        organizeTasks: 50,
        smokePenalty: -50,
        missImportantMission: -25,
        breakStreak: -50,
      },
      streakBonus: {
        threeDays: 50,
        sevenDays: 150,
        fourteenDays: 300,
        thirtyDays: 600,
      },
    },
    lastUpdated: '2026-09-28T04:00:00.000Z',
  },
};

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.load();
  }

  private ensureDirectory(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Merge with initial data to ensure all keys and personal context exist
        const existingMemories: UserMemory[] = parsed.memory || [];
        const mergedMemory = [...existingMemories];
        for (const initMem of INITIAL_DATA.memory) {
          if (!mergedMemory.some((m) => m.id === initMem.id || m.key === initMem.key)) {
            mergedMemory.push(initMem);
          }
        }

        // Merge projects to ensure new projects (Burger Palusa, Suite Solutions, Goloso, etc.) exist
        const existingProjects: Project[] = parsed.projects || [];
        const mergedProjects = [...existingProjects];
        for (const initProj of INITIAL_DATA.projects) {
          const idx = mergedProjects.findIndex((p) => p.id === initProj.id);
          if (idx === -1) {
            mergedProjects.push(initProj);
          } else {
            // Update description, name and goal
            mergedProjects[idx] = {
              ...initProj,
              ...mergedProjects[idx],
              name: initProj.name,
              description: initProj.description,
              goal: initProj.goal,
            };
          }
        }

        // Merge postits to ensure sample project postits exist if list is empty or lacks purple
        const existingPostits: PostIt[] = parsed.postits || [];
        const mergedPostits = [...existingPostits];
        for (const initPost of INITIAL_DATA.postits) {
          if (!mergedPostits.some((p) => p.id === initPost.id)) {
            mergedPostits.push(initPost);
          }
        }

        // Merge accounts to ensure Cocos Capital & Copy Trade accounts exist
        const existingAccounts: Account[] = parsed.accounts || [];
        const mergedAccounts = [...existingAccounts];
        for (const initAcc of INITIAL_DATA.accounts) {
          if (!mergedAccounts.some((a) => a.id === initAcc.id)) {
            mergedAccounts.push(initAcc);
          }
        }

        return {
          ...INITIAL_DATA,
          ...parsed,
          accounts: mergedAccounts,
          memory: mergedMemory,
          projects: mergedProjects,
          postits: mergedPostits,
          user: {
            ...INITIAL_DATA.user,
            ...(parsed.user || {}),
            name: parsed.user?.name && parsed.user.name !== 'Fran' ? parsed.user.name : INITIAL_DATA.user.name,
            location: INITIAL_DATA.user.location,
            lifeStage: INITIAL_DATA.user.lifeStage,
            activeProjects: INITIAL_DATA.user.activeProjects,
            priorities: INITIAL_DATA.user.priorities,
            operatingRules: INITIAL_DATA.user.operatingRules,
            preferences: {
              ...INITIAL_DATA.user.preferences,
              ...(parsed.user?.preferences || {}),
            },
          },
          categories: parsed.categories || INITIAL_DATA.categories,
          transactions: parsed.transactions || INITIAL_DATA.transactions,
          pendingIncomes: parsed.pendingIncomes || INITIAL_DATA.pendingIncomes,
          futureExpenses: parsed.futureExpenses || INITIAL_DATA.futureExpenses,
          reserve: { ...INITIAL_DATA.reserve, ...(parsed.reserve || {}) },
          goals: parsed.goals || INITIAL_DATA.goals,
          undoStack: parsed.undoStack || [],
          tasks: parsed.tasks || INITIAL_DATA.tasks,
          timeBlocks: (parsed.timeBlocks && parsed.timeBlocks.length > 0) ? parsed.timeBlocks : INITIAL_DATA.timeBlocks,
          timeBlockHistory: parsed.timeBlockHistory || INITIAL_DATA.timeBlockHistory || [],
          habits: parsed.habits || INITIAL_DATA.habits,
          checkins: parsed.checkins || INITIAL_DATA.checkins,
          crekoLeads: parsed.crekoLeads || INITIAL_DATA.crekoLeads,
          crekoQuotes: parsed.crekoQuotes || INITIAL_DATA.crekoQuotes,
          crekoOpportunities: parsed.crekoOpportunities || INITIAL_DATA.crekoOpportunities,
          spainDocs: parsed.spainDocs || INITIAL_DATA.spainDocs,
          missions: parsed.missions || INITIAL_DATA.missions,
          settings: { ...INITIAL_DATA.settings, ...(parsed.settings || {}) },
          changas: parsed.changas || INITIAL_DATA.changas,
          crekoProductionOrders: parsed.crekoProductionOrders || INITIAL_DATA.crekoProductionOrders,
          crekoContentItems: parsed.crekoContentItems || INITIAL_DATA.crekoContentItems,
          customModules: parsed.customModules || INITIAL_DATA.customModules,
          dayClosings: parsed.dayClosings || INITIAL_DATA.dayClosings,
          healthSummaries: parsed.healthSummaries || INITIAL_DATA.healthSummaries,
          healthConnection: parsed.healthConnection || INITIAL_DATA.healthConnection,
          spotify: { ...INITIAL_DATA.spotify, ...(parsed.spotify || {}) },
          weatherLocation: parsed.weatherLocation || INITIAL_DATA.weatherLocation,
          rpg: parsed.rpg || INITIAL_DATA.rpg,
        };
      }
    } catch (err) {
      console.error('Error loading database from file, using fallback:', err);
    }
    this.save(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  private save(stateToSave?: DatabaseSchema): void {
    const payload = stateToSave || this.data;
    try {
      this.ensureDirectory();
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  // --- Transactions ---
  public getTransactions(): Transaction[] {
    return [...this.data.transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getTransaction(id: string): Transaction | undefined {
    return this.data.transactions.find((t) => t.id === id);
  }

  public createTransaction(
    params: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'> & { userId?: string }
  ): { transaction: Transaction; undoAction: UndoableAction } {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const transaction: Transaction = {
      ...params,
      id,
      userId: params.userId || this.data.user.id,
      createdAt: now,
      updatedAt: now,
    };

    // Apply balance effects
    if (transaction.type === 'expense') {
      this.modifyAccountBalance(transaction.paymentMethodId, -transaction.amount);
      if (transaction.projectId) {
        this.modifyProjectExpenses(transaction.projectId, transaction.amount);
      }
    } else if (transaction.type === 'income') {
      this.modifyAccountBalance(transaction.paymentMethodId, transaction.amount);
      if (transaction.projectId) {
        this.modifyProjectIncome(transaction.projectId, transaction.amount);
      }
    } else if (transaction.type === 'transfer') {
      if (transaction.toPaymentMethodId) {
        this.modifyAccountBalance(transaction.paymentMethodId, -transaction.amount);
        this.modifyAccountBalance(transaction.toPaymentMethodId, transaction.amount);
      }
    }

    this.data.transactions.push(transaction);

    // Create undo entry
    const undoAction: UndoableAction = {
      id: `undo_${Date.now()}`,
      timestamp: now,
      description: `Creación de transacción ${transaction.description || ''} (${transaction.amount} €)`,
      inverseAction: {
        type: 'delete_transaction',
        payload: { transactionId: id },
      },
    };

    this.pushUndoAction(undoAction);
    this.save();

    return { transaction, undoAction };
  }

  public updateTransaction(
    id: string,
    updates: Partial<Transaction>
  ): { updated: Transaction; undoAction: UndoableAction } | null {
    const idx = this.data.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const oldTx = { ...this.data.transactions[idx] };

    // Revert old balance effects
    if (oldTx.type === 'expense') {
      this.modifyAccountBalance(oldTx.paymentMethodId, oldTx.amount);
      if (oldTx.projectId) this.modifyProjectExpenses(oldTx.projectId, -oldTx.amount);
    } else if (oldTx.type === 'income') {
      this.modifyAccountBalance(oldTx.paymentMethodId, -oldTx.amount);
      if (oldTx.projectId) this.modifyProjectIncome(oldTx.projectId, -oldTx.amount);
    } else if (oldTx.type === 'transfer' && oldTx.toPaymentMethodId) {
      this.modifyAccountBalance(oldTx.paymentMethodId, oldTx.amount);
      this.modifyAccountBalance(oldTx.toPaymentMethodId, -oldTx.amount);
    }

    const updatedTx: Transaction = {
      ...oldTx,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Apply new balance effects
    if (updatedTx.type === 'expense') {
      this.modifyAccountBalance(updatedTx.paymentMethodId, -updatedTx.amount);
      if (updatedTx.projectId) this.modifyProjectExpenses(updatedTx.projectId, updatedTx.amount);
    } else if (updatedTx.type === 'income') {
      this.modifyAccountBalance(updatedTx.paymentMethodId, updatedTx.amount);
      if (updatedTx.projectId) this.modifyProjectIncome(updatedTx.projectId, updatedTx.amount);
    } else if (updatedTx.type === 'transfer' && updatedTx.toPaymentMethodId) {
      this.modifyAccountBalance(updatedTx.paymentMethodId, -updatedTx.amount);
      this.modifyAccountBalance(updatedTx.toPaymentMethodId, updatedTx.amount);
    }

    this.data.transactions[idx] = updatedTx;

    const undoAction: UndoableAction = {
      id: `undo_${Date.now()}`,
      timestamp: new Date().toISOString(),
      description: `Modificación de movimiento`,
      inverseAction: {
        type: 'restore_transaction',
        payload: { transaction: oldTx },
      },
    };

    this.pushUndoAction(undoAction);
    this.save();
    return { updated: updatedTx, undoAction };
  }

  public deleteTransaction(id: string): boolean {
    const idx = this.data.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return false;

    const oldTx = this.data.transactions[idx];
    // Revert balance effects
    if (oldTx.type === 'expense') {
      this.modifyAccountBalance(oldTx.paymentMethodId, oldTx.amount);
      if (oldTx.projectId) this.modifyProjectExpenses(oldTx.projectId, -oldTx.amount);
    } else if (oldTx.type === 'income') {
      this.modifyAccountBalance(oldTx.paymentMethodId, -oldTx.amount);
      if (oldTx.projectId) this.modifyProjectIncome(oldTx.projectId, -oldTx.amount);
    } else if (oldTx.type === 'transfer' && oldTx.toPaymentMethodId) {
      this.modifyAccountBalance(oldTx.paymentMethodId, oldTx.amount);
      this.modifyAccountBalance(oldTx.toPaymentMethodId, -oldTx.amount);
    }

    const undoAction: UndoableAction = {
      id: `undo_${Date.now()}`,
      timestamp: new Date().toISOString(),
      description: `Eliminación de ${oldTx.description}`,
      inverseAction: {
        type: 'restore_transaction',
        payload: { transaction: oldTx },
      },
    };

    this.data.transactions.splice(idx, 1);
    this.pushUndoAction(undoAction);
    this.save();
    return true;
  }

  // --- Undo Action ---
  public undoLastAction(): { success: boolean; description?: string } {
    if (this.data.undoStack.length === 0) {
      return { success: false, description: 'No hay acciones previas para deshacer' };
    }

    const last = this.data.undoStack.pop()!;
    const inv = last.inverseAction;

    if (inv.type === 'delete_transaction') {
      const txId = inv.payload.transactionId;
      const idx = this.data.transactions.findIndex((t) => t.id === txId);
      if (idx !== -1) {
        const tx = this.data.transactions[idx];
        // Revert balance effects
        if (tx.type === 'expense') {
          this.modifyAccountBalance(tx.paymentMethodId, tx.amount);
          if (tx.projectId) this.modifyProjectExpenses(tx.projectId, -tx.amount);
        } else if (tx.type === 'income') {
          this.modifyAccountBalance(tx.paymentMethodId, -tx.amount);
          if (tx.projectId) this.modifyProjectIncome(tx.projectId, -tx.amount);
        } else if (tx.type === 'transfer' && tx.toPaymentMethodId) {
          this.modifyAccountBalance(tx.paymentMethodId, tx.amount);
          this.modifyAccountBalance(tx.toPaymentMethodId, -tx.amount);
        }
        this.data.transactions.splice(idx, 1);
      }
    } else if (inv.type === 'restore_transaction') {
      const restored = inv.payload.transaction as Transaction;
      const idx = this.data.transactions.findIndex((t) => t.id === restored.id);
      if (idx !== -1) {
        this.data.transactions[idx] = restored;
      } else {
        this.data.transactions.push(restored);
      }
      // Re-apply its balance effect
      if (restored.type === 'expense') {
        this.modifyAccountBalance(restored.paymentMethodId, -restored.amount);
        if (restored.projectId) this.modifyProjectExpenses(restored.projectId, restored.amount);
      } else if (restored.type === 'income') {
        this.modifyAccountBalance(restored.paymentMethodId, restored.amount);
        if (restored.projectId) this.modifyProjectIncome(restored.projectId, restored.amount);
      }
    } else if (inv.type === 'unmark_pending_income') {
      const { pendingId, txId } = inv.payload;
      const pend = this.data.pendingIncomes.find((p) => p.id === pendingId);
      if (pend) {
        pend.status = 'pending';
        pend.transactionId = undefined;
      }
      if (txId) {
        const txIdx = this.data.transactions.findIndex((t) => t.id === txId);
        if (txIdx !== -1) {
          const tx = this.data.transactions[txIdx];
          this.modifyAccountBalance(tx.paymentMethodId, -tx.amount);
          this.data.transactions.splice(txIdx, 1);
        }
      }
    }

    this.save();
    return { success: true, description: last.description };
  }

  private pushUndoAction(action: UndoableAction): void {
    this.data.undoStack.push(action);
    if (this.data.undoStack.length > 30) {
      this.data.undoStack.shift();
    }
  }

  // --- Accounts ---
  public getAccounts(): Account[] {
    return this.data.accounts;
  }

  public getAccount(id: string): Account | undefined {
    return this.data.accounts.find((a) => a.id === id);
  }

  public findAccountByName(name: string): Account | undefined {
    const clean = name.toLowerCase().trim();
    return this.data.accounts.find((a) => a.name.toLowerCase().includes(clean) || clean.includes(a.name.toLowerCase()));
  }

  public createAccount(params: Omit<Account, 'id' | 'updatedAt'>): Account {
    const id = `acc_${Date.now()}`;
    const account: Account = {
      ...params,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.data.accounts.push(account);
    this.save();
    return account;
  }

  public updateAccount(id: string, updates: Partial<Account>): Account | null {
    const acc = this.data.accounts.find((a) => a.id === id);
    if (!acc) return null;
    Object.assign(acc, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return acc;
  }

  private modifyAccountBalance(accountId: string, delta: number): void {
    const acc = this.data.accounts.find((a) => a.id === accountId);
    if (acc) {
      acc.balance = Math.round((acc.balance + delta) * 100) / 100;
      acc.updatedAt = new Date().toISOString();
    }
  }

  // --- Projects ---
  public getProjects(): Project[] {
    return this.data.projects;
  }

  public getProject(id: string): Project | undefined {
    return this.data.projects.find((p) => p.id === id);
  }

  public findProjectByName(name: string): Project | undefined {
    const clean = name.toLowerCase().trim();
    return this.data.projects.find((p) => p.name.toLowerCase().includes(clean) || clean.includes(p.name.toLowerCase()));
  }

  public createProject(params: Omit<Project, 'id' | 'accumulatedInvestment' | 'accumulatedIncome' | 'accumulatedExpenses' | 'progress' | 'createdAt'>): Project {
    const id = `proj_${Date.now()}`;
    const project: Project = {
      ...params,
      id,
      accumulatedInvestment: 0,
      accumulatedIncome: 0,
      accumulatedExpenses: 0,
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    this.data.projects.push(project);
    this.save();
    return project;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | null {
    const proj = this.data.projects.find((p) => p.id === id);
    if (!proj) return null;
    Object.assign(proj, updates);
    this.save();
    return proj;
  }

  private modifyProjectExpenses(projectId: string, amount: number): void {
    const proj = this.data.projects.find((p) => p.id === projectId);
    if (proj) {
      proj.accumulatedExpenses = Math.max(0, Math.round((proj.accumulatedExpenses + amount) * 100) / 100);
    }
  }

  private modifyProjectIncome(projectId: string, amount: number): void {
    const proj = this.data.projects.find((p) => p.id === projectId);
    if (proj) {
      proj.accumulatedIncome = Math.max(0, Math.round((proj.accumulatedIncome + amount) * 100) / 100);
    }
  }

  // --- Categories ---
  public getCategories(): Category[] {
    return this.data.categories;
  }

  public findCategoryByName(name: string): { category?: Category; subcategory?: { id: string; name: string } } {
    const clean = name.toLowerCase().trim();
    for (const cat of this.data.categories) {
      if (cat.name.toLowerCase().includes(clean) || clean.includes(cat.name.toLowerCase())) {
        return { category: cat };
      }
      for (const sub of cat.subcategories) {
        if (sub.name.toLowerCase().includes(clean) || clean.includes(sub.name.toLowerCase())) {
          return { category: cat, subcategory: sub };
        }
      }
    }
    return {};
  }

  public createCategory(
    name: string,
    subcategoryNames: (string | { id?: string; name: string })[] = [],
    icon?: string,
    color?: string
  ): Category {
    const id = `cat_${Date.now()}`;
    const formattedSubs = subcategoryNames
      .map((n, i) => {
        if (typeof n === 'string') {
          return { id: `sub_${Date.now()}_${i}`, name: n.trim() };
        }
        return { id: n.id || `sub_${Date.now()}_${i}`, name: (n.name || '').trim() };
      })
      .filter((s) => Boolean(s.name));

    const category: Category = {
      id,
      name: name.trim(),
      icon: icon || 'Tag',
      color: color || '#10b981',
      isCustom: true,
      subcategories: formattedSubs.length > 0 ? formattedSubs : [{ id: `sub_${Date.now()}_0`, name: 'General' }],
    };
    this.data.categories.push(category);
    this.save();
    return category;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const cat = this.data.categories.find((c) => c.id === id);
    if (!cat) return null;
    if (updates.name) cat.name = updates.name.trim();
    if (updates.icon) cat.icon = updates.icon;
    if (updates.color) cat.color = updates.color;
    if (updates.subcategories) cat.subcategories = updates.subcategories;
    this.save();
    return cat;
  }

  public deleteCategory(id: string): boolean {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    this.save();
    return true;
  }

  public addSubcategory(categoryId: string, name: string): boolean {
    const cat = this.data.categories.find((c) => c.id === categoryId);
    if (!cat) return false;
    cat.subcategories.push({ id: `sub_${Date.now()}`, name: name.trim() });
    this.save();
    return true;
  }

  public deleteSubcategory(categoryId: string, subcategoryId: string): boolean {
    const cat = this.data.categories.find((c) => c.id === categoryId);
    if (!cat) return false;
    const sIdx = cat.subcategories.findIndex((s) => s.id === subcategoryId);
    if (sIdx === -1) return false;
    cat.subcategories.splice(sIdx, 1);
    this.save();
    return true;
  }

  // --- Pending Income ---
  public getPendingIncomes(): PendingIncome[] {
    return this.data.pendingIncomes;
  }

  public createPendingIncome(params: Omit<PendingIncome, 'id' | 'createdAt' | 'status'>): PendingIncome {
    const id = `pend_${Date.now()}`;
    const item: PendingIncome = {
      ...params,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.data.pendingIncomes.push(item);
    this.save();
    return item;
  }

  public markIncomeReceived(
    pendingIncomeId: string,
    paymentMethodId: string
  ): { pendingIncome: PendingIncome; transaction: Transaction; undoAction: UndoableAction } | null {
    const pending = this.data.pendingIncomes.find((p) => p.id === pendingIncomeId);
    if (!pending) return null;

    const acc = this.data.accounts.find((a) => a.id === paymentMethodId) || this.data.accounts[0];

    // Find category for income (Generación de ingresos or Otros)
    const catGen = this.data.categories.find((c) => c.id === 'cat_gen_ingresos') || this.data.categories[0];

    // Create real income transaction
    const { transaction } = this.createTransaction({
      type: 'income',
      amount: pending.amount,
      currency: 'EUR',
      categoryId: catGen.id,
      paymentMethodId: acc.id,
      description: `Cobro: ${pending.concept} (${pending.origin})`,
      date: new Date().toISOString().split('T')[0],
      status: 'confirmed',
      source: 'pending_income',
      notes: `Asociado al pendiente #${pending.id}`,
    });

    pending.status = 'received';
    pending.transactionId = transaction.id;
    pending.paymentMethodId = acc.id;

    const undoAction: UndoableAction = {
      id: `undo_${Date.now()}`,
      timestamp: new Date().toISOString(),
      description: `Cobro recibido de ${pending.concept} (${pending.amount} €)`,
      inverseAction: {
        type: 'unmark_pending_income',
        payload: { pendingId: pending.id, txId: transaction.id },
      },
    };

    this.pushUndoAction(undoAction);
    this.save();

    return { pendingIncome: pending, transaction, undoAction };
  }

  public deletePendingIncome(id: string): boolean {
    const idx = this.data.pendingIncomes.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.data.pendingIncomes.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Future Expenses ---
  public getFutureExpenses(): FutureExpense[] {
    return this.data.futureExpenses;
  }

  public createFutureExpense(params: Omit<FutureExpense, 'id' | 'createdAt' | 'status'>): FutureExpense {
    const id = `fut_${Date.now()}`;
    const item: FutureExpense = {
      ...params,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.data.futureExpenses.push(item);
    this.save();
    return item;
  }

  public markFutureExpensePaid(id: string, paymentMethodId?: string): boolean {
    const fut = this.data.futureExpenses.find((f) => f.id === id);
    if (!fut) return false;

    fut.status = 'paid';
    if (paymentMethodId) {
      this.createTransaction({
        type: 'expense',
        amount: fut.amount,
        currency: 'EUR',
        categoryId: fut.categoryId,
        subcategoryId: fut.subcategoryId,
        paymentMethodId,
        description: fut.concept,
        date: new Date().toISOString().split('T')[0],
        status: 'confirmed',
        source: 'manual',
      });
    }
    this.save();
    return true;
  }

  public deleteFutureExpense(id: string): boolean {
    const idx = this.data.futureExpenses.findIndex((f) => f.id === id);
    if (idx === -1) return false;
    this.data.futureExpenses.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Reserve & Goals ---
  public getReserve(): Reserve {
    // Current reserve can be configured manually or calculated from designated reserve accounts
    const reserve = this.data.reserve;
    if (reserve.accountIds && reserve.accountIds.length > 0) {
      const reservedSum = this.data.accounts
        .filter((a) => reserve.accountIds.includes(a.id))
        .reduce((sum, a) => sum + Math.max(0, a.balance), 0);
      reserve.currentAmount = reservedSum;
    }
    reserve.percentage = reserve.targetAmount > 0 ? Math.min(100, Math.round((reserve.currentAmount / reserve.targetAmount) * 100)) : 0;
    return reserve;
  }

  public updateReserve(updates: Partial<Reserve>): Reserve {
    Object.assign(this.data.reserve, updates);
    this.save();
    return this.getReserve();
  }

  public getGoals(): FinancialGoal[] {
    return this.data.goals;
  }

  public createGoal(params: Omit<FinancialGoal, 'id' | 'createdAt'>): FinancialGoal {
    const id = `goal_${Date.now()}`;
    const goal: FinancialGoal = {
      ...params,
      id,
      createdAt: new Date().toISOString(),
    };
    this.data.goals.push(goal);
    this.save();
    return goal;
  }

  public updateGoal(id: string, updates: Partial<FinancialGoal>): FinancialGoal | null {
    const goal = this.data.goals.find((g) => g.id === id);
    if (!goal) return null;
    Object.assign(goal, updates);
    this.save();
    return goal;
  }

  // --- User Memory (Mi Cerebro) ---
  public getMemory(): UserMemory[] {
    return [...this.data.memory].sort((a, b) => {
      const priorityOrder: Record<string, number> = {
        user_preference: 3,
        global: 2,
        learned_rule: 1,
        temporary_context: 0,
      };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });
  }

  public createMemory(params: Omit<UserMemory, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): UserMemory {
    const existing = this.data.memory.find(
      (m) => m.key.toLowerCase().trim() === params.key.toLowerCase().trim() && m.type === params.type
    );
    const now = new Date().toISOString();

    if (existing) {
      Object.assign(existing, params, { updatedAt: now });
      this.save();
      return existing;
    }

    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const mem: UserMemory = {
      ...params,
      id,
      usageCount: 1,
      createdAt: now,
      updatedAt: now,
    };
    this.data.memory.push(mem);
    this.save();
    return mem;
  }

  public updateMemory(id: string, updates: Partial<UserMemory>): UserMemory | null {
    const mem = this.data.memory.find((m) => m.id === id);
    if (!mem) return null;
    Object.assign(mem, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return mem;
  }

  public deleteMemory(id: string): boolean {
    const idx = this.data.memory.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    this.data.memory.splice(idx, 1);
    this.save();
    return true;
  }

  public matchMemoryRule(query: string): UserMemory[] {
    const clean = query.toLowerCase();
    return this.getMemory().filter((m) => clean.includes(m.key.toLowerCase()));
  }

  // --- Real Financial Summary (Patrimonio Real & Categorías Segregadas) ---
  public getRealFinancialSummary(period: 'today' | 'week' | 'month' = 'month'): RealFinancialSummary {
    const cashAcc = this.data.accounts.find((a) => a.id === 'acc_cash' || a.type === 'cash');
    const arqAcc = this.data.accounts.find((a) => a.id === 'acc_arq' || a.name.toLowerCase().includes('arq'));
    const bingxAcc = this.data.accounts.find((a) => a.id === 'acc_bingx' || a.name.toLowerCase().includes('bingx') || a.id === 'acc_copytrade');
    const cocosAcc = this.data.accounts.find((a) => a.id === 'acc_cocos' || a.name.toLowerCase().includes('cocos'));

    const cashAmount = cashAcc && cashAcc.active ? cashAcc.balance : 0;
    const digitalAmount = arqAcc && arqAcc.active ? arqAcc.balance : 0;
    const totalAvailable = Math.round((cashAmount + digitalAmount) * 100) / 100;

    const bingxEur = bingxAcc && bingxAcc.active ? bingxAcc.balance : 80;
    const cocosUsd = cocosAcc && cocosAcc.active ? cocosAcc.balance : 100;
    const usdToEurRate = 0.92;
    const cocosEurApprox = Math.round(cocosUsd * usdToEurRate * 100) / 100;
    const totalEurApprox = Math.round((bingxEur + cocosEurApprox) * 100) / 100;

    const ikualoPending = this.data.pendingIncomes.find((p) => p.id === 'pend_ikualo' || p.concept.toLowerCase().includes('ikualo') || p.origin?.toLowerCase().includes('ikualo'));
    const ikualoEur = ikualoPending && ikualoPending.status === 'pending' ? ikualoPending.amount : 40;

    const dejavuPendingItem = this.data.pendingIncomes.find((p) => p.id === 'pend_dejavu' || p.origin?.toLowerCase().includes('dejavu') || p.concept?.toLowerCase().includes('dejavu'));
    const dejavuPending = dejavuPendingItem ? dejavuPendingItem.status === 'pending' : true;

    // Confirmed real patrimony = Available cash + Digital + Confirmed investments (with approx note for USD)
    const realPatrimonyConfirmedEur = Math.round((totalAvailable + totalEurApprox) * 100) / 100;

    // Expenses in period
    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    const day = now.getDay() || 7;
    weekStart.setDate(now.getDate() - day + 1);
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    let spentToday = 0;
    let spentThisWeek = 0;
    let spentThisMonth = 0;

    for (const t of this.data.transactions) {
      if (t.type !== 'expense' || t.status === 'cancelled') continue;
      const tDate = new Date(t.date);
      if (tDate >= todayStart && tDate <= now) spentToday += t.amount;
      if (tDate >= weekStart && tDate <= now) spentThisWeek += t.amount;
      if (tDate >= monthStart && tDate <= now) spentThisMonth += t.amount;
    }

    return {
      cashAmount,
      digitalAmount,
      totalAvailable,
      investments: {
        bingxEur,
        cocosUsd,
        cocosEurApprox,
        totalEurApprox,
      },
      pending: {
        ikualoEur,
        dejavuPending,
        dejavuNotes: 'Turnos pendientes de liquidar (monto por confirmar)',
        totalConfirmedPendingEur: ikualoEur,
      },
      realPatrimonyConfirmedEur,
      usdToEurRate,
      spentToday: Math.round(spentToday * 100) / 100,
      spentThisWeek: Math.round(spentThisWeek * 100) / 100,
      spentThisMonth: Math.round(spentThisMonth * 100) / 100,
    };
  }

  // --- Summary & Calculations ---
  public getFinancialSummary(period: 'today' | 'week' | 'month' = 'month'): any {
    const realSummary = this.getRealFinancialSummary(period);

    // Saldo real disponible para gastar: SOLO DINERO DISPONIBLE (Efectivo 50 € + ARQ 32 € = 82 €)
    const realBalance = realSummary.totalAvailable;

    // Ingresos pendientes confirmados
    const pendingIncomeTotal = realSummary.pending.totalConfirmedPendingEur;

    // Gastos futuros
    const futureExpensesTotal = this.data.futureExpenses
      .filter((f) => f.status === 'pending')
      .reduce((sum, f) => sum + f.amount, 0);

    // Posición proyectada
    const projectedPosition = Math.round((realBalance + pendingIncomeTotal - futureExpensesTotal) * 100) / 100;

    // Período
    const now = new Date();
    const periodStart = new Date();
    if (period === 'today') {
      periodStart.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      const day = now.getDay() || 7;
      periodStart.setDate(now.getDate() - day + 1);
      periodStart.setHours(0, 0, 0, 0);
    } else {
      periodStart.setDate(1);
      periodStart.setHours(0, 0, 0, 0);
    }

    const txsInPeriod = this.data.transactions.filter((t) => {
      if (t.status === 'cancelled') return false;
      const tDate = new Date(t.date);
      return tDate >= periodStart && tDate <= now;
    });

    // NOTE: Transfer between own accounts is NOT income or expense!
    const incomeInPeriod = txsInPeriod
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenseInPeriod = txsInPeriod
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = Math.round((incomeInPeriod - expenseInPeriod) * 100) / 100;

    const reserve = this.getReserve();

    // Alertas inteligentes
    const alerts = [];
    if (reserve.currentAmount < reserve.targetAmount * 0.3) {
      alerts.push({
        id: 'alt_reserve_low',
        type: 'warning',
        title: 'Reserva de seguridad baja',
        message: `Tu reserva está al ${reserve.percentage}% (${reserve.currentAmount} € / ${reserve.targetAmount} €).`,
      });
    }

    if (futureExpensesTotal > realBalance) {
      alerts.push({
        id: 'alt_expenses_high',
        type: 'critical',
        title: 'Atención con próximos gastos',
        message: `Los gastos previstos (${futureExpensesTotal} €) superan tu saldo disponible actual (${realBalance} €).`,
      });
    }

    const overduePending = this.data.pendingIncomes.filter((p) => {
      if (p.status !== 'pending' || !p.expectedDate) return false;
      return new Date(p.expectedDate).getTime() < new Date().setHours(0, 0, 0, 0);
    });

    if (overduePending.length > 0) {
      alerts.push({
        id: 'alt_pending_overdue',
        type: 'info',
        title: 'Cobros pendientes a revisar',
        message: `Tienes ${overduePending.length} cobro(s) con fecha esperada ya vencida (${overduePending.map((p) => p.concept).join(', ')}).`,
      });
    }

    // Cálculo de Ritmo de Gasto y Nivel de Estabilidad Real
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentExpenses = this.data.transactions
      .filter((t) => t.type === 'expense' && t.status !== 'cancelled' && new Date(t.date) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + t.amount, 0);

    const calculatedBurn = recentExpenses > 0
      ? Math.round((recentExpenses / 4.28) * 100) / 100
      : futureExpensesTotal > 0
      ? Math.round((futureExpensesTotal / 4) * 100) / 100
      : 85;

    const weeklyBurnRate = Math.max(20, calculatedBurn);
    const runwayWeeks = weeklyBurnRate > 0 ? Math.round((realBalance / weeklyBurnRate) * 10) / 10 : 12;

    let stabilityStatus: 'stable' | 'tight' | 'at_risk' = 'tight';
    let stabilityLabel = 'AJUSTADO';
    let stabilityBadgeColor = 'amber';
    let stabilityReason = '';
    let stabilityAdvice = '';

    if (futureExpensesTotal > realBalance || realBalance < 50 || runwayWeeks < 1.5) {
      stabilityStatus = 'at_risk';
      stabilityLabel = 'EN RIESGO';
      stabilityBadgeColor = 'rose';
      stabilityReason = `Tus compromisos previstos (${futureExpensesTotal.toFixed(2)} €) superan tu dinero disponible actual (${realBalance.toFixed(2)} €). Autonomía: ${runwayWeeks} semanas.`;
      stabilityAdvice = 'Frená cualquier gasto secundario. Asegurá el cobro de pendientes y mantené el control estricto de caja.';
    } else if (reserve.percentage < 40 || realBalance < 300 || runwayWeeks < 4.0) {
      stabilityStatus = 'tight';
      stabilityLabel = 'AJUSTADO';
      stabilityBadgeColor = 'amber';
      stabilityReason = `Dinero disponible para el día a día (${realBalance.toFixed(2)} €). Se esperan cobros y la reserva está al ${reserve.percentage}%. Autonomía estimada: ${runwayWeeks} semanas.`;
      stabilityAdvice = 'Cuidar el efectivo y ARQ. Cobrar Ikualo y DejaVu antes de desembolsos no indispensables.';
    } else {
      stabilityStatus = 'stable';
      stabilityLabel = 'ESTABLE';
      stabilityBadgeColor = 'emerald';
      stabilityReason = `Disponés de saldo líquido suficiente (${realBalance.toFixed(2)} €) e inversiones activas (${realSummary.investments.totalEurApprox} €). Autonomía: ${runwayWeeks} semanas.`;
      stabilityAdvice = 'Situación equilibrada. Cumplir las misiones diarias y mantener el ritmo de ahorro.';
    }

    // Segregación de Capital clara
    const livingMoney = realBalance;
    const reserveMoney = reserve.currentAmount;
    const projectsMoney = this.data.projects.reduce((sum, p) => sum + p.accumulatedExpenses, 0);
    const investMoney = realSummary.investments.totalEurApprox;
    const availableMoney = realBalance;

    return {
      realBalance: Math.round(realBalance * 100) / 100,
      pendingIncomeTotal: Math.round(pendingIncomeTotal * 100) / 100,
      futureExpensesTotal: Math.round(futureExpensesTotal * 100) / 100,
      projectedPosition,
      reserveTarget: reserve.targetAmount,
      reserveCurrent: reserve.currentAmount,
      reservePercentage: reserve.percentage,
      stability: {
        status: stabilityStatus,
        label: stabilityLabel,
        badgeColor: stabilityBadgeColor,
        runwayWeeks,
        weeklyBurnRate,
        reserveProgressPercent: reserve.percentage,
        reason: stabilityReason,
        advice: stabilityAdvice,
      },
      capitalBuckets: {
        livingMoney,
        reserveMoney,
        projectsMoney,
        investMoney,
        availableMoney,
      },
      userProfile: this.data.user,
      periodStats: {
        period,
        income: Math.round(incomeInPeriod * 100) / 100,
        expenses: Math.round(expenseInPeriod * 100) / 100,
        netBalance,
      },
      accounts: this.data.accounts,
      alerts,
      realSummary,
    };
  }

  // --- ⚡ JARVIS LIFE XP (SISTEMA RPG DE VIDA) ---
  public getRpgState(): RpgState {
    if (!this.data.rpg) {
      this.data.rpg = JSON.parse(JSON.stringify(INITIAL_DATA.rpg));
      this.save();
    }

    const rpg = this.data.rpg;

    // Automatic level calculation
    const xp = Math.max(0, rpg.totalXp);
    let level = 1;
    let levelName = 'Supervivencia';
    let currentLevelXp = xp;
    let nextLevelXp = 1000;

    if (xp < 1000) {
      level = 1;
      levelName = 'Supervivencia';
      currentLevelXp = xp;
      nextLevelXp = 1000;
    } else if (xp < 2500) {
      level = 2;
      levelName = 'Estabilidad';
      currentLevelXp = xp - 1000;
      nextLevelXp = 1500;
    } else if (xp < 4500) {
      level = 3;
      levelName = 'Control';
      currentLevelXp = xp - 2500;
      nextLevelXp = 2000;
    } else if (xp < 7000) {
      level = 4;
      levelName = 'Generación';
      currentLevelXp = xp - 4500;
      nextLevelXp = 2500;
    } else if (xp < 10000) {
      level = 5;
      levelName = 'Construcción';
      currentLevelXp = xp - 7000;
      nextLevelXp = 3000;
    } else {
      level = 6;
      levelName = 'Crecimiento';
      currentLevelXp = xp - 10000;
      nextLevelXp = 5000;
    }

    const progressPercent = Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100));

    rpg.level = level;
    rpg.levelName = levelName;
    rpg.currentLevelXp = currentLevelXp;
    rpg.nextLevelXp = nextLevelXp;
    rpg.progressPercent = progressPercent;

    return rpg;
  }

  public updateRpgState(updates: Partial<RpgState>): RpgState {
    const current = this.getRpgState();
    Object.assign(current, updates, { lastUpdated: new Date().toISOString() });
    this.save();
    return this.getRpgState();
  }

  public recordRpgAction(action: string, xpChange: number, reason: string, livesChange?: number): RpgState {
    const rpg = this.getRpgState();
    rpg.totalXp = Math.max(0, rpg.totalXp + xpChange);

    if (livesChange !== undefined) {
      rpg.lives = Math.max(1, Math.min(5, rpg.lives + livesChange));
    }

    const historyEntry: RpgHistoryEntry = {
      id: `rpg_h_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action,
      xpChange,
      timestamp: Date.now(),
      reason,
      livesChange,
      createdAt: new Date().toISOString(),
    };

    if (!rpg.history) rpg.history = [];
    rpg.history.unshift(historyEntry);
    if (rpg.history.length > 50) rpg.history.pop();

    rpg.lastUpdated = new Date().toISOString();
    this.save();
    return this.getRpgState();
  }

  public recordSmoke(quantity: number = 1, notes?: string): { rpg: RpgState; entry: SmokeLogEntry } {
    const rpg = this.getRpgState();
    const penalty = rpg.config?.xpValues?.smokePenalty || -50;
    const now = new Date();

    const entry: SmokeLogEntry = {
      id: `smk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: now.toISOString().split('T')[0],
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      timestamp: Date.now(),
      quantity: Math.max(1, quantity),
      notes: notes || 'Registro de tabaco para autocontrol',
      xpDeducted: penalty,
    };

    if (!rpg.smokeLog) rpg.smokeLog = [];
    rpg.smokeLog.unshift(entry);

    // Reset or update 'Sin fumar' streak
    const noSmokeStreak = rpg.streaks?.find((s) => s.id === 'strk_nosmoke');
    if (noSmokeStreak) {
      noSmokeStreak.currentStreak = 0;
      noSmokeStreak.lastCompletedDate = undefined;
    }

    this.recordRpgAction('Tabaco / Fumar', penalty, `Registro de ${quantity} cigarrillo(s)`);

    return { rpg: this.getRpgState(), entry };
  }

  public toggleRpgMission(missionId: string): RpgState {
    const rpg = this.getRpgState();
    let found = rpg.dailyMissions?.find((m) => m.id === missionId);
    let isRecovery = false;

    if (!found) {
      found = rpg.weeklyMissions?.find((m) => m.id === missionId);
    }
    if (!found) {
      found = rpg.recoveryMissions?.find((m) => m.id === missionId);
      isRecovery = true;
    }

    if (found) {
      found.completed = !found.completed;
      if (found.completed) {
        found.completedAt = new Date().toISOString();
        const livesBonus = isRecovery ? 1 : undefined;
        this.recordRpgAction(found.title, found.xp, `Misión completada: ${found.title}`, livesBonus);
      } else {
        found.completedAt = undefined;
        this.recordRpgAction(found.title, -found.xp, `Misión desmarcada: ${found.title}`);
      }
    }

    this.save();
    return this.getRpgState();
  }

  public createRpgMission(mission: Partial<RpgMissionItem>): RpgState {
    const rpg = this.getRpgState();
    const id = `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newMission: RpgMissionItem = {
      id,
      title: mission.title || 'Nueva misión',
      category: mission.category || 'diaria',
      xp: mission.xp || 100,
      completed: false,
      frequency: mission.frequency || (mission.category === 'semanal' ? 'weekly' : mission.category === 'recuperacion' ? 'recovery' : 'daily'),
      createdAt: new Date().toISOString(),
    };

    if (newMission.category === 'semanal') {
      if (!rpg.weeklyMissions) rpg.weeklyMissions = [];
      rpg.weeklyMissions.push(newMission);
    } else if (newMission.category === 'recuperacion') {
      if (!rpg.recoveryMissions) rpg.recoveryMissions = [];
      rpg.recoveryMissions.push(newMission);
    } else {
      if (!rpg.dailyMissions) rpg.dailyMissions = [];
      rpg.dailyMissions.push(newMission);
    }

    this.save();
    return this.getRpgState();
  }

  public updateRpgMission(id: string, updates: Partial<RpgMissionItem>): RpgState {
    const rpg = this.getRpgState();
    const lists = [rpg.dailyMissions, rpg.weeklyMissions, rpg.recoveryMissions];
    for (const list of lists) {
      const item = list?.find((m) => m.id === id);
      if (item) {
        Object.assign(item, updates);
        break;
      }
    }
    this.save();
    return this.getRpgState();
  }

  public deleteRpgMission(id: string): RpgState {
    const rpg = this.getRpgState();
    if (rpg.dailyMissions) rpg.dailyMissions = rpg.dailyMissions.filter((m) => m.id !== id);
    if (rpg.weeklyMissions) rpg.weeklyMissions = rpg.weeklyMissions.filter((m) => m.id !== id);
    if (rpg.recoveryMissions) rpg.recoveryMissions = rpg.recoveryMissions.filter((m) => m.id !== id);
    this.save();
    return this.getRpgState();
  }

  public updateRpgConfig(config: Partial<RpgConfig>): RpgConfig {
    const rpg = this.getRpgState();
    if (!rpg.config) rpg.config = JSON.parse(JSON.stringify(INITIAL_DATA.rpg?.config));
    if (config.xpValues) Object.assign(rpg.config.xpValues, config.xpValues);
    if (config.streakBonus) Object.assign(rpg.config.streakBonus, config.streakBonus);
    this.save();
    return rpg.config;
  }

  public getTobaccoStats(): any {
    const rpg = this.getRpgState();
    const logs = rpg.smokeLog || [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const todayCount = logs
      .filter((l) => l.date === todayStr)
      .reduce((sum, l) => sum + (l.quantity || 1), 0);

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekCount = logs
      .filter((l) => l.timestamp >= sevenDaysAgo)
      .reduce((sum, l) => sum + (l.quantity || 1), 0);

    const totalCount = logs.reduce((sum, l) => sum + (l.quantity || 1), 0);
    const totalXpLost = logs.reduce((sum, l) => sum + Math.abs(l.xpDeducted || 50), 0);

    const distinctDays = new Set(logs.map((l) => l.date)).size;
    const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);
    const lastSmoked = sortedLogs[0]?.timestamp;

    let hoursWithoutSmoking = 0;
    let daysWithoutSmoking = 0;
    if (lastSmoked) {
      const diffMs = Date.now() - lastSmoked;
      hoursWithoutSmoking = Math.floor(diffMs / (1000 * 60 * 60));
      daysWithoutSmoking = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    } else {
      hoursWithoutSmoking = 24;
      daysWithoutSmoking = 1;
    }

    let trend: 'improving' | 'stable' | 'increasing' = 'stable';
    if (weekCount > 15) trend = 'increasing';
    else if (weekCount <= 7) trend = 'improving';

    return {
      todayCount,
      weekCount,
      totalCount,
      totalXpLost,
      distinctDays: distinctDays || 1,
      trend,
      hoursWithoutSmoking,
      daysWithoutSmoking,
      lastSmokedAt: lastSmoked ? new Date(lastSmoked).toISOString() : null,
      history: sortedLogs.slice(0, 30),
    };
  }

  // --- User Profile ---
  public getUserProfile(): UserProfile {
    return this.data.user;
  }

  public updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    this.data.user = {
      ...this.data.user,
      ...updates,
      preferences: {
        ...this.data.user.preferences,
        ...(updates.preferences || {}),
      },
    };
    this.save();
    return this.data.user;
  }

  // --- Export / Backup ---
  public exportJSON(): string {
    return JSON.stringify(this.data, null, 2);
  }

  public exportTransactionsCSV(): string {
    const headers = ['ID', 'Fecha', 'Tipo', 'Concepto', 'Importe', 'Moneda', 'Categoría', 'Subcategoría', 'Medio de Pago', 'Proyecto', 'Estado', 'Notas'];
    const rows = this.data.transactions.map((t) => {
      const cat = this.data.categories.find((c) => c.id === t.categoryId);
      const sub = cat?.subcategories.find((s) => s.id === t.subcategoryId);
      const acc = this.data.accounts.find((a) => a.id === t.paymentMethodId);
      const proj = this.data.projects.find((p) => p.id === t.projectId);
      return [
        t.id,
        t.date,
        t.type,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.amount,
        t.currency,
        `"${cat?.name || ''}"`,
        `"${sub?.name || ''}"`,
        `"${acc?.name || ''}"`,
        `"${proj?.name || ''}"`,
        t.status,
        `"${(t.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  }

  // --- Post-It Intelligence System ---
  public getPostIts(): PostIt[] {
    if (!this.data.postits) this.data.postits = [];
    return [...this.data.postits].sort((a, b) => {
      // Pinned first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Urgency and project hierarchy: red (urgencies) > purple (Creko) > orange (Burger Palusa) > blue (Sowfts) > yellow (libre) > green (metas/ocio)
      const order: Record<string, number> = { red: 1, purple: 2, orange: 3, blue: 4, yellow: 5, green: 6 };
      const diff = (order[a.colorPriority] || 99) - (order[b.colorPriority] || 99);
      if (diff !== 0) return diff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public getPostIt(id: string): PostIt | undefined {
    return this.data.postits?.find((p) => p.id === id);
  }

  public createPostIt(payload: Omit<PostIt, 'id' | 'createdAt' | 'updatedAt'>): PostIt {
    if (!this.data.postits) this.data.postits = [];
    const postIt: PostIt = {
      ...payload,
      id: `postit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: payload.status || 'active',
      colorPriority: payload.colorPriority || 'yellow',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.postits.unshift(postIt);
    this.save();
    return postIt;
  }

  public updatePostIt(id: string, updates: Partial<PostIt>): PostIt | null {
    if (!this.data.postits) this.data.postits = [];
    const idx = this.data.postits.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.postits[idx] = {
      ...this.data.postits[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.postits[idx];
  }

  public deletePostIt(id: string): boolean {
    if (!this.data.postits) return false;
    const initialLen = this.data.postits.length;
    this.data.postits = this.data.postits.filter((p) => p.id !== id);
    if (this.data.postits.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public trashPostIt(id: string, reason: 'completed' | 'discarded' = 'completed'): PostIt | null {
    const p = this.getPostIt(id);
    if (!p) return null;
    p.status = 'trashed';
    p.trashedAt = new Date().toISOString();
    if (reason === 'completed') {
      p.completedAt = new Date().toISOString();
    }
    p.updatedAt = new Date().toISOString();
    this.save();
    return p;
  }

  public restorePostIt(id: string): PostIt | null {
    const p = this.getPostIt(id);
    if (!p) return null;
    p.status = 'active';
    p.trashedAt = undefined;
    p.updatedAt = new Date().toISOString();
    this.save();
    return p;
  }

  public emptyPostItTrash(): { deletedCount: number } {
    if (!this.data.postits) return { deletedCount: 0 };
    const beforeCount = this.data.postits.length;
    this.data.postits = this.data.postits.filter((p) => p.status !== 'trashed' && p.status !== 'completed');
    const deletedCount = beforeCount - this.data.postits.length;
    if (deletedCount > 0) {
      this.save();
    }
    return { deletedCount };
  }

  public togglePostItChecklist(postItId: string, itemId: string): PostIt | null {
    const p = this.getPostIt(postItId);
    if (!p || !p.checklist) return null;
    const item = p.checklist.find((c) => c.id === itemId);
    if (item) {
      item.done = !item.done;
      p.updatedAt = new Date().toISOString();
      this.save();
    }
    return p;
  }

  public convertPostItToTask(postItId: string): { task: Task; postIt: PostIt } | null {
    const postIt = this.getPostIt(postItId);
    if (!postIt) return null;

    const taskPriorityMap: Record<string, 'urgent' | 'high' | 'medium' | 'low'> = {
      red: 'urgent',
      purple: 'high',
      orange: 'high',
      blue: 'medium',
      yellow: 'medium',
      green: 'low',
    };

    const task = this.createTask({
      title: postIt.title,
      projectId: postIt.projectId,
      goalId: postIt.goalId,
      priority: taskPriorityMap[postIt.colorPriority] || 'medium',
      status: 'todo',
      dueDate: postIt.date,
      financialImpact: postIt.moneyAmount
        ? { type: 'income_driver', expectedAmount: postIt.moneyAmount }
        : undefined,
      notes: postIt.description,
      postItId: postIt.id,
    });

    postIt.convertedTo = { type: 'task', referenceId: task.id };
    postIt.updatedAt = new Date().toISOString();
    this.save();

    return { task, postIt };
  }

  public getPostItCleanupAnalysis(): {
    summary: string;
    overdueCount: number;
    urgentCount: number;
    byProject: Record<string, number>;
    suggestions: Array<{ action: 'archive' | 'convert_task' | 'reorder'; postItId: string; reason: string }>;
  } {
    const postits = this.getPostIts().filter((p) => p.status === 'active');
    const today = new Date().toISOString().split('T')[0];
    let overdueCount = 0;
    let urgentCount = 0;
    const byProject: Record<string, number> = {};
    const suggestions: Array<{ action: 'archive' | 'convert_task' | 'reorder'; postItId: string; reason: string }> = [];

    for (const p of postits) {
      if (p.colorPriority === 'red') urgentCount++;
      if (p.date && p.date < today) {
        overdueCount++;
        suggestions.push({
          action: 'reorder',
          postItId: p.id,
          reason: `Venció el ${p.date}. Se sugiere actualizar fecha o cerrar.`,
        });
      }
      if (p.moneyAmount && !p.convertedTo) {
        suggestions.push({
          action: 'convert_task',
          postItId: p.id,
          reason: `Involucra dinero (${p.moneyAmount} €). Conviene convertir a tarea con impacto financiero.`,
        });
      }
      const proj = p.projectId || 'sin_proyecto';
      byProject[proj] = (byProject[proj] || 0) + 1;
    }

    return {
      summary: `Tenés ${postits.length} post-its activos (${urgentCount} urgentes, ${overdueCount} vencidos).`,
      overdueCount,
      urgentCount,
      byProject,
      suggestions,
    };
  }

  // --- Task Engine ---
  public getTasks(): Task[] {
    if (!this.data.tasks) this.data.tasks = [];
    return [...this.data.tasks].sort((a, b) => {
      // Priority: urgent (1), high (2), medium (3), low (4)
      const prioOrder: Record<string, number> = { urgent: 1, high: 2, medium: 3, low: 4 };
      const diff = (prioOrder[a.priority] || 99) - (prioOrder[b.priority] || 99);
      if (diff !== 0) return diff;
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;
      return new Date(a.dueDate || '9999').getTime() - new Date(b.dueDate || '9999').getTime();
    });
  }

  public getTask(id: string): Task | undefined {
    return this.data.tasks?.find((t) => t.id === id);
  }

  public createTask(payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    if (!this.data.tasks) this.data.tasks = [];
    const task: Task = {
      ...payload,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: payload.status || 'todo',
      priority: payload.priority || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.tasks.push(task);
    this.save();
    return task;
  }

  public updateTask(id: string, updates: Partial<Task>): Task | null {
    if (!this.data.tasks) this.data.tasks = [];
    const idx = this.data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.data.tasks[idx] = {
      ...this.data.tasks[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.tasks[idx];
  }

  public deleteTask(id: string): boolean {
    if (!this.data.tasks) return false;
    const initialLen = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter((t) => t.id !== id);
    if (this.data.tasks.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public toggleTaskStatus(id: string): Task | null {
    const t = this.getTask(id);
    if (!t) return null;
    t.status = t.status === 'done' ? 'todo' : 'done';
    t.updatedAt = new Date().toISOString();
    this.save();
    return t;
  }

  // --- Unified Calendar ---
  public getUnifiedCalendar(): any[] {
    const items: any[] = [];
    // Future Expenses
    for (const f of this.data.futureExpenses.filter((fe) => fe.status === 'pending')) {
      items.push({
        id: `cal_fe_${f.id}`,
        title: f.concept,
        type: 'future_expense',
        date: f.expectedDate,
        amount: f.amount,
        status: f.status,
        color: '#f43f5e',
        referenceId: f.id,
        subtitle: `Gasto previsto - ${f.amount} €`,
        isUrgent: new Date(f.expectedDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      });
    }
    // Pending Incomes
    for (const p of this.data.pendingIncomes.filter((pi) => pi.status === 'pending')) {
      items.push({
        id: `cal_pi_${p.id}`,
        title: p.concept,
        type: 'pending_income',
        date: p.expectedDate || new Date().toISOString().split('T')[0],
        amount: p.amount,
        status: p.status,
        color: '#10b981',
        referenceId: p.id,
        subtitle: `Cobro esperado + ${p.amount} €`,
        isUrgent: false,
      });
    }
    // Tasks with due dates
    for (const t of (this.data.tasks || []).filter((task) => task.dueDate && task.status !== 'done')) {
      items.push({
        id: `cal_tk_${t.id}`,
        title: t.title,
        type: 'task',
        date: t.dueDate,
        status: t.status,
        color: t.priority === 'urgent' ? '#ef4444' : t.priority === 'high' ? '#f97316' : '#3b82f6',
        referenceId: t.id,
        subtitle: `Tarea [${t.priority}]`,
        isUrgent: t.priority === 'urgent',
      });
    }
    // Post-its with dates
    for (const post of (this.data.postits || []).filter((p) => p.date && p.status === 'active')) {
      items.push({
        id: `cal_po_${post.id}`,
        title: post.title,
        type: 'postit',
        date: post.date,
        amount: post.moneyAmount,
        status: post.status,
        color: post.colorPriority === 'red' ? '#ef4444' : post.colorPriority === 'purple' ? '#a855f7' : post.colorPriority === 'orange' ? '#f97316' : post.colorPriority === 'blue' ? '#38bdf8' : post.colorPriority === 'green' ? '#10b981' : '#eab308',
        referenceId: post.id,
        subtitle: `Post-it: ${post.title}`,
        isUrgent: post.colorPriority === 'red',
      });
    }

    // Time Blocks
    for (const b of (this.data.timeBlocks || []).filter((block) => block.status !== 'cancelled')) {
      items.push({
        id: `cal_tb_${b.id}`,
        title: `${b.title}`,
        type: 'time_block',
        date: b.date,
        time: `${b.startTime} ─ ${b.endTime}`,
        startTime: b.startTime,
        endTime: b.endTime,
        area: b.area,
        objective: b.objective,
        suggestedTasks: b.suggestedTasks,
        resultNotes: b.resultNotes,
        status: b.status,
        color: b.color || '#a855f7',
        colorPriority: b.colorPriority,
        referenceId: b.id,
        subtitle: `${b.startTime}–${b.endTime} · ${b.objective}`,
        isUrgent: b.isFixed || b.area === 'changa',
        isFixed: b.isFixed,
        order: b.order,
      });
    }

    return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // --- TIME BLOCKING ENGINE (SISTEMA DE BLOQUES DE TIEMPO) ---

  public getTimeBlocks(targetDate?: string): {
    blocks: TimeBlock[];
    currentBlock: TimeBlock | null;
    nextBlock: TimeBlock | null;
    completedCount: number;
    backlog: { id: string; title: string; area: string; reason?: string }[];
  } {
    const today = new Date().toISOString().split('T')[0];
    const date = targetDate || today;

    if (!this.data.timeBlocks) {
      this.data.timeBlocks = [];
    }

    // Filter blocks for this date
    let dayBlocks = this.data.timeBlocks.filter((b) => b.date === date);

    // If no blocks exist for today and requested date is today, auto-generate them
    if (dayBlocks.length === 0 && date === today) {
      this.generateDailyTimeBlocks(date);
      dayBlocks = this.data.timeBlocks.filter((b) => b.date === date);
    }

    // Sort chronologically by startTime
    dayBlocks.sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Find current active block based on system local time (HH:MM)
    const now = new Date();
    const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let currentBlock: TimeBlock | null = null;
    let nextBlock: TimeBlock | null = null;

    // Prioritize in_progress block first
    const inProg = dayBlocks.find((b) => b.status === 'in_progress');
    if (inProg) {
      currentBlock = inProg;
    } else {
      // Find block matching current time slot
      const byTime = dayBlocks.find(
        (b) => currentHHMM >= b.startTime && currentHHMM < b.endTime && b.status !== 'completed' && b.status !== 'cancelled'
      );
      if (byTime) {
        currentBlock = byTime;
      } else {
        // Fallback to first non-completed block
        currentBlock = dayBlocks.find((b) => b.status === 'pending') || null;
      }
    }

    if (currentBlock) {
      const remaining = dayBlocks.filter(
        (b) => b.id !== currentBlock?.id && b.status !== 'completed' && b.status !== 'cancelled' && b.startTime >= currentBlock!.startTime
      );
      nextBlock = remaining[0] || null;
    }

    const completedCount = dayBlocks.filter((b) => b.status === 'completed').length;

    // Dynamic backlog of pending items / tasks passing to another moment
    const backlog: { id: string; title: string; area: string; reason?: string }[] = [];
    // Moved or cancelled blocks
    dayBlocks.filter((b) => b.status === 'moved' || b.status === 'cancelled').forEach((b) => {
      backlog.push({ id: b.id, title: b.title, area: b.area, reason: 'Pospuesto para optimizar la jornada' });
    });
    // Active tasks without a fixed slot today
    (this.data.tasks || []).filter((t) => t.status === 'todo' && t.priority !== 'urgent').slice(0, 3).forEach((t) => {
      backlog.push({ id: `back_task_${t.id}`, title: t.title, area: 'creko', reason: 'Tarea en backlog' });
    });

    return {
      blocks: dayBlocks,
      currentBlock,
      nextBlock,
      completedCount,
      backlog,
    };
  }

  public createTimeBlock(data: Partial<TimeBlock>): TimeBlock {
    const areaColors: Record<TimeBlockArea, { color: string; colorPriority: TimeBlock['colorPriority'] }> = {
      creko: { color: '#a855f7', colorPriority: 'purple' },
      producto: { color: '#f97316', colorPriority: 'orange' },
      empleo: { color: '#38bdf8', colorPriority: 'blue' },
      changa: { color: '#ef4444', colorPriority: 'red' },
      personal: { color: '#10b981', colorPriority: 'green' },
      organizacion: { color: '#eab308', colorPriority: 'yellow' },
    };

    const area = (data.area || 'creko') as TimeBlockArea;
    const style = areaColors[area] || areaColors.creko;

    const newBlock: TimeBlock = {
      id: `tb_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      date: data.date || new Date().toISOString().split('T')[0],
      startTime: data.startTime || '09:00',
      endTime: data.endTime || '10:00',
      area,
      focus: data.focus || data.title || 'Enfoque',
      title: data.title || 'Bloque de tiempo',
      objective: data.objective || 'Cumplir objetivos del bloque',
      suggestedTasks: data.suggestedTasks || [],
      status: (data.status as TimeBlockStatus) || 'pending',
      resultNotes: data.resultNotes || '',
      actualMinutes: data.actualMinutes,
      color: data.color || style.color,
      colorPriority: data.colorPriority || style.colorPriority,
      projectId: data.projectId,
      isFixed: data.isFixed || false,
      order: (this.data.timeBlocks?.length || 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.timeBlocks = this.data.timeBlocks || [];
    this.data.timeBlocks.push(newBlock);
    this.save();
    return newBlock;
  }

  public updateTimeBlock(id: string, updates: Partial<TimeBlock>): TimeBlock | null {
    const block = (this.data.timeBlocks || []).find((b) => b.id === id);
    if (!block) return null;

    Object.assign(block, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return block;
  }

  public deleteTimeBlock(id: string): boolean {
    const idx = (this.data.timeBlocks || []).findIndex((b) => b.id === id);
    if (idx === -1) return false;
    this.data.timeBlocks.splice(idx, 1);
    this.save();
    return true;
  }

  public updateTimeBlockStatus(
    id: string,
    status: TimeBlockStatus,
    resultNotes?: string,
    actualMinutes?: number
  ): { updated: TimeBlock; nextBlock: TimeBlock | null } | null {
    const block = (this.data.timeBlocks || []).find((b) => b.id === id);
    if (!block) return null;

    block.status = status;
    if (resultNotes !== undefined) block.resultNotes = resultNotes;
    if (actualMinutes !== undefined) block.actualMinutes = actualMinutes;
    block.updatedAt = new Date().toISOString();

    // If completed, register in execution history log
    if (status === 'completed') {
      this.data.timeBlockHistory = this.data.timeBlockHistory || [];
      const [startH, startM] = block.startTime.split(':').map(Number);
      const [endH, endM] = block.endTime.split(':').map(Number);
      const plannedMinutes = (endH * 60 + endM) - (startH * 60 + startM);

      this.data.timeBlockHistory.unshift({
        id: `tb_log_${Date.now()}`,
        blockId: block.id,
        date: block.date,
        title: block.title,
        area: block.area,
        plannedMinutes: plannedMinutes > 0 ? plannedMinutes : 45,
        actualMinutes: actualMinutes || plannedMinutes,
        status: 'completed',
        resultNotes: block.resultNotes || 'Completado con éxito',
        completedAt: new Date().toISOString(),
      });
    }

    // Automatically detect and advance next block if completing
    let nextBlock: TimeBlock | null = null;
    if (status === 'completed') {
      const nextPending = (this.data.timeBlocks || []).find(
        (b) => b.date === block.date && b.status === 'pending' && b.startTime >= block.endTime
      );
      if (nextPending) {
        nextPending.status = 'in_progress';
        nextPending.updatedAt = new Date().toISOString();
        nextBlock = nextPending;
      }
    }

    this.save();
    return { updated: block, nextBlock };
  }

  public extendTimeBlock(id: string, additionalMinutes: number): { extendedBlock: TimeBlock; shiftedBlocks: TimeBlock[] } | null {
    const block = (this.data.timeBlocks || []).find((b) => b.id === id);
    if (!block) return null;

    // Helper: add minutes to "HH:MM"
    const addMinutes = (timeStr: string, mins: number): string => {
      const [h, m] = timeStr.split(':').map(Number);
      const total = h * 60 + m + mins;
      const newH = Math.floor(total / 60) % 24;
      const newM = total % 60;
      return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    };

    const oldEnd = block.endTime;
    block.endTime = addMinutes(block.endTime, additionalMinutes);
    block.updatedAt = new Date().toISOString();

    const shiftedBlocks: TimeBlock[] = [];
    // Shift subsequent non-fixed blocks
    const subsequent = (this.data.timeBlocks || []).filter(
      (b) => b.date === block.date && b.id !== block.id && b.status !== 'completed' && !b.isFixed && b.startTime >= oldEnd
    );

    subsequent.sort((a, b) => a.startTime.localeCompare(b.startTime));

    for (const sub of subsequent) {
      sub.startTime = addMinutes(sub.startTime, additionalMinutes);
      sub.endTime = addMinutes(sub.endTime, additionalMinutes);
      sub.updatedAt = new Date().toISOString();
      shiftedBlocks.push(sub);
    }

    this.save();
    return { extendedBlock: block, shiftedBlocks };
  }

  public shiftUpcomingBlocks(fromTime: string, shiftMinutes: number, date?: string): TimeBlock[] {
    const targetDate = date || new Date().toISOString().split('T')[0];

    const addMinutes = (timeStr: string, mins: number): string => {
      const [h, m] = timeStr.split(':').map(Number);
      const total = h * 60 + m + mins;
      const newH = Math.floor(total / 60) % 24;
      const newM = total % 60;
      return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    };

    const affected = (this.data.timeBlocks || []).filter(
      (b) => b.date === targetDate && b.status !== 'completed' && !b.isFixed && b.startTime >= fromTime
    );

    affected.forEach((b) => {
      b.startTime = addMinutes(b.startTime, shiftMinutes);
      b.endTime = addMinutes(b.endTime, shiftMinutes);
      b.updatedAt = new Date().toISOString();
    });

    this.save();
    return affected;
  }

  public generateDailyTimeBlocks(targetDate?: string, forceRegenerate?: boolean): TimeBlock[] {
    const date = targetDate || new Date().toISOString().split('T')[0];

    if (!forceRegenerate && this.data.timeBlocks) {
      const existing = this.data.timeBlocks.filter((b) => b.date === date);
      if (existing.length > 0) return existing;
    }

    // Remove existing if force regenerate
    if (forceRegenerate && this.data.timeBlocks) {
      this.data.timeBlocks = this.data.timeBlocks.filter((b) => b.date !== date);
    }

    // Determine Day of week: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
    const dayOfWeek = new Date(date).getDay();

    // Check for fixed commitments from Changas (e.g. Josu)
    const fixedChangas = (this.data.changas || []).filter(
      (c) => !c.paid && (c.date === date || !c.date)
    );

    // Build adaptive schedule based on Fran's actual day needs
    // Lunes: CREKO + empleo + producto
    // Martes: CREKO + producción + trabajo puntual
    // Miércoles: Empleo + CREKO + desarrollo de producto
    // Jueves: Captación + producción + reuniones
    // Viernes: CREKO + seguimiento + organización semanal
    const newBlocks: Omit<TimeBlock, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    // Morning Core: Captación & Mensajes (Always high priority for Creko)
    newBlocks.push({
      date,
      startTime: '08:30',
      endTime: '09:00',
      area: 'creko',
      focus: 'Captación',
      title: 'CREKO — Captación',
      objective: 'Preparar y detectar 15 nuevos locales comerciales en Google Maps.',
      suggestedTasks: [
        'Buscar comercios en Logroño centro en Google Maps',
        'Extraer números de WhatsApp e Instagram',
        'Anotar tipo de cartelería actual para propuesta personalizada',
      ],
      status: 'pending',
      color: '#a855f7',
      colorPriority: 'purple',
      projectId: 'proj_creko',
      isFixed: false,
      order: 1,
    });

    newBlocks.push({
      date,
      startTime: '09:00',
      endTime: '10:00',
      area: 'creko',
      focus: 'Mensajes',
      title: 'CREKO — Mensajes',
      objective: 'Enviar mensajes directos y registrar respuestas de los comercios.',
      suggestedTasks: [
        'Enviar mensajes personalizados a prospectos detectados',
        'Seguimiento a Peluquería Velvet (PRE-2026-001)',
        'Registrar respuestas en el embudo de captación',
      ],
      status: 'pending',
      color: '#a855f7',
      colorPriority: 'purple',
      projectId: 'proj_creko',
      isFixed: false,
      order: 2,
    });

    // 40 min Morning Job search block (Fran's explicit requirement: EMPLEO — Búsqueda de 40 min)
    newBlocks.push({
      date,
      startTime: '10:00',
      endTime: '10:40',
      area: 'empleo',
      focus: 'Búsqueda',
      title: 'EMPLEO — Búsqueda (40 min)',
      objective: 'Buscar ofertas, investigar oportunidades, guardar ofertas interesantes y enviar CV.',
      suggestedTasks: [
        'Explorar InfoJobs y LinkedIn en Logroño y La Rioja',
        'Guardar 3 ofertas de diseño, rotulación o impresión técnica',
        'Enviar CV y postulación a 2 empresas seleccionadas',
      ],
      status: 'pending',
      color: '#38bdf8',
      colorPriority: 'blue',
      isFixed: false,
      order: 3,
    });

    // Rest/Coffee break
    newBlocks.push({
      date,
      startTime: '10:40',
      endTime: '11:00',
      area: 'personal',
      focus: 'Descanso',
      title: 'Descanso & Café',
      objective: 'Pausa de 20 minutos sin pantallas, hidratación y recarga de enfoque.',
      suggestedTasks: ['Café/Agua', 'Desconectar ojos de pantalla', 'Estiramiento breve'],
      status: 'pending',
      color: '#10b981',
      colorPriority: 'green',
      isFixed: false,
      order: 4,
    });

    // Midday adaptive blocks depending on day of week
    if (dayOfWeek === 2 || dayOfWeek === 4) {
      // Martes / Jueves: Producción intensiva + Creatividad
      newBlocks.push({
        date,
        startTime: '11:00',
        endTime: '12:00',
        area: 'creko',
        focus: 'Creatividad & Presupuestos',
        title: 'CREKO — Creatividad',
        objective: 'Definir ideas visuales y mockups para clientes actuales.',
        suggestedTasks: ['Bocetos cristalera', 'Ajuste de colores y mockups'],
        status: 'pending',
        color: '#a855f7',
        colorPriority: 'purple',
        projectId: 'proj_creko',
        isFixed: false,
        order: 5,
      });

      newBlocks.push({
        date,
        startTime: '12:00',
        endTime: '13:00',
        area: 'creko',
        focus: 'Producción',
        title: 'CREKO — Producción & DTF UV',
        objective: 'Generar imágenes en alta fidelidad y coordinar archivos de impresión.',
        suggestedTasks: ['Generación de 4 artes en HD', 'Vectorización con semitonos'],
        status: 'pending',
        color: '#a855f7',
        colorPriority: 'purple',
        projectId: 'proj_creko',
        isFixed: false,
        order: 6,
      });
    } else {
      // Lunes / Miércoles / Viernes: Seguimiento + Desarrollo
      newBlocks.push({
        date,
        startTime: '11:00',
        endTime: '12:30',
        area: 'creko',
        focus: 'Seguimiento & Presupuestos',
        title: 'CREKO — Seguimiento & Cierre',
        objective: 'Seguimiento de presupuestos enviados (Velvet, Atlas) y cierre de ventas.',
        suggestedTasks: ['Llamada de seguimiento', 'Resolución de dudas de presupuesto'],
        status: 'pending',
        color: '#a855f7',
        colorPriority: 'purple',
        projectId: 'proj_creko',
        isFixed: false,
        order: 5,
      });
    }

    // Lunch
    newBlocks.push({
      date,
      startTime: '13:00',
      endTime: '14:00',
      area: 'personal',
      focus: 'Comida',
      title: 'Comida & Descanso',
      objective: 'Alimentación nutritiva y desconexión.',
      suggestedTasks: ['Comida sana', 'Descanso'],
      status: 'pending',
      color: '#10b981',
      colorPriority: 'green',
      isFixed: false,
      order: 7,
    });

    // Afternoon: Product Development (Prototipo Cartel 3D + láser + DTF UV)
    newBlocks.push({
      date,
      startTime: '14:00',
      endTime: '15:30',
      area: 'producto',
      focus: 'Prototipo',
      title: 'PRODUCTO — Prototipo Cartel',
      objective: 'Avanzar cartel: Estructura en L 3D + disco circular láser + estampa DTF UV para ferias.',
      suggestedTasks: [
        'Ajustar pieza L en impresión 3D',
        'Definir diámetro corte láser',
        'Coste unitario vs precio de venta',
      ],
      status: 'pending',
      color: '#f97316',
      colorPriority: 'orange',
      projectId: 'proj_burger_palusa',
      isFixed: false,
      order: 8,
    });

    // Fixed Changas / Work commitment if any (e.g. Josu 180 €)
    if (fixedChangas.length > 0) {
      const topChanga = fixedChangas[0];
      newBlocks.push({
        date,
        startTime: '16:00',
        endTime: '17:30',
        area: 'changa',
        focus: topChanga.categoryName,
        title: `TRABAJOS — ${topChanga.categoryName} (${topChanga.amount} €)`,
        objective: `Compromiso de trabajo puntual y seguimiento de cobro de ${topChanga.amount} €.`,
        suggestedTasks: ['Ejecución o coordinación', 'Confirmación de pago'],
        status: 'pending',
        color: '#ef4444',
        colorPriority: 'red',
        isFixed: true,
        order: 9,
      });
    }

    // Evening: Gym & Personal Health
    newBlocks.push({
      date,
      startTime: '18:30',
      endTime: '19:30',
      area: 'personal',
      focus: 'Gimnasio',
      title: 'PERSONAL — Gimnasio & Salud',
      objective: 'Entrenamiento físico, energía y bienestar mental.',
      suggestedTasks: ['Sesión de pesas', 'Llegar a la meta de 8.000 pasos', 'Estiramientos'],
      status: 'pending',
      color: '#10b981',
      colorPriority: 'green',
      isFixed: false,
      order: 10,
    });

    // End of day organization
    newBlocks.push({
      date,
      startTime: '19:40',
      endTime: '20:15',
      area: 'organizacion',
      focus: 'Cierre del Día',
      title: 'ORGANIZACIÓN — Cierre & Finanzas',
      objective: 'Cerrar el día, registrar resultados, verificar saldo y preparar mañana.',
      suggestedTasks: [
        'Registrar resultados finales en los bloques de hoy',
        'Chequear saldo real en efectivo (145 €) y movimientos',
        'Dejar listos los bloques y prioridades del día siguiente',
      ],
      status: 'pending',
      color: '#eab308',
      colorPriority: 'yellow',
      isFixed: false,
      order: 11,
    });

    const createdBlocks: TimeBlock[] = newBlocks.map((b, idx) => ({
      ...b,
      id: `tb_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    this.data.timeBlocks = this.data.timeBlocks || [];
    this.data.timeBlocks.push(...createdBlocks);
    this.save();

    return createdBlocks;
  }

  public exportTimeBlocksToIcs(targetDate?: string): string {
    const date = targetDate || new Date().toISOString().split('T')[0];
    const blocks = (this.data.timeBlocks || []).filter((b) => b.date === date);

    // Generate valid RFC 5545 iCalendar string
    const formatIcsDate = (dStr: string, timeStr: string) => {
      const [y, m, d] = dStr.split('-');
      const [hh, mm] = timeStr.split(':');
      return `${y}${m}${d}T${hh}${mm}00`;
    };

    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//JARVIS AI//Time Blocking System//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:JARVIS Bloques de Tiempo',
      'X-WR-TIMEZONE:Europe/Madrid',
    ];

    for (const b of blocks) {
      const start = formatIcsDate(b.date, b.startTime);
      const end = formatIcsDate(b.date, b.endTime);
      ics.push(
        'BEGIN:VEVENT',
        `UID:jarvis_tb_${b.id}@jarvis.ai`,
        `DTSTAMP:${formatIcsDate(date, '08:00')}Z`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:[${b.area.toUpperCase()}] ${b.title}`,
        `DESCRIPTION:Objetivo: ${b.objective}\\nEstado: ${b.status}${b.resultNotes ? '\\nResultado: ' + b.resultNotes : ''}`,
        `STATUS:${b.status === 'completed' ? 'CONFIRMED' : 'TENTATIVE'}`,
        'END:VEVENT'
      );
    }

    ics.push('END:VCALENDAR');
    return ics.join('\r\n');
  }

  public getTimeBlockLogs(limit: number = 20): TimeBlockExecutionLog[] {
    return (this.data.timeBlockHistory || []).slice(0, limit);
  }

  // --- JARVIS 2.0 EXTENSION METHODS ---

  // Habits
  public getHabits(): Habit[] {
    return this.data.habits || [];
  }

  public toggleHabit(id: string): Habit | null {
    const habit = (this.data.habits || []).find((h) => h.id === id);
    if (!habit) return null;
    habit.completedToday = !habit.completedToday;
    if (habit.completedToday) {
      habit.streak = (habit.streak || 0) + 1;
    } else {
      habit.streak = Math.max(0, (habit.streak || 1) - 1);
    }
    this.save();
    return habit;
  }

  public createHabit(data: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completedToday'>): Habit {
    const habit: Habit = {
      id: `hab_${Date.now()}`,
      title: data.title,
      icon: data.icon || 'Sparkles',
      category: data.category || 'habits',
      streak: 0,
      completedToday: false,
      createdAt: new Date().toISOString(),
    };
    this.data.habits = this.data.habits || [];
    this.data.habits.push(habit);
    this.save();
    return habit;
  }

  public deleteHabit(id: string): boolean {
    const idx = (this.data.habits || []).findIndex((h) => h.id === id);
    if (idx === -1) return false;
    this.data.habits.splice(idx, 1);
    this.save();
    return true;
  }

  // Checkins / Mood
  public getCheckins(): DailyCheckin[] {
    return (this.data.checkins || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getLatestCheckin(): DailyCheckin | null {
    const checkins = this.getCheckins();
    return checkins.length > 0 ? checkins[0] : null;
  }

  public saveCheckin(data: Omit<DailyCheckin, 'id' | 'createdAt'>): DailyCheckin {
    this.data.checkins = this.data.checkins || [];
    const existingIdx = this.data.checkins.findIndex((c) => c.date === data.date);
    const newEntry: DailyCheckin = {
      id: existingIdx >= 0 ? this.data.checkins[existingIdx].id : `chk_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      this.data.checkins[existingIdx] = newEntry;
    } else {
      this.data.checkins.unshift(newEntry);
    }

    // Sync habits completed today
    if (data.habitsCompleted && Array.isArray(data.habitsCompleted)) {
      for (const h of this.data.habits || []) {
        if (data.habitsCompleted.includes(h.id)) {
          if (!h.completedToday) {
            h.completedToday = true;
            h.streak = (h.streak || 0) + 1;
          }
        }
      }
    }

    this.save();
    return newEntry;
  }

  // Creko Leads (CRM Pipeline)
  public getCrekoLeads(): CrekoLead[] {
    return (this.data.crekoLeads || []).sort(
      (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    );
  }

  public createCrekoLead(data: Omit<CrekoLead, 'id' | 'createdAt' | 'updatedAt'>): CrekoLead {
    const lead: CrekoLead = {
      ...data,
      id: `lead_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.crekoLeads = this.data.crekoLeads || [];
    this.data.crekoLeads.unshift(lead);
    this.save();
    return lead;
  }

  public updateCrekoLead(id: string, updates: Partial<CrekoLead>): CrekoLead | null {
    const lead = (this.data.crekoLeads || []).find((l) => l.id === id);
    if (!lead) return null;
    Object.assign(lead, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return lead;
  }

  public deleteCrekoLead(id: string): boolean {
    const idx = (this.data.crekoLeads || []).findIndex((l) => l.id === id);
    if (idx === -1) return false;
    this.data.crekoLeads.splice(idx, 1);
    this.save();
    return true;
  }

  // Creko Quotes (Presupuestos)
  public getCrekoQuotes(): CrekoQuote[] {
    return (this.data.crekoQuotes || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createCrekoQuote(data: Omit<CrekoQuote, 'id' | 'createdAt'>): CrekoQuote {
    const quote: CrekoQuote = {
      ...data,
      id: `quote_${Date.now()}`,
      code: data.code || `PRE-${new Date().getFullYear()}-${String((this.data.crekoQuotes || []).length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    this.data.crekoQuotes = this.data.crekoQuotes || [];
    this.data.crekoQuotes.unshift(quote);
    this.save();
    return quote;
  }

  public updateCrekoQuote(id: string, updates: Partial<CrekoQuote>): CrekoQuote | null {
    const quote = (this.data.crekoQuotes || []).find((q) => q.id === id);
    if (!quote) return null;
    Object.assign(quote, updates);
    this.save();
    return quote;
  }

  public deleteCrekoQuote(id: string): boolean {
    const idx = (this.data.crekoQuotes || []).findIndex((q) => q.id === id);
    if (idx === -1) return false;
    this.data.crekoQuotes.splice(idx, 1);
    this.save();
    return true;
  }

  // Creko Opportunities (Google Maps / Captación)
  public getCrekoOpportunities(): GoogleMapsOpportunity[] {
    return (this.data.crekoOpportunities || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createCrekoOpportunity(data: Omit<GoogleMapsOpportunity, 'id' | 'createdAt'>): GoogleMapsOpportunity {
    const opp: GoogleMapsOpportunity = {
      ...data,
      id: `opp_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.crekoOpportunities = this.data.crekoOpportunities || [];
    this.data.crekoOpportunities.unshift(opp);
    this.save();
    return opp;
  }

  public convertOpportunityToLeadOrTask(id: string, target: 'lead' | 'task'): { opportunity: GoogleMapsOpportunity; lead?: CrekoLead; task?: Task } | null {
    const opp = (this.data.crekoOpportunities || []).find((o) => o.id === id);
    if (!opp) return null;

    let lead: CrekoLead | undefined;
    let task: Task | undefined;

    if (target === 'lead') {
      lead = this.createCrekoLead({
        name: opp.name,
        company: opp.name,
        source: 'google_maps',
        status: 'lead',
        potentialValue: opp.potentialAmount,
        probability: 50,
        notes: `Origen Google Maps (${opp.area}). Acción sugerida: ${opp.suggestedAction}. Info: ${opp.phoneOrIG || ''}`,
      });
      opp.leadId = lead.id;
      opp.status = 'converted';
    } else {
      task = this.createTask({
        title: `Contactar a ${opp.name} (${opp.area})`,
        projectId: 'proj_creko',
        priority: 'high',
        durationMinutes: 20,
        effort: 'low',
        financialImpact: { type: 'income_driver', expectedAmount: opp.potentialAmount },
        notes: `${opp.suggestedAction}. Contacto: ${opp.phoneOrIG || 'Buscar en Maps'}`,
        status: 'todo',
      });
      opp.taskId = task.id;
      opp.status = 'contacted';
    }

    this.save();
    return { opportunity: opp, lead, task };
  }

  // Spain Process Docs (Rotuprint / Regularización)
  public getSpainDocs(): SpainProcessDoc[] {
    return this.data.spainDocs || [];
  }

  public createSpainDoc(data: Omit<SpainProcessDoc, 'id' | 'updatedAt'>): SpainProcessDoc {
    const doc: SpainProcessDoc = {
      ...data,
      id: `doc_${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    this.data.spainDocs = this.data.spainDocs || [];
    this.data.spainDocs.push(doc);
    this.save();
    return doc;
  }

  public updateSpainDoc(id: string, updates: Partial<SpainProcessDoc>): SpainProcessDoc | null {
    const doc = (this.data.spainDocs || []).find((d) => d.id === id);
    if (!doc) return null;
    Object.assign(doc, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return doc;
  }

  public deleteSpainDoc(id: string): boolean {
    const idx = (this.data.spainDocs || []).findIndex((d) => d.id === id);
    if (idx === -1) return false;
    this.data.spainDocs.splice(idx, 1);
    this.save();
    return true;
  }

  // Missions
  public getMissions(): Mission[] {
    return this.data.missions || [];
  }

  public createMission(data: Omit<Mission, 'id'>): Mission {
    const mission: Mission = {
      ...data,
      id: `mis_${Date.now()}`,
    };
    this.data.missions = this.data.missions || [];
    this.data.missions.push(mission);
    this.save();
    return mission;
  }

  public updateMission(id: string, updates: Partial<Mission>): Mission | null {
    const mission = (this.data.missions || []).find((m) => m.id === id);
    if (!mission) return null;
    Object.assign(mission, updates);
    this.save();
    return mission;
  }

  // Jarvis Settings
  public getJarvisSettings(): JarvisSettings {
    return (
      this.data.settings || {
        intensity: 'normal',
        confirmHighExpenses: true,
        highExpenseThreshold: 300,
        enableDailyCheckinReminder: true,
        activeModules: ['money', 'quick_actions', 'postits', 'tasks', 'creko', 'spain_process', 'habits', 'missions', 'calendar', 'alerts', 'jarvis'],
      }
    );
  }

  public updateJarvisSettings(updates: Partial<JarvisSettings>): JarvisSettings {
    this.data.settings = { ...this.getJarvisSettings(), ...updates };
    this.save();
    return this.data.settings;
  }

  // Strategic Decision Engines: "¿Qué hago hoy?" & "Generar Dinero"
  public getDailyPlan() {
    const pendingIncomes = this.getPendingIncomes().filter((p) => p.status === 'pending');
    const waitingQuotes = (this.data.crekoQuotes || []).filter((q) => q.status === 'waiting' || q.needsFollowUp);
    const activeTasks = (this.data.tasks || []).filter((t) => t.status !== 'done');
    const rotuprintDoc = (this.data.spainDocs || []).find((d) => d.category === 'rotuprint' && d.status === 'in_progress');

    const topActions = [];

    // 1. Cobros pendientes de impacto directo
    if (pendingIncomes.length > 0) {
      const topPending = pendingIncomes[0];
      topActions.push({
        id: 'act_pending_' + topPending.id,
        type: 'collect_money',
        title: `Reclamar o confirmar cobro: ${topPending.concept}`,
        amount: topPending.amount,
        urgency: 'high',
        reason: 'Impacto directo en liquidez inmediata (€145 actuales)',
      });
    }

    // 2. Presupuestos sin respuesta
    if (waitingQuotes.length > 0) {
      const q = waitingQuotes[0];
      topActions.push({
        id: 'act_quote_' + q.id,
        type: 'follow_up_quote',
        title: `Hacer seguimiento a ${q.clientName} sobre ${q.code} (${q.amount} €)`,
        amount: q.amount,
        urgency: 'high',
        reason: 'Presupuesto ya enviado. El 70% de los cierres se logran con el primer recordatorio.',
      });
    }

    // 3. Documento Rotuprint o Tarea prioritaria
    if (rotuprintDoc) {
      topActions.push({
        id: 'act_doc_' + rotuprintDoc.id,
        type: 'rotuprint_spain',
        title: `Seguimiento de ${rotuprintDoc.title}`,
        urgency: 'medium',
        reason: 'Clave para la estabilidad legal y regularización a mediano plazo en España.',
      });
    } else if (activeTasks.length > 0) {
      const topTask = activeTasks.find((t) => t.priority === 'urgent') || activeTasks[0];
      topActions.push({
        id: 'act_task_' + topTask.id,
        type: 'execute_task',
        title: topTask.title,
        amount: topTask.financialImpact?.expectedAmount,
        urgency: topTask.priority,
        reason: topTask.notes || 'Tarea activa prioritaria en tu lista.',
      });
    }

    const timeBlockData = this.getTimeBlocks();
    const blocks = timeBlockData.blocks.map((b) => ({
      id: b.id,
      slot: `${b.startTime} - ${b.endTime}`,
      startTime: b.startTime,
      endTime: b.endTime,
      focus: b.title,
      area: b.area,
      objective: b.objective,
      status: b.status,
      resultNotes: b.resultNotes,
      color: b.color,
      colorPriority: b.colorPriority,
      tasks: b.suggestedTasks && b.suggestedTasks.length > 0 ? b.suggestedTasks : [b.objective],
      isFixed: b.isFixed,
    }));

    return {
      topActions,
      blocks,
      currentBlock: timeBlockData.currentBlock,
      nextBlock: timeBlockData.nextBlock,
      completedCount: timeBlockData.completedCount,
      backlog: timeBlockData.backlog,
      why: 'La situación actual requiere PROTEGER la liquidez inmediata (€145) cobrando los 180 € pendientes y activando ventas de Creko para alcanzar la meta de 1.000 € de reserva.',
    };
  }

  public getMoneyGenerationActions(duration: '30m' | '1h' | '2h' | '4h' | 'allday') {
    const actions = [];
    let totalPotential = 0;

    // Presupuestos enviados
    for (const q of (this.data.crekoQuotes || []).filter((q) => q.status === 'waiting' || q.status === 'draft')) {
      actions.push({
        title: q.status === 'waiting' ? `Escribir a ${q.clientName} (Presupuesto ${q.code})` : `Terminar y enviar presupuesto a ${q.clientName}`,
        category: 'Creko Cierre',
        potentialAmount: q.amount,
        estimatedTime: '15 min',
        actionType: 'whatsapp_or_call',
      });
      totalPotential += q.amount;
    }

    // Cobros pendientes
    for (const pi of (this.data.pendingIncomes || []).filter((p) => p.status === 'pending')) {
      actions.push({
        title: `Gestionar cobro inmediato: ${pi.concept}`,
        category: 'Cobro Inmediato',
        potentialAmount: pi.amount,
        estimatedTime: '10 min',
        actionType: 'collect',
      });
      totalPotential += pi.amount;
    }

    // Leads en captación
    for (const opp of (this.data.crekoOpportunities || []).filter((o) => o.status === 'discovered')) {
      actions.push({
        title: `Proponer servicio a ${opp.name} (${opp.category})`,
        category: 'Captación Activa',
        potentialAmount: opp.potentialAmount,
        estimatedTime: '20 min',
        actionType: 'outreach',
      });
      totalPotential += opp.potentialAmount;
    }

    // Filtrar o priorizar según el tiempo disponible
    let limit = 5;
    if (duration === '30m') limit = 2;
    else if (duration === '1h') limit = 4;
    else if (duration === '2h') limit = 7;
    else limit = 12;

    const selected = actions.slice(0, limit);
    const sum = selected.reduce((acc, a) => acc + a.potentialAmount, 0);

    return {
      duration,
      actions: selected,
      estimatedPotential: sum,
      message: `En ${duration === '30m' ? '30 minutos' : duration === '1h' ? '1 hora' : duration} podés movilizar hasta ${sum} € ejecutando estas acciones directas de alto impacto.`,
    };
  }

  // --- CHANGAS (INGRESOS OCASIONALES) ---
  public getChangas(): Changa[] {
    return this.data.changas || [];
  }

  public createChanga(params: Omit<Changa, 'id' | 'createdAt'>): Changa {
    const id = `changa_${Date.now()}`;
    const changa: Changa = {
      ...params,
      id,
      createdAt: new Date().toISOString(),
    };
    if (!this.data.changas) this.data.changas = [];
    this.data.changas.unshift(changa);

    // If paid, create confirmed transaction
    if (changa.paid && changa.amount > 0) {
      const acc =
        (changa.paymentMethodId && this.data.accounts.find((a) => a.id === changa.paymentMethodId)) ||
        this.data.accounts.find((a) => a.id === 'acc_cash') ||
        this.data.accounts[0];
      const catGen = this.data.categories.find((c) => c.id === 'cat_gen_ingresos') || this.data.categories[0];
      const { transaction } = this.createTransaction({
        type: 'income',
        amount: changa.amount,
        currency: 'EUR',
        categoryId: catGen.id,
        paymentMethodId: acc.id,
        description: `Changa: ${changa.categoryName} (${changa.clientOrPerson})`,
        date: changa.date || new Date().toISOString().split('T')[0],
        status: 'confirmed',
        source: 'manual',
        notes: `Changa #${changa.id}. ${changa.notes || ''}`,
      });
      changa.transactionId = transaction.id;
      changa.paymentMethodId = acc.id;
    } else if (!changa.paid && changa.amount > 0) {
      // Record as pending income
      this.createPendingIncome({
        concept: `Changa: ${changa.categoryName} (${changa.clientOrPerson})`,
        amount: changa.amount,
        origin: changa.categoryName,
        expectedDate: changa.date,
        notes: changa.notes,
      });
    }

    this.save();
    return changa;
  }

  public toggleChangaPaid(id: string, paymentMethodId?: string): Changa | null {
    const changa = (this.data.changas || []).find((c) => c.id === id);
    if (!changa) return null;
    changa.paid = !changa.paid;
    if (changa.paid && !changa.transactionId && changa.amount > 0) {
      const acc =
        (paymentMethodId && this.data.accounts.find((a) => a.id === paymentMethodId)) ||
        this.data.accounts.find((a) => a.id === 'acc_cash') ||
        this.data.accounts[0];
      const catGen = this.data.categories.find((c) => c.id === 'cat_gen_ingresos') || this.data.categories[0];
      const { transaction } = this.createTransaction({
        type: 'income',
        amount: changa.amount,
        currency: 'EUR',
        categoryId: catGen.id,
        paymentMethodId: acc.id,
        description: `Cobro de Changa: ${changa.categoryName} (${changa.clientOrPerson})`,
        date: new Date().toISOString().split('T')[0],
        status: 'confirmed',
        source: 'manual',
      });
      changa.transactionId = transaction.id;
      changa.paymentMethodId = acc.id;
    }
    this.save();
    return changa;
  }

  public deleteChanga(id: string): boolean {
    const idx = (this.data.changas || []).findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.changas.splice(idx, 1);
    this.save();
    return true;
  }

  // --- CREKO PILAR 2: SISTEMA DE PRODUCCIÓN ---
  public getCrekoProduction(): CrekoProductionOrder[] {
    return this.data.crekoProductionOrders || [];
  }

  public createCrekoProduction(
    params: Omit<CrekoProductionOrder, 'id' | 'createdAt' | 'updatedAt'>
  ): CrekoProductionOrder {
    const id = `prod_${Date.now()}`;
    const item: CrekoProductionOrder = {
      ...params,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!this.data.crekoProductionOrders) this.data.crekoProductionOrders = [];
    this.data.crekoProductionOrders.unshift(item);
    this.save();
    return item;
  }

  public updateCrekoProduction(
    id: string,
    updates: Partial<CrekoProductionOrder>
  ): CrekoProductionOrder | null {
    const item = (this.data.crekoProductionOrders || []).find((p) => p.id === id);
    if (!item) return null;
    Object.assign(item, { ...updates, updatedAt: new Date().toISOString() });
    this.save();
    return item;
  }

  public deleteCrekoProduction(id: string): boolean {
    const idx = (this.data.crekoProductionOrders || []).findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.data.crekoProductionOrders.splice(idx, 1);
    this.save();
    return true;
  }

  // --- CREKO PILAR 3: SISTEMA DE CONTENIDO ---
  public getCrekoContent(): CrekoContentItem[] {
    return this.data.crekoContentItems || [];
  }

  public createCrekoContent(params: Omit<CrekoContentItem, 'id' | 'createdAt'>): CrekoContentItem {
    const id = `cont_${Date.now()}`;
    const item: CrekoContentItem = {
      ...params,
      id,
      createdAt: new Date().toISOString(),
    };
    if (!this.data.crekoContentItems) this.data.crekoContentItems = [];
    this.data.crekoContentItems.unshift(item);
    this.save();
    return item;
  }

  public updateCrekoContent(id: string, updates: Partial<CrekoContentItem>): CrekoContentItem | null {
    const item = (this.data.crekoContentItems || []).find((c) => c.id === id);
    if (!item) return null;
    Object.assign(item, updates);
    this.save();
    return item;
  }

  public deleteCrekoContent(id: string): boolean {
    const idx = (this.data.crekoContentItems || []).findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.crekoContentItems.splice(idx, 1);
    this.save();
    return true;
  }

  // --- MÓDULOS GENERADOS CON IA ---
  public getCustomModules(): CustomAiModule[] {
    return this.data.customModules || [];
  }

  public createCustomModule(params: Omit<CustomAiModule, 'id' | 'createdAt'>): CustomAiModule {
    const id = `mod_${Date.now()}`;
    const mod: CustomAiModule = {
      ...params,
      id,
      createdAt: new Date().toISOString(),
    };
    if (!this.data.customModules) this.data.customModules = [];
    this.data.customModules.push(mod);
    this.save();
    return mod;
  }

  public addCustomModuleItem(moduleId: string, itemData: Record<string, any>): CustomAiModule | null {
    const mod = (this.data.customModules || []).find((m) => m.id === moduleId);
    if (!mod) return null;
    if (!mod.items) mod.items = [];
    mod.items.unshift({ ...itemData, _id: `item_${Date.now()}`, _createdAt: new Date().toISOString() });
    this.save();
    return mod;
  }

  public deleteCustomModule(id: string): boolean {
    const idx = (this.data.customModules || []).findIndex((m) => m.id === id);
    if (idx === -1) return false;
    this.data.customModules.splice(idx, 1);
    this.save();
    return true;
  }

  // --- CIERRE DEL DÍA ---
  public getDayClosings(): DayClosing[] {
    return this.data.dayClosings || [];
  }

  public createDayClosing(closing: Omit<DayClosing, 'id' | 'createdAt'>): DayClosing {
    const id = `close_${Date.now()}`;
    const record: DayClosing = {
      ...closing,
      id,
      createdAt: new Date().toISOString(),
    };
    if (!this.data.dayClosings) this.data.dayClosings = [];
    this.data.dayClosings.unshift(record);
    this.save();
    return record;
  }

  // --- ANÁLISIS DE DISPERSIÓN & FOCO ESTRATÉGICO ---
  public getDispersalAnalysis(): {
    activeCount: number;
    isDispersed: boolean;
    mainFocus: string[];
    waitingProjects: string[];
    warningMessage?: string;
    advice: string;
  } {
    const activeProjects = (this.data.projects || []).filter((p) => p.status === 'active');
    const isDispersed = activeProjects.length > 3;
    const mainFocus = ['Creko', 'Rotuprint'];
    const waitingProjects = (this.data.projects || []).filter((p) => p.status === 'paused').map((p) => p.name);

    let warningMessage: string | undefined;
    if (isDispersed) {
      warningMessage = `Fran, actualmente tenés ${activeProjects.length} proyectos activos. Creko y Rotuprint son tus dos focos obligatorios de estabilidad. Goloso se mantiene en espera para proteger tu energía.`;
    }

    return {
      activeCount: activeProjects.length,
      isDispersed,
      mainFocus,
      waitingProjects,
      warningMessage,
      advice: 'Primero hay que estar estable. Después generar. Después construir. Después crecer.',
    };
  }

  public getWeekSummary(): any {
    const totalLiquid = this.data.accounts.reduce((acc, a) => acc + (a.isReserve ? 0 : a.balance), 0);
    const reserveAmount = this.data.accounts.filter((a) => a.isReserve).reduce((acc, a) => acc + a.balance, 0);
    const changasThisMonth = (this.data.changas || []).reduce((acc, c) => acc + c.amount, 0);
    const activeTasks = (this.data.tasks || []).filter((t) => t.status !== 'done' && t.status !== 'cancelled');
    const crekoQuotesTotal = (this.data.crekoQuotes || []).reduce((acc, q) => acc + q.amount, 0);
    const crekoProductionCount = (this.data.crekoProductionOrders || []).length;
    const crekoContentCount = (this.data.crekoContentItems || []).length;

    return {
      totalLiquid,
      reserveAmount,
      reserveTarget: this.data.user.monthlyReserveTarget || 1000,
      reservePercent: Math.round((reserveAmount / (this.data.user.monthlyReserveTarget || 1000)) * 100),
      changasTotal: changasThisMonth,
      pendingTasksCount: activeTasks.length,
      crekoPipelineTotal: crekoQuotesTotal,
      crekoProductionCount,
      crekoContentCount,
      habitsStreakAvg: Math.round(
        (this.data.habits || []).reduce((acc, h) => acc + h.streak, 0) /
          Math.max(1, (this.data.habits || []).length)
      ),
    };
  }

  public resetToInitial(): void {
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.save();
  }

  // --- HEALTH & LIFE (APPLE HEALTHKIT INTEGRATION) ---
  public getHealthStatus(): HealthConnectionStatus {
    if (!this.data.healthConnection) {
      this.data.healthConnection = {
        state: 'NOT_CONNECTED',
        availableDataTypes: ['steps', 'distance', 'energy', 'workouts'],
        dailyStepTarget: 8000,
        weeklyWorkoutTarget: 4,
      };
      this.save();
    }
    return this.data.healthConnection;
  }

  public updateHealthStatus(partial: Partial<HealthConnectionStatus>): HealthConnectionStatus {
    const current = this.getHealthStatus();
    this.data.healthConnection = {
      ...current,
      ...partial,
    };
    this.save();
    return this.data.healthConnection;
  }

  public getTodayHealth(dateStr?: string): HealthDailySummary | null {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const summaries = this.data.healthSummaries || [];
    const found = summaries.find((s) => s.date === targetDate);
    return found || null;
  }

  public getHealthHistory(days: number = 7): HealthDailySummary[] {
    const summaries = this.data.healthSummaries || [];
    // Sort descending by date
    return [...summaries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, days);
  }

  public syncHealthKitData(payload: {
    userId?: string;
    date?: string;
    steps?: number;
    walkingRunningDistanceKm?: number;
    activeEnergyKcal?: number;
    workouts?: any[];
    source?: 'apple_health';
    syncedAt?: string;
  }): { success: boolean; summary: HealthDailySummary; message: string } {
    const targetDate = payload.date || new Date().toISOString().split('T')[0];
    if (!this.data.healthSummaries) {
      this.data.healthSummaries = [];
    }

    const existingIndex = this.data.healthSummaries.findIndex((s) => s.date === targetDate);
    const existing = existingIndex >= 0 ? this.data.healthSummaries[existingIndex] : null;

    const workoutCount = payload.workouts ? payload.workouts.length : (existing?.workoutCount || 0);
    const workoutMinutes = payload.workouts 
      ? payload.workouts.reduce((acc, w) => acc + (Number(w.durationMinutes) || 0), 0)
      : (existing?.workoutMinutes || 0);

    const nowIso = payload.syncedAt || new Date().toISOString();

    const summary: HealthDailySummary = {
      id: existing ? existing.id : `health_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: payload.userId || this.data.user.id || 'fran',
      date: targetDate,
      steps: typeof payload.steps === 'number' ? Math.round(payload.steps) : existing?.steps,
      walkingRunningDistanceKm: typeof payload.walkingRunningDistanceKm === 'number'
        ? Number(payload.walkingRunningDistanceKm.toFixed(2))
        : existing?.walkingRunningDistanceKm,
      activeEnergyKcal: typeof payload.activeEnergyKcal === 'number'
        ? Math.round(payload.activeEnergyKcal)
        : existing?.activeEnergyKcal,
      workoutCount,
      workoutMinutes,
      workouts: payload.workouts || existing?.workouts || [],
      syncedAt: nowIso,
      source: 'apple_health',
    };

    if (existingIndex >= 0) {
      this.data.healthSummaries[existingIndex] = summary;
    } else {
      this.data.healthSummaries.push(summary);
    }

    // Update connection status
    this.updateHealthStatus({
      state: 'CONNECTED',
      lastSyncedAt: nowIso,
      device: 'iPhone / Apple Watch',
      availableDataTypes: ['steps', 'distance', 'energy', 'workouts'],
    });

    this.save();
    return {
      success: true,
      summary,
      message: `Sincronizados datos de Salud (${summary.steps || 0} pasos, ${summary.walkingRunningDistanceKm || 0} km, ${summary.activeEnergyKcal || 0} kcal).`,
    };
  }

  public disconnectHealth(): { success: boolean; message: string } {
    this.updateHealthStatus({
      state: 'NOT_CONNECTED',
      errorMessage: undefined,
    });
    this.save();
    return {
      success: true,
      message: 'Apple Salud desconectada localmente de JARVIS. Para revocar permisos por completo, hacelo desde Ajustes de iPhone > Salud > Acceso a datos y dispositivos.',
    };
  }

  // --- SPOTIFY INTEGRATION METHODS ---
  public getSpotifyState(): SpotifyState {
    return this.data.spotify || {
      isConnected: false,
      isPlaying: false,
      playlistName: 'Enfoque & Flow Operativo',
      device: 'iPhone de Fran',
      profileName: 'Fran Albornoz',
    };
  }

  public updateSpotifyState(patch: Partial<SpotifyState>): SpotifyState {
    this.data.spotify = {
      ...(this.data.spotify || { isConnected: false, isPlaying: false }),
      ...patch,
      lastUpdated: new Date().toISOString(),
    };
    this.save();
    return this.data.spotify;
  }

  public toggleSpotifyPlayback(): SpotifyState {
    const current = this.getSpotifyState();
    const nextState = !current.isPlaying;
    return this.updateSpotifyState({ isPlaying: nextState });
  }

  // --- WEATHER & OUTFIT RECOMMENDATION ---
  public getWeatherOutfit(customCity?: string): WeatherOutfitReport {
    const city = customCity || this.data.weatherLocation || 'Logroño';
    const hour = new Date().getHours();
    const month = new Date().getMonth(); // 0 = Jan, 8 = Sep

    // Seasonal baseline for Logroño / España
    let tempC = 21;
    let condition = 'Despejado y agradable';
    let icon = 'sun';
    let feelsLikeC = 21;
    let humidity = 45;
    let windSpeed = 12;

    if (month >= 5 && month <= 8) {
      // Verano / Principio otoño
      if (hour < 9 || hour >= 21) {
        tempC = 17;
        feelsLikeC = 16;
        condition = 'Fresco de mañana/noche';
        icon = 'cloud';
      } else if (hour >= 13 && hour <= 18) {
        tempC = 27;
        feelsLikeC = 28;
        condition = 'Soleado y templado';
        icon = 'sun';
      } else {
        tempC = 22;
        feelsLikeC = 22;
        condition = 'Clima ideal';
        icon = 'sun';
      }
    } else if (month >= 11 || month <= 2) {
      // Invierno
      tempC = 9;
      feelsLikeC = 7;
      condition = 'Frío y viento';
      icon = 'wind';
      windSpeed = 22;
    } else {
      // Primavera u otoño medio
      tempC = 16;
      feelsLikeC = 15;
      condition = 'Templado variable';
      icon = 'cloud';
    }

    // Determine outfit based on actual temperature
    let title = '';
    let summary = '';
    let top = '';
    let bottom = '';
    let footwear = '';
    let accessories = '';
    let tip = '';

    if (tempC >= 25) {
      title = 'Outfit Liviano de Verano / Trabajo Activo';
      summary = 'Día caluroso y despejado. Máxima frescura y comodidad para moverte entre clientes y taller.';
      top = 'Remera de algodón transpirable (Creko oversize o básica lisa)';
      bottom = 'Bermuda de gabardina o jogger liviano';
      footwear = 'Zapatillas urbanas cómodas (ventiladas) con medias cortas';
      accessories = 'Gafas de sol, botella de agua fría y gorra si vas a estar afuera';
      tip = 'Llevá una camisa abierta o camperita ligera si vas a volver tarde porque en Logroño refresca al caer el sol.';
    } else if (tempC >= 18) {
      title = 'Outfit Urbano de Transición (Capas Livianas)';
      summary = 'Clima templado perfecto en Logroño. El clásico sistema en capas para no pasar ni frío ni calor.';
      top = 'Remera de algodón + sobrecamisa abierta o buzo fino (hoodie Creko)';
      bottom = 'Pantalón cargo cómodo o jean con elasticidad';
      footwear = 'Zapatillas urbanas todo terreno (resistentes para calle y taller)';
      accessories = 'Mochila o riñonera con documentos y cargador';
      tip = 'Si salís temprano con la campera, al mediodía te la sacás y quedás impecable solo con la remera.';
    } else if (tempC >= 12) {
      title = 'Outfit Clima Fresco / Capas Medias';
      summary = 'Ambiente fresco en Logroño. Requiere abrigo intermedio y protección de pecho y cuello.';
      top = 'Remera térmica o básica + Buzo pesado + Campera cortaviento o bomber';
      bottom = 'Pantalón de trabajo reforzado o jean grueso';
      footwear = 'Borcegos livianos o zapatillas altas con medias abrigadas';
      accessories = 'Cuellito o bufanda ligera en la mochila por si levanta viento';
      tip = 'No te confíes de la sensación térmica a la sombra en las calles céntricas.';
    } else {
      title = 'Outfit Invierno / Abrigo Completo';
      summary = 'Día frío en La Rioja. Prioridad mantener el calor corporal sin perder movilidad de trabajo.';
      top = 'Primera piel + Hoodie abrigado + Campera acolchada o parka aislante';
      bottom = 'Pantalón térmico o jean pesado';
      footwear = 'Calzado de abrigo con suela aislante antideslizante';
      accessories = 'Gorro de lana, guantes si vas a cargar materiales y cuellito térmico';
      tip = 'Tomá un café o mate caliente antes de salir a la calle para activar el motor.';
    }

    return {
      city,
      temperatureC: tempC,
      feelsLikeC,
      condition,
      icon,
      humidity,
      windSpeedKmh: windSpeed,
      outfitRecommendation: {
        title,
        summary,
        top,
        bottom,
        footwear,
        accessories,
        tip,
      },
    };
  }

  // Generate the full welcome report when Fran opens the app
  public getAppWelcomeReport(): AppWelcomeReport {
    const weather = this.getWeatherOutfit();
    const spotify = this.getSpotifyState();
    const summary = this.getFinancialSummary();
    const tasks = (this.data.tasks || []).filter((t) => t.status !== 'done');
    const urgentTasks = tasks.filter((t) => t.priority === 'urgent' || t.priority === 'high');
    const pendingIncomes = (this.data.pendingIncomes || []).filter((p) => p.status === 'pending');
    const totalPendingMoney = pendingIncomes.reduce((acc, p) => acc + p.amount, 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter((t) => t.dueDate === todayStr || t.priority === 'urgent');

    const topPriorities: string[] = [];
    if (totalPendingMoney > 0) {
      topPriorities.push(`Cobrar ${totalPendingMoney} € pendientes (Electricidad / Changas)`);
    }
    urgentTasks.slice(0, 3).forEach((t) => {
      topPriorities.push(t.title);
    });
    if (topPriorities.length === 0) {
      topPriorities.push('Cerrar ventas y captar clientes para Creko');
    }

    const greetingText = `¡Hola Fran! Hoy en ${weather.city} tenemos ${weather.temperatureC}°C (${weather.condition}). Tenés ${urgentTasks.length} pendientes clave y ${totalPendingMoney} € por cobrar.`;

    // Spoken speech script for JARVIS voice
    let spokenScript = `Hola Fran. Bienvenido. `;
    spokenScript += `En ${weather.city} hacen ${weather.temperatureC} grados, sensación de ${weather.feelsLikeC}. `;
    spokenScript += `Para salir a la calle te recomiendo: ${weather.outfitRecommendation.top} y ${weather.outfitRecommendation.bottom}. `;
    if (totalPendingMoney > 0) {
      spokenScript += `En tus finanzas tenés ${totalPendingMoney} euros pendientes de cobro que hay que meter a la caja. `;
    }
    if (urgentTasks.length > 0) {
      spokenScript += `Tu prioridad urgente hoy es: ${urgentTasks[0].title}. `;
    }
    spokenScript += `Playlist lista en Spotify para meterle foco. ¿Arrancamos?`;

    return {
      timestamp: new Date().toISOString(),
      weather,
      pendingTasksSummary: {
        urgentCount: urgentTasks.length,
        todayCount: todayTasks.length,
        moneyPendingAmount: totalPendingMoney,
        topPriorities,
      },
      spotify,
      greetingText,
      spokenScript,
    };
  }

  // --- JARVIS Activity & Life Timeline OS ---
  public getCurrentActivity(): CurrentActivity {
    if (!this.data.currentActivity) {
      this.data.currentActivity = {
        id: 'act_creko_captacion',
        title: 'Creko — Captación de clientes',
        category: 'creko',
        categoryLabel: 'CREKO',
        categoryColor: '#a855f7',
        icon: '🟣',
        startTime: '09:12',
        startTimestamp: Date.now() - 42 * 60000,
        durationMinutes: 42,
        notes: 'Prospección activa de comercios en Logroño y presupuestos',
        client: 'Comercios Logroño',
        isActive: true,
      };
      this.save();
    }
    return this.data.currentActivity;
  }

  public startActivity(params: Partial<CurrentActivity>): CurrentActivity {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // If there was a previous active activity, finish it and push to timeline
    if (this.data.currentActivity && this.data.currentActivity.isActive) {
      const elapsedMinutes = Math.max(1, Math.round((Date.now() - (this.data.currentActivity.startTimestamp || Date.now())) / 60000));
      const hours = Math.floor(elapsedMinutes / 60);
      const mins = elapsedMinutes % 60;
      const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

      this.addTimelineEntry({
        time: this.data.currentActivity.startTime,
        date: now.toISOString().split('T')[0],
        icon: this.data.currentActivity.icon || '🎯',
        title: this.data.currentActivity.title,
        category: this.data.currentActivity.category,
        duration: durationStr,
        durationMinutes: elapsedMinutes,
        notes: this.data.currentActivity.notes,
        client: this.data.currentActivity.client,
      });
    }

    const newActivity: CurrentActivity = {
      id: `act_${Date.now()}`,
      title: params.title || 'Nueva actividad',
      category: params.category || 'creko',
      categoryLabel: params.categoryLabel || (params.category || 'creko').toUpperCase(),
      categoryColor: params.categoryColor || '#a855f7',
      icon: params.icon || '⚡',
      startTime: timeStr,
      startTimestamp: Date.now(),
      durationMinutes: 0,
      notes: params.notes || '',
      client: params.client || '',
      isActive: true,
    };

    this.data.currentActivity = newActivity;
    this.save();
    return newActivity;
  }

  public finishActivity(notes?: string): CurrentActivity {
    const now = new Date();
    if (!this.data.currentActivity) {
      this.getCurrentActivity();
    }

    if (this.data.currentActivity && this.data.currentActivity.isActive) {
      const elapsedMinutes = Math.max(1, Math.round((Date.now() - (this.data.currentActivity.startTimestamp || Date.now())) / 60000));
      const hours = Math.floor(elapsedMinutes / 60);
      const mins = elapsedMinutes % 60;
      const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

      this.addTimelineEntry({
        time: this.data.currentActivity.startTime,
        date: now.toISOString().split('T')[0],
        icon: this.data.currentActivity.icon || '✓',
        title: this.data.currentActivity.title,
        category: this.data.currentActivity.category,
        duration: durationStr,
        durationMinutes: elapsedMinutes,
        notes: notes || this.data.currentActivity.notes,
        client: this.data.currentActivity.client,
      });

      this.data.currentActivity.isActive = false;
      this.data.currentActivity.durationMinutes = elapsedMinutes;
      this.save();
    }

    return this.data.currentActivity!;
  }

  public getTimeline(period: 'today' | 'week' | 'month' = 'today'): TimelineEntry[] {
    if (!this.data.timelineEntries) {
      this.data.timelineEntries = INITIAL_DATA.timelineEntries || [];
      this.save();
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (period === 'today') {
      return this.data.timelineEntries.filter((t) => t.date === todayStr || !t.date);
    }
    return this.data.timelineEntries;
  }

  public addTimelineEntry(entry: Partial<TimelineEntry>): TimelineEntry {
    if (!this.data.timelineEntries) {
      this.data.timelineEntries = INITIAL_DATA.timelineEntries || [];
    }

    const now = new Date();
    const timeStr = entry.time || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newEntry: TimelineEntry = {
      id: entry.id || `tl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      time: timeStr,
      date: entry.date || now.toISOString().split('T')[0],
      icon: entry.icon || '📝',
      title: entry.title || 'Registro de actividad',
      category: entry.category || 'vida',
      duration: entry.duration || '',
      durationMinutes: entry.durationMinutes || 0,
      notes: entry.notes || '',
      client: entry.client || '',
    };

    this.data.timelineEntries.unshift(newEntry);
    this.save();
    return newEntry;
  }
}

export const db = new Database();
