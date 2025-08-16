import React from 'react'

interface WeatherIconProps {
  type: 'sun' | 'cloud' | 'rain' | 'wind' | 'storm'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ type, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const icons = {
    sun: '☀️',
    cloud: '☁️',
    rain: '🌧️',
    wind: '💨',
    storm: '⛈️'
  }

  return (
    <div 
      className={`${sizeClasses[size]} ${className} flex items-center justify-center text-2xl`}
      data-testid="weather-icon"
    >
      {icons[type]}
    </div>
  )
}

export default WeatherIcon
