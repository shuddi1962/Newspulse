const { createClient } = require('@insforge/sdk');

const insforge = createClient({
  baseUrl: 'https://yb864zby.us-east.insforge.app',
  anonKey: 'ik_01f1d53400ea6f18dd79c37dbef1ee84',
  serviceKey: 'sk_01f1d53400ea6f18dd79c37dbef1ee84'
});

async function createTestAccounts() {
  const accounts = [
    { email: 'goodnewsonyematara2020+admin@gmail.com', password: 'AdminPass123!', name: 'Admin User' },
    { email: 'goodnewsonyematara2020+editor@gmail.com', password: 'EditorPass123!', name: 'Editor User' },
    { email: 'goodnewsonyematara2020+author@gmail.com', password: 'AuthorPass123!', name: 'Author User' },
    { email: 'goodnewsonyematara2020+reader@gmail.com', password: 'ReaderPass123!', name: 'Reader User' },
    { email: 'goodnewsonyematara2020+advertiser@gmail.com', password: 'AdsPass123!', name: 'Advertiser User' }
  ];

  for (const acc of accounts) {
    try {
      const { data, error } = await insforge.auth.signUp({
        email: acc.email,
        password: acc.password,
        name: acc.name
      });
      
      if (error) {
        console.log(`${acc.email}: ERROR - ${error.message}`);
      } else {
        console.log(`${acc.email}: CREATED - ${data?.user?.id}`);
      }
    } catch (e) {
      console.log(`${acc.email}: EXCEPTION - ${e.message}`);
    }
  }
}

createTestAccounts();
