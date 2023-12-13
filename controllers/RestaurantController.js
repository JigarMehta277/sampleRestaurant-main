const mongoose = require('mongoose');
const connectDB = require("../config/db");
const Restaurant = require('../models/Restaurant');

// Establish a connection with the MongoDB server and initialize the "Restaurant" model
connectDB();

// Create a new restaurant in the collection using the object passed in the "data" parameter
const addNewRestaurant = async (data) => {
  try {
    const newRestaurant = new Restaurant(data);
    await newRestaurant.save();
    console.log('Restaurant added successfully');
  } catch (err) {
    console.error('Error adding restaurant:', err.message);
  }
};


const getAllRestaurants = async (page, perPage, borough) => {
  try {
    const skip = (page - 1) * perPage;
    let query = {};

    if (borough) {
      query = { 'address.borough': borough };
    }

    const restaurants = await Restaurant.find(query)
      .sort({ restaurant_id: 1 })
      .skip(skip)
      .limit(perPage);

    return restaurants;
  } catch (err) {
    console.error('Error fetching restaurants:', err.message);
    return [];
  }
};

// Return a single restaurant object whose "_id" value matches the "Id" parameter
const getRestaurantById = async (id) => {
  try {
    const restaurant = await Restaurant.findById(id);
    return restaurant;
  } catch (err) {
    console.error('Error fetching restaurant by ID:', err.message);
    return null;
  }
};

//.

const updateRestaurantById = async (data, id) => {
  try {
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(id, data, { new: true });
    return updatedRestaurant;
  } catch (err) {
    console.error('Error updating restaurant by ID:', err.message);
    return null;
  }
};

// Delete an existing restaurant whose "_id" value matches the "Id" parameter
const deleteRestaurantById = async (id) => {
  try {
    await Restaurant.findByIdAndDelete(id);
    console.log('Restaurant deleted successfully');
  } catch (err) {
    console.error('Error deleting restaurant by ID:', err.message);
  }
};

//get all the cusins
const getAllCuisines = async () => {
  try {
    const cuisines = await Restaurant.distinct('cuisine');
    return cuisines;
  } catch (error) {
    console.error('Error retrieving cuisines:', error);
    throw error;
  }
};
const getAllRestaurantsByCuisine = async (selectedCuisine, page, perPage) => {
  try {
    const skip = (page - 1) * perPage;
    let query = {};

    if (selectedCuisine) {
      query['cuisine'] = selectedCuisine;
    }

    const restaurants = await Restaurant.find(query)
      .sort({ restaurant_id: 1 })
      .skip(skip)
      .limit(perPage);

    return restaurants;
  } catch (err) {
    console.error('Error fetching restaurants:', err.message);
    return [];
  }
};


module.exports = {
  connectDB,
  addNewRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurantById,
  deleteRestaurantById,
  getAllCuisines,
  getAllRestaurantsByCuisine 
};
