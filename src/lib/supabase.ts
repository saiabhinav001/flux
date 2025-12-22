import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zsppdxcewtrisdpztldv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_uOnqd1nVFCC__1aLpPTB8Q_rJwQ-rWl';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
