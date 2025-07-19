#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🌱 Seeding RecipeShare database...\n');

// Run the seeder
const seeder = spawn('node', ['src/seeders/recipeSeeder.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit'
});

seeder.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Database seeded successfully!');
    console.log('\n🎉 Your RecipeShare app now has sample data!');
    console.log('\n📝 Sample Users (password: password123):');
    console.log('- chef_sarah@example.com');
    console.log('- mike@example.com');
    console.log('- anna@example.com');
    console.log('- dave@example.com');
    console.log('- maria@example.com');
    console.log('\n🍽️ Sample Recipes:');
    console.log('- Classic Margherita Pizza');
    console.log('- Chocolate Chip Cookies');
    console.log('- Thai Green Curry');
    console.log('- Avocado Toast');
    console.log('- Beef Tacos');
    console.log('- Caesar Salad');
    console.log('- Smoothie Bowl');
    console.log('- Pasta Carbonara');
  } else {
    console.error('\n❌ Failed to seed database');
    process.exit(1);
  }
}); 