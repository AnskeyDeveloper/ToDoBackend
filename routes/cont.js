const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator'); //Destructuring 
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // it is a pakage for genereting password Hash 
var jwt = require('jsonwebtoken'); // import jsonwebtoken in jwt variable
var fetchuser = require('../middleware/fetchuser'); //fetchuser

const JWT_SECRET = 'bvsisacoolb$oy'; // This is our secret key to sign jwt token

// Create a User Using: POST API "/api/cont/createuser" .No login require Authentication
router.post('/createuser', [

    // This is our Validation to check the credential given by the user is valid or not 
    body('name', 'Enter a Valid name').isLength({ min: 3 }),
    body('email', 'Enter a Valid email').isEmail(),
    body('password', 'Please Enter Correct Password').isLength({ min: 3 }),

], async (req, res) => {

    // if there are errors, return a Bad request and The errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) { // if does not return true give the errors-array, the errors-variable should empty
        return res.status(400).json({ errors: errors.array() });
    }

    // Check whether the user with this email exits already
    try {
        // this code is rapped in try and catch errors
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: 'Sorry a user with this email already exists' })
        }

        // Genereting password Hash here
        const salt = await bcrypt.genSalt(10); // genereting password salt
        const secPass = await bcrypt.hash(req.body.password, salt); // store password Hash & salt in secPass variable

        // Create a new User
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        });

        // creating an obj which takes user id from db and stored it in data-variable
        data = {
            user: {
                id: user.id
            }
        }

        // sign method took two argument first: data second: secret
        const authtoken = jwt.sign(data, JWT_SECRET);

        res.json({ authtoken, user });
        // res.json(user) 

        // Catch The errors if any occured
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }

})



// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No login required
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(), // it checks password can not be blank
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body; // Destructuring- pull-out email and password from req.body
    try {
        let user = await User.findOne({ email });
        if (!user) {
            success = false
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }

        // Compare Method takes two argument password-string, password-Hash 
        const passwordCompare = await bcrypt.compare(password, user.password); // it will internally compare hash with user entered password, or it will turn true or false
        if (!passwordCompare) { // checks if return false through errors array
            success = false
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }


});


// ROUTE 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.post('/getuser', fetchuser, async (req, res) => {

    try {
        userId = req.user.id; // pull-out user-id from request body
        const user = await User.findById(userId).select("-password") //select- will select everything except the password 
        res.send(user)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router 