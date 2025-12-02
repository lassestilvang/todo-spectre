'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
);

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => {
    return (
      <ul ref={ref} className={cn('flex flex-row items-center gap-1', className)} {...props} />
    );
  }
);

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  ({ className, ...props }, ref) => {
    return (
      <li ref={ref} className={cn('', className)} {...props} />
    );
  }
);

const PaginationPrevious = ({
  className,
  onClick,
  disabled,
  ...props
}: React.ComponentProps<'button'> & {
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <Button
    variant="outline"
    className={cn('gap-1 pl-2.5', className)}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </Button>
);

const PaginationNext = ({
  className,
  onClick,
  disabled,
  ...props
}: React.ComponentProps<'button'> & {
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <Button
    variant="outline"
    className={cn('gap-1 pr-2.5', className)}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </Button>
);

const PaginationLink = ({
  className,
  isActive,
  onClick,
  children,
}: {
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}) => (
  <Button
    variant={isActive ? 'outline' : 'ghost'}
    className={cn('h-9 w-9 p-0', className)}
    onClick={onClick}
  >
    {children}
  </Button>
);

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext
};