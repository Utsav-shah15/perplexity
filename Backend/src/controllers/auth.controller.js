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

        const verifyemailtoken=jwt.sign(
            {
                email: user.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
         );

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
                    href="http://localhost:3000/auth/verify-email?token=${verifyemailtoken}"
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

async function verifyemail(req,res){
    try{
        const {token}=req.query;
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        const user=await User.findOne({email:decoded.email});

        if(!user){
            return res.json({
                message:"Invalid token",
                success:false,
                err:"user not found"
            })
        }

        if (user.verified) {
            const html = `
                <div style="
                font-family: Arial;
                padding: 40px;
                text-align: center;
                ">

                <h1 style="color: orange;">
                    Email Already Verified ⚠️
                </h1>

                <p>
                    Your email has already been verified.
                </p>

                <a 
                    href="http://localhost:3000/login"
                    style="
                    display: inline-block;
                    margin-top: 20px;
                    padding: 12px 20px;
                    background: black;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    "
                >
                    Login
                </a>

                </div>
            `;

            return res.send(html);
        }

        user.verified=true;

        await user.save();

    const html = `
      <div style="font-family: Arial; padding: 40px; text-align: center;">

        <h1 style="color: green;">
          Email Verified Successfully ✅
        </h1>

        <p>
          Your account has been verified successfully.
        </p>

        <a 
          href="http://localhost:3000/login"
          style="
            display: inline-block;
            margin-top: 20px;
            padding: 12px 20px;
            background: black;
            color: white;
            text-decoration: none;
            border-radius: 5px;
          "
        >
          Login
        </a>

      </div>
    `;

    return res.send(html)
    }catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

async function resendVerificationEmail(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.verified) {
        const html = `
            <div style="
            font-family: Arial;
            padding: 40px;
            text-align: center;
            ">

            <h1 style="color: orange;">
                Email Already Verified ⚠️
            </h1>

            <p>
                Your email has already been verified.
            </p>

            <a 
                href="http://localhost:3000/login"
                style="
                display: inline-block;
                margin-top: 20px;
                padding: 12px 20px;
                background: black;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                "
            >
                Login
            </a>

            </div>
        `;

         return res.send(html);
    }

    // Create new token
    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Verification URL
    const verificationUrl =
      `http://localhost:5000/api/auth/verify-email?token=${token}`;

    // Send Email
    await sendEmail({
      to: user.email,
      subject: "Verify Your Email - Aura AI",
      text: `Click the link to verify your email: ${verificationUrl}`,
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Email Verification</h2>
          <p>Click the button below to verify your email address.</p>
          <a href="${verificationUrl}" style="display:inline-block;padding:12px 20px;background:black;color:white;text-decoration:none;border-radius:5px;">Verify Email</a>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: "Verification email resent successfully",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

async function login(req,res){
   try{
      let {email,password}=req.body;

    const user=await User.findOne({email}).select("+password");

    if(!user){
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    const isMatch=await user.comparePassword(password);

    if (!isMatch) {
        return res.status(400).json({
            success: false,
            message: "Invalid password",
        });
    }

    if(!user.verified){
      return res.status(400).json({
        success: false,
        message: "Please verify your email",
      });
    }
    
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

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token,
            user,
    });
   }catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
        });
   }
}

async function getMe(req, res) {

  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
  
async function googleLogin(req, res) {
  try {
    const { credential, profile } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: "Google access token is required" });
    }

    // Fetch user profile from Google using the access token
    const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${credential}` },
    });

    if (!googleRes.ok) {
      return res.status(401).json({ success: false, message: "Invalid Google access token" });
    }

    const { sub: googleId, email, name, picture } = await googleRes.json();

    // Find existing user by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Link Google account if user signed up with email/password before
      if (!user.googleId) {
        user.googleId = googleId;
        user.verified = true;
        if (picture && !user.avatar) user.avatar = picture;
        await user.save();
      }
    } else {
      // Create new Google user (no password required)
      user = await User.create({
        username: name,
        email,
        googleId,
        avatar: picture,
        verified: true,
      });
    }

    // Issue JWT cookie
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      user,
    });

  } catch (error) {
    console.error("Google login error:", error);
    return res.status(401).json({
      success: false,
      message: "Google login failed",
    });
  }
}

async function logout(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
    });
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports={
    register,
    verifyemail,
    resendVerificationEmail,
    login,
    logout,
    googleLogin,
    getMe
}