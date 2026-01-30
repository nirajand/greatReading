import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LogIn, Sparkles, BookOpen } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import GlassCard from '@/components/GlassCard'
import ParticleBackground from '@/components/ParticleBackground'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

// Shadcn UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: localStorage.getItem('rememberedUsername') || '',
      password: '',
      rememberMe: false,
    },
  })

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard')
    }
  }, [navigate])

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await login(data.username, data.password, data.rememberMe)
      toast.success('Welcome back!', {
        description: 'Successfully signed in to your account',
        icon: <Sparkles className="w-4 h-4" />,
      })
      navigate('/dashboard')
    } catch (error) {
      toast.error('Authentication failed', {
        description: 'Please check your credentials and try again',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      <ParticleBackground density={60} />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex min-h-screen items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-full max-w-md"
        >
          <GlassCard gradient className="border-white/20">
            <Card className="border-0 bg-transparent">
              <CardHeader className="space-y-4 text-center">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-lg opacity-50" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                      <BookOpen className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
                    Obsidian Glass
                  </CardTitle>
                  <CardDescription className="text-gray-400 mt-2">
                    Sign in to your reading sanctuary
                  </CardDescription>
                </motion.div>
              </CardHeader>

              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Label htmlFor="username" className="text-gray-300">
                        Username
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="username"
                          type="text"
                          placeholder="Enter your username"
                          className="pl-10 bg-white/5 border-white/15 focus:border-purple-500/50 focus:ring-purple-500/20 h-12"
                          {...form.register('username')}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <div className="w-5 h-5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-sm" />
                        </div>
                      </div>
                      {form.formState.errors.username && (
                        <p className="mt-1 text-sm text-red-400">
                          {form.formState.errors.username.message}
                        </p>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Label htmlFor="password" className="text-gray-300">
                        Password
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="pl-10 pr-10 bg-white/5 border-white/15 focus:border-purple-500/50 focus:ring-purple-500/20 h-12"
                          {...form.register('password')}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-sm" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {form.formState.errors.password && (
                        <p className="mt-1 text-sm text-red-400">
                          {form.formState.errors.password.message}
                        </p>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="rememberMe"
                          className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                          {...form.register('rememberMe')}
                        />
                        <Label htmlFor="rememberMe" className="text-sm text-gray-400 cursor-pointer">
                          Remember me
                        </Label>
                      </div>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-medium py-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <LogIn className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                          Sign In
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>

              <CardFooter className="flex flex-col">
                <div className="relative w-full py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-900 px-3 text-gray-500">New to Obsidian Glass?</span>
                  </div>
                </div>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    asChild
                    className="w-full bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 h-12"
                  >
                    <Link to="/register">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create an account
                    </Link>
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>
          </GlassCard>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-center text-sm text-gray-500"
          >
            <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}