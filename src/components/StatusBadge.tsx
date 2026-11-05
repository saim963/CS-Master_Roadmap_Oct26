import { cn, STATUS_CONFIG, STATUS_CYCLE } from '../lib/utils';
import type { TopicStatus } from '../types';
import { Circle, BookOpen, CheckCircle, Star } from 'lucide-react';

const ICONS = { Circle, BookOpen, CheckCircle, Star };

interface Props {
  status: TopicStatus;
  onChange?: (next: TopicStatus) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function StatusBadge({ status, onChange, size = 'md', showLabel = false }: Props) {
  const cfg = STATUS_CONFIG[status];
  const IconComp = ICONS[cfg.icon as keyof typeof ICONS];

  const sizes = {
    sm: { icon: 14, text: 'text-xs', pad: 'px-1.5 py-0.5' },
    md: { icon: 16, text: 'text-sm', pad: 'px-2 py-1' },
    lg: { icon: 18, text: 'text-base', pad: 'px-3 py-1.5' },
  };

  const s = sizes[size];

  const handleClick = () => {
    if (!onChange) return;
    const idx = STATUS_CYCLE.indexOf(status);
    onChange(STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]);
  };

  return (
    <button
      onClick={handleClick}
      disabled={!onChange}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium transition-all',
        s.text,
        s.pad,
        cfg.color,
        cfg.bgColor,
        cfg.borderColor,
        onChange ? 'cursor-pointer hover:opacity-80 active:scale-95' : 'cursor-default'
      )}
      title={onChange ? `Click to change status (currently: ${cfg.label})` : cfg.label}
    >
      <IconComp size={s.icon} />
      {showLabel && <span>{cfg.label}</span>}
    </button>
  );
}
