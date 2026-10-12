import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function NavigationCard({
  icon: Icon,
  badgeText,
  title,
  description,
  buttonText,
  to,
  variant = 'default',
  id
}) {
  const isAccent = variant === 'accent'

  return (
    <div
      id={id}
      className={`group relative flex flex-col justify-between rounded-xl border p-7 sm:p-8 transition-all duration-200 ${
        isAccent
          ? 'border-indigo-500/30 bg-slate-900/90 hover:border-indigo-500/60 hover:shadow-xl hover:shadow-indigo-500/10'
          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-950/50'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-lg border transition-transform duration-200 group-hover:scale-105 ${
              isAccent
                ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400'
                : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
            }`}
          >
            {Icon && <Icon className="h-7 w-7" aria-hidden="true" />}
          </div>
          {badgeText && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase ${
                isAccent
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
              }`}
            >
              {badgeText}
            </span>
          )}
        </div>

        <h3 className="text-2xl font-bold tracking-tight text-white mb-2">
          {title}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          {description}
        </p>
      </div>

      <Link
        to={to}
        className={`inline-flex items-center justify-between rounded-lg px-5 py-3.5 text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
          isAccent
            ? 'bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500'
            : 'bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-500'
        }`}
      >
        <span>{buttonText}</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  )
}
