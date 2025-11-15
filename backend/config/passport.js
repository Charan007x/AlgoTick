const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth profile:', profile);
        
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
          // User exists, return user
          return done(null, user);
        }
        
        // Check if user exists with the same email
        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
          // User exists with email but not linked to Google
          // Link the Google account
          user.googleId = profile.id;
          user.provider = 'google';
          user.avatar = profile.photos[0]?.value;
          await user.save();
          return done(null, user);
        }
        
        // Create new user
        const username = profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
        
        user = new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          username: username,
          provider: 'google',
          avatar: profile.photos[0]?.value
        });
        
        await user.save();
        done(null, user);
        
      } catch (error) {
        console.error('Google OAuth error:', error);
        done(error, null);
      }
    }
  )
);

module.exports = passport;
