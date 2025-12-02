import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../../tests/utils'
import Button from '../../../src/components/ui/button'

describe('Button Component', () => {
  it('should render correctly with default props', () => {
    const { getByText } = renderWithProviders(<Button>Click Me</Button>)
    const button = getByText('Click Me')

    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('inline-flex items-center justify-center')
  })

  it('should render with variant classes', () => {
    const { getByText } = renderWithProviders(
      <Button variant="secondary">Secondary</Button>
    )
    const button = getByText('Secondary')

    expect(button).toHaveClass('bg-secondary')
  })

  it('should render with size classes', () => {
    const { getByText } = renderWithProviders(
      <Button size="sm">Small</Button>
    )
    const button = getByText('Small')

    expect(button).toHaveClass('h-8 px-3 text-sm')
  })

  it('should be disabled when disabled prop is true', () => {
    const { getByText } = renderWithProviders(
      <Button disabled>Disabled</Button>
    )
    const button = getByText('Disabled')

    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50 cursor-not-allowed')
  })

  it('should handle click events', async () => {
    const handleClick = vi.fn()
    const { getByText, user } = renderWithProviders(
      <Button onClick={handleClick}>Clickable</Button>
    )

    await user.click(getByText('Clickable'))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('should render with icon', () => {
    const { getByText, container } = renderWithProviders(
      <Button>
        <span className="mr-2">🔍</span>
        Search
      </Button>
    )

    expect(getByText('Search')).toBeInTheDocument()
    expect(container.querySelector('span')).toHaveTextContent('🔍')
  })
})