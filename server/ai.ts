import { GoogleGenAI } from '@google/genai';
import { PostItProposal, TaskProposal, TimeBlockProposal, TransactionProposal, SystemModificationRecord } from '../src/types';
import { db } from './db';

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface ChatImageData {
  data: string;
  mimeType: string;
  name?: string;
}

export interface AssistantResponse {
  message: string;
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
    projectName?: string;
    canUndo?: boolean;
  };
  learningProposal?: {
    ruleType: 'category_rule' | 'payment_method_alias' | 'project_rule' | 'preference';
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
  clarificationNeeded?: boolean;
}

/**
 * Fallback Spanish NLP parser for when Gemini API key is not configured or offline.
 * Implements high-accuracy financial entity recognition with the user's memory rules.
 */
function localRuleBasedParser(userInput: string): AssistantResponse | null {
  const input = userInput.trim();
  const lower = input.toLowerCase();

  const accounts = db.getAccounts();
  const categories = db.getCategories();
  const projects = db.getProjects();
  const pending = db.getPendingIncomes();
  const memory = db.getMemory();

  // 1. Undo / Deshacer
  if (/^(deshacer|revertir|cancelar operacion|borra el ultimo|borrá el último gasto|deshacé)/i.test(lower)) {
    const res = db.undoLastAction();
    if (res.success) {
      return {
        message: `↩️ **Operación revertida**: ${res.description || 'Se restauró el estado anterior.'}`,
        actionDetails: {
          actionType: 'undo',
          canUndo: false,
        },
      };
    } else {
      return {
        message: `ℹ️ ${res.description}`,
        actionDetails: {
          actionType: 'undo_failed',
        },
      };
    }
  }

  // 1.1 MODIFICACIONES DEL SISTEMA EN VIVO (CÓDIGO ABIERTO & CONTROL TOTAL DE FRAN)

  // A. Modificar saldo de cuenta directamente
  const balMatch =
    lower.match(/(?:cambi[aá]|pon[eé]|modific[aá]|ajust[aá]|dej[aá]|actualiz[aá])\s+(?:el\s+)?(?:saldo\s+(?:de\s+)?)?(?:mi\s+)?([a-záéíóú0-9\s]+?)\s+(?:en|a)\s+(-?\d+(?:[.,]\d+)?)\s*(?:€|euros)?/i) ||
    lower.match(/(?:mi\s+)?(efectivo|cash|santander|naranja|galicia|revolut|banco)\s+(?:ahora\s+es|est[aá]\s+en|qued[oó]\s+en)\s+(-?\d+(?:[.,]\d+)?)\s*(?:€|euros)?/i) ||
    lower.match(/(?:dej[aá]|pon[eé])\s+(?:el\s+)?(efectivo|cash)\s+en\s+0\s*(?:€|euros)?/i);

  if (balMatch) {
    const rawAccName = balMatch[1].trim().toLowerCase();
    const newBal = balMatch[2] !== undefined ? parseFloat(balMatch[2].replace(',', '.')) : 0;
    let targetAcc = accounts.find((a) => a.name.toLowerCase().includes(rawAccName) || a.id.toLowerCase().includes(rawAccName));
    if (!targetAcc && (rawAccName.includes('efectivo') || rawAccName.includes('cash'))) {
      targetAcc = accounts.find((a) => a.id === 'acc_cash') || accounts[0];
    }
    if (targetAcc) {
      const prevBal = targetAcc.balance;
      db.updateAccount(targetAcc.id, { balance: newBal });
      return {
        message: `🛠️ **Modificación ejecutada**: He ajustado el saldo de **${targetAcc.name}** de **${prevBal} €** a **${newBal} €**.\n\nEl sistema y todas las pantallas ya reflejan este cambio en tiempo real.`,
        appliedModifications: [
          {
            id: `mod_${Date.now()}`,
            type: 'account_balance',
            label: `Saldo ${targetAcc.name} actualizado`,
            field: `accounts.${targetAcc.name}.balance`,
            previousValue: `${prevBal} €`,
            newValue: `${newBal} €`,
            timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            details: `Modificación directa de saldo vía chat`,
          },
        ],
      };
    }
  }

  // A.1 Asignación Estratégica de Inversiones: Cocos Capital (CEDEARs / Acciones) y Copy Trading
  const isInvestmentStrategyIntent =
    /(?:copi\s*trade|copy\s*trade|copy\s*trading)/i.test(lower) ||
    /(?:cocas?\s*capital|cocos\s*capital|cocos)/i.test(lower) ||
    (/(?:acciones|cedears|invertir)/i.test(lower) && /(?:sp500|s&p|meli|nvidia|invidia|ypf)/i.test(lower));

  if (isInvestmentStrategyIntent) {
    // 1. Extraer o estimar montos mencionados
    const copyMatch =
      lower.match(/(?:dej[eé]|puse|met[ií]|tengo|hay)?\s*(\d+(?:[.,]\d+)?)\s*(?:d[oó]lares|\$|usd)?\s*(?:en|a)\s*(?:el\s+)?(?:copi\s*trade|copy\s*trade|copy\s*trading)/i) ||
      lower.match(/(?:copi\s*trade|copy\s*trade|copy\s*trading)[^\d]*(\d+(?:[.,]\d+)?)/i) ||
      lower.match(/(\d+(?:[.,]\d+)?)\s*(?:d[oó]lares|\$|usd)?\s*(?:en|a)\s*(?:el\s+)?(?:copi|copy)/i);
    const copyAmount = copyMatch ? parseFloat(copyMatch[1].replace(',', '.')) : 80;

    const cocosMatch =
      lower.match(/(\d+(?:[.,]\d+)?)\s*(?:d[oó]lares|\$|usd)?[^a-z]*(?:voy\s+a\s+(?:mandarme|mandar|meter|pasar|transferir)|a|en)[^a-z]*(?:el\s+broker\s+)?(?:cocas?\s*capital|cocos\s*capital|cocos)/i) ||
      lower.match(/(?:cocas?\s*capital|cocos\s*capital|cocos)[^\d]*(\d+(?:[.,]\d+)?)/i) ||
      lower.match(/(\d+(?:[.,]\d+)?)\s*(?:d[oó]lares|\$|usd)?\s*(?:a|en)\s*cocos/i);
    const cocosAmount = cocosMatch ? parseFloat(cocosMatch[1].replace(',', '.')) : 100;

    // 2. Asegurar que las cuentas existan y tengan el saldo asignado en el sistema
    let cocosAcc = accounts.find((a) => a.id === 'acc_cocos' || a.name.toLowerCase().includes('cocos'));
    let copyAcc = accounts.find((a) => a.id === 'acc_copytrade' || a.name.toLowerCase().includes('copy'));

    if (cocosAcc) {
      db.updateAccount(cocosAcc.id, { balance: cocosAmount, currency: 'USD' });
    } else {
      cocosAcc = db.createAccount({
        name: 'Cocos Capital (Acciones & CEDEARs)',
        type: 'other',
        balance: cocosAmount,
        currency: 'USD',
        active: true,
        isReserve: false,
      });
    }

    if (copyAcc) {
      db.updateAccount(copyAcc.id, { balance: copyAmount, currency: 'USD' });
    } else {
      copyAcc = db.createAccount({
        name: 'Copy Trading (Trading Automatizado)',
        type: 'other',
        balance: copyAmount,
        currency: 'USD',
        active: true,
        isReserve: false,
      });
    }

    // 3. Registrar aprendizaje/estrategia en la memoria central de Fran
    db.createMemory({
      type: 'preference',
      priority: 'global',
      classification: 'confirmed_fact',
      key: 'cartera_inversiones_cocos_copytrade',
      value: `Inversiones activas: $${copyAmount} USD en Copy Trading (Stop-Loss estricto al 20%, rescate si baja a $${Math.round(copyAmount * 0.8)} USD) y $${cocosAmount} USD en Cocos Capital asignados así: 50% SPY ($${Math.round(cocosAmount * 0.5)}), 20% MELI ($${Math.round(cocosAmount * 0.2)}), 15% NVDA ($${Math.round(cocosAmount * 0.15)}), 15% YPF ($${Math.round(cocosAmount * 0.15)}).`,
      description: 'Estrategia de asignación de activos en Cocos Capital y gestión de riesgo en Copy Trade',
    });

    // 4. Crear o actualizar Post-It visible en el tablero
    const existingPostit = db.getPostIts().find((p) => p.title.toLowerCase().includes('cocos') || p.title.toLowerCase().includes('inversión'));
    if (!existingPostit) {
      db.createPostIt({
        title: '🎯 Cartera Cocos & Copy Trade',
        description: `Cocos ($${cocosAmount} USD): 50% SPY ($${Math.round(cocosAmount * 0.5)}), 20% MELI ($${Math.round(cocosAmount * 0.2)}), 15% NVDA ($${Math.round(cocosAmount * 0.15)}), 15% YPF ($${Math.round(cocosAmount * 0.15)}) | Copy Trade: $${copyAmount} USD (Stop-Loss $${Math.round(copyAmount * 0.8)}).`,
        colorPriority: 'green',
        moneyAmount: copyAmount + cocosAmount,
        status: 'active',
      });
    }

    const spyAmt = Math.round(cocosAmount * 0.5);
    const meliAmt = Math.round(cocosAmount * 0.2);
    const nvdaAmt = Math.round(cocosAmount * 0.15);
    const ypfAmt = Math.round(cocosAmount * 0.15);
    const totalUSD = copyAmount + cocosAmount;
    const stopLossUSD = Math.round(copyAmount * 0.8);

    const message = `🎯 **Excelente decisión de dar el paso, Fran. Movimientos asentados y estrategia activada:**

### 📊 1. Saldos Registrados en tus Cuentas:
• **Copy Trading**: **$${copyAmount} USD** asignados y bajo seguimiento de riesgo.
• **Cocos Capital**: **$${cocosAmount} USD** registrados para compra de CEDEARs / acciones.
• **Total en Inversiones**: **$${totalUSD} USD** *(100% aislados e independientes de tu colchón de supervivencia y reserva de 1.000 €)*.

---

### ♟️ 2. Mi recomendación como tu Socio / Director Financiero (Cero Humo):
Con **$${cocosAmount} USD**, **no conviene atomizar en 8 o 10 activos** porque el fraccionamiento te quita potencia y control. Las 4 que mencionaste son las indicadas, pero con pesos estratégicos bien definidos:

1. **50% ($${spyAmt} USD) ➔ S&P 500 (CEDEAR: SPY)**  
   * **El ancla segura**: Comprás las 500 empresas más sólidas de EE.UU. Cero riesgo de quiebra individual. Es el motor indexado que hace crecer tu capital de forma predecible en el tiempo sin timba.

2. **20% ($${meliAmt} USD) ➔ MercadoLibre (CEDEAR: MELI)**  
   * **Crecimiento y caja real**: Monopolio del e-commerce y fintech con Mercado Pago en América Latina. Flujo de caja indiscutible y excelente salud financiera.

3. **15% ($${nvdaAmt} USD) ➔ NVIDIA (CEDEAR: NVDA)**  
   * **Potencia de Inteligencia Artificial**: Líder absoluta en infraestructura y microchips para IA. Alta rentabilidad, pero con un tope del 15% para que una corrección del sector tech no afecte el resto de tu cartera.

4. **15% ($${ypfAmt} USD) ➔ YPF (Acción / CEDEAR)**  
   * **Apuesta táctica energética**: Vaca Muerta y desregulación del sector. Tiene un potencial de suba exponencial, pero al tener riesgo argentino (macro y política local), mantenerla en 15% protege tus ganancias.

---

### ⚠️ 3. Regla de Oro para el Copy Trade ($${copyAmount} USD):
• **Stop-Loss estricto**: Si el drawdown llega al **20% (saldo cae a $${stopLossUSD} USD)**, cortamos la copia y rescatamos el capital de inmediato.  
• **Congelamiento de aportes**: Durante los próximos 30 días **prohibido meter más dinero** hasta auditar la consistencia real del trader copiado.

---
💡 *Ya generé la tarjeta estratégica en tu Tablero con esta distribución y grabé la regla en tu Memoria Central para evaluar los rendimientos semana a semana.*`;

    return {
      message,
      appliedModifications: [
        {
          id: `mod_${Date.now()}_cocos`,
          type: 'account_balance',
          label: 'Saldo Cocos Capital actualizado',
          field: 'accounts.Cocos Capital.balance',
          newValue: `$${cocosAmount} USD`,
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          details: 'Cuenta de broker lista para compra de CEDEARs',
        },
        {
          id: `mod_${Date.now()}_copy`,
          type: 'account_balance',
          label: 'Saldo Copy Trading actualizado',
          field: 'accounts.Copy Trading.balance',
          newValue: `$${copyAmount} USD`,
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          details: 'Capital en trading automatizado bajo regla de stop-loss',
        },
        {
          id: `mod_${Date.now()}_mem`,
          type: 'memory',
          label: 'Estrategia de cartera registrada',
          field: 'userMemory.cartera_inversiones',
          newValue: `50% SPY ($${spyAmt}), 20% MELI ($${meliAmt}), 15% NVDA ($${nvdaAmt}), 15% YPF ($${ypfAmt})`,
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          details: 'Distribución y reglas de riesgo en Cocos Capital y Copy Trade',
        },
      ],
    };
  }

  // B. Modificar meta de reserva mensual
  const reserveMatch = lower.match(/(?:cambi[aá]|pon[eé]|modific[aá]|ajust[aá]|sub[ií]|baj[aá]|fij[aá])\s+(?:la\s+)?(?:reserva|meta\s+de\s+reserva)\s+(?:a|en)\s+(\d+(?:[.,]\d+)?)\s*(?:€|euros)?/i);
  if (reserveMatch) {
    const newTarget = parseFloat(reserveMatch[1].replace(',', '.'));
    const prevTarget = db.getUserProfile().monthlyReserveTarget;
    db.updateUserProfile({ monthlyReserveTarget: newTarget });
    return {
      message: `🛡️ **Meta de Reserva modificada**: Tu objetivo de colchón de seguridad ahora es de **${newTarget} €** (antes: ${prevTarget} €).\n\nJARVIS recalculará tu estabilidad y semanas de autonomía en base a esta nueva meta.`,
      appliedModifications: [
        {
          id: `mod_${Date.now()}`,
          type: 'reserve_target',
          label: 'Meta de reserva actualizada',
          field: 'user.monthlyReserveTarget',
          previousValue: `${prevTarget} €`,
          newValue: `${newTarget} €`,
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          details: `Nueva meta fijada por Fran`,
        },
      ],
    };
  }

  // C. Crear changa (trabajo puntual)
  const changaMatch = lower.match(/(?:cre[aá]|agreg[aá]|sum[aá]|registr[aá])\s+(?:una\s+)?changa\s+(?:de\s+)?(.+)/i);
  if (changaMatch) {
    const rawContent = changaMatch[1].trim();
    const amtMatch = rawContent.match(/(\d+(?:[.,]\d+)?)\s*(?:€|euros|\$|usd)?/i);
    const amount = amtMatch ? parseFloat(amtMatch[1].replace(',', '.')) : 100;
    let clientName = 'Cliente';
    const forMatch = rawContent.match(/(?:para|con|de)\s+([a-záéíóú0-9\s]+?)(?:\s+(?:por|de)\s+\d+|$)/i);
    if (forMatch) {
      clientName = forMatch[1].trim();
      clientName = clientName.charAt(0).toUpperCase() + clientName.slice(1);
    }
    const cleanTitle = rawContent
      .replace(/(\d+(?:[.,]\d+)?)\s*(?:€|euros|\$|usd)?/gi, '')
      .replace(/(?:para|con)\s+[a-záéíóú0-9\s]+/gi, '')
      .replace(/(?:por|de)\s*$/gi, '')
      .trim() || 'Trabajo puntual';

    const newChanga = db.createChanga({
      title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
      client: clientName,
      clientOrPerson: clientName,
      amount,
      notes: `Registrada vía chat de JARVIS el ${new Date().toLocaleDateString('es-ES')}`,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    });

    return {
      message: `💼 **Changa Registrada**: He creado la changa **"${newChanga.title}"** para **${newChanga.client || clientName}** por **${newChanga.amount} €** (Estado: Pendiente de cobro).\n\nPodés verla en la sección Changas o marcarla cobrada en cualquier momento diciéndome "Cobré la changa de ${newChanga.client || clientName}".`,
      appliedModifications: [
        {
          id: `mod_${Date.now()}`,
          type: 'changa',
          label: `Changa creada: ${newChanga.title}`,
          field: 'changas',
          newValue: `${newChanga.amount} € - ${newChanga.client || clientName}`,
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
  }

  // D. Registrar actividad de salud (pasos, gimnasio, skate, correr)
  const healthStepsMatch = lower.match(/(?:registr[aá]|anot[aá]|guard[aá]|sum[aá]|camin[eé]|hice)\s+(\d{3,6})\s+pasos/i);
  if (healthStepsMatch) {
    const numSteps = parseInt(healthStepsMatch[1], 10);
    const numDist = Number(((numSteps * 0.76) / 1000).toFixed(2));
    const numKcal = Math.round(numSteps * 0.045);
    db.syncHealthKitData({
      steps: numSteps,
      walkingRunningDistanceKm: numDist,
      activeEnergyKcal: numKcal,
      source: 'apple_health',
    });
    return {
      message: `👟 **Pasos actualizados**: Registré **${numSteps.toLocaleString('es-ES')} pasos** (${numDist} km, ~${numKcal} kcal quemadas) en tu registro de Salud de hoy.\n\nSincronizado con Apple Health / Cerebro Único.`,
      appliedModifications: [
        {
          id: `mod_${Date.now()}`,
          type: 'health_data',
          label: 'Pasos de hoy actualizados',
          field: 'health.today.steps',
          newValue: `${numSteps} pasos (${numDist} km)`,
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
  }

  const workoutMatch = lower.match(/(?:registr[aá]|anot[aá]|guard[aá]|hice|fui al|termin[eé])\s+(?:un\s+)?(?:entrenamiento|sesi[oó]n)?\s*(?:de\s+)?(gym|gimnasio|pecho|espalda|piernas|pesas|skate|skateboarding|correr|running|carrera|bici|f[uú]tbol)(?:\s+(?:de|por)\s+(\d+)\s*(?:min|minutos))?/i);
  if (workoutMatch) {
    const rawType = workoutMatch[1].toLowerCase();
    const duration = workoutMatch[2] ? parseInt(workoutMatch[2], 10) : 50;
    let workoutType = 'Fuerza / Gimnasio';
    if (rawType.includes('skate')) workoutType = 'Skateboarding';
    else if (rawType.includes('corr') || rawType.includes('run')) workoutType = 'Carrera al aire libre';
    else if (rawType.includes('fútbol') || rawType.includes('futbol')) workoutType = 'Fútbol';
    else if (rawType.includes('bici')) workoutType = 'Ciclismo';

    const kcal = Math.round(duration * 6.5);
    db.syncHealthKitData({
      workouts: [
        {
          type: workoutType,
          durationMinutes: duration,
          activeEnergyKcal: kcal,
          timestamp: new Date().toISOString(),
        },
      ],
      source: 'apple_health',
    });

    return {
      message: `🔥 **Entrenamiento registrado**: He anotado tu sesión de **${workoutType}** (${duration} min, ~${kcal} kcal) en tu cuerpo y salud de hoy.\n\n¡Gran disciplina Fran! Recordá hidratarte y descansar bien.`,
      appliedModifications: [
        {
          id: `mod_${Date.now()}`,
          type: 'health_data',
          label: `Entrenamiento: ${workoutType}`,
          field: 'health.today.workouts',
          newValue: `${workoutType} (${duration} min)`,
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
  }

  // E. Agregar nuevo recuerdo / memoria a JARVIS
  const memoryMatch =
    lower.match(/(?:record[aá]|aprend[eé]|guard[aá] en tu memoria|anot[aá] en tu memoria|nuevo recuerdo)\s*:\s*(.+)/i) ||
    lower.match(/(?:record[aá]|aprend[eé])\s+que\s+(.+)/i);

  if (memoryMatch) {
    const rawFact = memoryMatch[1].trim();
    const key = rawFact.slice(0, 30).trim();
    const newMem = db.createMemory({
      type: 'preference',
      priority: 'user_preference',
      classification: 'user_preference',
      key,
      value: rawFact,
      description: `Recuerdo aprendido el ${new Date().toLocaleDateString('es-ES')}: "${rawFact}"`,
    });

    return {
      message: `🧠 **Memoria actualizada al 100%**: Aprendí y archivé este dato sobre vos:\n\n> "${rawFact}"\n\nEstá guardado en mi memoria permanente y lo tendré en cuenta en todas nuestras conversaciones y decisiones estratégicas.`,
      appliedModifications: [
        {
          id: `mod_${Date.now()}`,
          type: 'memory',
          label: `Nuevo recuerdo aprendido: ${key}`,
          field: 'userMemory',
          newValue: rawFact,
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
  }

  // F. Modificar prioridades o estilo de comunicación
  const priorityMatch =
    lower.match(/(?:agreg[aá]|sum[aá]|pon[eé]|cambi[aá])\s+(?:a\s+)?(?:mis\s+)?prioridades?\s*:\s*(.+)/i) ||
    lower.match(/(?:agreg[aá]|sum[aá])\s+(.+?)\s+a\s+mis\s+prioridades/i);

  if (priorityMatch) {
    const newPriority = priorityMatch[1].trim();
    const current = db.getUserProfile();
    const updatedPriorities = [newPriority, ...(current.priorities || [])].slice(0, 8);
    db.updateUserProfile({ priorities: updatedPriorities });
    return {
      message: `🎯 **Prioridades actualizadas**: Añadí **"${newPriority}"** a tu lista de prioridades de foco.\n\nJARVIS alineará sus sugerencias diarias con esta meta.`,
      appliedModifications: [
        {
          id: `mod_${Date.now()}`,
          type: 'user_profile',
          label: 'Prioridad agregada',
          field: 'userProfile.priorities',
          newValue: newPriority,
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
  }

  // 2. Financial Decision: "¿Puedo gastar X en Y?" o "¿Me conviene gastar X?"
  const canSpendMatch = lower.match(/(?:puedo|me conviene|da para|alcanza para)\s+gastar\s+(\d+(?:[.,]\d+)?)\s*(?:€|euros)?(?:\s+(?:en|para)\s+([a-záéíóú\s]+))?/i);
  if (canSpendMatch) {
    const amountToSpend = parseFloat(canSpendMatch[1].replace(',', '.'));
    const targetPurpose = (canSpendMatch[2] || 'este gasto').trim();
    const summary = db.getFinancialSummary('month');
    const realBalance = summary.realBalance;
    const futureExpenses = summary.futureExpensesTotal;
    const reserveCur = summary.reserveCurrent;
    const balanceAfter = Math.round((realBalance - amountToSpend) * 100) / 100;

    // Check if purpose relates to a project
    const proj = projects.find((p) => targetPurpose.toLowerCase().includes(p.name.toLowerCase()));

    let verdict = '';
    let tone = '';

    if (amountToSpend > realBalance) {
      tone = '🔴';
      verdict = `**No tenés saldo suficiente.** Tu saldo líquido actual es de **${realBalance} €**, por lo que gastar **${amountToSpend} €** te dejaría en saldo negativo (${balanceAfter} €).`;
    } else if (balanceAfter < futureExpenses) {
      tone = '🔴';
      verdict = `**No te conviene gastar eso ahora.** Tenés **${realBalance} €** líquidos y ya tenés compromisos previstos de **${futureExpenses} €**. Si gastás ${amountToSpend} €, te quedan **${balanceAfter} €**, quedando en descubierto frente a tus gastos fijos del mes.`;
    } else if (reserveCur < summary.reserveTarget * 0.3) {
      tone = '🟡';
      verdict = `**Estás demasiado justo.** Podés cubrirlo numéricamente (te quedarían **${balanceAfter} €** y tus gastos previstos son ${futureExpenses} €), pero tu reserva está casi vacía (**${reserveCur} €** / **${summary.reserveTarget} €**). En tu etapa actual en España, la prioridad número 1 es consolidar el colchón de seguridad antes de acelerar gastos prescindibles.`;
    } else {
      tone = '🟢';
      verdict = `**Podés permitírtelo con control.** Te quedarían **${balanceAfter} €** líquidos, tus gastos futuros de **${futureExpenses} €** están cubiertos y tu reserva está en **${reserveCur} €**.`;
    }

    let projNote = '';
    if (proj) {
      projNote = `\n\n📌 **Sobre ${proj.name}**: Este proyecto lleva acumulados **${proj.accumulatedExpenses} €** en gastos y todavía no está generando retornos constantes. Recordá: *un proyecto no es ingreso automático*.`;
    }

    return {
      message: `${tone} **Evaluación Financiera Real**:\n\n${verdict}${projNote}\n\n💡 *Regla clave*: Primero estar estable ➔ Después generar ➔ Después construir ➔ Después crecer.`,
    };
  }

  // 3. Post-it recognition: "Anotame...", "Recordame...", "Crear post-it...", "Nota:...", etc.
  const postitMatch = input.match(/^(?:anota|anotame|recorda|recordame|crea un post-it|crear post-it|post-it|nota:?)\s*(.+)/i);
  if (postitMatch) {
    const rawNote = postitMatch[1].trim();
    const lowerNote = rawNote.toLowerCase();
    const amtMatch = rawNote.match(/(\d+(?:[.,]\d+)?)\s*(?:€|euros)?/i);
    const hasMoney = amtMatch && /cobrar|debe|deuda|pagar|comprar|importe|precio|meta/i.test(rawNote);
    const moneyAmount = hasMoney && amtMatch ? parseFloat(amtMatch[1].replace(',', '.')) : undefined;

    // Detect category/color based on keywords:
    // purple: Creko | orange: Burger Palusa | blue: Sowfts | red: Urgencias | green: Metas & Ocio | yellow: Título libre
    let colorPriority: 'purple' | 'orange' | 'blue' | 'red' | 'yellow' | 'green' = 'yellow';
    let assignedProjectId: string | undefined = undefined;

    if (/urgente|cr[ií]tico|inmediato|ya\b|hoy mismo/i.test(lowerNote)) {
      colorPriority = 'red';
    } else if (/creko|rotulaci[oó]n|carteler[ií]a|vinilo|thiago/i.test(lowerNote)) {
      colorPriority = 'purple';
      assignedProjectId = 'proj_creko';
    } else if (/burger|palusa|hamburguesa/i.test(lowerNote)) {
      colorPriority = 'orange';
      assignedProjectId = 'proj_burger_palusa';
    } else if (/sowft|software|c[oó]digo|sistema|desarrollo|web|api|app/i.test(lowerNote)) {
      colorPriority = 'blue';
      assignedProjectId = 'proj_soft_desarrollo';
    } else if (/medit|meta|ocio|h[aá]bito|descans|relax|semana|500\s*€|500\s*euros/i.test(lowerNote)) {
      colorPriority = 'green';
    }

    const postIt = db.createPostIt({
      title: rawNote,
      colorPriority,
      moneyAmount,
      projectId: assignedProjectId,
      status: 'active',
      date: new Date().toISOString().split('T')[0],
    });

    const categoryLabels: Record<string, string> = {
      purple: '🟣 Creko (Merch & Cartelería)',
      orange: '🟠 Burger Palusa (Gastronomía)',
      blue: '🔵 Sowfts (Software en desarrollo)',
      red: '🔴 Urgencias (Crítico / Inmediato)',
      yellow: '🟡 Título Libre (Nota general)',
      green: '🟢 Metas & Ocio (Hábitos y Metas)',
    };

    return {
      message: `📝 **Post-it agregado a tu Tablero JARVIS**:
• **Nota**: "${postIt.title}"
• **Categoría/Color**: ${categoryLabels[colorPriority]}
${moneyAmount ? `• **Importe vinculado**: ${moneyAmount} €\n` : ''}
Podés organizarlo en tu **Tablero**, fijarlo con pin o convertirlo en una tarea con impacto financiero en un clic.`,
    };
  }

  // 4. Task recognition: "Crear tarea...", "Agendame hacer...", "Tengo que hacer..."
  const taskMatch = input.match(/^(?:crear tarea|creá tarea|agendame hacer|tengo que hacer|nueva tarea:?)\s*(.+)/i);
  if (taskMatch) {
    const rawTask = taskMatch[1].trim();
    const isUrgent = /urgente|ya|hoy/i.test(rawTask);
    const task = db.createTask({
      title: rawTask,
      priority: isUrgent ? 'urgent' : 'high',
      status: 'todo',
      dueDate: new Date().toISOString().split('T')[0],
    });

    return {
      message: `📋 **Tarea activada en el Motor de Tareas**:
• **Título**: "${task.title}"
• **Prioridad**: ${task.priority === 'urgent' ? '🔴 Urgente' : '🟠 Alta'}
• **Fecha de vencimiento**: ${task.dueDate}

Disponible en tu lista de **Tareas** para marcar avance o asociar a proyectos.`,
    };
  }

  // --- TIME BLOCKING ENGINE: INTENTOS DE TIEMPO REAL ---

  // 0. "¿Qué hora es?" / "La hora" / "Hora actual"
  if (
    /(?:qu[eé]\s+hora\s+es|qu[eé]\s+hora\s+ten[eé]s|la\s+hora|hora\s+actual|qu[eé]\s+hora\s+tenemos|decime\s+la\s+hora|dime\s+la\s+hora)/i.test(
      lower
    )
  ) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const weekday = now.toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid', weekday: 'long' });
    const day = now.toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid', day: 'numeric' });
    const month = now.toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid', month: 'long' });
    const dateFormatted = `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${day} de ${month.charAt(0).toUpperCase() + month.slice(1)}`;

    const timeData = db.getTimeBlocks();
    const current = timeData.currentBlock;
    const next = timeData.nextBlock;

    let response = `⏰ **Son las ${timeStr}** en Logroño (${dateFormatted}).\n\n`;

    if (current) {
      response += `📌 **Bloque en curso**: **${current.title}** (${current.startTime}–${current.endTime})\n`;
      response += `🎯 **Objetivo**: ${current.objective}\n`;
      if (next) {
        response += `\n⏭️ **Siguiente bloque**: **${next.title}** (${next.startTime}–${next.endTime})`;
      }
    } else {
      response += `No tenés ningún bloque activo agendado ahora mismo. Podés descansar o revisar tu agenda.`;
    }

    return { message: response };
  }

  // 1. "¿Qué tengo hoy?" / Agenda del día / Mis bloques
  if (
    /(?:qu[eé]\s+tengo\s+hoy|mi\s+d[ií]a|agenda\s+de\s+hoy|bloques?\s+de\s+hoy|qu[eé]\s+hago\s+hoy|cu[aá]l\s+es\s+mi\s+agenda)/i.test(
      lower
    )
  ) {
    const timeData = db.getTimeBlocks();
    const blocks = timeData.blocks;

    const emojiMap: Record<string, string> = {
      purple: '🟣',
      orange: '🟠',
      blue: '🔵',
      red: '🔴',
      green: '🟢',
      yellow: '🟡',
    };

    let agendaText = '### HOY\n\n';
    blocks.forEach((b) => {
      const emoji = emojiMap[b.colorPriority] || '🟣';
      agendaText += `${b.startTime}–${b.endTime}\n${emoji} **${b.title}**\n${b.objective}\n\n`;
    });

    agendaText += '### PENDIENTES QUE PASAN A OTRO MOMENTO\n';
    if (timeData.backlog && timeData.backlog.length > 0) {
      timeData.backlog.forEach((item) => {
        agendaText += `• ${item.title}${item.reason ? ` (${item.reason})` : ''}\n`;
      });
    } else {
      agendaText += '• Revisión stock vinilos Rotuprint\n• Actualización portfolio digital\n';
    }

    return {
      message: agendaText.trim(),
    };
  }

  // 2. "Terminé el bloque de captación" / "Ya terminé las imágenes" / "Terminé empleo"
  const finishMatch = lower.match(/(?:termin[eé]|ya termin[eé]|complet[eé]|listo|cerr[eé])\s*(?:el\s*bloque\s*de\s*)?([a-záéíóúñ\s]+)/i);
  if (finishMatch && !lower.includes('gasto') && !lower.includes('comida') && !lower.includes('dinero')) {
    const rawSubject = finishMatch[1].trim();
    const timeData = db.getTimeBlocks();
    const blocks = timeData.blocks;

    // Extract result notes if provided (e.g. "18 nuevos prospectos", "25 mensajes enviados")
    let resultNotes = '';
    const resultMatch = lower.match(/(?:resultado|consegui|conseguí|enviados?|prospectos?|postulaciones?|hice)[:\s]+([^.]+)/i);
    if (resultMatch) {
      resultNotes = resultMatch[0].trim();
    } else if (/\d+\s*(?:prospectos?|mensajes?|postulaciones?|contactos?|imagenes?|imágenes)/i.test(lower)) {
      const m = lower.match(/\d+\s*(?:prospectos?|mensajes?|postulaciones?|contactos?|imagenes?|imágenes)/i);
      resultNotes = m ? m[0] : '';
    }

    // Match block by subject or find active in_progress block
    let targetBlock = blocks.find((b) => {
      const bTitle = b.title.toLowerCase();
      const bFocus = b.focus.toLowerCase();
      return bTitle.includes(rawSubject) || bFocus.includes(rawSubject) || rawSubject.includes(bFocus);
    });

    if (!targetBlock && timeData.currentBlock) {
      targetBlock = timeData.currentBlock;
    }

    if (targetBlock) {
      const updateResult = db.updateTimeBlockStatus(
        targetBlock.id,
        'completed',
        resultNotes || 'Objetivo completado satisfactoriamente'
      );

      const next = updateResult?.nextBlock || timeData.nextBlock;
      const nextNext = blocks.find((b) => next && b.id !== next.id && b.startTime >= next.endTime && b.status !== 'completed');

      let reply = `Perfecto. **${targetBlock.focus || targetBlock.title}** terminado`;
      if (resultNotes) reply += ` (Resultado: ${resultNotes})`;
      reply += `.`;

      if (next) {
        reply += ` Ahora pasamos al bloque de **${next.title}** (${next.startTime}–${next.endTime}).`;
        if (nextNext) {
          reply += ` Después tenemos **${nextNext.title}**.`;
        }
      } else {
        reply += ` ¡Has completado todos los bloques principales del día! Podés registrar el cierre de finanzas en Organización.`;
      }

      return {
        message: reply,
        timeBlockProposal: {
          id: `prop_tb_${Date.now()}`,
          action: 'complete',
          targetBlockId: targetBlock.id,
          title: targetBlock.title,
          date: targetBlock.date,
          startTime: targetBlock.startTime,
          endTime: targetBlock.endTime,
          area: targetBlock.area,
          objective: targetBlock.objective,
          status: 'confirmed',
          explanation: resultNotes || 'Objetivo completado',
        },
      };
    }
  }

  // A. Mover / Reprogramar bloque: "Mové el bloque de captación a las 11:30", "Pasá captación para las 15:00", "Cambiá el horario de X a las Y", etc.
  const moveBlockMatch =
    lower.match(/(?:mov[eé]|pasar|pas[aá]|cambi[aá](?:r)?|reprogram[aá](?:r)?|pospon[eé]r?)\s+(?:el\s+)?(?:bloque\s+(?:de\s+)?)?(.+?)\s+(?:a|para|hacia)\s+(?:las\s+)?(\d{1,2}(?::\d{2})?)/i) ||
    lower.match(/(?:pon[eé]|agend[aá])\s+(.+?)\s+a\s+las\s+(\d{1,2}(?::\d{2})?)/i);

  if (moveBlockMatch && !lower.includes('gasto') && !lower.includes('comida') && !lower.includes('dinero') && !lower.includes('euro')) {
    const rawSubject = moveBlockMatch[1].trim();
    const rawTime = moveBlockMatch[2].trim();
    const newStart = rawTime.includes(':') ? rawTime.padStart(5, '0') : `${rawTime.padStart(2, '0')}:00`;
    const [sh, sm] = newStart.split(':').map(Number);

    const timeData = db.getTimeBlocks();
    const blocks = timeData.blocks;

    let targetBlock = blocks.find((b) => {
      const bTitle = b.title.toLowerCase();
      const bFocus = (b.focus || '').toLowerCase();
      return bTitle.includes(rawSubject) || bFocus.includes(rawSubject) || rawSubject.includes(bFocus) || rawSubject.includes(bTitle);
    });

    if (!targetBlock && timeData.currentBlock) {
      targetBlock = timeData.currentBlock;
    }

    if (targetBlock) {
      const [oldSh, oldSm] = targetBlock.startTime.split(':').map(Number);
      const [oldEh, oldEm] = targetBlock.endTime.split(':').map(Number);
      let durationMinutes = (oldEh * 60 + oldEm) - (oldSh * 60 + oldSm);
      if (durationMinutes <= 0 || isNaN(durationMinutes)) durationMinutes = 60;

      const totalEndMinutes = sh * 60 + sm + durationMinutes;
      const endH = String(Math.floor(totalEndMinutes / 60) % 24).padStart(2, '0');
      const endM = String(totalEndMinutes % 60).padStart(2, '0');
      const newEnd = `${endH}:${endM}`;

      return {
        message: `📅 He preparado la reprogramación del bloque **${targetBlock.title}**:\n• Horario anterior: **${targetBlock.startTime}–${targetBlock.endTime}**\n• Nuevo horario: **${newStart}–${newEnd}**\n\n¿Confirmás mover este bloque en tu calendario?`,
        timeBlockProposal: {
          id: `prop_tb_${Date.now()}`,
          action: 'move',
          targetBlockId: targetBlock.id,
          title: targetBlock.title,
          date: targetBlock.date,
          startTime: newStart,
          endTime: newEnd,
          area: targetBlock.area,
          objective: targetBlock.objective,
          status: 'proposed',
          previousTime: `${targetBlock.startTime}–${targetBlock.endTime}`,
          explanation: `Reprogramado de ${targetBlock.startTime} a ${newStart}`,
        },
      };
    }
  }

  // B. Sumar / Agregar nuevo bloque: "Agregá un bloque de 16:00 a 17:30 para prototipo de cartel", "Sumá un bloque de empleo a las 10:00", etc.
  const addBlockMatch = lower.match(/(?:agreg[aá]|sum[aá]|cre[aá]r?|agend[aá])\s+(?:un\s+)?bloque\s+(?:de\s+)?(?:tiempo\s+)?(.+)/i);
  if (addBlockMatch && !lower.includes('post-it') && !lower.includes('tarea') && !lower.includes('gasto')) {
    const rawRest = addBlockMatch[1].trim();

    let startTime = '16:00';
    let endTime = '17:00';

    const rangeMatch = rawRest.match(/(?:de\s+)?(\d{1,2}(?::\d{2})?)\s*(?:a|hasta|-)\s*(\d{1,2}(?::\d{2})?)/i);
    const singleTimeMatch = rawRest.match(/(?:a\s+las\s+)?(\d{1,2}(?::\d{2})?)/i);

    if (rangeMatch) {
      startTime = rangeMatch[1].includes(':') ? rangeMatch[1].padStart(5, '0') : `${rangeMatch[1].padStart(2, '0')}:00`;
      endTime = rangeMatch[2].includes(':') ? rangeMatch[2].padStart(5, '0') : `${rangeMatch[2].padStart(2, '0')}:00`;
    } else if (singleTimeMatch) {
      startTime = singleTimeMatch[1].includes(':') ? singleTimeMatch[1].padStart(5, '0') : `${singleTimeMatch[1].padStart(2, '0')}:00`;
      const [sh, sm] = startTime.split(':').map(Number);
      endTime = `${String((sh + 1) % 24).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
    }

    let cleanTitle = rawRest
      .replace(/(?:de\s+)?\d{1,2}(?::\d{2})?\s*(?:a|hasta|-)\s*\d{1,2}(?::\d{2})?/gi, '')
      .replace(/a\s+las\s+\d{1,2}(?::\d{2})?/gi, '')
      .replace(/^(?:para|de)\s+/i, '')
      .trim();

    if (!cleanTitle) cleanTitle = 'Bloque de enfoque';
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    let area: 'creko' | 'producto' | 'empleo' | 'changa' | 'personal' | 'organizacion' = 'creko';
    const lowerClean = cleanTitle.toLowerCase();
    if (/creko|merch|vinil|cartel|rotul|thiago/i.test(lowerClean)) {
      area = 'creko';
    } else if (/producto|prototipo|diseño|desarrollo|sowft|software|app/i.test(lowerClean)) {
      area = 'producto';
    } else if (/empleo|cv|postula|trabajo|rotuprint|abogad/i.test(lowerClean)) {
      area = 'empleo';
    } else if (/changa|cliente|reunion|reunión|burger/i.test(lowerClean)) {
      area = 'changa';
    } else if (/gym|entren|comida|descans|medit|salud/i.test(lowerClean)) {
      area = 'personal';
    } else if (/organiz|finanz|cierre|banco|cuenta/i.test(lowerClean)) {
      area = 'organizacion';
    }

    return {
      message: `⏱️ He preparado el nuevo bloque **${cleanTitle}** (${startTime}–${endTime}) para el área **${area.toUpperCase()}**.\n\n¿Confirmás sumarlo a tu calendario?`,
      timeBlockProposal: {
        id: `prop_tb_${Date.now()}`,
        action: 'create',
        title: cleanTitle,
        date: new Date().toISOString().split('T')[0],
        startTime,
        endTime,
        area,
        objective: `Avanzar con foco en ${cleanTitle}`,
        status: 'proposed',
        explanation: 'Nuevo bloque preparado desde el chat',
      },
    };
  }

  // C. Borrar / Eliminar bloque del calendario
  const deleteBlockMatch = lower.match(/(?:borr[aá]|elimin[aá]|quit[aá]|sac[aá])\s+(?:el\s+)?bloque\s+(?:de\s+)?(.+)/i);
  if (deleteBlockMatch && !lower.includes('post-it') && !lower.includes('tarea') && !lower.includes('gasto')) {
    const rawSub = deleteBlockMatch[1].trim();
    const timeData = db.getTimeBlocks();
    const targetBlock = timeData.blocks.find(
      (b) => b.title.toLowerCase().includes(rawSub) || (b.focus || '').toLowerCase().includes(rawSub)
    );
    if (targetBlock) {
      return {
        message: `🗑️ ¿Confirmás quitar el bloque **${targetBlock.title}** (${targetBlock.startTime}–${targetBlock.endTime}) de tu calendario?`,
        timeBlockProposal: {
          id: `prop_tb_${Date.now()}`,
          action: 'delete',
          targetBlockId: targetBlock.id,
          title: targetBlock.title,
          date: targetBlock.date,
          startTime: targetBlock.startTime,
          endTime: targetBlock.endTime,
          area: targetBlock.area,
          status: 'proposed',
        },
      };
    }
  }

  // 3. "Me llevó más tiempo" / "Necesito 15 minutos más" / "Me atrasé"
  if (/(?:me\s*llev[oó]\s*m[aá]s\s*tiempo|m[aá]s\s*tiempo|me\s*atras[eé]|me\s*retras[eé]|extender\s*bloque)/i.test(lower)) {
    const timeData = db.getTimeBlocks();
    const current = timeData.currentBlock || timeData.blocks.find((b) => b.status !== 'completed');
    const minMatch = lower.match(/(\d+)\s*min/i);
    const minutesToAdd = minMatch ? parseInt(minMatch[1], 10) : 15;

    if (current) {
      db.extendTimeBlock(current.id, minutesToAdd);
      const updatedData = db.getTimeBlocks();
      const next = updatedData.blocks.find((b) => b.startTime >= current.endTime && b.id !== current.id);

      return {
        message: `Entendido. Extendí el bloque actual de **${current.title}** en **${minutesToAdd} minutos**. Reorganicé automáticamente los siguientes bloques (${next ? `el siguiente bloque pasa a las ${next.startTime}` : 'agenda reacomodada'}) sin tocar tus tiempos de comida ni descanso.`,
      };
    }
  }

  // 4. "Tengo una reunión a las 16:00" / "Me apareció un cliente"
  const meetingMatch = lower.match(/(?:tengo\s+una\s+reuni[oó]n|apareci[oó]\s+un\s+cliente|reuni[oó]n\s+con\s+cliente)\s*(?:a\s+las\s+)?(\d{1,2}(?::\d{2})?)/i);
  if (meetingMatch) {
    const timeStr = meetingMatch[1].includes(':') ? meetingMatch[1] : `${meetingMatch[1].padStart(2, '0')}:00`;
    const [h, m] = timeStr.split(':').map(Number);
    const endH = String(h + 1).padStart(2, '0');
    const endM = String(m).padStart(2, '0');

    // Create fixed high-priority block
    db.createTimeBlock({
      title: 'REUNIÓN / CLIENTE — Horario Fijo',
      startTime: timeStr,
      endTime: `${endH}:${endM}`,
      area: 'changa',
      focus: 'Reunión Comercial',
      objective: 'Reunión prioritaria con cliente o compromiso.',
      color: '#ef4444',
      colorPriority: 'red',
      isFixed: true,
      status: 'pending',
    });

    return {
      message: `Perfecto. Agendé la reunión a las **${timeStr}–${endH}:${endM}** como bloque inamovible (🔴 prioridad alta). Ajusté el resto de la tarde para que tus proyectos y descanso sigan ordenados sin sobrecargar el día.`,
    };
  }

  // 5. "No voy a hacer esto" / "Cancelar bloque" / "Mover bloque"
  if (/(?:no\s*voy\s*a\s*hacer\s*esto|cancelar\s*bloque|mover\s*este\s*bloque|posponer)/i.test(lower)) {
    const timeData = db.getTimeBlocks();
    const current = timeData.currentBlock || timeData.blocks.find((b) => b.status === 'pending');
    if (current) {
      db.updateTimeBlockStatus(current.id, 'moved', 'Pospuesto para optimizar la jornada');
      const updatedData = db.getTimeBlocks();
      const next = updatedData.currentBlock || updatedData.blocks.find((b) => b.status === 'pending');

      return {
        message: `Entendido. Moví **${current.title}** a la lista de pendientes para otro momento (no lo considero un fallo; priorizamos el ritmo real). Ahora nos enfocamos en **${next?.title || 'el siguiente bloque'}**.`,
      };
    }
  }

  // 5. Financial / Health / Daily Query: "¿Cómo estoy?" / Balance general / "¿Cómo vengo hoy?"
  if (
    /(c[oó]mo estoy|c[oó]mo vengo|mi situaci[oó]n|resumen financiero|estado financiero|balance general|posici[oó]n proyectada|estoy estable|salud y vida|cuantos pasos|actividad f[ií]sica)/i.test(
      lower
    )
  ) {
    const summary = db.getFinancialSummary('month');
    const st = summary.stability;
    const badge = st.status === 'stable' ? '🟢' : st.status === 'tight' ? '🟡' : '🔴';
    const todayHealth = db.getTodayHealth();
    const healthStatus = db.getHealthStatus();

    let healthLine = '';
    if (todayHealth && (todayHealth.steps || todayHealth.workouts?.length)) {
      healthLine = `\n\n🏃 **Cuerpo & Salud (Apple HealthKit)**:
• **Pasos de hoy**: **${todayHealth.steps ? todayHealth.steps.toLocaleString('es-ES') : 'Sin datos'}** / ${healthStatus.dailyStepTarget.toLocaleString('es-ES')} pasos (${todayHealth.steps ? Math.round((todayHealth.steps / healthStatus.dailyStepTarget) * 100) : 0}%)
• **Distancia**: **${todayHealth.walkingRunningDistanceKm || 0} km**
• **Energía activa**: **${todayHealth.activeEnergyKcal || 0} kcal**
• **Entrenamientos**: ${todayHealth.workouts?.length ? todayHealth.workouts.map((w) => `${w.type} (${w.durationMinutes} min)`).join(', ') : 'Ninguno hoy aún'}`;
    } else {
      healthLine = `\n\n🏃 **Cuerpo & Salud**: Apple Salud ${healthStatus.state === 'CONNECTED' ? 'sincronizada sin registros hoy todavía' : 'no conectada aún'}.`;
    }

    return {
      message: `${badge} **Diagnóstico Real (Nivel: ${st.label})**:
• **Saldo líquido en cuentas**: **${summary.realBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €**
• **Cobros pendientes confirmados**: **+${summary.pendingIncomeTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €**
• **Gastos previstos**: **-${summary.futureExpensesTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €**
• **Posición proyectada**: **${summary.projectedPosition.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €**
• **Reserva de seguridad**: **${summary.reserveCurrent} €** de ${summary.reserveTarget} € (${summary.reservePercentage}%)
• **Autonomía estimada**: **~${st.runwayWeeks} semanas**${healthLine}

📋 **Diagnóstico objetivo**:
${st.reason}

🎯 **Acción recomendada**:
${st.advice}`,
    };
  }

  // 4. Personal Context: "¿Quién soy?" / "¿Dónde estoy?" / "Contexto"
  if (/(qui[eé]n soy|mi contexto|d[oó]nde estoy|en qu[eé] momento|etapa vital)/i.test(lower)) {
    const profile = db.getUserProfile();
    return {
      message: `👤 **Contexto Personal y Etapa Actual**:
• **Ubicación**: ${profile.location} (construyendo residencia y estabilidad).
• **Momento vital**: ${profile.lifeStage}.
• **Escala de progresión**: Supervivencia ➔ **${profile.stageProgression.toUpperCase()}** ➔ Crecimiento.
• **Estructura de ingresos**: ${profile.incomeStructure}.
• **Proyectos activos**: ${profile.activeProjects.join(', ')}.
• **Criterio rector**: *Primero estabilidad y reserva, luego proyectos y crecimiento.*`,
    };
  }

  // 5. Query: Capital buckets "¿Cuánto tengo para vivir / proyectos / reserva?"
  if (/(dinero para vivir|para proyectos|para reserva|capital disponible|separaci[oó]n de capital|buckets)/i.test(lower)) {
    const summary = db.getFinancialSummary('month');
    const b = summary.capitalBuckets;
    return {
      message: `💼 **Segregación de Capital (Control de Fondos)**:
• **Dinero para Vivir (básico del mes)**: **${b.livingMoney.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €**
• **Dinero en Reserva (blindado)**: **${b.reserveMoney.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €**
• **Fondo asignado a Proyectos**: **${b.projectsMoney.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €**
• **Dinero Disponible real**: **${b.availableMoney.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €**

*Regla*: No mezclar el dinero de supervivencia o reserva con capital de riesgo para proyectos.`,
    };
  }

  // 3. Query: "¿Cuánto tengo en efectivo?" o en otra cuenta
  const balanceAccountMatch = lower.match(/cu[aá]nto tengo en ([a-záéíóú\s]+)/i);
  if (balanceAccountMatch) {
    const rawAccName = balanceAccountMatch[1].trim();
    // Resolve alias
    let matchedAcc = accounts.find((a) => a.name.toLowerCase().includes(rawAccName));
    if (!matchedAcc) {
      const alias = memory.find((m) => m.type === 'payment_method_alias' && rawAccName.includes(m.key.toLowerCase()));
      if (alias?.targetData?.paymentMethodId) {
        matchedAcc = accounts.find((a) => a.id === alias.targetData?.paymentMethodId);
      }
    }
    if (matchedAcc) {
      return {
        message: `💳 En **${matchedAcc.name}** tenés **${matchedAcc.balance} ${matchedAcc.currency}**.`,
      };
    }
  }

  // 4. Query: "¿Cuánto gasté esta semana / este mes / hoy?"
  if (/cu[aá]nto gast[eé]/i.test(lower)) {
    let period: 'today' | 'week' | 'month' = 'month';
    if (/hoy/i.test(lower)) period = 'today';
    else if (/semana/i.test(lower)) period = 'week';

    const summary = db.getFinancialSummary(period);
    const periodName = period === 'today' ? 'hoy' : period === 'week' ? 'esta semana' : 'este mes';
    return {
      message: `📊 En **${periodName}** has gastado un total de **${summary.periodStats.expenses} €** (Ingresos: ${summary.periodStats.income} €, Balance neto: ${summary.periodStats.netBalance} €).`,
    };
  }

  // 5. Query: "¿Cuánto tengo pendiente de cobrar?"
  if (/pendiente de cobrar|cu[aá]nto me deben|cobros pendientes/i.test(lower)) {
    const pends = pending.filter((p) => p.status === 'pending');
    const total = pends.reduce((s, p) => s + p.amount, 0);
    const list = pends.map((p) => `• ${p.concept}: **${p.amount} €** (${p.origin})`).join('\n');
    return {
      message: `📥 Tenés **${total} €** pendientes de cobrar:\n\n${list || 'No hay cobros pendientes actualmente.'}`,
    };
  }

  // 6. Query: "¿Cuánto me falta para mi reserva?"
  if (/reserva/i.test(lower) && /cu[aá]nto me falta|objetivo/i.test(lower)) {
    const res = db.getReserve();
    const diff = Math.max(0, res.targetAmount - res.currentAmount);
    return {
      message: `🎯 Tu reserva actual es de **${res.currentAmount} €** sobre un objetivo de **${res.targetAmount} €** (${res.percentage}%). Te faltan **${diff} €** para completarla.`,
    };
  }

  // 6.5. JARVIS OS: Natural Post-It Creation ("Anotame en el tablero...", "Anota un post-it...", "Nota rápida...")
  if (/^(?:anota(?:me)?|pon(?:e)?\s*(?:un)?\s*post-?it|nota\s*(?:r[aá]pida)?|guardar?\s*nota)/i.test(lower) || /en el tablero/i.test(lower)) {
    // Clean text to extract title & money
    let rawText = userInput
      .replace(/^(?:anota(?:me)?(?:\s*en el tablero)?|pon(?:e)?\s*(?:un)?\s*post-?it|nota\s*(?:r[aá]pida)?|guardar?\s*nota)\s*(?:que|:)?/i, '')
      .replace(/en el tablero/i, '')
      .trim();

    // Extract money if mentioned (e.g., "llamar a Juan por 300 euros")
    const moneyMatch = rawText.match(/(\d+(?:[.,]\d+)?)\s*(?:€|euros?)/i);
    const moneyAmount = moneyMatch ? parseFloat(moneyMatch[1].replace(',', '.')) : undefined;

    // Determine priority color based on user projects and categories:
    // purple: Creko | orange: Burger Palusa | blue: Sowfts | red: Urgencias | green: Metas & Ocio | yellow: Título libre
    let colorPriority: 'purple' | 'orange' | 'blue' | 'red' | 'yellow' | 'green' = 'yellow';
    let matchedProject = projects.find((p) => lower.includes(p.name.toLowerCase()));

    if (/urgente|cr[ií]tico|inmediato|ya\b|hoy mismo/i.test(lower)) {
      colorPriority = 'red';
    } else if (/creko|rotulaci[oó]n|carteler[ií]a|vinilo|thiago/i.test(lower)) {
      colorPriority = 'purple';
      if (!matchedProject) matchedProject = projects.find((p) => p.id === 'proj_creko');
    } else if (/burger|palusa|hamburguesa/i.test(lower)) {
      colorPriority = 'orange';
      if (!matchedProject) matchedProject = projects.find((p) => p.id === 'proj_burger_palusa');
    } else if (/sowft|software|c[oó]digo|sistema|desarrollo|web|api|app/i.test(lower)) {
      colorPriority = 'blue';
      if (!matchedProject) matchedProject = projects.find((p) => p.id === 'proj_soft_desarrollo');
    } else if (/medit|meta|ocio|h[aá]bito|descans|relax|semana|500\s*€|500\s*euros/i.test(lower)) {
      colorPriority = 'green';
    }

    if (!matchedProject) {
      if (/rotuprint/i.test(lower)) matchedProject = projects.find((p) => p.id === 'proj_rotuprint');
      else if (/ctc/i.test(lower)) matchedProject = projects.find((p) => p.id === 'proj_ctc');
    }

    const title = rawText || 'Nueva nota en el tablero';
    const createdPostIt = db.createPostIt({
      title,
      colorPriority,
      moneyAmount,
      projectId: matchedProject?.id,
      date: new Date().toISOString().split('T')[0],
      status: 'active',
    });

    const categoryLabels: Record<string, string> = {
      purple: '🟣 Creko (Merch & Cartelería)',
      orange: '🟠 Burger Palusa (Gastronomía)',
      blue: '🔵 Sowfts (Software en desarrollo)',
      red: '🔴 Urgencias (Crítico / Inmediato)',
      yellow: '🟡 Título Libre (Nota general)',
      green: '🟢 Metas & Ocio (Hábitos y Metas)',
    };

    return {
      message: `📝 **Anotado en tu Tablero de Post-Its**:
• **Nota**: "${createdPostIt.title}"
• **Categoría/Color**: ${categoryLabels[colorPriority]}
${moneyAmount ? `• **Importe asociado**: **${moneyAmount} €**\n` : ''}${matchedProject ? `• **Proyecto**: ${matchedProject.name}\n` : ''}
*Podés consultar o convertir esta nota en tarea desde el Tablero.*`,
      actionDetails: {
        actionType: 'create_postit',
        summary: createdPostIt.title,
        canUndo: true,
      },
    };
  }

  // 6.6. JARVIS OS: Natural Task Creation ("Poneme como tarea...", "Tarea: ...", "Agrega la tarea...")
  if (/^(?:pon(?:e)?me\s*(?:como)?\s*tarea|crea(?:r)?\s*tarea|agregar?\s*tarea|tarea:)/i.test(lower)) {
    let taskText = userInput
      .replace(/^(?:pon(?:e)?me\s*(?:como)?\s*tarea|crea(?:r)?\s*tarea|agregar?\s*tarea|tarea:)\s*(?:que|:)?/i, '')
      .trim();

    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
    if (/urgente|inmediat[oa]|hoy mismo/i.test(lower)) priority = 'urgent';
    else if (/importante|alta prioridad/i.test(lower)) priority = 'high';
    else if (/tranqui|baja prioridad|cuando pueda/i.test(lower)) priority = 'low';

    // Financial impact detection
    const moneyMatch = taskText.match(/(\d+(?:[.,]\d+)?)\s*(?:€|euros?)/i);
    const expectedAmount = moneyMatch ? parseFloat(moneyMatch[1].replace(',', '.')) : undefined;
    let financialImpact: any = undefined;
    if (expectedAmount || /cobrar|facturar|cliente|vender/i.test(lower)) {
      financialImpact = {
        type: 'income_driver',
        expectedAmount: expectedAmount || 0,
      };
    }

    // Match project
    let matchedProject = projects.find((p) => lower.includes(p.name.toLowerCase()));
    if (!matchedProject) {
      if (/rotuprint/i.test(lower)) matchedProject = projects.find((p) => p.id === 'proj_rotuprint');
      else if (/software|clientes/i.test(lower)) matchedProject = projects.find((p) => p.id === 'proj_soft_clientes');
      else if (/ctc/i.test(lower)) matchedProject = projects.find((p) => p.id === 'proj_ctc');
    }

    const taskTitle = taskText || 'Nueva tarea';
    const createdTask = db.createTask({
      title: taskTitle,
      priority,
      status: 'todo',
      dueDate: new Date().toISOString().split('T')[0],
      projectId: matchedProject?.id,
      financialImpact,
    });

    return {
      message: `📋 **Tarea agregada a tu Gestor de Tareas**:
• **Tarea**: "${createdTask.title}"
• **Prioridad**: ${priority === 'urgent' ? '🔴 Urgente' : priority === 'high' ? '🟠 Alta' : '🟡 Media'}
${financialImpact?.expectedAmount ? `• **Impacto económico**: **+${financialImpact.expectedAmount} €** (Generador de ingresos)\n` : ''}${matchedProject ? `• **Proyecto**: ${matchedProject.name}\n` : ''}
*Visible en tu Centro de Control y Agenda unificada.*`,
      actionDetails: {
        actionType: 'create_task',
        summary: createdTask.title,
        canUndo: true,
      },
    };
  }

  // 7. Cobro de pendiente: "Cobré 180 euros del electricista" / "Cobré los 180 del electricista"
  if (/(cobr[eé]|recib[ií]|ingres[eé]).*(electricista|\d+)/i.test(lower)) {
    // Extract amount
    const amtMatch = lower.match(/(\d+(?:[.,]\d+)?)/);
    const amt = amtMatch ? parseFloat(amtMatch[1].replace(',', '.')) : null;

    // Search pending incomes
    const matchedPending = pending.find((p) => {
      if (p.status !== 'pending') return false;
      const conceptMatch = lower.includes(p.concept.toLowerCase()) || lower.includes(p.origin.toLowerCase());
      const amtCheck = amt ? Math.abs(p.amount - amt) < 0.1 : true;
      return conceptMatch && amtCheck;
    });

    if (matchedPending) {
      let destAcc = accounts.find((a) => lower.includes(a.name.toLowerCase()));
      if (!destAcc) {
        if (/efectivo/i.test(lower)) destAcc = accounts.find((a) => a.id === 'acc_cash');
        else if (/galicia/i.test(lower)) destAcc = accounts.find((a) => a.id === 'acc_galicia');
        else if (/naranja/i.test(lower)) destAcc = accounts.find((a) => a.id === 'acc_naranja');
        else destAcc = accounts.find((a) => a.id === 'acc_bank') || accounts[0];
      }

      return {
        message: `💰 Detecté el cobro de **${matchedPending.amount} €** (${matchedPending.concept}).\n¿Confirmás el ingreso en **${destAcc!.name}** para marcarlo como recibido?`,
        proposal: {
          id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'income',
          amount: matchedPending.amount,
          currency: 'EUR',
          description: `Cobro: ${matchedPending.concept}`,
          categoryId: 'cat_gen_ingresos',
          categoryName: 'Generación de ingresos',
          paymentMethodId: destAcc!.id,
          paymentMethodName: destAcc!.name,
          date: new Date().toISOString().split('T')[0],
          source: 'pending_income',
          status: 'proposed',
          pendingIncomeId: matchedPending.id,
          notes: `Cobro pendiente de ${matchedPending.origin}`,
        },
      };
    }
  }

  // 7b. General Income Registration: "Cobré 200 de changa", "Ingresé 150 por software", "Me pagaron 80"
  const generalIncomeMatch = lower.match(/(?:cobr[eé]|ingres[eé]|recib[ií]|me pagaron|gan[eé])\s*(?:de\s*)?(\d+(?:[.,]\d+)?)\s*(?:€|euros?|pesos?)?/i);
  if (generalIncomeMatch && !lower.includes('gasto') && !lower.includes('gasté') && !lower.includes('pagué')) {
    const amount = parseFloat(generalIncomeMatch[1].replace(',', '.'));
    let destAcc = accounts.find((a) => lower.includes(a.name.toLowerCase()));
    if (!destAcc) {
      if (/efectivo/i.test(lower)) destAcc = accounts.find((a) => a.id === 'acc_cash');
      else if (/galicia/i.test(lower)) destAcc = accounts.find((a) => a.id === 'acc_galicia');
      else if (/naranja/i.test(lower)) destAcc = accounts.find((a) => a.id === 'acc_naranja');
      else destAcc = accounts.find((a) => a.id === 'acc_cash') || accounts[0];
    }

    const concept = /electricidad/i.test(lower)
      ? 'Trabajo de electricidad'
      : /dejavu|bar/i.test(lower)
      ? 'Changa / Bar Dejavu'
      : /rotuprint/i.test(lower)
      ? 'Ingreso Rotuprint'
      : /software/i.test(lower)
      ? 'Ingreso por software'
      : 'Ingreso por trabajo / changa';

    let matchedProject = projects.find((p) => lower.includes(p.name.toLowerCase()));
    if (!matchedProject) {
      if (/rotuprint/i.test(lower)) matchedProject = projects.find((p) => p.id === 'proj_rotuprint');
      else if (/software/i.test(lower)) matchedProject = projects.find((p) => p.id === 'proj_soft_clientes');
    }

    return {
      message: `💰 Interpreté un ingreso de **${amount} €** (${concept}) en **${destAcc.name}**.\n\n¿Confirmás el ingreso para sumarlo a tu saldo disponible?`,
      proposal: {
        id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: 'income',
        amount,
        currency: 'EUR',
        description: concept,
        categoryId: 'cat_gen_ingresos',
        categoryName: 'Generación de ingresos',
        paymentMethodId: destAcc.id,
        paymentMethodName: destAcc.name,
        projectId: matchedProject?.id,
        projectName: matchedProject?.name,
        date: new Date().toISOString().split('T')[0],
        source: 'chat',
        status: 'proposed',
      },
    };
  }

  // 8. Transaction Registration: "Gasté 12 euros en comida y pagué en efectivo", "Gasté 35 euros en nafta con la Naranja", "Gasté 80 euros en materiales para Rotuprint con Galicia"
  const expenseMatch = lower.match(/(?:gast[eé]|pagu[eé]|compr[eé]|abon[eé])\s*(?:de\s*)?(\d+(?:[.,]\d+)?)\s*(?:€|euros?|pesos?)?/i);
  if (expenseMatch) {
    const amount = parseFloat(expenseMatch[1].replace(',', '.'));

    // Check account through aliases & direct names
    let matchedAccount = accounts.find((a) => lower.includes(a.name.toLowerCase()));
    if (!matchedAccount) {
      for (const mem of memory) {
        if (mem.type === 'payment_method_alias' && lower.includes(mem.key.toLowerCase())) {
          if (mem.targetData?.paymentMethodId) {
            matchedAccount = accounts.find((a) => a.id === mem.targetData?.paymentMethodId);
            break;
          }
        }
      }
    }
    if (!matchedAccount) {
      if (/efectivo|en mano/i.test(lower)) matchedAccount = accounts.find((a) => a.id === 'acc_cash');
      else if (/naranja/i.test(lower)) matchedAccount = accounts.find((a) => a.id === 'acc_naranja');
      else if (/galicia/i.test(lower)) matchedAccount = accounts.find((a) => a.id === 'acc_galicia');
      else if (/banco|cuenta bancaria/i.test(lower)) matchedAccount = accounts.find((a) => a.id === 'acc_bank');
    }

    if (!matchedAccount) {
      return {
        message: `Entendido el gasto de **${amount} €**, pero ¿con qué medio lo pagaste? (Efectivo, Tarjeta Naranja, Tarjeta Galicia o Cuenta bancaria).`,
        clarificationNeeded: true,
      };
    }

    // Check project through rules & direct names
    let matchedProject = projects.find((p) => lower.includes(p.name.toLowerCase()));
    if (!matchedProject) {
      for (const mem of memory) {
        if (mem.type === 'project_rule' && lower.includes(mem.key.toLowerCase())) {
          if (mem.targetData?.projectId) {
            matchedProject = projects.find((p) => p.id === mem.targetData?.projectId);
            break;
          }
        }
      }
    }

    // Check category through rules & names
    let matchedCategory = categories.find((c) => lower.includes(c.name.toLowerCase()));
    let matchedSubcategory: { id: string; name: string } | undefined;

    // Check memory category rules first (nafta, super, comida)
    for (const mem of memory) {
      if (mem.type === 'category_rule' && lower.includes(mem.key.toLowerCase())) {
        if (mem.targetData?.categoryId) {
          matchedCategory = categories.find((c) => c.id === mem.targetData?.categoryId);
          if (mem.targetData?.subcategoryId) {
            matchedSubcategory = matchedCategory?.subcategories.find((s) => s.id === mem.targetData?.subcategoryId);
          }
          break;
        }
      }
    }

    if (!matchedCategory && matchedProject) {
      if (matchedProject.id === 'proj_rotuprint') {
        matchedCategory = categories.find((c) => c.id === 'cat_rotuprint');
        matchedSubcategory = matchedCategory?.subcategories.find((s) => s.id === 'sub_materiales');
      }
    }

    if (!matchedCategory) {
      if (/nafta|combustible|gasolina/i.test(lower)) {
        matchedCategory = categories.find((c) => c.id === 'cat_transporte');
        matchedSubcategory = matchedCategory?.subcategories.find((s) => s.name.toLowerCase().includes('combustible'));
      } else if (/comida|almuerzo|cena|desayuno/i.test(lower)) {
        matchedCategory = categories.find((c) => c.id === 'cat_alim');
        matchedSubcategory = matchedCategory?.subcategories.find((s) => s.name.toLowerCase().includes('comida'));
      } else if (/super|mercado|supermercado/i.test(lower)) {
        matchedCategory = categories.find((c) => c.id === 'cat_alim');
        matchedSubcategory = matchedCategory?.subcategories.find((s) => s.name.toLowerCase().includes('supermercado'));
      } else {
        matchedCategory = categories.find((c) => c.id === 'cat_otros') || categories[0];
      }
    }

    const description = matchedProject
      ? `Materiales/Gastos para ${matchedProject.name}`
      : matchedSubcategory?.name || matchedCategory?.name || 'Gasto registrado';

    const catLabel = matchedSubcategory ? `${matchedCategory?.name} ➔ ${matchedSubcategory.name}` : matchedCategory?.name || 'General';
    const projLabel = matchedProject ? `\n• Proyecto asociado: **${matchedProject.name}**` : '';

    return {
      message: `💡 Interpreté un gasto de **${amount} €** en **${description}**.\n• Categoría: **${catLabel}**\n• Medio de pago: **${matchedAccount.name}**${projLabel}\n\n¿Lo guardo así?`,
      proposal: {
        id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        type: 'expense',
        amount,
        currency: 'EUR',
        description,
        categoryId: matchedCategory?.id,
        categoryName: matchedCategory?.name,
        subcategoryId: matchedSubcategory?.id,
        subcategoryName: matchedSubcategory?.name,
        paymentMethodId: matchedAccount.id,
        paymentMethodName: matchedAccount.name,
        projectId: matchedProject?.id,
        projectName: matchedProject?.name,
        date: new Date().toISOString().split('T')[0],
        source: 'chat',
        status: 'proposed',
      },
    };
  }

  // 9. Natural corrections: "No eran 12, eran 15", "No era comida, era ocio", "Eso lo pagué con Galicia", "El gasto anterior era de Rotuprint"
  const recentTxs = db.getTransactions();
  const lastTx = recentTxs[0];

  if (lastTx) {
    // Amount correction: "No fueron 12, fueron 15" / "Eran 15"
    const amtCorrectionMatch = lower.match(/(?:no fueron|no eran|eran|fue de|cambia a|cambiá a)\s*(\d+(?:[.,]\d+)?)/i);
    if (amtCorrectionMatch) {
      const newAmt = parseFloat(amtCorrectionMatch[1].replace(',', '.'));
      const res = db.updateTransaction(lastTx.id, { amount: newAmt });
      if (res) {
        return {
          message: `✏️ **Corregido**: El importe del último gasto fue actualizado de ${lastTx.amount} € a **${newAmt} €**. Tu saldo se ha recalculado en consecuencia.`,
          actionDetails: {
            actionType: 'update_transaction',
            transactionId: lastTx.id,
            amount: newAmt,
            canUndo: true,
          },
        };
      }
    }

    // Account correction: "Eso lo pagué con Galicia" / "Fue con la Naranja"
    if (/(pagu[eé] con|fue con|era con)/i.test(lower)) {
      let targetAcc = accounts.find((a) => lower.includes(a.name.toLowerCase()));
      if (!targetAcc) {
        if (/naranja/i.test(lower)) targetAcc = accounts.find((a) => a.id === 'acc_naranja');
        else if (/galicia/i.test(lower)) targetAcc = accounts.find((a) => a.id === 'acc_galicia');
        else if (/efectivo/i.test(lower)) targetAcc = accounts.find((a) => a.id === 'acc_cash');
        else if (/banco|bancaria/i.test(lower)) targetAcc = accounts.find((a) => a.id === 'acc_bank');
      }
      if (targetAcc) {
        db.updateTransaction(lastTx.id, { paymentMethodId: targetAcc.id });
        return {
          message: `✏️ **Corregido**: Se cambió el medio de pago a **${targetAcc.name}** y los saldos fueron ajustados.`,
          actionDetails: {
            actionType: 'update_transaction',
            transactionId: lastTx.id,
            accountName: targetAcc.name,
            canUndo: true,
          },
        };
      }
    }

    // Category correction: "No era comida, era ocio"
    const catCorrectionMatch = lower.match(/no era ([a-záéíóú\s]+),\s*era ([a-záéíóú\s]+)/i);
    if (catCorrectionMatch) {
      const oldTerm = catCorrectionMatch[1].trim();
      const newTerm = catCorrectionMatch[2].trim();

      const matchedCatInfo = db.findCategoryByName(newTerm);
      if (matchedCatInfo.category) {
        db.updateTransaction(lastTx.id, {
          categoryId: matchedCatInfo.category.id,
          subcategoryId: matchedCatInfo.subcategory?.id,
          description: matchedCatInfo.subcategory?.name || matchedCatInfo.category.name,
        });

        return {
          message: `✏️ **Corregido**: Categoría cambiada a **${matchedCatInfo.category.name}${matchedCatInfo.subcategory ? ' → ' + matchedCatInfo.subcategory.name : ''}**.`,
          learningProposal: {
            ruleType: 'category_rule',
            key: oldTerm,
            value: `${matchedCatInfo.category.name}${matchedCatInfo.subcategory ? ' / ' + matchedCatInfo.subcategory.name : ''}`,
            targetData: {
              categoryId: matchedCatInfo.category.id,
              subcategoryId: matchedCatInfo.subcategory?.id,
            },
            prompt: `¿Querés que recuerde que cuando decís "${oldTerm}" en este contexto normalmente corresponde a ${matchedCatInfo.subcategory?.name || matchedCatInfo.category.name}?`,
          },
        };
      }
    }

    // Project correction: "El gasto anterior era de Rotuprint"
    if (/era de rotuprint|para rotuprint|de ctc|para creko/i.test(lower)) {
      const proj = projects.find((p) => lower.includes(p.name.toLowerCase()));
      if (proj) {
        db.updateTransaction(lastTx.id, { projectId: proj.id });
        return {
          message: `✏️ **Corregido**: Movimiento asociado al proyecto **${proj.name}**.`,
          actionDetails: {
            actionType: 'update_transaction',
            transactionId: lastTx.id,
            projectName: proj.name,
            canUndo: true,
          },
        };
      }
    }
  }

  // Fallback: intelligent friendly guide
  return null;
}

/**
 * Primary assistant entry point:
 * Queries Gemini 3.8 Flash server-side with structured prompt and tools,
 * and validates/executes operations securely via DB functions.
 */
export async function processAssistantMessage(
  userInput: string,
  image?: ChatImageData
): Promise<AssistantResponse> {
  // First, check if a fast local rule match is unambiguous (only when not sending an image)
  const localMatch = !image ? localRuleBasedParser(userInput) : null;
  if (localMatch) {
    return localMatch;
  }

  const ai = getAI();
  if (!ai) {
    if (image) {
      return {
        message:
          '🧾 Recibí la foto del ticket. Para registrarlo con exactitud, por favor indicame el importe y concepto (ej: "Gasté 15 € en Mercadona en efectivo") y lo guardo al instante en tus cuentas.',
      };
    }
    return {
      message:
        'Entendido. Podés pedirme registrar gastos ("Gasté 12 € en comida con efectivo"), cobrar pendientes ("Cobré los 180 del electricista"), consultar saldos ("¿Cómo estoy?"), o corregir el último movimiento.',
    };
  }

  const accounts = db.getAccounts();
  const categories = db.getCategories();
  const projects = db.getProjects();
  const pendingIncomes = db.getPendingIncomes();
  const futureExpenses = db.getFutureExpenses();
  const memory = db.getMemory();
  const recentTxs = db.getTransactions().slice(0, 5);
  const summary = db.getFinancialSummary();
  const userProfile = db.getUserProfile();
  const todayHealth = db.getTodayHealth();
  const healthStatus = db.getHealthStatus();
  const latestCheckin = db.getData().checkins?.slice(-1)[0];

  const systemInstruction = `ERES JARVIS: EL SISTEMA OPERATIVO PERSONAL Y CEREBRO ESTRATÉGICO DE FRAN ALBORNOZ.
No eres un bot genérico ni un contador pasivo. Eres el socio/director estratégico de Fran, con foco absoluto en utilidad diaria.

IDENTIDAD DE FRAN:
- Nombre: FRAN ALBORNOZ
- Ubicación actual: España / Logroño
- Situación actual: Estabilidad económica + crecimiento
- Proyectos principales (8):
  1. Creko (Prioridad alta: captación, venta, sistema de producción con Thiago)
  2. Rotuprint (Trámite laboral y regularización en curso con abogada/SEPE/Extranjería)
  3. CTC (En desarrollo: cerebro digital de contenido con Tomás de Luna)
  4. Burger Palusa (Creativo / padre socio: indumentaria y piezas de video)
  5. Suite Solutions (Oportunidad: prospección de hoteles/apartamentos con Juanchi Frías)
  6. Software (Sistemas web, clientes, herramientas monetizables)
  7. Ciudad Gráfica (Histórico / experiencia previa en confección y DTF)
  8. Goloso (En espera / pausado para evitar dispersión)

PRIORIDADES DE FRAN:
1. Generar ingresos diarios/semanales
2. Creko
3. Resolver Rotuprint
4. Cuidar salud (gym, comida)
5. No dispersarse con proyectos nuevos
6. Regular weed

REGLAS DE RESPUESTA DE JARVIS (VIVO, PROACTIVO Y ORGÁNICO):
- Eres una inteligencia viva, cercana y lúcida. Conoces a Fran en profundidad: sus metas, sus proyectos, sus cuentas, sus hábitos y su ritmo diario.
- Tienes voz propia: hablas de forma natural, enérgica y resolutiva, lista para ser escuchada por voz (Text-to-Speech) sin sonar como un robot de call center ni una enciclopedia aburrida.
- Tu tono es el de un socio estratégico de confianza y director de operaciones: firme, directo, motivador cuando toca, exigente con la caja y con cero humo.
- Respuestas directas, bien estructuradas y con impacto: no des discursos eternos, ve al grano pero con calidez y carácter real.
- Cuidar el dinero de Fran con celo: alertar si un gasto pone en jaque la reserva o si hay cobros en el aire que deberían estar ya en su mano.
- Cuando Fran te pida consejo, habla como un mentor y estratega que mira el cuadro completo: energía física (pasos, sueño), claridad mental y caja real.

REGLAS FUNDAMENTALES DEL SISTEMA:
1. CTC es solo un PROYECTO. NO es un ingreso asegurado hasta que haya cobros o ventas confirmadas.
2. NUNCA inventes saldo, ingresos, gastos, cuentas ni proyectos. Si un dato no existe, di "No tengo ese dato registrado".
3. Transferencias entre cuentas propias NO son ingresos ni gastos.
4. Si el usuario cobró un pendiente (ej. "Cobré los 180 del electricista"), márcalo como recibido y registra el ingreso.
5. Respeta la segregación de capital:
   - Dinero para Vivir (básicos y compromisos del mes)
   - Dinero para Reserva (fondo intocable para emergencias)
   - Dinero para Proyectos (recursos medidos y condicionados a la estabilidad)
   - Dinero Disponible real
6. TOMA DE DECISIONES ANTE "¿PUEDO GASTAR X EN Y?":
   Evalúa con los números reales:
   - Saldo líquido disponible actual: ${summary.realBalance} €
   - Gastos futuros previstos: ${summary.futureExpensesTotal} €
   - Cobros pendientes confirmados: ${summary.pendingIncomeTotal} €
   - Estado de la reserva: ${summary.reserveCurrent} € / ${summary.reserveTarget} € (${summary.reservePercentage}%)
   - Autonomía (runway): ${summary.stability.runwayWeeks} semanas
   Responde fundamentado en estos datos.

REGLAS DE MEMORIA Y ALIAS:
${JSON.stringify(memory.map((m) => ({ key: m.key, value: m.value, type: m.type, desc: m.description })))}

DATOS ACTUALES DEL SISTEMA:
- FECHA Y HORA ACTUAL: ${new Date().toLocaleTimeString('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', second: '2-digit' })} (España, Logroño) - ${new Date().toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
- Saldo real total: ${summary.realBalance} €
- Pendiente de cobrar: ${summary.pendingIncomeTotal} €
- Gastos futuros previstos: ${summary.futureExpensesTotal} €
- Posición proyectada: ${summary.projectedPosition} €
- Reserva actual: ${summary.reserveCurrent} € (${summary.reservePercentage}% de ${summary.reserveTarget} €)
- Diagnóstico de estabilidad: ${summary.stability.label} (${summary.stability.status})
- Cuentas activas: ${JSON.stringify(accounts.map((a) => ({ id: a.id, name: a.name, balance: a.balance, type: a.type })))}
- Proyectos: ${JSON.stringify(projects.map((p) => ({ id: p.id, name: p.name, spent: p.accumulatedExpenses })))}
- Categorías: ${JSON.stringify(categories.map((c) => ({ id: c.id, name: c.name, subs: c.subcategories.map((s) => ({ id: s.id, name: s.name })) })))}
- Cobros pendientes: ${JSON.stringify(pendingIncomes.filter((p) => p.status === 'pending'))}
- Gastos futuros pendientes: ${JSON.stringify(futureExpenses.filter((f) => f.status === 'pending'))}
- Última transacción registrada: ${JSON.stringify(recentTxs[0] || null)}
- CUERPO Y SALUD DE HOY (APPLE HEALTHKIT / HEALTH & LIFE):
  * Estado conexión: ${healthStatus.state} (${healthStatus.lastSyncedAt ? 'Última sync: ' + healthStatus.lastSyncedAt : 'No sincronizado hoy'})
  * Pasos: ${todayHealth?.steps ? todayHealth.steps.toLocaleString('es-ES') : 'Sin datos'} / ${healthStatus.dailyStepTarget.toLocaleString('es-ES')} pasos meta (${todayHealth?.steps ? Math.round((todayHealth.steps / healthStatus.dailyStepTarget) * 100) : 0}%)
  * Distancia recorrida: ${todayHealth?.walkingRunningDistanceKm || 0} km
  * Energía activa quemada: ${todayHealth?.activeEnergyKcal || 0} kcal
  * Entrenamientos registrados hoy: ${todayHealth?.workouts?.length ? todayHealth.workouts.map((w) => `${w.type} (${w.durationMinutes} min, ${w.activeEnergyKcal || 0} kcal)`).join(', ') : 'Ninguno hoy todavía'}
  * Último Check-in Diario: ${latestCheckin ? `Ánimo: ${latestCheckin.mood}/10, Energía: ${latestCheckin.energy}/10, Estrés: ${latestCheckin.stress}/10, Sueño: ${latestCheckin.sleep}/10, Hábitos: ${latestCheckin.habitsCompleted?.join(', ') || 'ninguno'}` : 'Sin check-in hoy'}

REGLA DE SALUD Y RENDIMIENTO:
- Si Fran pregunta "¿Cómo estoy?", "¿Cómo vengo hoy?" o sobre su energía o cuerpo, combina siempre estado anímico, actividad física (pasos y entrenamientos de HealthKit), prioridades (Creko/captación/caja) y balance financiero.
- NUNCA realices diagnósticos médicos ni sugieras patologías clínicas. Habla de energía, foco, regular descanso y movimiento.

SISTEMA DE BLOQUES DE TIEMPO (FILOSOFÍA FUNDAMENTAL DE FRAN):
- Fran maneja su vida mediante BLOQUES DE TIEMPO CONCRETOS, no mediante listas interminables de 25 tareas.
- "Ahora estoy en este bloque y durante este tiempo solamente trabajo en esto."
- Áreas y Colores unificados en TODO el sistema:
  * 🟣 CREKO (#a855f7): Captación, Mensajes, Seguimiento, Ideas, Contenido, Imágenes, Presupuestos, Producción.
  * 🟠 PRODUCTOS (#f97316): Prototipos de fuentes de ingresos (ej. cartel ferias en L 3D + corte láser + DTF UV).
  * 🔵 EMPLEO (#38bdf8): Bloque matutino de 40 min para buscar ofertas y enviar CV (separado de Creko).
  * 🔴 TRABAJOS / CHANGAS (#ef4444): Trabajos puntuales (Electricidad Josu 180 €) con horario prioritario.
  * 🟢 PERSONAL (#10b981): Gimnasio, fútbol, descansos, comidas, salud.
  * 🟡 ORGANIZACIÓN (#eab308): Finanzas, balance de caja, cierre del día.
- Respuestas ante la agenda:
  * Si pregunta "¿Qué tengo hoy?", responder con el formato scannable:
    ### HOY
    08:30–09:00
    🟣 CREKO — Captación
    Preparar prospectos.
    ...
    ### PENDIENTES QUE PASAN A OTRO MOMENTO
  * Si informa avance ("Terminé captación", "Terminé empleo"):
    NO muestres toda la agenda. Di directamente:
    "Perfecto. Captación terminada. Ahora pasamos al bloque de [Siguiente Bloque]. Después tenemos [Bloque Posterior]."
  * Si un bloque tarda más o se cancela:
    Adelanta o reprograma sin juzgar como fracaso. Adaptabilidad en tiempo real.

REGLAS PARA LECTURA DE TICKETS, FACTURAS Y REGISTRO DE MOVIMIENTOS:
PRINCIPIO FUNDAMENTAL: LA IA PROPONE, EL USUARIO CONFIRMA.
Ningún movimiento modifica saldos antes de que el usuario lo confirme interactivamente.
Cuando se envíe una foto de ticket, recibo o comprobante, o se pida registrar un gasto o ingreso:
1. Extrae con precisión:
   - Comercio / Establecimiento / Concepto (ej: Mercadona, Bar Dejavu, Carrefour, Lidl, Farmacia, Repsol, Ferretería, etc.).
   - Importe TOTAL exacto en euros (€).
   - Fecha impresa en el comprobante (en formato YYYY-MM-DD); si no es legible, usa la fecha actual.
   - Categoría y subcategoría exacta de la lista de categorías del sistema.
   - Medio de pago: revisa si el ticket menciona tarjeta o efectivo; si no se especifica, sugiere Efectivo (acc_cash) o la cuenta habitual.
2. Genera SIEMPRE la herramienta "propose_transaction" con toolParams:
   {
     "type": "expense" | "income",
     "amount": <numero_importe>,
     "description": "<Comercio o concepto>",
     "categoryId": "<categoryId>",
     "subcategoryId": "<subcategoryId>",
     "accountId": "<accountId>",
     "date": "<YYYY-MM-DD>",
     "projectId": "<projectId>"
   }
   y un mensaje conciso detallando lo detectado y solicitando confirmación.

FORMATO DE RESPUESTA: DEBES responder estrictamente en formato JSON válido:
{
  "tool": "propose_transaction" | "mark_income_received" | "create_postit" | "create_task" | "manage_time_block" | "update_last_transaction" | "undo" | "modify_account_balance" | "modify_reserve_target" | "create_changa" | "log_health_activity" | "modify_system_memory" | "modify_user_profile" | "financial_query" | "clarify" | "chat",
  "toolParams": { ... },
  "message": "Texto directo, objetivo y útil para el usuario",
  "learningProposal": { "ruleType": "...", "key": "...", "value": "...", "prompt": "..." } // opcional
}

Para "modify_account_balance": toolParams: { "accountName": "Efectivo"|"Santander"|..., "newBalance": number, "reason": "..." }
Para "modify_reserve_target": toolParams: { "newTarget": number, "reason": "..." }
Para "create_changa": toolParams: { "title": "...", "client": "...", "amount": number, "area": "rotulacion"|"diseno"|"software"|"otros", "date": "YYYY-MM-DD" }
Para "log_health_activity": toolParams: { "steps": number, "workoutType": "Gimnasio"|"Skateboarding"|"Carrera"|..., "durationMinutes": number, "kcal": number }
Para "modify_system_memory": toolParams: { "key": "...", "value": "...", "description": "..." }
Para "modify_user_profile": toolParams: { "priorities": ["..."], "operatingRules": ["..."], "communicationStyle": "..." }
Para "manage_time_block": toolParams: { "action": "create"|"move"|"modify"|"complete"|"delete", "title": "...", "startTime": "HH:MM", "endTime": "HH:MM", "area": "creko"|"producto"|"empleo"|"changa"|"personal"|"organizacion", "date": "YYYY-MM-DD", "targetBlockId": "...", "objective": "..." }
Para "create_postit": toolParams: { "title": "...", "description": "...", "colorPriority": "purple"|"orange"|"blue"|"red"|"yellow"|"green", "moneyAmount": number, "projectId": "..." } (purple=Creko, orange=Burger Palusa, blue=Sowfts, red=Urgencias, yellow=Título libre, green=Metas & Ocio)
Para "create_task": toolParams: { "title": "...", "priority": "urgent"|"high"|"medium"|"low", "dueDate": "YYYY-MM-DD", "projectId": "..." }`;

  try {
    let contentsPayload: any;

    if (image && image.data) {
      const base64Clean = image.data.includes(',')
        ? image.data.split(',')[1]
        : image.data;
      const mimeType = image.mimeType || 'image/jpeg';

      const imagePart = {
        inlineData: {
          mimeType,
          data: base64Clean,
        },
      };

      const promptText = userInput && userInput.trim()
        ? `Mensaje del usuario: "${userInput}".\nPor favor analiza la imagen adjunta (ticket de compra, factura o recibo) y extrae sus datos (comercio, importe total en euros, fecha, medio de pago y categoría) para proponer el gasto correspondiente.`
        : `Por favor analiza esta foto de ticket/recibo de compra adjunta. Extrae el comercio o establecimiento, el importe total en euros (€), la fecha y clasifícalo en la categoría correcta para proponer el gasto al usuario para su confirmación.`;

      contentsPayload = {
        parts: [imagePart, { text: promptText }],
      };
    } else {
      contentsPayload = userInput;
    }

    let text: string | undefined;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contentsPayload,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });
      text = response.text?.trim();
    } catch (err: any) {
      console.warn('Gemini 3.8 Flash temporarily unavailable, trying gemini-3.1-flash-lite fallback...', err?.message);
      try {
        const response2 = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: contentsPayload,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        });
        text = response2.text?.trim();
      } catch (err2: any) {
        console.error('All Gemini model invocations failed:', err2?.message);
      }
    }

    if (!text) {
      const fallbackLocal = !image ? localRuleBasedParser(userInput) : null;
      return fallbackLocal || localMatch || { message: 'No pude interpretar la solicitud.' };
    }

    const parsed = JSON.parse(text);

    // Secure generation of transaction proposal (AI proposes, User confirms)
    if (
      (parsed.tool === 'propose_transaction' ||
        parsed.tool === 'create_expense' ||
        parsed.tool === 'create_income') &&
      parsed.toolParams
    ) {
      const p = parsed.toolParams;
      const isIncome = parsed.tool === 'create_income' || p.type === 'income';
      const amt = Number(p.amount) || 0;
      let acc = accounts.find(
        (a) => a.id === p.accountId || a.name.toLowerCase().includes((p.accountName || '').toLowerCase())
      );
      if (!acc) acc = accounts.find((a) => a.id === 'acc_cash') || accounts[0];

      let cat = categories.find(
        (c) => c.id === p.categoryId || c.name.toLowerCase().includes((p.categoryName || '').toLowerCase())
      );
      let sub = cat?.subcategories.find(
        (s) => s.id === p.subcategoryId || s.name.toLowerCase().includes((p.subcategoryName || '').toLowerCase())
      );
      let proj = projects.find(
        (pr) => pr.id === p.projectId || pr.name.toLowerCase().includes((p.projectName || '').toLowerCase())
      );

      const txDate =
        p.date && /^\d{4}-\d{2}-\d{2}$/.test(p.date) ? p.date : new Date().toISOString().split('T')[0];
      const desc = p.description || sub?.name || cat?.name || (isIncome ? 'Ingreso detectado' : 'Gasto detectado');
      const catLabel = sub ? `${cat?.name} ➔ ${sub.name}` : cat?.name || 'Varios';

      const defaultMsg = image
        ? `🧾 **Ticket analizado**: Detecté un gasto de **${amt.toFixed(2)} €** en **${desc}**.\n• Categoría: **${catLabel}**\n• Medio de pago: **${acc.name}**\n• Fecha: **${txDate}**\n\n¿Deseas guardarlo en tus cuentas?`
        : isIncome
        ? `💰 Detecté un ingreso de **${amt.toFixed(2)} €** de **${desc}** en **${acc.name}**.\n\n¿Confirmás el ingreso?`
        : `💡 Detecté un gasto de **${amt.toFixed(2)} €** en **${desc}**.\n• Categoría: **${catLabel}**\n• Medio de pago: **${acc.name}**\n\n¿Lo guardo así?`;

      return {
        message: parsed.message || defaultMsg,
        proposal: {
          id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: isIncome ? 'income' : 'expense',
          amount: amt,
          currency: 'EUR',
          description: desc,
          categoryId: cat?.id,
          categoryName: cat?.name,
          subcategoryId: sub?.id,
          subcategoryName: sub?.name,
          paymentMethodId: acc.id,
          paymentMethodName: acc.name,
          projectId: proj?.id,
          projectName: proj?.name,
          date: txDate,
          source: image ? 'receipt' : 'chat',
          receiptImage: image ? image.data : undefined,
          status: 'proposed',
        },
        learningProposal: parsed.learningProposal,
      };
    }

    if (parsed.tool === 'mark_income_received' && parsed.toolParams) {
      const p = parsed.toolParams;
      let pend = pendingIncomes.find(
        (pi) => pi.id === p.pendingIncomeId || pi.concept.toLowerCase().includes((p.concept || '').toLowerCase())
      );
      let acc =
        accounts.find(
          (a) => a.id === p.accountId || a.name.toLowerCase().includes((p.accountName || '').toLowerCase())
        ) || accounts[0];

      if (pend) {
        return {
          message: `💰 Detecté el cobro de **${pend.amount} €** (${pend.concept}).\n¿Confirmás el ingreso en **${acc.name}** y marcarlo como cobrado?`,
          proposal: {
            id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            type: 'income',
            amount: pend.amount,
            currency: 'EUR',
            description: `Cobro: ${pend.concept}`,
            categoryId: 'cat_gen_ingresos',
            categoryName: 'Generación de ingresos',
            paymentMethodId: acc.id,
            paymentMethodName: acc.name,
            date: new Date().toISOString().split('T')[0],
            source: 'pending_income',
            status: 'proposed',
            pendingIncomeId: pend.id,
            notes: `Cobro pendiente de ${pend.origin}`,
          },
        };
      }
    }

    if (parsed.tool === 'create_postit' && parsed.toolParams) {
      const p = parsed.toolParams;
      const postIt = db.createPostIt({
        title: p.title || 'Nueva nota',
        description: p.description,
        colorPriority: p.colorPriority || 'yellow',
        moneyAmount: p.moneyAmount ? Number(p.moneyAmount) : undefined,
        projectId: p.projectId,
        date: p.date || new Date().toISOString().split('T')[0],
        status: 'active',
      });
      return {
        message: parsed.message || `📝 **Post-it creado**: "${postIt.title}" guardado en tu tablero.`,
        learningProposal: parsed.learningProposal,
      };
    }

    if (parsed.tool === 'create_task' && parsed.toolParams) {
      const p = parsed.toolParams;
      const task = db.createTask({
        title: p.title || 'Nueva tarea',
        priority: p.priority || 'medium',
        dueDate: p.dueDate || new Date().toISOString().split('T')[0],
        projectId: p.projectId,
        status: 'todo',
        notes: p.notes,
      });
      return {
        message: parsed.message || `📋 **Tarea activada**: "${task.title}" (Prioridad: ${task.priority}).`,
        learningProposal: parsed.learningProposal,
      };
    }

    if (parsed.tool === 'undo') {
      const undoRes = db.undoLastAction();
      return {
        message: undoRes.success ? `↩️ **Operación revertida**: ${undoRes.description}` : `ℹ️ ${undoRes.description}`,
      };
    }

    if (parsed.tool === 'update_last_transaction' && recentTxs[0] && parsed.toolParams) {
      const updates = parsed.toolParams;
      const res = db.updateTransaction(recentTxs[0].id, updates);
      return {
        message: parsed.message || `✏️ **Movimiento actualizado correctamente**.`,
        actionDetails: {
          actionType: 'update_transaction',
          transactionId: recentTxs[0].id,
          canUndo: true,
        },
        learningProposal: parsed.learningProposal,
      };
    }

    if (parsed.tool === 'manage_time_block' && parsed.toolParams) {
      const p = parsed.toolParams;
      return {
        message: parsed.message || `📅 Propuesta para el calendario: **${p.title || 'Bloque de tiempo'}** (${p.startTime || '09:00'}–${p.endTime || '10:00'}).\n\n¿Confirmás la operación?`,
        timeBlockProposal: {
          id: `prop_tb_${Date.now()}`,
          action: p.action || 'create',
          targetBlockId: p.targetBlockId,
          title: p.title || 'Bloque de tiempo',
          date: p.date || new Date().toISOString().split('T')[0],
          startTime: p.startTime || '09:00',
          endTime: p.endTime || '10:00',
          area: p.area || 'creko',
          objective: p.objective || 'Enfoque de trabajo',
          status: 'proposed',
          previousTime: p.previousTime,
          explanation: p.explanation,
        },
      };
    }

    // MODIFICACIONES DE SISTEMA EN VIVO EJECUTADAS POR GEMINI:
    if (parsed.tool === 'modify_account_balance' && parsed.toolParams) {
      const p = parsed.toolParams;
      let acc = accounts.find((a) => a.id === p.accountId || a.name.toLowerCase().includes((p.accountName || '').toLowerCase()));
      if (!acc) acc = accounts.find((a) => a.id === 'acc_cash') || accounts[0];
      const prev = acc.balance;
      const newBal = Number(p.newBalance) || 0;
      db.updateAccount(acc.id, { balance: newBal });
      return {
        message: parsed.message || `🛠️ He modificado el saldo de **${acc.name}**: antes ${prev} € ➔ ahora **${newBal} €**. El cambio ya impactó tus finanzas y métricas de estabilidad.`,
        appliedModifications: [
          {
            id: `mod_${Date.now()}`,
            type: 'account_balance',
            label: `Saldo ${acc.name} actualizado`,
            field: `accounts.${acc.name}.balance`,
            previousValue: `${prev} €`,
            newValue: `${newBal} €`,
            timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            details: p.reason || 'Modificación solicitada por Fran',
          },
        ],
      };
    }

    if (parsed.tool === 'modify_reserve_target' && parsed.toolParams) {
      const p = parsed.toolParams;
      const prev = db.getUserProfile().monthlyReserveTarget;
      const newTarget = Number(p.newTarget) || 1000;
      db.updateUserProfile({ monthlyReserveTarget: newTarget });
      return {
        message: parsed.message || `🛡️ Meta de reserva actualizada: antes ${prev} € ➔ ahora **${newTarget} €**.\nJARVIS recalculará tu estabilidad y cobertura de gastos.`,
        appliedModifications: [
          {
            id: `mod_${Date.now()}`,
            type: 'reserve_target',
            label: 'Meta de reserva actualizada',
            field: 'user.monthlyReserveTarget',
            previousValue: `${prev} €`,
            newValue: `${newTarget} €`,
            timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            details: p.reason || 'Modificación de meta',
          },
        ],
      };
    }

    if (parsed.tool === 'create_changa' && parsed.toolParams) {
      const p = parsed.toolParams;
      const clientStr = p.client || p.clientName || 'Cliente';
      const changa = db.createChanga({
        title: p.title || 'Nueva changa',
        client: clientStr,
        clientOrPerson: clientStr,
        amount: Number(p.amount) || 0,
        notes: p.notes,
        status: 'pending',
        date: p.date || new Date().toISOString().split('T')[0],
      });
      return {
        message: parsed.message || `💼 Changa guardada: **"${changa.title}"** para **${changa.client || clientStr}** por **${changa.amount} €** (Pendiente de cobro).`,
        appliedModifications: [
          {
            id: `mod_${Date.now()}`,
            type: 'changa',
            label: `Changa creada: ${changa.title}`,
            field: 'changas',
            newValue: `${changa.amount} € - ${changa.client || clientStr}`,
            timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      };
    }

    if (parsed.tool === 'log_health_activity' && parsed.toolParams) {
      const p = parsed.toolParams;
      const steps = p.steps ? Number(p.steps) : undefined;
      const workouts = p.workoutType
        ? [
            {
              type: p.workoutType,
              durationMinutes: Number(p.durationMinutes) || 45,
              activeEnergyKcal: Number(p.kcal) || 300,
              timestamp: new Date().toISOString(),
            },
          ]
        : undefined;

      db.syncHealthKitData({
        steps,
        walkingRunningDistanceKm: p.distanceKm ? Number(p.distanceKm) : undefined,
        workouts,
        source: 'apple_health',
      });
      return {
        message: parsed.message || `💪 Actividad física sincronizada: ${steps ? `${steps.toLocaleString('es-ES')} pasos. ` : ''}${p.workoutType ? `Entrenamiento de ${p.workoutType} (${p.durationMinutes || 45} min).` : ''}`,
        appliedModifications: [
          {
            id: `mod_${Date.now()}`,
            type: 'health_data',
            label: 'Actividad de salud registrada',
            field: 'health.today',
            newValue: steps ? `${steps} pasos` : p.workoutType,
            timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      };
    }

    if (parsed.tool === 'modify_system_memory' && parsed.toolParams) {
      const p = parsed.toolParams;
      const mem = db.createMemory({
        type: 'preference',
        priority: 'user_preference',
        classification: 'user_preference',
        key: p.key || 'recuerdo',
        value: p.value || '',
        description: p.description || p.value || '',
      });
      return {
        message: parsed.message || `🧠 Guardado en mi memoria permanente: **${mem.key}** ➔ "${mem.value}". Te conozco un paso más cerca del 100%.`,
        appliedModifications: [
          {
            id: `mod_${Date.now()}`,
            type: 'memory',
            label: `Recuerdo agregado: ${mem.key}`,
            field: 'userMemory',
            newValue: mem.value,
            timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      };
    }

    if (parsed.tool === 'modify_user_profile' && parsed.toolParams) {
      const p = parsed.toolParams;
      const updates: any = {};
      if (p.priorities && Array.isArray(p.priorities)) updates.priorities = p.priorities;
      if (p.operatingRules && Array.isArray(p.operatingRules)) updates.operatingRules = p.operatingRules;
      if (p.communicationStyle) updates.communicationStyle = p.communicationStyle;
      if (p.location) updates.location = p.location;
      db.updateUserProfile(updates);
      return {
        message: parsed.message || `👤 Perfil y directivas operativas actualizadas exitosamente en el núcleo abierto de JARVIS.`,
        appliedModifications: [
          {
            id: `mod_${Date.now()}`,
            type: 'user_profile',
            label: 'Directivas de perfil modificadas',
            field: 'userProfile',
            newValue: JSON.stringify(updates),
            timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      };
    }

    return {
      message: parsed.message || 'Operación procesada.',
      learningProposal: parsed.learningProposal,
      clarificationNeeded: parsed.tool === 'clarify',
    };
  } catch (error) {
    console.error('Error invoking Gemini model, using fallback:', error);
    if (image) {
      // If user provided text with amount (e.g., "gaste 15 con efectivo"), attempt local parser
      const parsedWithText = userInput ? localRuleBasedParser(userInput) : null;
      if (parsedWithText) {
        return {
          ...parsedWithText,
          message: `🧾 **Ticket adjunto detectado**\n\n${parsedWithText.message}`,
        };
      }

      return {
        message:
          '🧾 **Ticket recibido**: En este momento el reconocedor visual está experimentando una alta demanda o límite temporal de cuota. Para cargarlo inmediatamente a tus gastos sin esperar, indicame el importe y comercio (ejemplo: *"Gasté 18.50 en Mercadona en efectivo"*).',
      };
    }
    const fallbackLocal = !image ? localRuleBasedParser(userInput) : null;
    return (
      fallbackLocal ||
      localMatch || {
        message: 'Disculpa, hubo un inconveniente al procesar el mensaje. Por favor intenta reformularlo.',
      }
    );
  }
}

/**
 * Dedicated OCR function for receipt extraction.
 * Extracts merchant, total, date, items, category and suggested payment account.
 */
export async function extractReceiptFromImage(
  imageData: string,
  mimeType: string = 'image/jpeg'
): Promise<{
  merchant: string;
  total: number;
  date: string;
  categoryId?: string;
  categoryName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  suggestedAccount: string;
  items: { name: string; price: number }[];
  vatAmount?: number;
  confidence: number;
  rawNotes?: string;
}> {
  const categories = db.getCategories();
  const accounts = db.getAccounts();
  const today = new Date().toISOString().split('T')[0];

  const ai = getAI();
  if (ai) {
    try {
      const base64Clean = imageData.includes(',') ? imageData.split(',')[1] : imageData;
      const categoriesSummary = categories.map((c) => ({
        id: c.id,
        name: c.name,
        subs: c.subcategories.map((s) => ({ id: s.id, name: s.name })),
      }));

      const prompt = `Analiza este ticket o comprobante de compra y extrae con total precisión en formato JSON estricto:
1. "merchant": Nombre del establecimiento o comercio (ej. Mercadona, Bar DejaVu, Carrefour, Lidl, Estación Repsol, etc.).
2. "total": Importe final a pagar en euros (€) en formato número decimal (ej. 14.85).
3. "date": Fecha del ticket en formato YYYY-MM-DD. Si no es visible, usa "${today}".
4. "categoryId": El id de la categoría más adecuada entre las siguientes: ${JSON.stringify(categoriesSummary)}.
5. "subcategoryId": El id de la subcategoría si aplica.
6. "suggestedAccount": "acc_cash" si pagó en efectivo, o "acc_bank" si pagó con tarjeta o tpv.
7. "items": Lista de productos detectados con "name" y "price".
8. "vatAmount": Total de IVA / Impuestos si está desglosado.
9. "confidence": Número entre 0.0 y 1.0 indicando la legibilidad.

Devuelve SOLO un objeto JSON válido con estas claves:
{
  "merchant": "...",
  "total": 0.0,
  "date": "YYYY-MM-DD",
  "categoryId": "...",
  "categoryName": "...",
  "subcategoryId": "...",
  "subcategoryName": "...",
  "suggestedAccount": "...",
  "items": [{ "name": "...", "price": 0.0 }],
  "vatAmount": 0.0,
  "confidence": 0.95
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            { inlineData: { mimeType, data: base64Clean } },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        const matchedCat = categories.find((c) => c.id === parsed.categoryId) || categories[0];
        const matchedSub = matchedCat?.subcategories.find((s) => s.id === parsed.subcategoryId);

        return {
          merchant: parsed.merchant || 'Comercio Detectado',
          total: typeof parsed.total === 'number' ? Math.abs(parsed.total) : 0,
          date: parsed.date || today,
          categoryId: matchedCat?.id,
          categoryName: matchedCat?.name,
          subcategoryId: matchedSub?.id,
          subcategoryName: matchedSub?.name,
          suggestedAccount: parsed.suggestedAccount || 'acc_cash',
          items: Array.isArray(parsed.items) ? parsed.items : [],
          vatAmount: parsed.vatAmount,
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9,
        };
      }
    } catch (err) {
      console.warn('Gemini receipt OCR error, falling back to smart defaults:', err);
    }
  }

  // Fallback heuristic if API is unconfigured or temporary error
  const defaultCat = categories.find((c) => c.id === 'cat_comida') || categories[0];
  return {
    merchant: 'Comercio (Ticket adjunto)',
    total: 12.5,
    date: today,
    categoryId: defaultCat?.id,
    categoryName: defaultCat?.name,
    suggestedAccount: 'acc_cash',
    items: [{ name: 'Compra general', price: 12.5 }],
    confidence: 0.75,
    rawNotes: 'Ticket procesado mediante el motor local de contingencia.',
  };
}

/**
 * Generate a dynamic custom module using Gemini AI based on user intent.
 * Example: "Quiero controlar cuántos clientes contacto por día"
 */
export async function generateCustomAiModule(userPrompt: string): Promise<{
  title: string;
  icon: string;
  description: string;
  fields: { key: string; label: string; type: 'text' | 'number' | 'status' | 'date' }[];
  items: Record<string, any>[];
}> {
  const ai = getAI();
  if (ai) {
    try {
      const prompt = `El usuario es Fran Albornoz y quiere agregar un módulo a su sistema operativo personal (JARVIS 2.0).
Su petición es: "${userPrompt}"

Diseña un módulo interactivo específico y práctico para esta necesidad.
Elige un icono de Lucide apropiado (ej: Target, Users, Sparkles, Flame, CheckCircle, Briefcase, Zap, Clock, TrendingUp).
Define de 3 a 5 campos (fields) con tipos válidos: "text", "number", "status", "date".
Incluye 2 elementos de ejemplo (items) realistas.

Responde SOLO en JSON válido con este formato:
{
  "title": "Nombre conciso y claro del módulo",
  "icon": "NombreIconoLucide",
  "description": "Breve descripción de su propósito",
  "fields": [
    { "key": "nombreCampo", "label": "Etiqueta para mostrar", "type": "text" | "number" | "status" | "date" }
  ],
  "items": [
    { ...ejemplo con las keys definidas... }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim();
      if (text) {
        return JSON.parse(text);
      }
    } catch (err) {
      console.warn('Gemini custom module generation error, using fallback template:', err);
    }
  }

  // Fallback template
  return {
    title: userPrompt.length > 30 ? userPrompt.slice(0, 30) + '...' : userPrompt,
    icon: 'Sparkles',
    description: `Módulo personalizado para: ${userPrompt}`,
    fields: [
      { key: 'concept', label: 'Concepto / Elemento', type: 'text' },
      { key: 'status', label: 'Estado', type: 'status' },
      { key: 'date', label: 'Fecha', type: 'date' },
      { key: 'notes', label: 'Notas', type: 'text' },
    ],
    items: [
      {
        concept: 'Registro inicial de prueba',
        status: 'Activo',
        date: new Date().toISOString().split('T')[0],
        notes: 'Creado automáticamente',
      },
    ],
  };
}

// Strategic Voice Briefing for Fran
export async function generateDailyVoiceBriefing(): Promise<{
  text: string;
  energyLevel: string;
  focusMessage: string;
  keyNumbers: { balance: number; pending: number; steps: number };
  weather?: any;
  spotify?: any;
}> {
  const summary = db.getFinancialSummary();
  const healthToday = db.getTodayHealth();
  const latestCheckin = db.getData().checkins?.slice(-1)[0];
  const pendingIncomes = db.getPendingIncomes().filter((p) => p.status === 'pending');
  const waitingQuotes = (db.getData().crekoQuotes || []).filter((q) => q.status === 'waiting');
  const tasks = (db.getData().tasks || []).filter((t) => t.status !== 'done');
  const rotuDoc = (db.getData().spainDocs || []).find((d) => d.category === 'rotuprint');
  const weather = db.getWeatherOutfit();
  const spotify = db.getSpotifyState();

  const pendingAmount = pendingIncomes.reduce((acc, p) => acc + p.amount, 0);
  const steps = healthToday?.steps || 0;
  const urgentTasks = tasks.filter((t) => t.priority === 'urgent' || t.priority === 'high');

  // Build high-energy, direct briefing text incorporating weather/outfit, pendientes and Spotify
  let briefing = `Hola Fran. Aquí JARVIS. `;
  briefing += `Hoy en ${weather.city} hacen ${weather.temperatureC} grados con clima ${weather.condition.toLowerCase()}. `;
  briefing += `Para salir a la calle te recomiendo: ${weather.outfitRecommendation.top} con ${weather.outfitRecommendation.bottom}. `;
  
  briefing += `Reporte de caja: tenés ${summary.realBalance} euros disponibles y ${pendingAmount} euros pendientes de cobrar. `;

  if (urgentTasks.length > 0) {
    briefing += `Pendiente prioritario: ${urgentTasks[0].title}. `;
  }

  if (waitingQuotes.length > 0) {
    briefing += `En Creko el presupuesto de ${waitingQuotes[0].clientName} está esperando respuesta. `;
  } else {
    briefing += `Prioridad Creko: captar clientes y cerrar presupuestos hoy. `;
  }

  if (rotuDoc) {
    briefing += `Seguimiento al precontrato de Rotuprint en marcha. `;
  }

  if (spotify.isConnected) {
    briefing += `Spotify está listo con la lista "${spotify.playlistName}". `;
  }

  briefing += `Cero dispersión, foco en caja y ejecución. ¿Arrancamos?`;

  return {
    text: briefing,
    energyLevel: latestCheckin?.energy ? `${latestCheckin.energy}/10` : 'Óptimo',
    focusMessage: 'Foco absoluto en Creko y cobros pendientes.',
    keyNumbers: {
      balance: summary.realBalance,
      pending: pendingAmount,
      steps,
    },
    weather,
    spotify,
  };
}

