const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserModel = require('./models/auth')

passport.serializeUser((user, cb) => {
  cb(null, { id: user.id, username: user.username, name: user.name })
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRIT,
    callbackURL: "/auth/google/redirect"
  },
  async (accessToken, refreshToken, profile, cb) => {
    console.log(profile);
    const hasGoogleId = await UserModel.findOne({googleID: profile.id})
    if (hasGoogleId) {
      cb(null, hasGoogleId)
    } else {
      const user = new UserModel({
        name: profile.displayName,
        googleID: profile.id
      })
      const newUser = await user.save()
      console.log('newUser', newUser);
      cb(null, newUser)
    }
  }
));