'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const toggleVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-3',
        sm: 'h-9 px-2.5',
        lg: 'h-11 px-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof toggleVariants> {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant, size, pressed, onPressedChange, ...props }, ref) => {
    const [isPressed, setIsPressed] = React.useState(pressed || false);

    React.useEffect(() => {
      if (pressed !== undefined) {
        setIsPressed(pressed);
      }
    }, [pressed]);

    const handleClick = () => {
      const newPressed = !isPressed;
      setIsPressed(newPressed);
      if (onPressedChange) {
        onPressedChange(newPressed);
      }
    };

    return (
      <button
        type="button"
        ref={ref}
        className={cn(
          toggleVariants({ variant, size, className }),
          isPressed ? 'bg-accent text-accent-foreground' : 'bg-transparent'
        )}
        onClick={handleClick}
        aria-pressed={isPressed}
        {...props}
      />
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle, toggleVariants };