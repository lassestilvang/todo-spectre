import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../../utils'
import ListItem from '../../../src/components/lists/list-item'
import { testData } from '../../utils'

describe('ListItem Component', () => {
  const mockList = {
    id: 1,
    user_id: testData.user.id,
    title: 'Test List',
    color: '#FF5733',
    icon: 'inbox',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  it('should render list item with title and icon', () => {
    const { getByText, container } = renderWithProviders(
      <ListItem list={mockList} />
    )

    expect(getByText('Test List')).toBeInTheDocument()
    expect(container.querySelector('.list-item')).toBeInTheDocument()
  })

  it('should show list color', () => {
    const { container } = renderWithProviders(
      <ListItem list={mockList} />
    )

    const colorIndicator = container.querySelector('.color-indicator')
    expect(colorIndicator).toHaveStyle(`background-color: ${mockList.color}`)
  })

  it('should show list icon', () => {
    const { container } = renderWithProviders(
      <ListItem list={mockList} />
    )

    const iconElement = container.querySelector('.list-icon')
    expect(iconElement).toHaveTextContent(mockList.icon)
  })

  it('should handle click events', async () => {
    const handleClick = vi.fn()
    const { getByText, user } = renderWithProviders(
      <ListItem list={mockList} onClick={handleClick} />
    )

    await user.click(getByText('Test List'))
    expect(handleClick).toHaveBeenCalledWith(mockList.id)
  })

  it('should show active state when selected', () => {
    const { container } = renderWithProviders(
      <ListItem list={mockList} isActive={true} />
    )

    expect(container.querySelector('.list-item')).toHaveClass('active')
  })
})