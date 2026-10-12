import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Mic,
  MicOff,
  RotateCcw,
  CheckCircle2,
  Brain,
  Trash2,
  HelpCircle,
  TrendingDown,
  ArrowDownLeft,
  Camera,
  Receipt,
  UploadCloud,
  X,
  Eye,
  Check,
  Edit3,
  Calendar,
  CreditCard,
  FolderKanban,
  StickyNote,
  CheckSquare,
  Pin,
  ArrowRight,
  Volume2,
  VolumeX,
  Radio,
  Clock,
  Zap,
  Code,
} from 'lucide-react';
import { ChatMessage, TransactionProposal, Account, Category, Project, PostItProposal, TaskProposal, TimeBlockProposal } from '../types';
import { api } from '../services/api';
import { jarvisVoice } from '../utils/jarvisVoice';
import { JarvisVoiceModal } from './JarvisVoiceModal';
import { FranMemoryModal } from './FranMemoryModal';
import { JarvisOpenSourceModal } from './JarvisOpenSourceModal';

interface ChatViewProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  accounts?: Account[];
  categories?: Category[];
  projects?: Project[];
  onRefreshData: () => void;
}

// Helper to optimize and compress receipt images before transmission
async function processImageFile(
  file: File
): Promise<{ data: string; mimeType: string; name: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX_DIM = 1600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            data: reader.result as string,
            mimeType: file.type || 'image/jpeg',
            name: file.name,
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve({
          data: dataUrl,
          mimeType: 'image/jpeg',
          name: file.name,
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  setMessages,
  accounts = [],
  categories = [],
  projects = [],
  onRefreshData,
}) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(jarvisVoice.isVoiceEnabled());
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{
    data: string;
    mimeType: string;
    name?: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // JARVIS Voice, Memory & Open Source Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [isOpenSourceModalOpen, setIsOpenSourceModalOpen] = useState(false);

  // Editing state for interactive transaction proposals
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    type: 'expense' | 'income';
    amount: number;
    description: string;
    categoryId: string;
    subcategoryId: string;
    paymentMethodId: string;
    projectId: string;
    date: string;
  }>({
    type: 'expense',
    amount: 0,
    description: '',
    categoryId: '',
    subcategoryId: '',
    paymentMethodId: '',
    projectId: '',
    date: new Date().toISOString().split('T')[0],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check speech recognition support and subscribe to voice engine
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      setSpeechSupported(hasSpeech);
    }

    const unsubscribe = jarvisVoice.subscribe((speaking) => {
      setIsSpeaking(speaking);
      if (!speaking) {
        setSpeakingMessageId(null);
      }
    });

    return () => {
      unsubscribe();
      jarvisVoice.stop();
    };
  }, []);

  const toggleVoiceOutput = () => {
    const nextState = !voiceEnabled;
    setVoiceEnabled(nextState);
    jarvisVoice.setVoiceEnabled(nextState);
    if (!nextState) {
      jarvisVoice.stop();
      setSpeakingMessageId(null);
    }
  };

  const speakMessage = (id: string, text: string) => {
    if (speakingMessageId === id && isSpeaking) {
      jarvisVoice.stop();
      setSpeakingMessageId(null);
      return;
    }
    setSpeakingMessageId(id);
    jarvisVoice.speak(text, () => {
      setSpeakingMessageId(null);
    });
  };

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        try {
          const processed = await processImageFile(file);
          setSelectedImage(processed);
        } catch (err) {
          console.error('Error processing image:', err);
        }
      }
    }
    if (e.target) e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        try {
          const processed = await processImageFile(file);
          setSelectedImage(processed);
        } catch (err) {
          console.error('Error processing dropped image:', err);
        }
      }
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    if (e.clipboardData && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        try {
          const processed = await processImageFile(file);
          setSelectedImage(processed);
        } catch (err) {
          console.error('Error processing pasted image:', err);
        }
      }
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if ((!query && !selectedImage) || loading) return;

    const imgToSend = selectedImage;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query || (imgToSend ? '🧾 [Foto de ticket enviada para registrar gasto]' : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: imgToSend || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);
    setLoading(true);

    try {
      const response = await api.sendChatMessage(query, imgToSend || undefined);

      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        proposal: response.proposal,
        postItProposal: response.postItProposal,
        taskProposal: response.taskProposal,
        timeBlockProposal: response.timeBlockProposal,
        actionDetails: response.actionDetails,
        learningProposal: response.learningProposal,
        appliedModifications: response.appliedModifications,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically speak out loud if voice is enabled (making JARVIS live and talk)
      if (jarvisVoice.isVoiceEnabled() && response.message) {
        setSpeakingMessageId(assistantMsg.id);
        jarvisVoice.speak(response.message, () => {
          setSpeakingMessageId(null);
        });
      }

      // If an operation was executed (correction, modification, undo, etc.), refresh system data
      if (
        response.actionDetails ||
        response.appliedModifications ||
        response.message.includes('revertida') ||
        response.message.includes('Tablero') ||
        response.message.includes('Tareas')
      ) {
        onRefreshData();
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: 'Ocurrió un error al procesar el mensaje. Por favor intenta de nuevo.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmProposal = async (msgId: string, proposal: TransactionProposal) => {
    setLoading(true);
    try {
      if (proposal.pendingIncomeId) {
        const res = await api.markIncomeReceived(proposal.pendingIncomeId, proposal.paymentMethodId);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? {
                  ...m,
                  proposal: {
                    ...m.proposal!,
                    status: 'confirmed',
                    transactionId: res.transaction.id,
                  },
                }
              : m
          )
        );
      } else {
        const { transaction } = await api.createTransaction({
          type: proposal.type,
          amount: proposal.amount,
          currency: proposal.currency || 'EUR',
          description: proposal.description,
          categoryId: proposal.categoryId,
          subcategoryId: proposal.subcategoryId,
          paymentMethodId: proposal.paymentMethodId,
          projectId: proposal.projectId,
          date: proposal.date,
          status: 'confirmed',
          source: proposal.source,
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? {
                  ...m,
                  proposal: {
                    ...m.proposal!,
                    status: 'confirmed',
                    transactionId: transaction.id,
                  },
                }
              : m
          )
        );
      }

      onRefreshData();
    } catch (err) {
      console.error('Error confirming proposal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelProposal = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              proposal: {
                ...m.proposal!,
                status: 'cancelled',
              },
            }
          : m
      )
    );
  };

  const handleStartEdit = (msgId: string, proposal: TransactionProposal) => {
    setEditingProposalId(msgId);
    setEditFormData({
      type: proposal.type,
      amount: proposal.amount,
      description: proposal.description,
      categoryId: proposal.categoryId || (categories?.[0]?.id ?? ''),
      subcategoryId: proposal.subcategoryId || '',
      paymentMethodId: proposal.paymentMethodId || (accounts?.[0]?.id ?? 'acc_cash'),
      projectId: proposal.projectId || '',
      date: proposal.date || new Date().toISOString().split('T')[0],
    });
  };

  const handleSaveEdit = async (msgId: string) => {
    setLoading(true);
    try {
      const targetCat = categories?.find((c) => c.id === editFormData.categoryId);
      const targetSub = targetCat?.subcategories.find((s) => s.id === editFormData.subcategoryId);
      const targetAcc = accounts?.find((a) => a.id === editFormData.paymentMethodId);
      const targetProj = projects?.find((p) => p.id === editFormData.projectId);

      const { transaction } = await api.createTransaction({
        type: editFormData.type,
        amount: Number(editFormData.amount) || 0,
        currency: 'EUR',
        description: editFormData.description || 'Movimiento registrado',
        categoryId: editFormData.categoryId || undefined,
        subcategoryId: editFormData.subcategoryId || undefined,
        paymentMethodId: editFormData.paymentMethodId,
        projectId: editFormData.projectId || undefined,
        date: editFormData.date,
        status: 'confirmed',
        source: 'chat',
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                proposal: {
                  ...m.proposal!,
                  type: editFormData.type,
                  amount: Number(editFormData.amount) || 0,
                  description: editFormData.description,
                  categoryId: targetCat?.id,
                  categoryName: targetCat?.name,
                  subcategoryId: targetSub?.id,
                  subcategoryName: targetSub?.name,
                  paymentMethodId: targetAcc?.id || editFormData.paymentMethodId,
                  paymentMethodName: targetAcc?.name || 'Cuenta',
                  projectId: targetProj?.id,
                  projectName: targetProj?.name,
                  date: editFormData.date,
                  status: 'confirmed',
                  transactionId: transaction.id,
                },
              }
            : m
        )
      );

      setEditingProposalId(null);
      onRefreshData();
    } catch (err) {
      console.error('Error saving edited proposal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    setLoading(true);
    try {
      const res = await api.undo();
      if (res.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `undo_${Date.now()}`,
            role: 'assistant',
            content: `↩️ **Deshecho**: ${res.description || 'Operación revertida con éxito.'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        onRefreshData();
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `undo_${Date.now()}`,
            role: 'assistant',
            content: `ℹ️ ${res.description}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPostIt = async (msgId: string, postIt: PostItProposal) => {
    setLoading(true);
    try {
      await api.createPostIt({
        title: postIt.title,
        description: postIt.description,
        colorPriority: postIt.colorPriority || 'yellow',
        projectId: postIt.projectId,
        moneyAmount: postIt.moneyAmount,
        date: postIt.date || new Date().toISOString().split('T')[0],
        status: 'active',
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.postItProposal
            ? {
                ...m,
                postItProposal: {
                  ...m.postItProposal,
                  status: 'confirmed',
                },
              }
            : m
        )
      );
      onRefreshData();
    } catch (err) {
      console.error('Error confirming post-it:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPostIt = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.postItProposal
          ? {
              ...m,
              postItProposal: {
                ...m.postItProposal,
                status: 'cancelled',
              },
            }
          : m
      )
    );
  };

  const handleConfirmTask = async (msgId: string, task: TaskProposal) => {
    setLoading(true);
    try {
      await api.createTask({
        title: task.title,
        priority: task.priority || 'medium',
        projectId: task.projectId,
        dueDate: task.dueDate || new Date().toISOString().split('T')[0],
        status: 'todo',
        financialImpact: task.financialImpact,
      });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.taskProposal
            ? {
                ...m,
                taskProposal: {
                  ...m.taskProposal,
                  status: 'confirmed',
                },
              }
            : m
        )
      );
      onRefreshData();
    } catch (err) {
      console.error('Error confirming task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTask = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.taskProposal
          ? {
              ...m,
              taskProposal: {
                ...m.taskProposal,
                status: 'cancelled',
              },
            }
          : m
      )
    );
  };

  const handleConfirmTimeBlock = async (msgId: string, proposal: TimeBlockProposal) => {
    setLoading(true);
    try {
      if (proposal.action === 'create') {
        await api.createTimeBlock({
          date: proposal.date,
          startTime: proposal.startTime,
          endTime: proposal.endTime,
          area: proposal.area,
          title: proposal.title,
          objective: proposal.objective || 'Enfoque de trabajo',
          status: 'pending',
        });
      } else if (proposal.action === 'move' || proposal.action === 'modify') {
        if (proposal.targetBlockId) {
          await api.updateTimeBlock(proposal.targetBlockId, {
            date: proposal.date,
            startTime: proposal.startTime,
            endTime: proposal.endTime,
            area: proposal.area,
            title: proposal.title,
            objective: proposal.objective,
          });
        }
      } else if (proposal.action === 'complete') {
        if (proposal.targetBlockId) {
          await api.updateTimeBlockStatus(
            proposal.targetBlockId,
            'completed',
            proposal.explanation || 'Completado desde el chat con JARVIS'
          );
        }
      } else if (proposal.action === 'delete') {
        if (proposal.targetBlockId) {
          await api.deleteTimeBlock(proposal.targetBlockId);
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.timeBlockProposal
            ? {
                ...m,
                timeBlockProposal: {
                  ...m.timeBlockProposal,
                  status: 'confirmed',
                },
              }
            : m
        )
      );

      onRefreshData();
    } catch (err) {
      console.error('Error confirming time block proposal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTimeBlock = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.timeBlockProposal
          ? {
              ...m,
              timeBlockProposal: {
                ...m.timeBlockProposal,
                status: 'cancelled',
              },
            }
          : m
      )
    );
  };

  const handleAcceptRule = async (proposal: NonNullable<ChatMessage['learningProposal']>) => {
    try {
      await api.createMemory({
        type: proposal.ruleType,
        priority: 'learned_rule',
        key: proposal.key,
        value: proposal.value,
        targetData: proposal.targetData,
        description: `Regla aprendida desde el chat para "${proposal.key}"`,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `mem_saved_${Date.now()}`,
          role: 'assistant',
          content: `🧠 **Regla guardada en Mi Cerebro**: Ahora cuando digas "${proposal.key}", se asociará automáticamente a **${proposal.value}**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      onRefreshData();
    } catch (err) {
      console.error('Error saving rule:', err);
    }
  };

  // Voice dictation
  const toggleListening = () => {
    if (!speechSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    recognition.start();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPaste={handlePaste}
      className="relative flex flex-col h-[calc(100vh-130px)] sm:h-[calc(100vh-150px)] max-w-3xl mx-auto bg-[#1E293B] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden mb-20"
    >
      {/* Hidden file input for ticket photos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
        id="input-ticket-file"
      />

      {/* Drag & Drop Visual Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-40 bg-slate-900/90 backdrop-blur-xs border-2 border-dashed border-blue-400 rounded-3xl flex flex-col items-center justify-center text-white pointer-events-none space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-400 text-blue-300 flex items-center justify-center animate-bounce">
            <UploadCloud className="w-8 h-8" />
          </div>
          <p className="text-sm sm:text-base font-bold text-white">Soltá la foto de tu ticket aquí</p>
          <p className="text-xs text-blue-300">
            El asistente extraerá el importe, comercio y lo sumará a tus gastos
          </p>
        </div>
      )}

      {/* Header HUD: JARVIS 2.0 Core */}
      <div className="p-3 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            <Radio className={`w-4 h-4 ${isSpeaking ? 'animate-pulse text-cyan-200' : ''}`} />
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5 font-mono">
                JARVIS OS
                <span className="text-[10px] text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 font-sans font-semibold">
                  IA & VOZ EN VIVO
                </span>
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Socio Estratégico de Fran</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-medium">Modificaciones abiertas</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Voice Hub, 100% Memory, Open Source & Audio Toggle */}
        <div className="flex items-center flex-wrap gap-1.5">
          {/* Hands-Free Voice Assistant Modal Trigger */}
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all active:scale-95"
            title="Abrir Asistente de Voz Manos Libres con Arc Reactor"
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Hablar con Jarvis</span>
          </button>

          {/* 100% Memory Drawer */}
          <button
            onClick={() => setIsMemoryModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-500/40 flex items-center gap-1.5 transition-all"
            title="Ver y editar todo lo que JARVIS sabe sobre vos"
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Memoria 100%</span>
          </button>

          {/* Open-Source Dev Studio */}
          <button
            onClick={() => setIsOpenSourceModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-all"
            title="Ver código abierto, prompt y base de datos"
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Código Abierto</span>
          </button>

          {/* JARVIS Live Voice Output Toggle */}
          <button
            onClick={toggleVoiceOutput}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              voiceEnabled
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title={voiceEnabled ? 'Voz activada (JARVIS habla respuestas)' : 'Voz silenciada'}
            id="btn-toggle-jarvis-voice"
          >
            {voiceEnabled ? (
              <>
                <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-emerald-400 animate-pulse' : 'text-blue-400'}`} />
                <span className="hidden xl:inline text-[11px]">{isSpeaking ? 'Hablando...' : 'Auto-Voz'}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden xl:inline text-[11px]">Silencio</span>
              </>
            )}
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg text-xs transition-colors"
            title="Subir foto de ticket"
            id="btn-header-upload-ticket"
          >
            <Camera className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMessages([])}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg text-xs transition-colors"
            title="Limpiar conversación"
            id="btn-clear-chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-blue-400 flex items-center justify-center shadow-md">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">
                El corazón de tu control financiero
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Escribí, hablá o subí la foto de un ticket de compra. El asistente interpretará los datos y actualizará tus cuentas.
              </p>
            </div>

            {/* Quick action chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md pt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl border border-blue-500/50 hover:border-blue-400 bg-blue-950/40 hover:bg-blue-900/50 text-left transition-all group col-span-1 sm:col-span-2 flex items-center gap-3"
                id="btn-quick-upload-ticket"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    🧾 Escanear Foto de Ticket
                  </span>
                  <span className="block text-xs text-slate-200 font-medium group-hover:text-white mt-0.5">
                    Subí un ticket o factura: extrae importe, negocio y lo suma a gastos
                  </span>
                </div>
              </button>

              {[
                {
                  label: 'Gasto cotidiano',
                  query: 'Gasté 12 euros en comida y pagué en efectivo',
                },
                {
                  label: 'Cobro de pendiente',
                  query: 'Cobré los 180 del electricista',
                },
                {
                  label: 'Consulta de Decisión',
                  query: '¿Puedo gastar 60 € en CTC?',
                },
                {
                  label: 'Diagnóstico de Estabilidad',
                  query: '¿Cómo está mi estabilidad?',
                },
                {
                  label: 'Cobro de Oficio / Variable',
                  query: 'Cobré 180 € por trabajo de electricidad en efectivo',
                },
                {
                  label: 'Gasto con tarjeta',
                  query: 'Gasté 35 € en nafta con la Naranja',
                },
                {
                  label: 'Segregación de Capital',
                  query: '¿Cuánto dinero tengo disponible para vivir este mes?',
                },
                {
                  label: 'Saldo de cuenta',
                  query: '¿Cuánto tengo en efectivo?',
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.query)}
                  className="p-2.5 rounded-xl border border-slate-700/80 hover:border-slate-600 bg-slate-900/60 hover:bg-slate-900 text-left transition-all group"
                >
                  <span className="block text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
                    {item.label}
                  </span>
                  <span className="block text-xs text-slate-300 font-medium group-hover:text-white mt-0.5">
                    "{item.query}"
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10'
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/70'
                }`}
              >
                {/* Attached Ticket Image in User message */}
                {msg.image && (
                  <div className="mb-2.5">
                    <div
                      onClick={() => setViewingImage(msg.image?.data || null)}
                      className="relative group overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/60 max-w-[220px] sm:max-w-[260px] cursor-pointer shadow-md"
                    >
                      <img
                        src={msg.image.data}
                        alt={msg.image.name || 'Ticket adjunto'}
                        className="w-full max-h-56 object-contain transition-transform duration-200 group-hover:scale-105 bg-black/30"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[11px] bg-slate-950/80 text-white px-2.5 py-1 rounded-md flex items-center gap-1 font-semibold backdrop-blur-xs">
                          <Eye className="w-3.5 h-3.5" /> Ver en grande
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] text-blue-200/90 mt-1 flex items-center gap-1">
                      <Receipt className="w-3 h-3 text-blue-300" />
                      <span className="truncate max-w-[200px]">{msg.image.name || 'Ticket adjuntado'}</span>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="whitespace-pre-wrap leading-relaxed font-sans">{msg.content}</div>

                {/* Assistant Voice Control & Time Footer */}
                {!isUser && (
                  <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                    <button
                      onClick={() => speakMessage(msg.id, msg.content)}
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                        speakingMessageId === msg.id && isSpeaking
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs animate-pulse'
                          : 'bg-slate-700/40 hover:bg-slate-700 text-slate-300 hover:text-white'
                      }`}
                      title={speakingMessageId === msg.id && isSpeaking ? 'Pausar voz' : 'Escuchar mensaje con la voz de JARVIS'}
                      id={`btn-speak-msg-${msg.id}`}
                    >
                      {speakingMessageId === msg.id && isSpeaking ? (
                        <>
                          <Volume2 className="w-3 h-3 text-emerald-400" />
                          <span>Hablando...</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-blue-400" />
                          <span>Escuchar</span>
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  </div>
                )}

                {/* Interactive Transaction Proposal Card */}
                {msg.proposal && (
                  <div className="mt-3 pt-3 border-t border-slate-700/80">
                    {/* Status: Proposed (Pending user confirmation) */}
                    {msg.proposal.status === 'proposed' && (
                      <div className="bg-slate-900/90 rounded-2xl p-3.5 sm:p-4 border border-amber-500/40 shadow-xl space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                              msg.proposal.type === 'expense'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {msg.proposal.type === 'expense' ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : (
                              <ArrowDownLeft className="w-3 h-3" />
                            )}
                            {msg.proposal.type === 'expense' ? 'Gasto propuesto' : 'Ingreso propuesto'}
                          </span>
                          <span className="text-[11px] font-medium text-amber-400/90 flex items-center gap-1">
                            ⚠️ Esperando tu confirmación
                          </span>
                        </div>

                        {/* Amount & Description */}
                        <div className="flex items-baseline justify-between gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-white truncate">
                              {msg.proposal.description}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 truncate">
                              {msg.proposal.categoryName || 'General'}
                              {msg.proposal.subcategoryName ? ` ➔ ${msg.proposal.subcategoryName}` : ''}
                            </div>
                          </div>
                          <div
                            className={`text-xl sm:text-2xl font-black shrink-0 ${
                              msg.proposal.type === 'expense' ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {msg.proposal.type === 'expense' ? '-' : '+'}
                            {msg.proposal.amount.toFixed(2)} €
                          </div>
                        </div>

                        {/* Metadata grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 flex items-center gap-1.5 text-slate-300">
                            <CreditCard className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="truncate">
                              {msg.proposal.paymentMethodName || 'Efectivo'}
                            </span>
                          </div>
                          <div className="bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 flex items-center gap-1.5 text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{msg.proposal.date || new Date().toISOString().split('T')[0]}</span>
                          </div>
                          {msg.proposal.projectName && (
                            <div className="col-span-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 flex items-center gap-1.5 text-slate-300">
                              <FolderKanban className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <span className="truncate">
                                Proyecto: <strong>{msg.proposal.projectName}</strong>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons or Edit form */}
                        {editingProposalId === msg.id ? (
                          /* Inline Edit Form */
                          <div className="pt-2 border-t border-slate-800 space-y-3">
                            <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                              <Edit3 className="w-3.5 h-3.5" /> Modificar datos antes de confirmar:
                            </div>
                            <div className="space-y-2">
                              <div>
                                <label className="text-[10px] text-slate-400 uppercase font-bold">
                                  Concepto / Comercio
                                </label>
                                <input
                                  type="text"
                                  value={editFormData.description}
                                  onChange={(e) =>
                                    setEditFormData({ ...editFormData, description: e.target.value })
                                  }
                                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-blue-500"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase font-bold">
                                    Importe (€)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={editFormData.amount}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        amount: parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase font-bold">
                                    Fecha
                                  </label>
                                  <input
                                    type="date"
                                    value={editFormData.date}
                                    onChange={(e) =>
                                      setEditFormData({ ...editFormData, date: e.target.value })
                                    }
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-blue-500"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase font-bold">
                                    Categoría
                                  </label>
                                  <select
                                    value={editFormData.categoryId}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        categoryId: e.target.value,
                                        subcategoryId: '',
                                      })
                                    }
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-blue-500"
                                  >
                                    {categories?.map((c) => (
                                      <option key={c.id} value={c.id}>
                                        {c.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase font-bold">
                                    Subcategoría
                                  </label>
                                  <select
                                    value={editFormData.subcategoryId}
                                    onChange={(e) =>
                                      setEditFormData({ ...editFormData, subcategoryId: e.target.value })
                                    }
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-blue-500"
                                  >
                                    <option value="">(Ninguna)</option>
                                    {categories
                                      ?.find((c) => c.id === editFormData.categoryId)
                                      ?.subcategories.map((s) => (
                                        <option key={s.id} value={s.id}>
                                          {s.name}
                                        </option>
                                      ))}
                                  </select>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase font-bold">
                                    Medio de pago
                                  </label>
                                  <select
                                    value={editFormData.paymentMethodId}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        paymentMethodId: e.target.value,
                                      })
                                    }
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-blue-500"
                                  >
                                    {accounts?.map((a) => (
                                      <option key={a.id} value={a.id}>
                                        {a.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase font-bold">
                                    Proyecto
                                  </label>
                                  <select
                                    value={editFormData.projectId}
                                    onChange={(e) =>
                                      setEditFormData({ ...editFormData, projectId: e.target.value })
                                    }
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-blue-500"
                                  >
                                    <option value="">(Ninguno)</option>
                                    {projects?.map((p) => (
                                      <option key={p.id} value={p.id}>
                                        {p.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => setEditingProposalId(null)}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                              >
                                Volver
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(msg.id)}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" /> Guardar con estos cambios
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* 3 Interactive Buttons */
                          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => handleConfirmProposal(msg.id, msg.proposal!)}
                              disabled={loading}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
                              id={`btn-confirm-proposal-${msg.id}`}
                            >
                              <Check className="w-4 h-4" />
                              Confirmar y Guardar
                            </button>
                            <button
                              onClick={() => handleStartEdit(msg.id, msg.proposal!)}
                              disabled={loading}
                              className="inline-flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs py-2 px-3 rounded-xl border border-slate-700 transition-all cursor-pointer"
                              id={`btn-edit-proposal-${msg.id}`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Modificar
                            </button>
                            <button
                              onClick={() => handleCancelProposal(msg.id)}
                              disabled={loading}
                              className="inline-flex items-center justify-center gap-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 font-semibold text-xs py-2 px-2.5 rounded-xl transition-all cursor-pointer"
                              id={`btn-cancel-proposal-${msg.id}`}
                            >
                              <X className="w-3.5 h-3.5" />
                              Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status: Confirmed */}
                    {msg.proposal.status === 'confirmed' && (
                      <div className="bg-emerald-950/40 border border-emerald-600/40 rounded-2xl p-3 text-xs text-slate-200 flex items-center justify-between gap-2 shadow-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <span className="font-bold text-emerald-300">Movimiento confirmado:</span>
                            <span className="ml-1.5 text-slate-300">
                              {msg.proposal.type === 'expense' ? '-' : '+'}
                              {msg.proposal.amount.toFixed(2)} € · {msg.proposal.description} ·{' '}
                              {msg.proposal.paymentMethodName}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={handleUndo}
                          disabled={loading}
                          className="inline-flex items-center gap-1 bg-slate-900/90 hover:bg-slate-900 text-blue-400 hover:text-blue-300 border border-slate-700 px-2 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          DESHACER
                        </button>
                      </div>
                    )}

                    {/* Status: Cancelled */}
                    {msg.proposal.status === 'cancelled' && (
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-400 flex items-center gap-2">
                        <X className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Movimiento cancelado. No se modificó ningún saldo ni cuenta.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Interactive Post-It Proposal Card */}
                {msg.postItProposal && (
                  <div className="mt-3 pt-3 border-t border-slate-700/80">
                    {msg.postItProposal.status === 'proposed' && (
                      <div className="bg-slate-900/90 rounded-2xl p-3.5 sm:p-4 border border-yellow-500/40 shadow-xl space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                            <StickyNote className="w-3 h-3" />
                            Propuesta de Post-It
                          </span>
                          <span className="text-[11px] font-medium text-amber-400/90 flex items-center gap-1">
                            ⚠️ Esperando tu confirmación
                          </span>
                        </div>

                        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-white flex items-center gap-1.5">
                              {msg.postItProposal.colorPriority === 'red' && '🔴'}
                              {msg.postItProposal.colorPriority === 'orange' && '🟠'}
                              {msg.postItProposal.colorPriority === 'yellow' && '🟡'}
                              {msg.postItProposal.colorPriority === 'green' && '🟢'}
                              {msg.postItProposal.colorPriority === 'blue' && '🔵'}
                              {msg.postItProposal.colorPriority === 'purple' && '🟣'}
                              {msg.postItProposal.title}
                            </span>
                            {msg.postItProposal.moneyAmount !== undefined && (
                              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                                {msg.postItProposal.moneyAmount} €
                              </span>
                            )}
                          </div>
                          {msg.postItProposal.description && (
                            <p className="text-xs text-slate-300">{msg.postItProposal.description}</p>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleCancelPostIt(msg.id)}
                            disabled={loading}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
                          >
                            Descartar
                          </button>
                          <button
                            onClick={() => handleConfirmPostIt(msg.id, msg.postItProposal!)}
                            disabled={loading}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-yellow-600 hover:bg-yellow-500 flex items-center gap-1.5 shadow-lg shadow-yellow-600/30 transition-all active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" /> Anotar en Tablero
                          </button>
                        </div>
                      </div>
                    )}

                    {msg.postItProposal.status === 'confirmed' && (
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 text-xs text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Nota fijada en el Tablero de Post-Its.</span>
                      </div>
                    )}

                    {msg.postItProposal.status === 'cancelled' && (
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-400 flex items-center gap-2">
                        <X className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Nota descartada.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Interactive Task Proposal Card */}
                {msg.taskProposal && (
                  <div className="mt-3 pt-3 border-t border-slate-700/80">
                    {msg.taskProposal.status === 'proposed' && (
                      <div className="bg-slate-900/90 rounded-2xl p-3.5 sm:p-4 border border-blue-500/40 shadow-xl space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            <CheckSquare className="w-3 h-3" />
                            Propuesta de Tarea
                          </span>
                          <span className="text-[11px] font-medium text-amber-400/90 flex items-center gap-1">
                            ⚠️ Esperando tu confirmación
                          </span>
                        </div>

                        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-white flex items-center gap-1.5">
                              {msg.taskProposal.priority === 'urgent' && '🔴 Urgente: '}
                              {msg.taskProposal.priority === 'high' && '🟠 Alta: '}
                              {msg.taskProposal.priority === 'medium' && '🟡 '}
                              {msg.taskProposal.priority === 'low' && '⚪ '}
                              {msg.taskProposal.title}
                            </span>
                          </div>

                          {msg.taskProposal.financialImpact?.expectedAmount && (
                            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                              💰 Impacto económico: +{msg.taskProposal.financialImpact.expectedAmount} € (Cobro)
                            </div>
                          )}

                          {msg.taskProposal.dueDate && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              Vence: {msg.taskProposal.dueDate}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleCancelTask(msg.id)}
                            disabled={loading}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
                          >
                            Descartar
                          </button>
                          <button
                            onClick={() => handleConfirmTask(msg.id, msg.taskProposal!)}
                            disabled={loading}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" /> Crear Tarea
                          </button>
                        </div>
                      </div>
                    )}

                    {msg.taskProposal.status === 'confirmed' && (
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 text-xs text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Tarea agregada exitosamente a tu Gestor de Tareas.</span>
                      </div>
                    )}

                    {msg.taskProposal.status === 'cancelled' && (
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-400 flex items-center gap-2">
                        <X className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Tarea descartada.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Interactive Time Block / Calendar Proposal Card */}
                {msg.timeBlockProposal && (
                  <div className="mt-3 pt-3 border-t border-slate-700/80">
                    {msg.timeBlockProposal.status === 'proposed' && (
                      <div className="bg-slate-900/90 rounded-2xl p-3.5 sm:p-4 border border-violet-500/40 shadow-xl space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border ${
                            msg.timeBlockProposal.area === 'creko'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : msg.timeBlockProposal.area === 'producto'
                              ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                              : msg.timeBlockProposal.area === 'empleo'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : msg.timeBlockProposal.area === 'changa'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : msg.timeBlockProposal.area === 'personal'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            {msg.timeBlockProposal.action === 'move'
                              ? '📅 Mover en Calendario'
                              : msg.timeBlockProposal.action === 'create'
                              ? '⏱️ Sumar al Calendario'
                              : msg.timeBlockProposal.action === 'complete'
                              ? '✅ Marcar Terminado'
                              : '🗑️ Quitar del Calendario'}
                          </span>
                          <span className="text-[11px] font-medium text-amber-400/90 flex items-center gap-1">
                            ⚠️ ¿Confirmás sumarlo / moverlo?
                          </span>
                        </div>

                        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white flex items-center gap-1.5">
                              {msg.timeBlockProposal.area === 'creko' && '🟣'}
                              {msg.timeBlockProposal.area === 'producto' && '🟠'}
                              {msg.timeBlockProposal.area === 'empleo' && '🔵'}
                              {msg.timeBlockProposal.area === 'changa' && '🔴'}
                              {msg.timeBlockProposal.area === 'personal' && '🟢'}
                              {msg.timeBlockProposal.area === 'organizacion' && '🟡'}
                              {msg.timeBlockProposal.title}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs">
                              {msg.timeBlockProposal.previousTime && (
                                <span className="line-through text-slate-500">
                                  {msg.timeBlockProposal.previousTime}
                                </span>
                              )}
                              <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-cyan-400" />
                                {msg.timeBlockProposal.startTime} – {msg.timeBlockProposal.endTime}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              {msg.timeBlockProposal.date}
                            </span>
                            <span className="capitalize font-medium text-slate-300">
                              Área: {msg.timeBlockProposal.area}
                            </span>
                          </div>

                          {(msg.timeBlockProposal.objective || msg.timeBlockProposal.explanation) && (
                            <p className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                              🎯 {msg.timeBlockProposal.objective || msg.timeBlockProposal.explanation}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleCancelTimeBlock(msg.id)}
                            disabled={loading}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all"
                          >
                            Descartar
                          </button>
                          <button
                            onClick={() => handleConfirmTimeBlock(msg.id, msg.timeBlockProposal!)}
                            disabled={loading}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-lg transition-all active:scale-95 ${
                              msg.timeBlockProposal.action === 'delete'
                                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-600/30'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            {msg.timeBlockProposal.action === 'create'
                              ? 'Sumar al Calendario'
                              : msg.timeBlockProposal.action === 'move'
                              ? 'Confirmar y Mover'
                              : msg.timeBlockProposal.action === 'complete'
                              ? 'Marcar Terminado'
                              : 'Confirmar y Quitar'}
                          </button>
                        </div>
                      </div>
                    )}

                    {msg.timeBlockProposal.status === 'confirmed' && (
                      <div className="bg-slate-900/60 border border-emerald-500/30 rounded-xl p-2.5 text-xs text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          {msg.timeBlockProposal.action === 'create'
                            ? `✅ Bloque "${msg.timeBlockProposal.title}" sumado con éxito a tu Calendario.`
                            : msg.timeBlockProposal.action === 'move'
                            ? `✅ Bloque "${msg.timeBlockProposal.title}" movido a las ${msg.timeBlockProposal.startTime}–${msg.timeBlockProposal.endTime}.`
                            : msg.timeBlockProposal.action === 'complete'
                            ? `✅ Bloque "${msg.timeBlockProposal.title}" marcado como completado.`
                            : `✅ Bloque quitado de tu Calendario.`}
                        </span>
                      </div>
                    )}

                    {msg.timeBlockProposal.status === 'cancelled' && (
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-400 flex items-center gap-2">
                        <X className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Propuesta descartada sin cambios en el calendario.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action feedback card with UNDO button */}
                {msg.actionDetails && msg.actionDetails.canUndo && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Registrado en base de datos</span>
                    </div>
                    <button
                      onClick={handleUndo}
                      disabled={loading}
                      className="inline-flex items-center gap-1 bg-slate-900/80 hover:bg-slate-900 text-blue-400 hover:text-blue-300 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                      id="btn-chat-undo"
                    >
                      <RotateCcw className="w-3 h-3" />
                      DESHACER
                    </button>
                  </div>
                )}

                {/* Learning proposal card */}
                {msg.learningProposal && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-blue-500/40 text-slate-200 space-y-2">
                    <div className="flex items-start gap-2">
                      <Brain className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                      <p className="text-xs font-medium text-slate-200">{msg.learningProposal.prompt}</p>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleAcceptRule(msg.learningProposal!)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
                      >
                        Sí, guardar regla
                      </button>
                    </div>
                  </div>
                )}

                {/* Applied System Modifications in Live DB Card (CÓDIGO ABIERTO EN ACCIÓN) */}
                {msg.appliedModifications && msg.appliedModifications.length > 0 && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-900 border border-cyan-500/40 text-slate-200 space-y-2.5 shadow-lg shadow-cyan-500/5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Modificación de Sistema Aplicada en Vivo
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        CÓDIGO ABIERTO
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {msg.appliedModifications.map((mod, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white">{mod.label}</span>
                            <span className="text-[10px] font-mono text-slate-400">{mod.timestamp}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300 font-mono">
                            <span className="text-slate-500">Campo:</span>
                            <code className="text-cyan-400 bg-slate-900 px-1 py-0.5 rounded">{mod.field}</code>
                            {mod.previousValue !== undefined && (
                              <>
                                <span className="text-slate-500">({mod.previousValue}</span>
                                <span className="text-cyan-300">➔</span>
                              </>
                            )}
                            <strong className="text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/60">
                              {mod.newValue}
                            </strong>
                            {mod.previousValue !== undefined && <span className="text-slate-500">)</span>}
                          </div>
                          {mod.details && (
                            <p className="text-[10px] text-slate-400 italic mt-0.5">{mod.details}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Sincronizado al 100% en la base de datos abierta
                      </span>
                      <button
                        onClick={() => setIsOpenSourceModalOpen(true)}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono"
                      >
                        Ver JSON ➔
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></div>
            <span className="text-slate-400 ml-1">
              {selectedImage ? 'Analizando imagen del ticket y extrayendo datos...' : 'Interpretando y consultando base de datos...'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800">
        {/* Selected Image Preview before sending */}
        {selectedImage && (
          <div className="mb-2.5 p-2 bg-slate-800/95 border border-blue-500/50 rounded-2xl flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                onClick={() => setViewingImage(selectedImage.data)}
                className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-slate-700 shrink-0 cursor-pointer group relative"
              >
                <img
                  src={selectedImage.data}
                  alt="Vista previa del ticket"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Ticket listo para procesar</span>
                </div>
                <p className="text-[11px] text-slate-300 truncate max-w-[200px] sm:max-w-xs">
                  {selectedImage.name || 'ticket.jpg'} · Extraerá importe y comercio
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors"
              title="Quitar foto"
              id="btn-remove-selected-ticket"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Action Chips for Fast System Modifications & Real-time Talk */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none text-[11px]">
          <button
            type="button"
            onClick={() => handleSend('¿Cómo vengo hoy? Dame un reporte de caja, salud y prioridades')}
            className="shrink-0 bg-slate-800/80 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-500/50 px-2.5 py-1 rounded-full text-slate-300 transition-colors"
          >
            📊 ¿Cómo vengo hoy?
          </button>
          <button
            type="button"
            onClick={() => handleSend('¿Puedo gastar 30 euros hoy?')}
            className="shrink-0 bg-slate-800/80 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-500/50 px-2.5 py-1 rounded-full text-slate-300 transition-colors"
          >
            💰 ¿Puedo gastar 30 €?
          </button>
          <button
            type="button"
            onClick={() => setInput('Poné mi efectivo en ')}
            className="shrink-0 bg-slate-800/80 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-500/50 px-2.5 py-1 rounded-full text-slate-300 transition-colors"
          >
            🛠️ Poné mi efectivo en...
          </button>
          <button
            type="button"
            onClick={() => setInput('Creá una changa de rotulación para ')}
            className="shrink-0 bg-slate-800/80 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-500/50 px-2.5 py-1 rounded-full text-slate-300 transition-colors"
          >
            💼 Creá una changa...
          </button>
          <button
            type="button"
            onClick={() => handleSend('Registrá que fui al gym 50 minutos de pecho y tríceps')}
            className="shrink-0 bg-slate-800/80 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-500/50 px-2.5 py-1 rounded-full text-slate-300 transition-colors"
          >
            🏋️ Fui al gym 50 min
          </button>
          <button
            type="button"
            onClick={() => setInput('Recordá que ')}
            className="shrink-0 bg-slate-800/80 hover:bg-purple-950/60 hover:text-purple-300 border border-slate-700/60 hover:border-purple-500/50 px-2.5 py-1 rounded-full text-slate-300 transition-colors"
          >
            🧠 Recordá que...
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Ticket / Camera Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className={`p-2.5 rounded-full border transition-all ${
              selectedImage
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700 hover:bg-slate-700'
            }`}
            title="Subir foto de ticket o factura"
            id="btn-upload-ticket"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Voice Dictate Button */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-full border transition-all ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700 hover:bg-slate-700'
              }`}
              title={isListening ? 'Detener dictado' : 'Hablar al micrófono'}
              id="btn-voice-dictate"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                selectedImage
                  ? 'Agregá detalles opcionales (ej: "Pagué con tarjeta") o presioná Enviar'
                  : isListening
                  ? 'Escuchando tu voz...'
                  : 'Habla o sube foto de ticket... (Ej: Gasté 12 en comida)'
              }
              disabled={loading}
              className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-full py-3 px-5 pr-12 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all"
              id="input-chat-message"
            />
            <button
              type="submit"
              disabled={(!input.trim() && !selectedImage) || loading}
              className="absolute right-1.5 top-1.5 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all"
              id="btn-send-chat"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        <p className="text-[11px] text-slate-500 text-center mt-2">
          Operaciones protegidas · Reconocimiento visual con Gemini 3.8 Flash
        </p>
      </div>

      {/* Lightbox / Modal for viewing full size ticket photo */}
      {viewingImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                <Receipt className="w-4 h-4 text-blue-400" />
                <span>Foto de comprobante / ticket</span>
              </div>
              <button
                onClick={() => setViewingImage(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                id="btn-close-ticket-modal"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={viewingImage}
              alt="Ticket ampliado"
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg mx-auto bg-black/40"
            />
          </div>
        </div>
      )}

      {/* JARVIS Hands-Free Voice Assistant Modal */}
      <JarvisVoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onRefreshData={onRefreshData}
        onSendMessageToChat={(txt) => handleSend(txt)}
      />

      {/* 100% Fran Memory & Knowledge Inspector */}
      <FranMemoryModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        onRefreshData={onRefreshData}
      />

      {/* Open Source & Dev Studio Modal */}
      <JarvisOpenSourceModal
        isOpen={isOpenSourceModalOpen}
        onClose={() => setIsOpenSourceModalOpen(false)}
        onRefreshData={onRefreshData}
      />
    </div>
  );
};
