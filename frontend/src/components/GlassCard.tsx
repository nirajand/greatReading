import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  blur?: 'light' | 'medium' | 'strong'
  hover?: boolean
  gradient?: boolean
}

export default function GlassCard({ 
  children, 
  className, 
  blur = 'medium', 
  hover = true,
  gradient = false,
  ...props 
}: GlassCardProps) {
  const blurMap = {
    light: 'backdrop-blur-sm',
    medium: 'backdrop-blur-md',
    strong: 'backdrop-blur-lg'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={hover ? { y: -4, transition: { type: "spring", stiffness: 300 } } : undefined}
      className={cn(
        'relative overflow-hidden rounded-xl border bg-gradient-to-br from-white/5 to-white/[0.02] p-6',
        blurMap[blur],
        gradient && 'border-purple-500/20',
        hover && 'transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10',
        className
      )}
      {...props}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}