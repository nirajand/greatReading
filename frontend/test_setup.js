const fs = require('fs')
const path = require('path')

console.log('🔍 Testing Frontend Setup...')
console.log('=' * 50)

const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'tailwind.config.js',
  'postcss.config.js',
  'tsconfig.json',
  'src/App.tsx',
  'src/main.tsx',
  'src/index.css',
  'index.html'
]

const requiredDirs = [
  'src/components',
  'src/pages',
  'src/services',
  'src/contexts'
]

let allPassed = true

console.log('\n📁 Checking required files:')
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file)
  console.log(`${exists ? '✅' : '❌'} ${file}`)
  if (!exists) allPassed = false
})

console.log('\n📁 Checking required directories:')
requiredDirs.forEach(dir => {
  const exists = fs.existsSync(dir)
  console.log(`${exists ? '✅' : '❌'} ${dir}`)
  if (!exists) allPassed = false
})

// Check node_modules
console.log('\n📦 Checking dependencies:')
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const requiredDeps = ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query']
const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies?.[dep])

if (missingDeps.length === 0) {
  console.log('✅ All required dependencies are in package.json')
} else {
  console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`)
  allPassed = false
}

console.log('\n' + '=' * 50)
if (allPassed) {
  console.log('✅ Frontend setup looks good!')
  console.log('\nTo start the frontend:')
  console.log('npm run dev')
  console.log('\nThe app will be available at: http://localhost:5173')
} else {
  console.log('❌ Some setup issues detected.')
  console.log('\nFix the issues above and run: npm install')
}
console.log('=' * 50)
