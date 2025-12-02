import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../../utils'
import TaskItem from '../../../src/components/tasks/task-item'
import { testData } from '../../utils'

describe('TaskItem Component', () => {
  const mockTask = {
    id: 1,
    list_id: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    priority: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  it('should render task with title and status', () => {
    const { getByText, container } = renderWithProviders(
      <TaskItem task={mockTask} />
    )

    expect(getByText('Test Task')).toBeInTheDocument()
    expect(getByText('pending')).toBeInTheDocument()
  })

  it('should show priority indicator', () => {
    const { container } = renderWithProviders(
      <TaskItem task={mockTask} />
    )

    const priorityIndicator = container.querySelector('.priority-indicator')
    expect(priorityIndicator).toBeInTheDocument()
  })

  it('should show completed state for completed tasks', () => {
    const completedTask = { ...mockTask, status: 'completed' }
    const { container } = renderWithProviders(
      <TaskItem task={completedTask} />
    )

    expect(container.querySelector('.task-item')).toHaveClass('completed')
  })

  it('should handle click events', async () => {
    const handleClick = vi.fn()
    const { getByText, user } = renderWithProviders(
      <TaskItem task={mockTask} onClick={handleClick} />
    )

    await user.click(getByText('Test Task'))
    expect(handleClick).toHaveBeenCalledWith(mockTask.id)
  })

  it('should show due date when provided', () => {
    const taskWithDueDate = {
      ...mockTask,
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
    }

    const { container } = renderWithProviders(
      <TaskItem task={taskWithDueDate} />
    )

    expect(container.querySelector('.due-date')).toBeInTheDocument()
  })
})