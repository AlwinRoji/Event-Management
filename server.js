const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); 
const saltRounds = 10; 
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/login', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Define schema for user data
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Create model for user data
const User = mongoose.model('User', userSchema);

// Define schema for contact form data
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    number: { type: String },
    subject: { type: String },
    message: { type: String, required: true }
});

// Create model for contact form data
const Contact = mongoose.model('Contact', contactSchema);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route handler for form submission
app.post('/submitContactForm', (req, res) => {
    const { name, email, number, subject, message } = req.body;

    // Create a new contact object
    const newContact = new Contact({
        name: name,
        email: email,
        number: number,
        subject: subject,
        message: message
    });

    // Save the contact object to the database
    newContact.save()
        .then(() => {
            console.log('Contact form data saved successfully');
            res.redirect('/');
        })
        .catch(err => {
            console.error('Error saving contact form data:', err);
            res.status(500).send('Error saving contact form data');
        });
});

// Route handler for user registration
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Hash the password before saving to the database
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user object
        const newUser = new User({
            username: username,
            email: email,
            password: hashedPassword
        });

        // Save the user object to the database
        await newUser.save();
        console.log('User registered successfully');
          res.redirect('/index.html');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});

// Route handler for user login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username
        const user = await User.findOne({ username: username });

        // If user not found or password doesn't match, send error
        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).send('Invalid username or password');
            return;
        }

        // If login successful
        res.redirect('/index.html');
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).send('Error logging in user');
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
