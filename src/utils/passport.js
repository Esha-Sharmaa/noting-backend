const passport = require('passport');
const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth2');
const User = require('../modals/user.modal.js');

// GoogleStrategy for email password login 
passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {
            const foundUser = await User.findOne({ email });
            if (!foundUser) return done(null, false, { message: 'Invalid Email' });

            const isMatch = User.isPasswordCorrect(password);
            if (!isMatch) return done(null, false, { message: 'Incorrect Password' });

            return done(null, foundUser);
        }
        catch (error) {
            done(error);
        }

    }
));

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:5000/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
        console.log("function called");
        try {
            console.log(profile);
            let user = await User.findOne({
                $or: [
                    { googleId: profile.id },
                    { email: profile.emails[0].value }
                ]
            });
            if (!user) {
                user = await User.create({
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    displayName: profile.displayName,
                    avatar: profile.photos[0].value
                });
            }
            return done(null, user);

        } catch (error) {
            done(error);
        }
    }
));

passport.serializeUser((user, done) => {
    console.log("user seralized");
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    console.log("deseralized user");
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, false);
    }
});