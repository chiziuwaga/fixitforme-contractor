'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BaseCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerActions?: ReactNode;
  footer?: ReactNode;
  status?: 'default' | 'success' | 'warning' | 'error';
  animated?: boolean;
}

export function BaseCard({ 
  title, 
  description, 
  children, 
  className,
  headerActions,
  footer,
  status = 'default',
  animated = false
}: BaseCardProps) {
  const statusColors = {
    default: 'border-border',
    success: 'border-success/20 bg-success/10',
    warning: 'border-warning/20 bg-warning/10',
    error: 'border-destructive/20 bg-destructive/10'
  };

  const CardWrapper = animated ? motion.div : 'div';
  const animationProps = animated ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {};

  return (
    <CardWrapper {...animationProps}>
      <Card className={cn(statusColors[status], className)}>
        {(title || description || headerActions) && (
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                {title && (
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {title}
                  </CardTitle>
                )}
                {description && (
                  <CardDescription className="text-sm text-muted-foreground">
                    {description}
                  </CardDescription>
                )}
              </div>
              {headerActions && (
                <div className="flex items-center gap-2">
                  {headerActions}
                </div>
              )}
            </div>
          </CardHeader>
        )}
        <CardContent className="pt-0">
          {children}
        </CardContent>
        {footer && (
          <div className="px-6 py-3 border-t border-border bg-muted/25">
            {footer}
          </div>
        )}
      </Card>
    </CardWrapper>
  );
}

interface BaseStatProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period?: string;
  };
  icon?: ReactNode;
  className?: string;
  format?: 'currency' | 'percentage' | 'number';
}

export function BaseStat({ 
  label, 
  value, 
  change, 
  icon, 
  className,
  format = 'number'
}: BaseStatProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="text-2xl font-bold text-foreground">
          {formatValue(value)}
        </div>
        
        {change && (
          <div className="flex items-center gap-2">
            <Badge 
              variant={change.type === 'increase' ? 'default' : 'secondary'}
              className={cn(
                "text-xs",
                change.type === 'increase' 
                  ? "bg-success/10 text-success-foreground hover:bg-success/20" 
                  : "bg-destructive/10 text-destructive-foreground hover:bg-destructive/20"
              )}
            >
              {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
            </Badge>
            {change.period && (
              <span className="text-xs text-muted-foreground">
                vs {change.period}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface BaseButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function BaseButton({ 
  children, 
  variant = 'primary', 
  size = 'default',
  disabled = false,
  loading = false,
  onClick,
  className
}: BaseButtonProps) {
  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  };

  return (
    <Button
      variant={variant === 'primary' ? 'default' : variant}
      size={size}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(variantStyles[variant], className)}
    >
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </Button>
  );
}

const BaseComponents = { BaseCard, BaseStat, BaseButton };
export default BaseComponents;
