'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

async function fetchTasks() {
  const res = await fetch('/api/tasks');
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export default function AnalyticsPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['tasks'], queryFn: fetchTasks });

  if (isLoading) return <div className="p-8">Loading analytics…</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load analytics</div>;

  const tasks = Array.isArray(data) ? data : data?.items ?? [];
  const total = tasks.length;
  const completed = tasks.filter((t: { status: string }) => t.status === 'completed').length;
  const pending = tasks.filter((t: { status: string }) => t.status === 'pending').length;
  const high = tasks.filter((t: { priority: number }) => t.priority === 3).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader><CardTitle>Total tasks</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{total}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Completed</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{completed}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pending</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{pending}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>High priority</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{high}</CardContent>
        </Card>
      </div>
      <div className="mt-6 text-sm text-muted-foreground">
        Completion rate: {total ? Math.round((completed / total) * 100) : 0}%
      </div>
    </div>
  );
}
