const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const ATLAS_URI = 'mongodb+srv://bytebudget_user:Byt3Budg3t_us3r@bytebudget.1wa00ze.mongodb.net/bytebudget?appName=ByteBudget';
const LOCAL_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bytebudget';

async function runMigration() {
  console.log('🔄 Connecting to MongoDB Atlas (Source)...');
  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log('✅ Connected to MongoDB Atlas.');

  console.log('📥 Fetching existing users and transactions from cloud database...');
  const users = await atlasConn.db.collection('users').find({}).toArray();
  const transactions = await atlasConn.db.collection('transactions').find({}).toArray();
  
  console.log(`📊 Found ${users.length} users and ${transactions.length} transactions in the cloud.`);
  await atlasConn.close();

  console.log('\n🔄 Connecting to Local MongoDB (Destination)...');
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log('✅ Connected to Local MongoDB.');

  console.log('🧹 Clearing any existing local database records to prevent duplicates...');
  await localConn.db.collection('users').deleteMany({});
  await localConn.db.collection('transactions').deleteMany({});

  if (users.length > 0) {
    console.log(`📤 Copying ${users.length} users to local database...`);
    await localConn.db.collection('users').insertMany(users);
  }
  
  if (transactions.length > 0) {
    console.log(`📤 Copying ${transactions.length} transactions to local database...`);
    await localConn.db.collection('transactions').insertMany(transactions);
  }

  console.log('\n🎉 Success! All data has been successfully migrated to your local database.');
  await localConn.close();
}

runMigration().catch(err => {
  console.error('\n❌ Migration failed:', err);
  process.exit(1);
});
