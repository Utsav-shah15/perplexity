require("dotenv").config()
const jwt=require("jsonwebtoken");
const User=require("../models/user.model.js");
const {registerValidation}=require("../validator/authvalidation.js")
const sendEmail=require("../services/mail.service.js")

async function register(req,res){
    try {
        const { error } = registerValidation.validate(req.body);

        if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
        }

        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const user = await User.create({
            username,
            email,
            password,
        });

        await sendEmail({
            to: email,
            subject: "Welcome to Perplexity",

            text: `
            Hi ${username},

            Welcome to Perplexity 🚀

            Your account has been created successfully.

            Thank you for joining us.

            Best Regards,
            Perplexity Team
            `,

            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                
                <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px;">
                    
                    <h1 style="color: #333;">Welcome to Perplexity 🚀</h1>

                    <p style="font-size: 16px; color: #555;">
                    Hi <b>${username}</b>,
                    </p>

                    <p style="font-size: 16px; color: #555;">
                    Your account has been created successfully.
                    </p>

                    <p style="font-size: 16px; color: #555;">
                    You can now explore AI-powered chats, search smarter, and manage your conversations easily.
                    </p>

                    <a 
                    href="http://localhost:3000"
                    style="
                        display: inline-block;
                        margin-top: 20px;
                        padding: 12px 20px;
                        background-color: black;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                    "
                    >
                    Get Started
                    </a>

                    <p style="margin-top: 30px; color: gray; font-size: 14px;">
                    Best Regards,<br />
                    Perplexity Team
                    </p>

                </div>
                </div>
            `,
        });

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
         );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user,
        });
  } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
  }
}

module.exports={
    register
}