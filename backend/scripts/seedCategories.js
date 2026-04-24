// Script to seed default categories
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');
const User = require('../models/User');

const defaultCategories = [
  {
    name: 'policy',
    displayName: 'Policies',
    description: 'Company policies and guidelines',
    color: '#8B5CF6',
    icon: 'policy'
  },
  {
    name: 'procedure',
    displayName: 'Procedures',
    description: 'Step-by-step procedures and workflows',
    color: '#EC4899',
    icon: 'list_alt'
  },
  {
    name: 'manual',
    displayName: 'Manuals',
    description: 'User manuals and documentation',
    color: '#10B981',
    icon: 'menu_book'
  },
  {
    name: 'report',
    displayName: 'Reports',
    description: 'Business reports and analytics',
    color: '#F59E0B',
    icon: 'assessment'
  },
  {
    name: 'contract',
    displayName: 'Contracts',
    description: 'Legal contracts and agreements',
    color: '#3B82F6',
    icon: 'description'
  },
  {
    name: 'training',
    displayName: 'Training Materials',
    description: 'Educational and training resources',
    color: '#8B5CF6',
    icon: 'school'
  },
  {
    name: 'template',
    displayName: 'Templates',
    description: 'Document templates and forms',
    color: '#6366F1',
    icon: 'content_copy'
  },
  {
    name: 'specification',
    displayName: 'Specifications',
    description: 'Technical specifications and requirements',
    color: '#059669',
    icon: 'engineering'
  },
  {
    name: 'other',
    displayName: 'Other',
    description: 'Miscellaneous documents',
    color: '#6B7280',
    icon: 'folder'
  }
];

async function seedCategories() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get admin user to set as creator
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌ No admin user found. Please run seedAdmin.js first.');
      process.exit(1);
    }

    console.log('👤 Using admin user:', admin.email);
    console.log('📁 Seeding categories...\n');

    let createdCount = 0;
    let skippedCount = 0;

    for (const categoryData of defaultCategories) {
      try {
        // Check if category already exists
        const existingCategory = await Category.findOne({ name: categoryData.name });
        
        if (existingCategory) {
          console.log(`⏭️  Skipped: ${categoryData.displayName} (already exists)`);
          skippedCount++;
          continue;
        }

        // Create new category
        const category = new Category({
          ...categoryData,
          createdBy: admin._id
        });

        await category.save();
        console.log(`✅ Created: ${categoryData.displayName} (${categoryData.name})`);
        createdCount++;
      } catch (error) {
        console.error(`❌ Failed to create ${categoryData.displayName}:`, error.message);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Summary:');
    console.log(`  ✅ Created: ${createdCount} categories`);
    console.log(`  ⏭️  Skipped: ${skippedCount} categories`);
    console.log(`  📁 Total: ${defaultCategories.length} categories`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (createdCount > 0) {
      console.log('✅ Categories seeded successfully!');
      console.log('🎯 Admins can now manage categories in the admin dashboard.');
      console.log('📝 Users will see these categories when uploading documents.\n');
    }

    // Display all categories
    const allCategories = await Category.find().sort({ displayName: 1 });
    console.log('📋 All Categories:');
    allCategories.forEach(cat => {
      console.log(`  • ${cat.displayName} (${cat.name}) - ${cat.color}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal Error:', error);
    process.exit(1);
  }
}

seedCategories();