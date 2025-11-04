'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('table-dark', className)}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead className={cn('', className)}>
      {children}
    </thead>
  );
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function TableBody({ children, className }: TableBodyProps) {
  return (
    <tbody className={cn('', className)}>
      {children}
    </tbody>
  );
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableRow({ children, className, onClick }: TableRowProps) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      {children}
    </motion.tr>
  );
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHead({ children, className }: TableHeadProps) {
  return (
    <th className={cn('', className)}>
      {children}
    </th>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export function TableCell({ children, className }: TableCellProps) {
  return (
    <td className={cn('', className)}>
      {children}
    </td>
  );
}

// Action Buttons for tables
interface TableActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onMore?: () => void;
  className?: string;
}

export function TableActions({ onEdit, onDelete, onMore, className }: TableActionsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="btn-icon text-muted-foreground hover:text-foreground"
          aria-label="Editar"
        >
          <Edit className="h-4 w-4" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="btn-icon text-muted-foreground hover:text-destructive"
          aria-label="Deletar"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
      {onMore && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMore();
          }}
          className="btn-icon text-muted-foreground hover:text-foreground"
          aria-label="Mais opções"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// Badge component for table cells
interface TableBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function TableBadge({ children, variant = 'default', className }: TableBadgeProps) {
  const variants = {
    default: 'bg-secondary text-foreground',
    success: 'bg-primary/10 text-primary border border-primary/20',
    warning: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
    error: 'bg-destructive/10 text-destructive border border-destructive/20',
    info: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

