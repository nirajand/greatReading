import { useEffect, useRef } from 'react'
import { loadSlim } from 'tsparticles-slim'
import Particles from 'react-particles'
import type { Engine, Container } from 'tsparticles-engine'

interface ParticleBackgroundProps {
  density?: number
  interactivity?: boolean
  theme?: 'light' | 'dark'
  className?: string
}

export default function ParticleBackground({
  density = 80,
  interactivity = true,
  theme = 'dark',
  className = '',
}: ParticleBackgroundProps) {
  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine)
  }

  return (
    <Particles
      id="tsparticles"
      className={`absolute inset-0 z-0 ${className}`}
      init={particlesInit}
      options={{
        background: {
          color: {
            value: "transparent",
          },
        },
        fpsLimit: 120,
        interactivity: {
          events: {
            onHover: {
              enable: interactivity,
              mode: "grab",
            },
            onClick: {
              enable: true,
              mode: "push",
            },
          },
          modes: {
            grab: {
              distance: 140,
              links: {
                opacity: 0.3,
              },
            },
            push: {
              quantity: 4,
            },
          },
        },
        particles: {
          color: {
            value: theme === 'dark' 
              ? ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B"] 
              : ["#7C3AED", "#2563EB", "#059669", "#D97706"],
          },
          links: {
            color: theme === 'dark' ? "#4B5563" : "#9CA3AF",
            distance: 150,
            enable: true,
            opacity: 0.2,
            width: 1,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            speed: 1,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: density,
          },
          opacity: {
            value: 0.3,
            animation: {
              enable: true,
              speed: 1,
              minimumValue: 0.1,
            },
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 3 },
            animation: {
              enable: true,
              speed: 4,
              minimumValue: 0.1,
            },
          },
        },
        detectRetina: true,
      }}
    />
  )
}