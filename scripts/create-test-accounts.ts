import { createClient } from '@insforge/sdk';

const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
});

const testAccounts = [
  { email: 'test.admin@newspulse.com', password: 'TestAdmin123!', name: 'Test Admin', role: 'admin' },
  { email: 'test.editor@newspulse.com', password: 'TestEditor123!', name: 'Test Editor', role: 'editor' },
  { email: 'test.author@newspulse.com', password: 'TestAuthor123!', name: 'Test Author', role: 'author' },
  { email: 'test.reader@newspulse.com', password: 'TestReader123!', name: 'Test Reader', role: 'reader' },
  { email: 'test.advertiser@newspulse.com', password: 'TestAdvertiser123!', name: 'Test Advertiser', role: 'reader' },
];

async function createTestAccounts() {
  for (const account of testAccounts) {
    try {
      console.log(`Creating account: ${account.email}...`);
      const { data, error } = await insforge.auth.signUp({
        email: account.email,
        password: account.password,
        name: account.name,
      });

      if (error) {
        console.error(`Failed to create ${account.email}:`, error.message);
        continue;
      }

      console.log(`Created: ${account.email} - User ID: ${data?.user?.id}`);

      // Update role in profiles table
      if (data?.user?.id) {
        const { error: profileError } = await insforge
          .from('profiles')
          .update({ role: account.role })
          .eq('id', data.user.id);

        if (profileError) {
          console.error(`Failed to update role for ${account.email}:`, profileError);
        } else {
          console.log(`Updated role to ${account.role} for ${account.email}`);
        }
      }
    } catch (err) {
      console.error(`Error creating ${account.email}:`, err);
    }
  }
}

createTestAccounts();
