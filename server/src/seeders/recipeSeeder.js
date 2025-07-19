/* eslint-disable @typescript-eslint/no-require-imports */
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const sampleUsers = [
  {
    username: 'chef_sarah',
    email: 'sarah@example.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    bio: 'Professional chef with 10+ years of experience. Love creating healthy and delicious meals!',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    username: 'foodie_mike',
    email: 'mike@example.com',
    password: 'password123',
    firstName: 'Mike',
    lastName: 'Chen',
    bio: 'Home cook passionate about Asian cuisine and fusion dishes.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    username: 'baking_anna',
    email: 'anna@example.com',
    password: 'password123',
    firstName: 'Anna',
    lastName: 'Rodriguez',
    bio: 'Pastry chef and baking enthusiast. Sweet treats are my specialty!',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  },
  {
    username: 'vegan_dave',
    email: 'dave@example.com',
    password: 'password123',
    firstName: 'David',
    lastName: 'Thompson',
    bio: 'Plant-based cooking advocate. Making vegan food delicious and accessible.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    username: 'italian_maria',
    email: 'maria@example.com',
    password: 'password123',
    firstName: 'Maria',
    lastName: 'Santini',
    bio: 'Italian grandmother teaching traditional family recipes.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
  }
];

const sampleRecipes = [
  {
    title: "Classic Margherita Pizza",
    description: "A traditional Italian pizza with fresh mozzarella, basil, and tomato sauce. Simple yet delicious!",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&h=400&fit=crop",
    prepTime: 30,
    cookTime: 15,
    servings: 4,
    difficulty: "Medium",
    cuisine: "Italian",
    category: "Dinner",
    ingredients: [
      { name: "Pizza dough", amount: "1", unit: "ball" },
      { name: "Fresh mozzarella", amount: "8", unit: "oz" },
      { name: "Fresh basil leaves", amount: "1/2", unit: "cup" },
      { name: "Tomato sauce", amount: "1/2", unit: "cup" },
      { name: "Olive oil", amount: "2", unit: "tbsp" },
      { name: "Salt", amount: "1", unit: "tsp" }
    ],
    instructions: [
      { step: 1, description: "Preheat oven to 500°F (260°C) with a pizza stone if available." },
      { step: 2, description: "Roll out the pizza dough on a floured surface to desired thickness." },
      { step: 3, description: "Spread tomato sauce evenly over the dough, leaving a border for the crust." },
      { step: 4, description: "Tear mozzarella into pieces and distribute over the sauce." },
      { step: 5, description: "Bake for 12-15 minutes until crust is golden and cheese is bubbly." },
      { step: 6, description: "Remove from oven and top with fresh basil leaves. Drizzle with olive oil and serve." }
    ],
    isPublic: true,
    isFeatured: true
  },
  {
    title: "Chocolate Chip Cookies",
    description: "Soft and chewy chocolate chip cookies that are perfect for any occasion. A family favorite!",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&h=400&fit=crop",
    prepTime: 15,
    cookTime: 12,
    servings: 24,
    difficulty: "Easy",
    cuisine: "American",
    category: "Dessert",
    ingredients: [
      { name: "All-purpose flour", amount: "2 1/4", unit: "cups" },
      { name: "Butter", amount: "1", unit: "cup" },
      { name: "Brown sugar", amount: "3/4", unit: "cup" },
      { name: "White sugar", amount: "3/4", unit: "cup" },
      { name: "Eggs", amount: "2", unit: "large" },
      { name: "Vanilla extract", amount: "2", unit: "tsp" },
      { name: "Chocolate chips", amount: "2", unit: "cups" },
      { name: "Baking soda", amount: "1", unit: "tsp" },
      { name: "Salt", amount: "1", unit: "tsp" }
    ],
    instructions: [
      { step: 1, description: "Preheat oven to 375°F (190°C). Line baking sheets with parchment paper." },
      { step: 2, description: "Cream together butter, brown sugar, and white sugar until light and fluffy." },
      { step: 3, description: "Beat in eggs one at a time, then stir in vanilla extract." },
      { step: 4, description: "In a separate bowl, whisk together flour, baking soda, and salt." },
      { step: 5, description: "Gradually mix dry ingredients into wet ingredients until just combined." },
      { step: 6, description: "Fold in chocolate chips." },
      { step: 7, description: "Drop rounded tablespoons of dough onto prepared baking sheets." },
      { step: 8, description: "Bake for 10-12 minutes until edges are golden brown. Cool on baking sheets for 5 minutes." }
    ],
    isPublic: true,
    isFeatured: true
  },
  {
    title: "Thai Green Curry",
    description: "A fragrant and creamy Thai green curry with vegetables and your choice of protein. Spicy and delicious!",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&h=400&fit=crop",
    prepTime: 20,
    cookTime: 25,
    servings: 4,
    difficulty: "Medium",
    cuisine: "Thai",
    category: "Dinner",
    ingredients: [
      { name: "Green curry paste", amount: "3", unit: "tbsp" },
      { name: "Coconut milk", amount: "2", unit: "cans" },
      { name: "Chicken breast", amount: "1", unit: "lb" },
      { name: "Bamboo shoots", amount: "1", unit: "can" },
      { name: "Thai basil", amount: "1/2", unit: "cup" },
      { name: "Fish sauce", amount: "2", unit: "tbsp" },
      { name: "Palm sugar", amount: "1", unit: "tbsp" },
      { name: "Thai chilies", amount: "4", unit: "pieces" }
    ],
    instructions: [
      { step: 1, description: "Heat oil in a large wok or pot over medium heat." },
      { step: 2, description: "Add green curry paste and fry for 1-2 minutes until fragrant." },
      { step: 3, description: "Pour in coconut milk and bring to a gentle simmer." },
      { step: 4, description: "Add chicken pieces and cook for 8-10 minutes until cooked through." },
      { step: 5, description: "Add bamboo shoots and simmer for 5 minutes." },
      { step: 6, description: "Season with fish sauce and palm sugar to taste." },
      { step: 7, description: "Garnish with Thai basil and serve with steamed rice." }
    ],
    isPublic: true,
    isFeatured: true
  },
  {
    title: "Avocado Toast",
    description: "A healthy and delicious breakfast option with creamy avocado, perfectly seasoned and topped with fresh ingredients.",
    image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=600&h=400&fit=crop",
    prepTime: 10,
    cookTime: 5,
    servings: 2,
    difficulty: "Easy",
    cuisine: "International",
    category: "Breakfast",
    ingredients: [
      { name: "Sourdough bread", amount: "4", unit: "slices" },
      { name: "Ripe avocados", amount: "2", unit: "medium" },
      { name: "Lemon juice", amount: "1", unit: "tbsp" },
      { name: "Red pepper flakes", amount: "1/4", unit: "tsp" },
      { name: "Salt", amount: "1/4", unit: "tsp" },
      { name: "Black pepper", amount: "1/4", unit: "tsp" },
      { name: "Microgreens", amount: "1/2", unit: "cup" },
      { name: "Cherry tomatoes", amount: "8", unit: "pieces" }
    ],
    instructions: [
      { step: 1, description: "Toast the bread until golden brown and crispy." },
      { step: 2, description: "In a bowl, mash the avocados with a fork until smooth but still chunky." },
      { step: 3, description: "Add lemon juice, salt, pepper, and red pepper flakes to the avocado." },
      { step: 4, description: "Spread the avocado mixture evenly on each slice of toast." },
      { step: 5, description: "Top with microgreens and halved cherry tomatoes." },
      { step: 6, description: "Serve immediately while the toast is still warm and crispy." }
    ],
    isPublic: true,
    isFeatured: false
  },
  {
    title: "Beef Tacos",
    description: "Authentic Mexican beef tacos with homemade tortillas and fresh salsa. Perfect for taco night!",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop",
    prepTime: 25,
    cookTime: 20,
    servings: 6,
    difficulty: "Medium",
    cuisine: "Mexican",
    category: "Dinner",
    ingredients: [
      { name: "Ground beef", amount: "1", unit: "lb" },
      { name: "Corn tortillas", amount: "12", unit: "pieces" },
      { name: "Onion", amount: "1", unit: "medium" },
      { name: "Garlic", amount: "3", unit: "cloves" },
      { name: "Taco seasoning", amount: "2", unit: "tbsp" },
      { name: "Lime", amount: "2", unit: "pieces" },
      { name: "Cilantro", amount: "1/2", unit: "cup" },
      { name: "Cheese", amount: "1", unit: "cup" }
    ],
    instructions: [
      { step: 1, description: "Heat oil in a large skillet over medium-high heat." },
      { step: 2, description: "Add diced onion and cook until softened, about 5 minutes." },
      { step: 3, description: "Add ground beef and cook until browned, breaking it up with a spoon." },
      { step: 4, description: "Add minced garlic and taco seasoning, cook for 2 minutes." },
      { step: 5, description: "Warm tortillas in a dry skillet or microwave." },
      { step: 6, description: "Fill tortillas with beef mixture and top with cheese, cilantro, and lime juice." }
    ],
    isPublic: true,
    isFeatured: false
  },
  {
    title: "Caesar Salad",
    description: "A classic Caesar salad with crisp romaine lettuce, homemade dressing, and crunchy croutons.",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&h=400&fit=crop",
    prepTime: 15,
    cookTime: 10,
    servings: 4,
    difficulty: "Easy",
    cuisine: "Italian",
    category: "Salad",
    ingredients: [
      { name: "Romaine lettuce", amount: "2", unit: "heads" },
      { name: "Parmesan cheese", amount: "1/2", unit: "cup" },
      { name: "Croutons", amount: "2", unit: "cups" },
      { name: "Anchovy fillets", amount: "4", unit: "pieces" },
      { name: "Garlic", amount: "2", unit: "cloves" },
      { name: "Lemon juice", amount: "2", unit: "tbsp" },
      { name: "Olive oil", amount: "1/4", unit: "cup" },
      { name: "Black pepper", amount: "1/2", unit: "tsp" }
    ],
    instructions: [
      { step: 1, description: "Wash and chop romaine lettuce into bite-sized pieces." },
      { step: 2, description: "In a bowl, mash anchovies and garlic into a paste." },
      { step: 3, description: "Whisk in lemon juice, olive oil, and black pepper to make dressing." },
      { step: 4, description: "Toss lettuce with dressing until well coated." },
      { step: 5, description: "Add croutons and shaved parmesan cheese." },
      { step: 6, description: "Serve immediately while the lettuce is crisp." }
    ],
    isPublic: true,
    isFeatured: false
  },
  {
    title: "Smoothie Bowl",
    description: "A vibrant and nutritious smoothie bowl topped with fresh fruits, granola, and seeds. Perfect for a healthy breakfast!",
    image: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=600&h=400&fit=crop",
    prepTime: 10,
    cookTime: 0,
    servings: 2,
    difficulty: "Easy",
    cuisine: "International",
    category: "Breakfast",
    ingredients: [
      { name: "Frozen berries", amount: "2", unit: "cups" },
      { name: "Banana", amount: "1", unit: "ripe" },
      { name: "Greek yogurt", amount: "1/2", unit: "cup" },
      { name: "Honey", amount: "2", unit: "tbsp" },
      { name: "Granola", amount: "1/2", unit: "cup" },
      { name: "Fresh fruits", amount: "1", unit: "cup" },
      { name: "Chia seeds", amount: "2", unit: "tbsp" }
    ],
    instructions: [
      { step: 1, description: "Blend frozen berries, banana, yogurt, and honey until smooth." },
      { step: 2, description: "Pour the smoothie into bowls." },
      { step: 3, description: "Top with granola, fresh fruits, and chia seeds." },
      { step: 4, description: "Serve immediately with a spoon." }
    ],
    isPublic: true,
    isFeatured: false
  },
  {
    title: "Pasta Carbonara",
    description: "A classic Italian pasta dish with eggs, cheese, pancetta, and black pepper. Simple ingredients, incredible flavor!",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=600&h=400&fit=crop",
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    difficulty: "Medium",
    cuisine: "Italian",
    category: "Dinner",
    ingredients: [
      { name: "Spaghetti", amount: "1", unit: "lb" },
      { name: "Pancetta", amount: "8", unit: "oz" },
      { name: "Eggs", amount: "4", unit: "large" },
      { name: "Parmesan cheese", amount: "1", unit: "cup" },
      { name: "Black pepper", amount: "2", unit: "tsp" },
      { name: "Salt", amount: "1", unit: "tsp" }
    ],
    instructions: [
      { step: 1, description: "Cook spaghetti in salted boiling water until al dente." },
      { step: 2, description: "Meanwhile, cook diced pancetta in a large skillet until crispy." },
      { step: 3, description: "In a bowl, whisk together eggs, grated parmesan, and black pepper." },
      { step: 4, description: "Drain pasta, reserving 1 cup of pasta water." },
      { step: 5, description: "Add hot pasta to the skillet with pancetta." },
      { step: 6, description: "Remove from heat and quickly stir in egg mixture, adding pasta water as needed." },
      { step: 7, description: "Serve immediately with extra parmesan and black pepper." }
    ],
    isPublic: true,
    isFeatured: true
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Recipe.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`Created user: ${savedUser.username}`);
    }

    // Create recipes and assign to users
    for (let i = 0; i < sampleRecipes.length; i++) {
      const recipeData = sampleRecipes[i];
      const author = createdUsers[i % createdUsers.length]; // Distribute recipes among users
      
      const recipe = new Recipe({
        ...recipeData,
        author: author._id
      });
      
      const savedRecipe = await recipe.save();
      console.log(`Created recipe: ${savedRecipe.title}`);
      
      // Add recipe to user's myRecipes array
      author.myRecipes.push(savedRecipe._id);
      await author.save();
    }

    // Add some reviews and likes
    for (const recipe of await Recipe.find()) {
      // Add some random likes
      const randomUsers = createdUsers.sort(() => 0.5 - Math.random()).slice(0, 3);
      recipe.likes = randomUsers.map(user => user._id);
      
      // Add some random reviews
      const reviewUsers = createdUsers.sort(() => 0.5 - Math.random()).slice(0, 2);
      recipe.reviews = reviewUsers.map(user => ({
        user: user._id,
        rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
        comment: `Great recipe! Loved it. - ${user.firstName}`
      }));
      
      await recipe.save();
    }

    console.log('✅ Database seeded successfully!');
    console.log(`Created ${createdUsers.length} users`);
    console.log(`Created ${sampleRecipes.length} recipes`);
    
    // Display sample data
    console.log('\n📊 Sample Data Created:');
    console.log('Users:', createdUsers.map(u => u.username).join(', '));
    console.log('Recipes:', sampleRecipes.map(r => r.title).join(', '));
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase; 