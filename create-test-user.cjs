const { createClient } = require('@supabase/supabase-js');

async function createTestUser() {
  const supabaseUrl = 'https://taprwweemxfbrrkwajnc.supabase.co';
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhcHJ3d2VlbXhmYnJya3dham5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzA2NzMyNCwiZXhwIjoyMDkyNjQzMzI0fQ.qo9CPDxFb9Ht5BP-x3imn-_jb0aoXV-yue_Do8l3WcU';

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const email = 'testuser@example.com';
  const password = 'TestUser123!';

  console.log(`Creating test user: ${email}`);

  const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Test User' }
  });

  if (createError && !createError.message.includes('already exists')) {
    console.error('Error creating user:', createError);
    return;
  }

  console.log('--------------------------------------------------');
  console.log('STANDARD TEST USER CREDENTIALS:');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('--------------------------------------------------');
}

createTestUser();
