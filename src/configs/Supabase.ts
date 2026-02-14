import { createClient } from '@supabase/supabase-js'

// Supabase configuration
// These should ideally be set via environment variables
const supabaseURL: string = process.env.REACT_APP_SUPABASE_URL || 'https://csixbcvpmowbodihcklc.supabase.co'
const supabaseKey: string = process.env.REACT_APP_SUPABASE_KEY || 'sb_publishable_glueARuSIkRpBzPdw2wUFw_PuYo9H-7'

// Validate that we have the required configuration
if (!supabaseURL || !supabaseKey) {
	console.error('Supabase configuration is missing. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY environment variables.')
}

// Create Supabase client with proper configuration
// The Supabase JS client automatically adds 'apikey' and 'Authorization' headers
const supabase = createClient(supabaseURL, supabaseKey)

export default supabase