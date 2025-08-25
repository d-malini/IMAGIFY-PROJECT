import userModel from "../models/userModel.js";    
import bcrypt from "bcrypt";                                                           // bcrypt for encryption
import jwt from 'jsonwebtoken'                                                          //jwt for authentication

const registerUser = async(req, res) => {
    try {
        const {name, email, password} = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: "Missing Details" });
        }

        // Check if email already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "Email already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword
        };

        const newUser = new userModel(userData);
        const user = await newUser.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.json({ success: true, token, user: { name: user.name } });

    } catch (error) {
        // Handle duplicate key error from MongoDB
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.json({ success: false, message: "Email already registered" });
        }
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}



const loginUser = async(req, res) => {

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        return res.json({ success: true, token, user: { name: user.name } });
    } catch (error) {
        console.log(error)
        res.json({success: false, message : error.message})
    }
}

const userCredits= async (req,res) => {
    try {
        const userId = req.userId;
        const user= await userModel.findById(userId);

        if (!user) {
        return res.status(404).json({ message: 'User not found' });
        }

        // res.status(200).json({ creditBalance: user.creditBalance });

        res.json({success: true, credits: user.creditBalance, user: {name: user.name}});
    } catch (error) {
        console.log(error)
        res.json({success: false, message : error.message})
    }
}



export { registerUser, loginUser , userCredits};