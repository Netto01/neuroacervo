'use client';

import React from 'react';
import { MaterialItem } from '@/types/neuro';
import { DOMAIN_LABELS, TYPE_LABELS, AGE_LABELS } from '@/data/neuroData';
import { useNeuro } from '@/context/NeuroContext';
import { 
  Star, 
  Download, 
  Clock, 
  FileText, 
  ExternalLink, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface MaterialCardProps {
  material: MaterialItem;
  onSelect: (material: MaterialItem) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ material, onSelect }) => {
  const { favorites, toggleFavorite } = useNeuro();
  const isFavorited = favorites.includes(material.id);

  return (
    <div 
      onClick={() => onSelect(material)}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 p-5 shadow-sm hover:shadow-xl hover:border-teal-500/40 dark:hover:border-teal-500/30 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* Top Badges & Favorite */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${TYPE_LABELS[material.type].badge}`}>
            {TYPE_LABELS[material.type].label}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(material.id);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              isFavorited 
                ? 'text-amber-500 bg-amber-500/10' 
                : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Star className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Title & Subtitle */}
        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2 text-base mb-1.5">
          {material.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
          {material.subtitle}
        </p>

        {/* Domain Badges */}
        <div className="flex flex-wrap gap-1 mb-4">
          {material.domains.slice(0, 3).map((dom) => (
            <span
              key={dom}
              className={`text-[10px] font-medium px-2 py-0.5 rounded border ${DOMAIN_LABELS[dom].bg} ${DOMAIN_LABELS[dom].color}`}
            >
              {DOMAIN_LABELS[dom].label}
            </span>
          ))}
          {material.domains.length > 3 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              +{material.domains.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {material.downloadFormat}
          </span>
          <span>•</span>
          <span>{material.downloadSize}</span>
        </div>

        <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold group-hover:translate-x-0.5 transition-transform">
          <span>Abrir</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
