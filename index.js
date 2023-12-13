
const express = require("express");
const bodyParser = require('body-parser');
const connectDB = require("./config/db");
const path = require("path");
const app = express();
const exphbs = require("express-handlebars");
const cookieParser = require('cookie-parser');
const { authenticateJWT } = require('./Middleware/authMiddleware');

app.use(bodyParser.urlencoded({ extended: "true" })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: "application/vnd.api+json" })); // parse application/vnd.api+json as json

//seting th etamplate engine
app.engine(".hbs", exphbs.engine({ extname: ".hbs" ,}));
app.set('view engine', 'hbs');


//Connect Database
connectDB();

const {
  addNewRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurantById,
  deleteRestaurantById,
  getAllCuisines,
  getAllRestaurantsByCuisine 
} = require('./controllers/RestaurantController');
const{
  registerUser, loginUser
}= require('./controllers/UserController');
const e = require("cors");

app.use(bodyParser.json());

app.use(cookieParser());

//helper hbs
const Handlebars = require('handlebars');
Handlebars.registerHelper('formatDate', (date) => {
  return date ? new Date(date).toLocaleDateString() : 'N/A';
});

const navigationMiddleware = (req, res, next) => {
  const navLinks = [
    { text: 'Home', url: '/' },
    { text: 'Register', url: '/api/register' },
    { text: 'Login', url: '/' },
    { text: 'List Restaurants', url: '/api/restaurants' },
    { text: 'Search Cuisine', url: '/selectCusin' },
    // Add more navigation links as needed
  ];

  res.locals.navLinks = navLinks;
  next();
};

// Apply navigation middleware to all routes
app.use(navigationMiddleware);

//Rooute to register user
app.get('/api/register', (req, res) =>{
  res.render("register");
})
app.post('/api/register', (req, res) => registerUser(req, res));

app.get('/login', (req, res) =>{
  res.render("login");
})
app.get('/', (req, res) =>{
  res.redirect("/api/restaurants");
})
// Route for user login
app.post('/api/login', (req, res) => loginUser(req, res));


// Route to add a new restaurant
app.post('/api/restaurants',async (req, res) => {
  try {
    await addNewRestaurant(req.body);
    res.status(201).json({ message: 'Restaurant added successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to get all restaurants with optional query parameters
app.get('/api/restaurants', async (req, res) => {
  try {
    const { page, perPage, borough } = req.query;
    const restaurants = await getAllRestaurants(Number(page), Number(perPage), borough);
    const first50Restaurants = restaurants.slice(0, 50);
    const jsonData =JSON.parse(JSON.stringify(first50Restaurants));
    res.setHeader('Content-Type', 'text/html');
    res.render("ListRestaurant",{ pageTitle: 'Restaurant List', restaurants: jsonData });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to get a specific restaurant by ID
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await getRestaurantById(req.params.id);
    if (!restaurant) {
      res.status(404).json({ message: 'Restaurant not found' });
    } else {
      const jsonData =JSON.parse(JSON.stringify(restaurant));
      res.render("Details",{ pageTitle: 'Restaurant List', restaurant: jsonData });;
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get("/api/restaurants/edit/:id",async (req,res)=>{
  const restaurant = await getRestaurantById(req.params.id);
    if (!restaurant) {
      res.status(404).json({ message: 'Restaurant not found' });
    } else {
      const jsonData =JSON.parse(JSON.stringify(restaurant));
      res.render("EditRestaurant",{ pageTitle: 'Restaurant List', restaurant: jsonData });;
    }
})

app.put('/api/restaurants/:id',async (req, res) => {
  try {
    const updatedRestaurant = await updateRestaurantById(req.body, req.params.id);
    if (!updatedRestaurant) {
      res.status(404).json({ message: 'Restaurant not found' });
    } else {
      res.redirect("/api/restaurants");
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to delete a specific restaurant by ID
app.delete('/api/restaurants/:id',async (req, res) => {
  try {
    await deleteRestaurantById(req.params.id);
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.get('/selectCusin', async (req,res)=>{
  const data = await getAllCuisines();
  const jsonData =JSON.parse(JSON.stringify(data));
  res.render("SerchCusin",{cuisines:jsonData})
})
app.get('/selectedCusin', async (req,res)=>{
  try {
    const { cuisine,page, perPage } = req.query;
    const restaurants = await getAllRestaurantsByCuisine(cuisine,Number(page), Number(perPage));
    const first50Restaurants = restaurants.slice(0, 50);
    const jsonData =JSON.parse(JSON.stringify(first50Restaurants));
    res.setHeader('Content-Type', 'text/html');
    res.render("ListRestaurant",{ pageTitle: 'Restaurant List', restaurants: jsonData });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
})


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));