import { X, ExternalLink, ShoppingCart } from 'lucide-react'
import type { ScheduleTask } from '../types/appliance'
import { useModalClose } from '../hooks/useModalClose'

interface Props {
  task: ScheduleTask
  applianceName: string
  onClose: () => void
}

export function DiyGuideModal({ task, applianceName, onClose }: Props) {
  useModalClose(onClose)
  const products = task.products ?? []
  const steps = task.steps ?? []

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">{applianceName}</p>
            <h3 className="font-semibold text-slate-800 leading-snug">{task.label}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 ml-4 shrink-0 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-5">
          {/* Steps */}
          {steps.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Steps</p>
              <ol className="flex flex-col gap-3">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Tips */}
          {task.notes && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tips</p>
              <p className="text-sm text-slate-600 leading-relaxed italic">{task.notes}</p>
            </div>
          )}

          {/* Tools & Parts */}
          {products.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShoppingCart size={12} /> Tools & Parts
              </p>
              <div className="flex flex-col gap-2">
                {products.map((p, i) => (
                  <a
                    key={i}
                    href={p.searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors group"
                  >
                    <span className="text-sm text-amber-800 font-medium">{p.label}</span>
                    <ExternalLink size={13} className="text-amber-500 shrink-0 group-hover:text-amber-700" />
                  </a>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Amazon links · at no additional cost to you
              </p>
            </div>
          )}
        </div>

        {/* Footer — video link */}
        <div className="px-6 py-4 border-t border-slate-100">
          <a
            href={task.diyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-slate-800 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            <ExternalLink size={14} /> Watch DIY Video →
          </a>
        </div>
      </div>
    </div>
  )
}
