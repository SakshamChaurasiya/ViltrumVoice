import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body

    try {

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        //check if password is of 6 characters
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({ email })
        //find if user already exist
        if (user) return res.status(400).json({ message: "Email already exists" });

        //hash the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //make new user,sending info to database User model
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        })

        if (newUser) {
            //generate jwt token
            generateToken(newUser._id, res)
            //save to db
            await newUser.save();

            const createdAtIST = newUser.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
            const updatedAtIST = newUser.updatedAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

            //returns the response to user
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
                createdAt: createdAtIST,
                updatedAt: updatedAtIST,
            });

        } else {
            res.status(400).json({ message: "Invalid user data" });
        }

    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body

    try {
        //find user in database using email
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        //compare the password that is saved in database
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        //generate the cookie token
        generateToken(user._id, res);

//send response to user
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        })

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = (req, res) => {

    try {
        //delete cookie when logged out
        res.cookie("jwt", "", { maxAge: 0 })
        res.status(200).json({ message: "Logged out successfully" })
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({ message: "Profile pic is required" });
        }

        //upload pic to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        //save that image to database
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true })

        //update the database and send to user
        res.status(200).json(updatedUser)



    } catch (error) {
        console.log("error in updating profile:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const checkAuth = (req, res) => {
try {
    //send user response
    res.status(200).json(req.user);
} catch (error) {
    console.log("Error in checkAuth controller",error.message);
    res.status(500).json({message:"Internal servel error"});
}
};