import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { AlertTriangle, Check, ChevronDown, Info, X } from 'lucide-react';
import type { Fact, Source } from '../types';
import { sourceById } from '../data/sources';
import { fmtDate } from '../utils/dates';

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg' };
export const Button = ({ variant = 'primary', size = 'md', className = '', ...p }: BtnProps) => (
  <button type="button" {...p} className={`btn btn-${variant} ${size === 'lg' ? 'btn-lg' : size === 'sm' ? 'btn-sm' : ''} ${className}`} />
);

export const ExternalLink = ({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
    {children}
  </a>
);

export const Notice = ({ kind = 'info', children }: { kind?: 'info' | 'warn' | 'danger' | 'ok'; children: ReactNode }) => (
  <div className={`notice ${kind === 'info' ? '' : kind}`} role={kind === 'danger' ? 'alert' : undefined}>
    {kind === 'ok' ? <Check size={20} aria-hidden /> : kind === 'info' ? <Info size={20} aria-hidden /> : <AlertTriangle size={20} aria-hidden />}
    <div>{children}</div>
  </div>
);

export const Disclosure = ({ title, children, defaultOpen = false }: { title: ReactNode; children: ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className="disc" data-open={open}>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <span>{title}</span>
        <ChevronDown className="chev" size={22} aria-hidden />
      </button>
      {open && (
        <div className="body" id={id}>
          {children}
        </div>
      )}
    </div>
  );
};

export const Modal = ({ title, children, actions, onClose, wide = false }: { title: string; children: ReactNode; actions?: ReactNode; onClose?: () => void; wide?: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => prev?.focus?.();
  }, []);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div ref={ref} tabIndex={-1} className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 id={titleId}>{title}</h3>
          {onClose && (
            <Button variant="ghost" size="sm" aria-label="Schließen" onClick={onClose}>
              <X size={22} aria-hidden />
            </Button>
          )}
        </div>
        {children}
        {actions && <div className="actions">{actions}</div>}
      </div>
    </div>
  );
};

const STATUS_LABEL: Record<Fact['status'], string> = {
  verified: 'Belegt',
  dynamic: 'Datenstand beachten',
  unconfirmed: 'Nicht bestätigt',
  illustrative: 'Veranschaulichung',
};

export const SourceList = ({ ids }: { ids: string[] }) => {
  const sources: Source[] = ids.map(sourceById);
  return (
    <ul className="small" style={{ paddingLeft: '1.2em', margin: 0 }}>
      {sources.map((s) => (
        <li key={s.id} style={{ marginBottom: 8 }}>
          <strong>{s.title}</strong> – {s.publisher}
          <br />
          <ExternalLink href={s.url}>{s.url}</ExternalLink> <span className="muted">(abgerufen {fmtDate(s.retrieved)})</span>
          {s.note && (
            <>
              <br />
              <em className="muted">{s.note}</em>
            </>
          )}
        </li>
      ))}
    </ul>
  );
};

/** Kompakter Quellen-/Datenstand-Hinweis mit aufklappbarer Quellenliste. */
export const SourceNote = ({ ids, asOf, status = 'verified', label = 'Quellen' }: { ids: string[]; asOf?: string; status?: Fact['status']; label?: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="stack" style={{ marginTop: 12 }}>
      <div className="row small muted">
        <span className={`chip ${status === 'verified' ? 'ok' : status === 'dynamic' ? 'warn' : ''}`}>{STATUS_LABEL[status]}</span>
        {asOf && <span>Stand: {/^\d{4}-\d{2}-\d{2}$/.test(asOf) ? fmtDate(asOf) : asOf}</span>}
        <button type="button" className="btn btn-ghost btn-sm" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {label} {open ? 'ausblenden' : 'anzeigen'}
        </button>
      </div>
      {open && <SourceList ids={ids} />}
    </div>
  );
};

export const ScreenTitle = ({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: ReactNode }) => (
  <header style={{ marginBottom: 'var(--sp-6)' }}>
    {eyebrow && <div className="eyebrow">{eyebrow}</div>}
    <h2 tabIndex={-1} data-screen-title>
      {title}
    </h2>
    {lead && <p className="lead">{lead}</p>}
  </header>
);

export const NoData = ({ children }: { children?: ReactNode }) => (
  <div className="notice warn" role="note">
    <AlertTriangle size={20} aria-hidden />
    <div>
      <strong>Keine verlässliche Angabe verfügbar</strong>
      {children && <p style={{ marginTop: 4 }}>{children}</p>}
    </div>
  </div>
);
