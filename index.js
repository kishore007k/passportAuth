import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import gPkg from "passport-google-oauth20";
import fPkg from "passport-facebook";
import expressSession from "express-session";

dotenv.config();

const { Strategy: GS } = gPkg;
const { Strategy: FS } = fPkg;

const app = express();

app.use(cors());

const PORT = process.env.PORT;
const GCI = process.env.GOOGLE_CLIENT_ID;
const GCS = process.env.GOOGLE_CLIENT_SECRET;
const FCI = process.env.FACEBOOK_CLIENT_ID;
const FCS = process.env.FACEBOOK_CLIENT_SECRET;

passport.use(
	new GS(
		{
			clientID: GCI,
			clientSecret: GCS,
			callbackURL: "/google",
		},
		(accessToken, refreshToken, profile, callBack) => {
			callBack(null, profile);
		}
	)
);

passport.use(
	new FS(
		{
			clientID: FCI,
			clientSecret: FCS,
			callbackURL: "/facebook",
			profileFields: ["emails", "displayName", "name", "picture"],
		},
		(accessToken, refreshToken, profile, callback) => {
			callback(null, profile);
		}
	)
);

passport.serializeUser((user, callback) => {
	callback(null, user);
});

passport.deserializeUser((user, callback) => {
	callback(null, user);
});

app.use(
	expressSession({
		secret: "thisisasecret",
		resave: true,
		saveUninitialized: true,
	})
);

app.use(passport.initialize());
app.use(passport.session());

// ROUTES
app.get(
	"/login/google",
	passport.authenticate("google", { scope: ["profile email"] })
);

app.get(
	"/login/facebook",
	passport.authenticate("facebook", { scope: ["email"] })
);

app.get("/google", passport.authenticate("google"), (req, res) => {
	res.redirect("/");
});

app.get("/facebook", passport.authenticate("facebook"), (req, res) => {
	res.redirect("/");
});

app.get("/", (req, res) => {
	res.send(
		req.user ? req.user : "Not Logged in please Login with Google or Facebook"
	);
});

app.get("/logout", (req, res) => {
	req.logOut();
	res.redirect("/");
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
