const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function createAdminUser() {
  const supabaseUrl = 'https://taprwweemxfbrrkwajnc.supabase.co';
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhcHJ3d2VlbXhmYnJya3dham5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzA2NzMyNCwiZXhwIjoyMDkyNjQzMzI0fQ.qo9CPDxFb9Ht5BP-x3imn-_jb0aoXV-yue_Do8l3WcU';

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const email = 'admin@chanaidrecovery.com';
  const password = 'AdminPassword2024!';

  console.log(`Checking if admin user exists: ${email}`);

  // 1. Create the user if they don't exist
  const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  let adminUser = userList.users.find(u => u.email === email);

  if (!adminUser) {
    console.log('Creating new admin user...');
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin', full_name: 'System Administrator' },
      app_metadata: { role: 'admin' }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return;
    }
    adminUser = user;
    console.log('Admin user created successfully.');
  } else {
    console.log('Admin user already exists. Updating metadata to ensure admin role...');
    const { data: { user }, error: updateError } = await supabase.auth.admin.updateUserById(adminUser.id, {
      user_metadata: { role: 'admin', full_name: 'System Administrator' },
      app_metadata: { role: 'admin' }
    });

    if (updateError) {
      console.error('Error updating user:', updateError);
      return;
    }
    console.log('Admin user metadata updated.');
  }

  console.log('--------------------------------------------------');
  console.log('ADMIN CREDENTIALS FOR TESTING:');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('--------------------------------------------------');
}

createAdminUser();
