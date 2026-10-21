import { Award, Baby, BedDouble, Brain, ClipboardCheck, Compass, GraduationCap, Hospital, House, Target, type LucideProps } from 'lucide-react';
import type { Phase } from '../data/phases';

const MAP = {
  school: GraduationCap,
  hospital: Hospital,
  home: House,
  bed: BedDouble,
  baby: Baby,
  brain: Brain,
  target: Target,
  exam: ClipboardCheck,
  award: Award,
  compass: Compass,
} as const;

export const PhaseIcon = ({ name, ...p }: { name: Phase['icon'] } & LucideProps) => {
  const C = MAP[name];
  return <C aria-hidden {...p} />;
};
