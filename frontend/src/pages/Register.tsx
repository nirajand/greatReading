// src/pages/Register.tsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  User, 
  Lock, 
  CheckCircle, 
  Sparkles,
  ArrowRight,
  Shield,
  AlertCircle,
  Check
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import GlassCard from '@/components/GlassCard'
import ParticleBackground from '@/components/ParticleBackground'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Shadcn UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Password strength validation
const passwordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof passwordSchema>

// Password strength checker
const checkPasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  const passedChecks = Object.values(checks).filter(Boolean).length
  const strength = (passedChecks / 5) * 100

  let level = 'weak'
  let color = 'bg-red-500'
  if (strength >= 80) {
    level = 'strong'
    color = 'bg-green-500'
  } else if (strength >= 60) {
    level = 'good'
    color = 'bg-yellow-500'
  } else if (strength >= 40) {
    level = 'fair'
    color = 'bg-orange-500'
  }

  return { checks, strength, level, color }
}

export default function Register() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, level: 'weak', color: 'bg-red-500', checks: {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  }})

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
    mode: 'onChange',
  })

  // Watch password changes to update strength
  const passwordValue = form.watch('password')
  useEffect(() => {
    if (passwordValue) {
      const strength = checkPasswordStrength(passwordValue)
      setPasswordStrength(strength)
    }
  }, [passwordValue])

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      await registerUser(data.email, data.username, data.password)
      
      toast.success('Welcome to Obsidian Glass! 🎉', {
        description: 'Your account has been created successfully.',
        duration: 5000,
        icon: <Sparkles className="w-5 h-5 text-yellow-400" />,
        action: {
          label: 'Sign In',
          onClick: () => navigate('/login'),
        },
      })

      // Animated success state before redirect
      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (error: any) {
      toast.error('Registration failed', {
        description: error.message || 'Please check your information and try again.',
        icon: <AlertCircle className="w-5 h-5" />,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Enhanced Particle Background */}
      <ParticleBackground 
        density={100} 
        interactivity={true}
        theme="dark"
      />

      {/* Animated gradient orbs */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-1/4 -right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
      />

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className="w-full max-w-2xl"
        >
          {/* Progress Steps */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex justify-center mb-8"
          >
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <motion.div
                  key={stepNumber}
                  variants={itemVariants}
                  className="flex flex-col items-center"
                >
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                    step >= stepNumber 
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 border-transparent text-white" 
                      : "border-white/20 text-gray-400"
                  )}>
                    {step > stepNumber ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <span className={cn(
                    "text-sm mt-2",
                    step >= stepNumber ? "text-white" : "text-gray-500"
                  )}>
                    {stepNumber === 1 && 'Account'}
                    {stepNumber === 2 && 'Password'}
                    {stepNumber === 3 && 'Complete'}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Main Card */}
          <GlassCard 
            className="border-white/20 backdrop-blur-xl" 
            blur="strong"
            gradient
          >
            <Card className="border-0 bg-transparent">
              <CardHeader className="space-y-6 pb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-4">
                    {/* Animated glow effect */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-50"
                    />
                    {/* Main logo */}
                    <div className="relative w-20 h-20 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  
                  <CardTitle className="text-3xl font-bold text-center">
                    <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
                      Join Obsidian Glass
                    </span>
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-center max-w-md">
                    Create your personal reading sanctuary and unlock insights into your reading journey
                  </CardDescription>
                </motion.div>

                {/* Security Badge */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center"
                >
                  <Badge variant="outline" className="gap-2 px-4 py-2 border-white/10 bg-white/5">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">End-to-end encrypted</span>
                  </Badge>
                </motion.div>
              </CardHeader>

              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {/* Step 1: Account Details */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        className="space-y-6"
                      >
                        {/* Email */}
                        <div>
                          <Label htmlFor="email" className="text-gray-300 mb-2 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            className={cn(
                              "h-12 bg-white/5 border-white/10 focus:border-purple-500/50",
                              form.formState.errors.email && "border-red-500/50 focus:border-red-500/50"
                            )}
                            {...form.register('email')}
                          />
                          {form.formState.errors.email && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-sm text-red-400 flex items-center gap-2"
                            >
                              <AlertCircle className="w-4 h-4" />
                              {form.formState.errors.email.message}
                            </motion.p>
                          )}
                        </div>

                        {/* Username */}
                        <div>
                          <Label htmlFor="username" className="text-gray-300 mb-2 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Username
                          </Label>
                          <Input
                            id="username"
                            type="text"
                            placeholder="Choose a unique username"
                            className={cn(
                              "h-12 bg-white/5 border-white/10 focus:border-purple-500/50",
                              form.formState.errors.username && "border-red-500/50 focus:border-red-500/50"
                            )}
                            {...form.register('username')}
                          />
                          {form.formState.errors.username && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-sm text-red-400 flex items-center gap-2"
                            >
                              <AlertCircle className="w-4 h-4" />
                              {form.formState.errors.username.message}
                            </motion.p>
                          )}
                          <p className="mt-2 text-sm text-gray-500">
                            This will be your public display name. You can change it later.
                          </p>
                        </div>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="pt-4"
                        >
                          <Button
                            type="button"
                            onClick={() => {
                              const emailValid = form.trigger('email')
                              const usernameValid = form.trigger('username')
                              Promise.all([emailValid, usernameValid]).then(([emailOk, usernameOk]) => {
                                if (emailOk && usernameOk) {
                                  setStep(2)
                                }
                              })
                            }}
                            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 group"
                          >
                            Continue to Password
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Step 2: Password */}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        className="space-y-6"
                      >
                        {/* Password */}
                        <div>
                          <Label htmlFor="password" className="text-gray-300 mb-2 flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Create a strong password"
                              className={cn(
                                "h-12 bg-white/5 border-white/10 focus:border-purple-500/50 pr-10",
                                form.formState.errors.password && "border-red-500/50 focus:border-red-500/50"
                              )}
                              {...form.register('password')}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>

                          {/* Password Strength Meter */}
                          {passwordValue && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="mt-4 space-y-3"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">Password strength:</span>
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "capitalize",
                                    passwordStrength.level === 'strong' && "border-green-500/50 text-green-400",
                                    passwordStrength.level === 'good' && "border-yellow-500/50 text-yellow-400",
                                    passwordStrength.level === 'fair' && "border-orange-500/50 text-orange-400",
                                    passwordStrength.level === 'weak' && "border-red-500/50 text-red-400"
                                  )}
                                >
                                  {passwordStrength.level}
                                </Badge>
                              </div>
                              <Progress 
                                value={passwordStrength.strength} 
                                className={cn(
                                  "h-2",
                                  passwordStrength.level === 'strong' && "[&>div]:bg-green-500",
                                  passwordStrength.level === 'good' && "[&>div]:bg-yellow-500",
                                  passwordStrength.level === 'fair' && "[&>div]:bg-orange-500",
                                  passwordStrength.level === 'weak' && "[&>div]:bg-red-500"
                                )}
                              />

                              {/* Password Requirements */}
                              <div className="grid grid-cols-2 gap-2 mt-3">
                                {Object.entries(passwordStrength.checks).map(([key, passed]) => (
                                  <motion.div
                                    key={key}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={cn(
                                      "flex items-center gap-2 text-sm p-2 rounded",
                                      passed 
                                        ? "text-green-400 bg-green-500/10" 
                                        : "text-gray-500 bg-white/5"
                                    )}
                                  >
                                    <div className={cn(
                                      "w-2 h-2 rounded-full",
                                      passed ? "bg-green-500" : "bg-gray-600"
                                    )} />
                                    <span className="capitalize">
                                      {key === 'length' && 'At least 8 characters'}
                                      {key === 'uppercase' && 'Uppercase letter'}
                                      {key === 'lowercase' && 'Lowercase letter'}
                                      {key === 'number' && 'Number'}
                                      {key === 'special' && 'Special character'}
                                    </span>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                          
                          {form.formState.errors.password && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-sm text-red-400 flex items-center gap-2"
                            >
                              <AlertCircle className="w-4 h-4" />
                              {form.formState.errors.password.message}
                            </motion.p>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <Label htmlFor="confirmPassword" className="text-gray-300 mb-2">
                            Confirm Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirm your password"
                              className={cn(
                                "h-12 bg-white/5 border-white/10 focus:border-purple-500/50 pr-10",
                                form.formState.errors.confirmPassword && "border-red-500/50 focus:border-red-500/50"
                              )}
                              {...form.register('confirmPassword')}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          {form.formState.errors.confirmPassword && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-sm text-red-400 flex items-center gap-2"
                            >
                              <AlertCircle className="w-4 h-4" />
                              {form.formState.errors.confirmPassword.message}
                            </motion.p>
                          )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-3 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep(1)}
                            className="flex-1 h-12 border-white/10 hover:bg-white/5"
                          >
                            Back
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              const passwordValid = form.trigger('password')
                              const confirmValid = form.trigger('confirmPassword')
                              Promise.all([passwordValid, confirmValid]).then(([passOk, confirmOk]) => {
                                if (passOk && confirmOk) {
                                  setStep(3)
                                }
                              })
                            }}
                            className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          >
                            Continue
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Terms & Submit */}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        className="space-y-6"
                      >
                        {/* Terms and Conditions */}
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                const currentValue = form.getValues('terms')
                                form.setValue('terms', !currentValue, { shouldValidate: true })
                              }}
                              className={cn(
                                "flex items-center justify-center w-5 h-5 mt-1 rounded border transition-colors",
                                form.watch('terms') 
                                  ? "bg-purple-500 border-purple-500" 
                                  : "border-white/20 bg-transparent",
                                form.formState.errors.terms && "border-red-500"
                              )}
                            >
                              {form.watch('terms') && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </button>
                            
                            <Label 
                              htmlFor="terms-checkbox" 
                              className={cn(
                                "text-sm cursor-pointer flex-1",
                                form.formState.errors.terms ? "text-red-400" : "text-gray-300"
                              )}
                              onClick={() => {
                                const currentValue = form.getValues('terms')
                                form.setValue('terms', !currentValue, { shouldValidate: true })
                              }}
                            >
                              I agree to the{' '}
                              <Link to="/terms" className="text-purple-400 hover:text-purple-300 hover:underline">
                                Terms of Service
                              </Link>{' '}
                              and{' '}
                              <Link to="/privacy" className="text-purple-400 hover:text-purple-300 hover:underline">
                                Privacy Policy
                              </Link>
                              . I understand that Obsidian Glass will store my reading progress and analytics to provide personalized insights.
                            </Label>
                          </div>
                          
                          {/* Hidden input for form submission */}
                          <input
                            type="checkbox"
                            id="terms-checkbox"
                            {...form.register('terms')}
                            className="hidden"
                          />
                          
                          {form.formState.errors.terms && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-sm text-red-400 flex items-center gap-2"
                            >
                              <AlertCircle className="w-4 h-4" />
                              {form.formState.errors.terms.message}
                            </motion.p>
                          )}
                        </div>

                        {/* Benefits List */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-3"
                        >
                          {[
                            { icon: Sparkles, text: 'Personalized reading insights' },
                            { icon: Shield, text: 'End-to-end encrypted data' },
                            { icon: CheckCircle, text: 'Cross-device synchronization' },
                            { icon: User, text: 'Custom reading goals' },
                          ].map((benefit, index) => (
                            <motion.div
                              key={benefit.text}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 * index }}
                              className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                            >
                              <benefit.icon className="w-5 h-5 text-purple-400" />
                              <span className="text-sm text-gray-300">{benefit.text}</span>
                            </motion.div>
                          ))}
                        </motion.div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-3 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep(2)}
                            className="flex-1 h-12 border-white/10 hover:bg-white/5"
                          >
                            Back
                          </Button>
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                              "flex-1 h-12 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700",
                              isLoading && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {isLoading ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                  className="mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                                />
                                Creating account...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-5 w-5" />
                                Create Account
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </CardContent>

              <Separator className="bg-white/10" />

              <CardFooter className="flex flex-col pt-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center w-full"
                >
                  <p className="text-gray-400">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="text-purple-400 hover:text-purple-300 font-medium hover:underline transition-colors group inline-flex items-center"
                    >
                      Sign in here
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </p>
                  <p className="text-sm text-gray-500 mt-3">
                    By creating an account, you agree to our Terms and Privacy Policy
                  </p>
                </motion.div>
              </CardFooter>
            </Card>
          </GlassCard>

          {/* Feature Highlights */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              { title: 'Smart Analytics', desc: 'Track reading habits with detailed insights' },
              { title: 'Privacy Focused', desc: 'Your data stays encrypted and private' },
              { title: 'Multi-Device Sync', desc: 'Continue reading anywhere, anytime' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="text-center p-4 bg-white/5 rounded-lg backdrop-blur-sm"
              >
                <h4 className="font-medium text-gray-300">{feature.title}</h4>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}