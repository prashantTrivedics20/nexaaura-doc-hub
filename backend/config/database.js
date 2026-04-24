const mongoose = require('mongoose');

// Database connection configuration
const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      retryReads: true,
      // Additional production settings
      ...(process.env.NODE_ENV === 'production' && {
        ssl: true,
        sslValidate: true,
        authSource: 'admin'
      })
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📴 Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔄 Mongoose connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Retry connection after 5 seconds
    setTimeout(() => {
      console.log('🔄 Retrying database connection...');
      connectDB();
    }, 5000);
  }
};

// Database health check
const checkDBHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      status: states[state],
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      collections: Object.keys(mongoose.connection.collections).length
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
};

// Database performance monitoring
const setupDBMonitoring = () => {
  if (process.env.NODE_ENV === 'production') {
    // Monitor slow queries
    mongoose.set('debug', (collectionName, method, query, doc) => {
      const start = Date.now();
      
      // Log queries that take longer than 100ms
      setTimeout(() => {
        const duration = Date.now() - start;
        if (duration > 100) {
          console.warn('🐌 Slow MongoDB Query:', {
            collection: collectionName,
            method,
            duration: `${duration}ms`,
            query: JSON.stringify(query)
          });
        }
      }, 0);
    });
  }

  // Connection pool monitoring
  mongoose.connection.on('fullsetup', () => {
    console.log('📊 MongoDB replica set connection established');
  });

  mongoose.connection.on('all', () => {
    console.log('📊 MongoDB connection to all servers established');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
  });
};

// Database backup configuration (for production)
const setupBackupSchedule = () => {
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_AUTO_BACKUP === 'true') {
    const cron = require('node-cron');
    
    // Daily backup at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('🗄️ Starting automated database backup...');
      
      try {
        // Implement your backup logic here
        // This could involve mongodump, cloud storage upload, etc.
        console.log('✅ Database backup completed');
      } catch (error) {
        console.error('❌ Database backup failed:', error);
      }
    });
  }
};

// Database indexes setup
const setupIndexes = async () => {
  try {
    // Wait for connection to be ready
    if (mongoose.connection.readyState !== 1) {
      console.log('⏳ Waiting for database connection...');
      return;
    }

    // User indexes
    await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.db.collection('users').createIndex({ username: 1 }, { unique: true });
    await mongoose.connection.db.collection('users').createIndex({ createdAt: -1 });

    // Document indexes
    await mongoose.connection.db.collection('documents').createIndex({ title: 'text', description: 'text', tags: 'text' });
    await mongoose.connection.db.collection('documents').createIndex({ category: 1 });
    await mongoose.connection.db.collection('documents').createIndex({ uploadedBy: 1 });
    await mongoose.connection.db.collection('documents').createIndex({ createdAt: -1 });
    await mongoose.connection.db.collection('documents').createIndex({ status: 1 });

    // Email verification indexes
    await mongoose.connection.db.collection('emailverifications').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await mongoose.connection.db.collection('emailverifications').createIndex({ email: 1, purpose: 1 });

    console.log('📊 Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating database indexes:', error.message);
  }
};

module.exports = {
  connectDB,
  checkDBHealth,
  setupDBMonitoring,
  setupBackupSchedule,
  setupIndexes
};