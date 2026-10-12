import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trash2,
  RotateCcw,
  Sparkles,
  Euro,
  Calendar,
  X,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowDownCircle,
  Eye,
} from 'lucide-react';
import { PostIt, PostItColorPriority } from '../types';
import { soundFX } from '../utils/soundEffects';

interface VisualTrashBinProps {
  trashedPostIts: PostIt[];
  onTrashPostIt: (id: string, reason?: 'completed' | 'discarded') => Promise<void>;
  onRestorePostIt: (id: string) => Promise<void>;
  onEmptyTrash: () => Promise<void>;
  onPermanentDelete?: (id: string) => Promise<void>;
  isDraggingOverBoard?: boolean;
}

export const VisualTrashBin: React.FC<VisualTrashBinProps> = ({
  trashedPostIts,
  onTrashPostIt,
  onRestorePostIt,
  onEmptyTrash,
  onPermanentDelete,
}) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);
  const [showConfirmEmpty, setShowConfirmEmpty] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const count = trashedPostIts.length;

  // Calculate total money from completed/trashed notes
  const totalMoneyRecovered = trashedPostIts.reduce(
    (acc, p) => acc + (p.moneyAmount || 0),
    0
  );

  // Determine fill stage
  const maxVisualCapacity = 15;
  const fillPercentage = Math.min(100, Math.round((count / maxVisualCapacity) * 100));

  let fillLabel = 'Vacío';
  let badgeColor = 'text-slate-400 bg-slate-800/80 border-slate-700';
  if (count > 0 && count <= 3) {
    fillLabel = 'Iniciando';
    badgeColor = 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  } else if (count > 3 && count <= 8) {
    fillLabel = 'Medio Lleno';
    badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  } else if (count > 8 && count < 15) {
    fillLabel = '¡Casi Lleno!';
    badgeColor = 'text-orange-400 bg-orange-500/15 border-orange-500/40';
  } else if (count >= 15) {
    fillLabel = '¡A Tope! 🏆';
    badgeColor = 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50';
  }

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const postItId = e.dataTransfer.getData('text/plain');
    if (!postItId) return;

    soundFX.playTossIntoTrash();
    triggerWiggle();
    try {
      await onTrashPostIt(postItId, 'completed');
    } catch (err) {
      console.error('Error dropping post-it into trash:', err);
    }
  };

  const triggerWiggle = () => {
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 600);
  };

  // Color mapping for crumpled balls
  const getBallStyle = (color: PostItColorPriority) => {
    switch (color) {
      case 'red':
        return 'from-rose-500 via-rose-600 to-rose-900 border-rose-400/60 text-rose-200 shadow-rose-900/50';
      case 'orange':
        return 'from-amber-500 via-amber-600 to-amber-900 border-amber-400/60 text-amber-200 shadow-amber-900/50';
      case 'yellow':
        return 'from-yellow-400 via-yellow-500 to-yellow-800 border-yellow-300/60 text-yellow-100 shadow-yellow-900/50';
      case 'green':
        return 'from-emerald-500 via-emerald-600 to-emerald-900 border-emerald-400/60 text-emerald-200 shadow-emerald-900/50';
      case 'blue':
      default:
        return 'from-sky-500 via-sky-600 to-sky-900 border-sky-400/60 text-sky-200 shadow-sky-900/50';
    }
  };

  // Generate visual crumpled balls (up to 16 displayed balls)
  const visualBalls = trashedPostIts.slice(0, 16).map((post, idx) => {
    // Deterministic positions based on index
    const angles = [-18, 14, -26, 22, -10, 30, -32, 15, -12, 28, -22, 18, -15, 25, -8, 19];
    const leftOffsets = [24, 52, 34, 68, 18, 58, 40, 72, 28, 62, 22, 50, 36, 66, 30, 48];
    // Bottom stack height: stacked from bottom (10%) to rim (78%)
    const bottomHeight = Math.min(82, 12 + Math.floor(idx / 2.2) * 11);

    return {
      id: post.id,
      title: post.title,
      color: post.colorPriority,
      angle: angles[idx % angles.length],
      left: leftOffsets[idx % leftOffsets.length],
      bottom: bottomHeight,
      zIndex: idx + 2,
    };
  });

  const handleEmptyConfirmed = async () => {
    setIsProcessing(true);
    soundFX.playEmptyTrash();
    try {
      await onEmptyTrash();
      setShowConfirmEmpty(false);
      setIsOpenModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Visual Trash Can Card / Station */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group select-none transition-all duration-300 rounded-3xl p-4 sm:p-5 border flex flex-col justify-between overflow-hidden shadow-2xl ${
          isDragOver
            ? 'bg-amber-950/40 border-amber-400 ring-4 ring-amber-400/30 scale-102 shadow-amber-500/20'
            : 'bg-gradient-to-b from-slate-900 via-slate-950 to-[#0B1120] border-slate-800 hover:border-slate-700'
        }`}
        id="visual-trash-station"
      >
        {/* Glow ambient effect */}
        <div
          className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-all ${
            count > 0 ? 'bg-amber-500/10' : 'bg-slate-700/5'
          }`}
        />

        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 relative z-10 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-300">
              <Trash2 className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                Tacho de Post-Its
                {count >= 10 && <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />}
              </h3>
              <p className="text-[10px] text-slate-400">
                Completados & Liquidados
              </p>
            </div>
          </div>

          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${badgeColor}`}
          >
            {count} {count === 1 ? 'nota' : 'notas'} ({fillLabel})
          </span>
        </div>

        {/* 3D Visual Physical Wastebasket Render */}
        <div
          onClick={() => setIsOpenModal(true)}
          className="my-2 cursor-pointer flex flex-col items-center justify-center relative group/can transition-transform hover:scale-[1.02]"
          title="Hacé clic para ver el contenido del tacho"
        >
          {/* Basket Container with metallic rim and mesh body */}
          <motion.div
            animate={
              isWiggling
                ? { rotate: [-5, 6, -4, 4, -2, 2, 0], scale: [1, 1.05, 0.98, 1.02, 1] }
                : isDragOver
                ? { scale: 1.06, y: -2 }
                : { scale: 1, y: 0 }
            }
            transition={{ duration: 0.5 }}
            className="w-44 sm:w-48 h-44 relative flex flex-col items-center"
          >
            {/* Top Rim Oval */}
            <div className="w-36 sm:w-40 h-10 rounded-[50%] bg-gradient-to-r from-slate-600 via-slate-500 to-slate-700 border-2 border-slate-400/80 shadow-md relative z-20 flex items-center justify-center overflow-hidden">
              {/* Inner depth hole */}
              <div className="w-[94%] h-[80%] rounded-[50%] bg-gradient-to-b from-slate-950 via-[#0B0F19] to-slate-900 border border-slate-800 shadow-inner flex items-center justify-center">
                {count === 0 && (
                  <span className="text-[9px] text-slate-500 font-medium tracking-wide">
                    {isDragOver ? '¡Soltá acá!' : 'Vacío'}
                  </span>
                )}
              </div>
            </div>

            {/* Wastebasket Mesh Body (Tapered) */}
            <div
              className="w-32 sm:w-36 h-32 -mt-4 rounded-b-2xl border-x-2 border-b-2 border-slate-600/80 bg-gradient-to-b from-slate-900/90 via-[#0F172A]/90 to-slate-950 shadow-2xl relative overflow-hidden flex flex-col justify-end"
              style={{
                clipPath: 'polygon(0% 0%, 100% 0%, 88% 100%, 12% 100%)',
              }}
            >
              {/* Wiremesh texture pattern */}
              <div
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(#94A3B8 1px, transparent 1px), radial-gradient(#94A3B8 1px, transparent 1px)',
                  backgroundSize: '10px 10px',
                  backgroundPosition: '0 0, 5px 5px',
                }}
              />

              {/* Metallic horizontal ribs */}
              <div className="absolute top-[28%] w-full h-[1px] bg-slate-600/40" />
              <div className="absolute top-[56%] w-full h-[1px] bg-slate-600/40" />
              <div className="absolute top-[82%] w-full h-[1px] bg-slate-600/40" />

              {/* Empty state hint */}
              {count === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                  <ArrowDownCircle className="w-5 h-5 text-slate-600 mb-1 animate-bounce" />
                  <span className="text-[10px] text-slate-500 font-medium leading-tight">
                    {isDragOver ? 'Soltá para tirar' : 'Arrastrá o tocá "Al tacho"'}
                  </span>
                </div>
              )}

              {/* Crumpled Post-It Paper Balls Inside */}
              <AnimatePresence>
                {visualBalls.map((b) => (
                  <motion.div
                    key={b.id}
                    initial={{ scale: 0, y: -40, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                    style={{
                      left: `${b.left}%`,
                      bottom: `${b.bottom}%`,
                      transform: `translate(-50%, 50%) rotate(${b.angle}deg)`,
                      zIndex: b.zIndex,
                    }}
                    className={`absolute w-7 h-7 sm:w-8 sm:h-8 rounded-[38%_62%_63%_37%/41%_44%_56%_59%] bg-gradient-to-br ${getBallStyle(
                      b.color
                    )} border shadow-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
                    title={b.title}
                  >
                    {/* Crumple folds / shadows simulation */}
                    <div className="w-3 h-3 border-t border-l border-white/40 rounded-sm opacity-60 rotate-12" />
                    <div className="w-2 h-2 border-b border-r border-black/40 rounded-sm opacity-50 -rotate-45 absolute" />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Overflowing indicator if > 16 */}
              {count > 16 && (
                <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full z-30 shadow-lg animate-pulse">
                  +{count - 16}
                </div>
              )}
            </div>

            {/* Wastebasket Base Shadow */}
            <div className="w-28 sm:w-32 h-3 rounded-[50%] bg-black/60 blur-sm -mt-1" />
          </motion.div>

          {/* Hover overlay hint */}
          <div className="mt-1 text-[11px] font-semibold text-slate-400 group-hover/can:text-amber-300 flex items-center gap-1 transition-colors">
            <Eye className="w-3 h-3" />
            <span>Ver interior ({count})</span>
          </div>
        </div>

        {/* Progress Bar of Fullness */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              Capacidad de liquidación
            </span>
            <span className="font-bold text-slate-300">{fillPercentage}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fillPercentage}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full transition-all ${
                fillPercentage > 80
                  ? 'bg-gradient-to-r from-amber-500 to-emerald-400'
                  : fillPercentage > 40
                  ? 'bg-gradient-to-r from-blue-500 to-amber-500'
                  : 'bg-blue-500'
              }`}
            />
          </div>

          {totalMoneyRecovered > 0 && (
            <div className="text-[10px] text-emerald-400 font-medium flex items-center justify-between pt-1">
              <span>Impacto liquidado:</span>
              <span className="font-bold">+{totalMoneyRecovered} €</span>
            </div>
          )}
        </div>

        {/* Quick Empty button if not empty */}
        {count > 0 && (
          <div className="pt-2 flex items-center justify-end">
            <button
              onClick={() => setShowConfirmEmpty(true)}
              className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-slate-800/60"
            >
              <Trash2 className="w-3 h-3" />
              <span>Vaciar tacho</span>
            </button>
          </div>
        )}
      </div>

      {/* MODAL: Full Trash Content Inspector */}
      <AnimatePresence>
        {isOpenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      Tacho de Post-Its Completados
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {count} en total
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Notas arrugadas y archivadas. Podés restaurarlas al tablero o vaciar el tacho.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpenModal(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary Stats bar */}
              <div className="p-4 bg-slate-950/40 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Post-Its archivados</div>
                  <div className="text-base font-bold text-white">{count}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Dinero liquidado</div>
                  <div className="text-base font-bold text-emerald-400">
                    +{totalMoneyRecovered} €
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
                  {count > 0 && (
                    <button
                      onClick={() => setShowConfirmEmpty(true)}
                      className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Vaciar Tacho</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Post-It Cards inside the Trash */}
              <div className="p-5 overflow-y-auto space-y-3 flex-1">
                {count === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-2xl">
                      🗑️
                    </div>
                    <h3 className="text-sm font-semibold text-white">
                      El tacho de basura está vacío
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      A medida que vayas completando notas en el tablero, arrastralas o tocalas para depositarlas acá y ver cómo se va llenando.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {trashedPostIts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 flex flex-col justify-between space-y-3 group transition-all"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight uppercase ${
                                post.colorPriority === 'purple'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : post.colorPriority === 'orange'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : post.colorPriority === 'blue'
                                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                  : post.colorPriority === 'red'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : post.colorPriority === 'green'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                              }`}
                            >
                              {post.colorPriority === 'purple' && '🟣 Creko'}
                              {post.colorPriority === 'orange' && '🟠 Burger Palusa'}
                              {post.colorPriority === 'blue' && '🔵 Sowfts'}
                              {post.colorPriority === 'red' && '🔴 Urgencias'}
                              {post.colorPriority === 'yellow' && '🟡 Título Libre'}
                              {post.colorPriority === 'green' && '🟢 Metas & Ocio'}
                            </span>

                            {post.moneyAmount !== undefined && (
                              <span className="text-xs font-bold text-emerald-400">
                                {post.moneyAmount} €
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-slate-200 line-through opacity-80 leading-snug">
                            {post.title}
                          </h4>

                          {post.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-2">
                              {post.description}
                            </p>
                          )}
                        </div>

                        {/* Footer Action buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                          <span className="text-[10px] text-slate-500">
                            {post.trashedAt
                              ? `Tirado: ${new Date(post.trashedAt).toLocaleDateString()}`
                              : 'Archivado'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {/* Restore Button */}
                            <button
                              onClick={async () => {
                                soundFX.playRestore();
                                await onRestorePostIt(post.id);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 flex items-center gap-1 transition-all"
                              title="Desarrugar y devolver al tablero activo"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restaurar</span>
                            </button>

                            {/* Permanent delete button */}
                            {onPermanentDelete && (
                              <button
                                onClick={async () => {
                                  await onPermanentDelete(post.id);
                                }}
                                className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                                title="Eliminar definitivamente"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Tip: Arrastrá los post-its desde el tablero directamente al tacho para completarlos.
                </span>
                <button
                  onClick={() => setIsOpenModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog for Empty Trash */}
      <AnimatePresence>
        {showConfirmEmpty && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1.5">
                <h3 className="text-base font-bold text-white">¿Vaciar el tacho de basura?</h3>
                <p className="text-xs text-slate-400">
                  Se eliminarán definitivamente <strong>{count} post-its</strong> arrugados. Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowConfirmEmpty(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEmptyConfirmed}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all"
                >
                  {isProcessing ? 'Vaciando...' : 'Sí, Vaciar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
