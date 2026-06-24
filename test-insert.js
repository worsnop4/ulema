import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env', 'utf-8')
const env = Object.fromEntries(envFile.split('\n').filter(Boolean).map(line => line.split('=')))
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

async function test() {
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr) {
    console.log("Can't test without user, trying to log in...")
    // Wait, we need an active session. But I can't log in from the script without credentials.
  }
}
test()
