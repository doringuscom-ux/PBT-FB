const mongoose = require('mongoose');
const uri = 'mongodb+srv://pbtadkacom_db_user:y6QKjN2Bj6RWIU6f@pbtnews.yfs6iil.mongodb.net/?appName=PBTNews';

mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
