// Responsible for logic related to authentication
// External dependencies
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");
const UserToken = require("../models/Usertoken");

// Internal dependencies
const User = require("../models/User");
const {
  usernameValidator,
  emailValidator,
  passwordValidator,
} = require("../dependencies/validators/User");

async function register(req, res) {
  const { username, password, email } = req.body;

  // Validate username format
  if (!usernameValidator(username)) {
    return res.status(400).json({ message: "Invalid username format" });
  }
  // Validate email format
  if (!emailValidator(email)) {
    return res.status(400).json({ message: "Invalid username format" });
  }

  // Validate password length
  if (!passwordValidator(password)) {
    return res.status(400).json({ message: "Invalid password length" });
  }

  try {
    // Check if username already exists in the database
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user document
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
    });

    // Save the new user document to the database
    await newUser.save();

    // Respond with success message
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// Login a user
async function login(req, res) {
  const { username, password } = req.body;
  // console.log(username);
  console.log(req.body);

  // Validate username format
  if (!usernameValidator(username)) {
    return res.status(400).json({ message: "Invalid username format" });
  }

  console.log("Heere");

  // Validate password length
  if (!passwordValidator(password)) {
    return res.status(400).json({ message: "Invalid password length" });
  }

  try {
    const user = await User.findOne({ username: username });
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }

    // console.log(password)
    // if (password === user.password) {
    //   const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    //   console.log("TOKEN GENERATED")
    //   res.json({ token });
    // }
    // else {
    //   res.status(401).json({ message: 'Invalid password' });
    // }
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.json({ success: false, message: "passwords do not match" });
    } else if (validPassword) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      console.log("TOKEN GENERATED");
      return res.json({ token });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

const forgetPassword = async (req, res, next) => {
  const email = req.body.email;

  try {
    // Find user by email
    const user = await User.findOne({
      email: { $regex: email, $options: "i" },
    });

    // If user not found, create and return a custom 404 error
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    // Payload for JWT token
    const payload = {
      email: user.email,
    };

    // Expiry time for JWT token (in seconds)
    const expiryTime = 300;

    // Sign JWT token with payload and secret key
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: expiryTime,
    });

    // Save token in the database
    const newToken = new UserToken({
      userId: user._id,
      token: token,
    });

    try {
      // Attempt to save the token
      await newToken.save();

      // Configure nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "mugdha.padgelwar2024@gmail.com",
          pass: "wxyw fpxk eipf bhxr",
        },
      });

      // Email options

      const mailOptions = {
        from: "mugdha.padgelwar2024@gmail.com",
        to: user.email,
        subject: "Password Reset Instructions",
        html: `
         <html> 
         <head> 
             <title>Password Reset Request</title> 
         </head> 
         <body> 
             <h1>Password reset request</h1> 
             <p>Dear ${user.userName},</p> 
             <p>We have received a request to reset your password for your account. To complete the password reset process, please click on the button below:</p>
             <a href="${process.env.LIVE_URL}/resetpassword/${token}" style="text-decoration: none;">
            <button style="background-color: #4CAF50; color: #ffffff; font-size: 16px; font-family: Helvetica, Arial, sans-serif; padding: 14px 20px; border: none; border-radius: 4px; cursor: pointer;">
              Reset Password
            </button>
             </a>
             <p>Please note that this link is only valid for 5 minutes. If you did not request a password reset, please discard this message.</p>
             <p>Thank you</p> 
         </body>
     </html>
              `,
      };

      // Send email
      await transporter.sendMail(mailOptions);

      // Send response
      res
        .status(200)
        .json({ success: true, message: "Password reset instructions sent" });
    } catch (error) {
      // If an error occurs during sending email, handle it
      return next(error);
    }
  } catch (error) {
    // If an error occurs during finding user or saving token, handle it
    return next(error);
  }
};

const resetpassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const token = req.query.token; // Extracting token from query parameters

    // Check if token and newPassword are provided
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and newPassword are required" });
    }

    // Verify the JWT token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      const email = decoded.email;
      console.log(email);

      // Find user by ID
      const user = await User.findOne({ email: email });

      // Check if user exists
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Encrypt the new password
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(newPassword, salt);

      // Update user's password
      user.password = encryptedPassword;

      try {
        // Save the updated user
        const updateUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $set: user },
          { new: true }
        );

        // Respond with success message
        return res.status(200).json({ message: "Password reset successfully" });
      } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({ message: "Something went wrong" });
      }
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { register, login, forgetPassword, resetpassword };
