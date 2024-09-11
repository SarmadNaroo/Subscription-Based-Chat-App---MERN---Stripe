import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import Stripe from "stripe";

const stripe = new Stripe();// your stripe secret key

export const signup = async (req, res) => {
	try {
		const { fullName, username, password, confirmPassword, gender } = req.body;

		if (password !== confirmPassword) {
			return res.status(400).json({ error: "Passwords don't match" });
		}

		const user = await User.findOne({ username });

		if (user) {
			return res.status(400).json({ error: "Username already exists" });
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
		const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

		const newUser = new User({
			fullName,
			username,
			password: hashedPassword,
			gender,
			profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
			subscriptionActive: false, // default subscription status
		});

		await newUser.save();

		// Create Stripe Checkout session
		const session = await stripe.checkout.sessions.create({
			mode: "subscription",
			line_items: [
				{
					price: 'price_1Pil67Arc6VFolFCt6QOnLNs',
					quantity: 1,
				},
			],
			success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `http://localhost:3000/cancel`,
			client_reference_id: newUser._id.toString(),
		});
		
		
	  
		res.status(200).json({ sessionId: session.id });
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const handleSubscriptionSuccess = async (req, res) => {
	try {
	  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
  
	  if (session.payment_status === "paid") {
		const userId = session.client_reference_id;
		const user = await User.findById(userId);
  
		if (user) {
		  user.subscriptionActive = true;
		  await user.save();
		}
  
		res.status(200).json({ success: true });
	  } else {
		res.status(400).json({ error: "Payment not completed" });
	  }
	} catch (error) {
	  console.log("Error in handleSubscriptionSuccess controller", error.message);
	  res.status(500).json({ error: "Internal Server Error" });
	}
};

export const login = async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await User.findOne({ username });
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		if (!user.subscriptionActive) {
			return res.status(403).json({ error: "Subscription not active" });
		  }	  

		generateTokenAndSetCookie(user._id, res);

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			profilePic: user.profilePic,
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const logout = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
