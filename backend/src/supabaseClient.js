// Supabase client setup for backend
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lwyyjdzwzhetwrkdzjdx.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3eXlqZHp3emhldHdya2R6amR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMjQ5NjAsImV4cCI6MjA2ODYwMDk2MH0.TUBcjwOZyqPpAM4z3vB9iJ7xW0Ct3U16noQzZOmjp_w';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = supabase;
