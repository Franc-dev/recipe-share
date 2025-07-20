import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaInstagram, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold">RecipeShare</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Share your culinary creations and discover amazing recipes from food lovers around the world. 
              Join our community and start your cooking journey today!
            </p>
            <div className="flex space-x-4">
              <button className="text-gray-400 hover:text-white transition-colors">
                <FaGithub className="text-xl" />
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <FaTwitter className="text-xl" />
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram className="text-xl" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-300 hover:text-white transition-colors">
                  Browse Recipes
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/search?category=Breakfast" className="text-gray-300 hover:text-white transition-colors">
                  Breakfast
                </Link>
              </li>
              <li>
                <Link to="/search?category=Lunch" className="text-gray-300 hover:text-white transition-colors">
                  Lunch
                </Link>
              </li>
              <li>
                <Link to="/search?category=Dinner" className="text-gray-300 hover:text-white transition-colors">
                  Dinner
                </Link>
              </li>
              <li>
                <Link to="/search?category=Dessert" className="text-gray-300 hover:text-white transition-colors">
                  Dessert
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 RecipeShare. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            <div className="flex items-center text-gray-400 text-sm">
              Made with <FaHeart className="text-red-500 mx-1" /> for food lovers
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 