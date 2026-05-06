const { createClient } = require('@insforge/sdk');

const insforge = createClient({
  baseUrl: 'https://yb864zby.us-east.insforge.app',
  anonKey: 'ik_01f1d53400ea6f18dd79c37dbef1ee84',
});

const testAccounts = [
  { email: 'test.admin@newspulse.com', password: 'TestAdmin123!', name: 'Test Admin', role: 'admin' },
  { email: 'test.editor@newspulse.com', password: 'TestEditor123!', name: 'Test Editor', role: 'editor' },
  { email: 'test.author@newspulse.com', password: 'TestAuthor123!', name: 'Test Author', role: 'author' },
  { email: 'test.reader@newspulse.com', password: 'TestReader123!', name: 'Test Reader', role: 'reader' },
  { email: 'test.advertiser@newspulse.com', password: 'TestAdvertiser123!', name: 'Test Advertiser', role: 'reader' },
];

async function createTestAccounts() {
  console.log('Creating test accounts...\n');

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

      console.log(`✓ Created: ${account.email}`);
      console.log(`  User ID: ${data?.user?.id}`);
      console.log(`  Requires verification: ${data?.requireEmailVerification}\n`);

    } catch (err) {
      console.error(`Error creating ${account.email}:`, err.message);
    }
  }

  console.log('Done!');
}

createTestAccounts();
