'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface ErrorDisplayProps {
  error: Error | string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({ error, onRetry, className }: ErrorDisplayProps) {
  const errorMessage = typeof error === 'string' ? error : error.message || 'An unknown error occurred';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          Error
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-destructive-foreground">{errorMessage}</p>
          {onRetry && (
            <Button
              variant="outline"
              onClick={onRetry}
              className="mt-2"
            >
              Retry
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}