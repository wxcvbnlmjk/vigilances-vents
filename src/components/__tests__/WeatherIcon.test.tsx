import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import WeatherIcon from '../WeatherIcon'

describe('WeatherIcon', () => {
  it('renders the correct icon for each weather type', () => {
    const { rerender } = render(<WeatherIcon type="sun" />)
    expect(screen.getByText('☀️')).toBeInTheDocument()

    rerender(<WeatherIcon type="cloud" />)
    expect(screen.getByText('☁️')).toBeInTheDocument()

    rerender(<WeatherIcon type="rain" />)
    expect(screen.getByText('🌧️')).toBeInTheDocument()

    rerender(<WeatherIcon type="wind" />)
    expect(screen.getByText('💨')).toBeInTheDocument()

    rerender(<WeatherIcon type="storm" />)
    expect(screen.getByText('⛈️')).toBeInTheDocument()
  })

  it('applies the correct size classes', () => {
    const { rerender } = render(<WeatherIcon type="sun" size="sm" />)
    expect(screen.getByTestId('weather-icon')).toHaveClass('w-6 h-6')

    rerender(<WeatherIcon type="sun" size="md" />)
    expect(screen.getByTestId('weather-icon')).toHaveClass('w-8 h-8')

    rerender(<WeatherIcon type="sun" size="lg" />)
    expect(screen.getByTestId('weather-icon')).toHaveClass('w-12 h-12')
  })

  it('applies custom className', () => {
    render(<WeatherIcon type="sun" className="custom-class" />)
    expect(screen.getByTestId('weather-icon')).toHaveClass('custom-class')
  })
})
