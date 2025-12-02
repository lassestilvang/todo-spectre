import { ListManagement } from '@/components/lists/list-management';

export default function MainPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Todo Spectre</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Welcome to your task planner. Select a list from the sidebar to get started.
      </p>

      {/* Mobile view - show list management at the top */}
      <div className="md:hidden mt-6">
        <ListManagement />
      </div>
    </div>
  );
}