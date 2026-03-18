import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Supabase admin client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))

app.use(express.json())

// Health check endpoint (required by Render)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Example API route
app.get('/api/status', async (_req, res) => {
  try {
    // Test Supabase connection
    const { error } = await supabase.from('_test').select('*').limit(1)
    res.json({
      api: 'ok',
      supabase: error ? 'error' : 'connected',
    })
  } catch {
    res.json({ api: 'ok', supabase: 'not configured' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
