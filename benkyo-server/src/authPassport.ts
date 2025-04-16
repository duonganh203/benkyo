import passport from 'passport';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { User } from './schemas';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const FRONTEND_URI = process.env.FRONTEND_URI;
const ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT;

passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID!,
            clientSecret: GOOGLE_CLIENT_SECRET!,
            callbackURL:
                (ENV === 'development' ? `http://localhost:${PORT}/` : FRONTEND_URI) + 'api/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ email: profile.emails?.[0].value });
                if (!user) {
                    const hashedPassword = await bcrypt.hash(Math.random().toString(36).substring(7), 10);
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails?.[0].value,
                        avatar: profile.photos?.[0].value,
                        password: hashedPassword
                    });
                    await user.save();
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.use(
    new FacebookStrategy(
        {
            clientID: FACEBOOK_APP_ID!,
            clientSecret: FACEBOOK_APP_SECRET!,
            callbackURL: FRONTEND_URI + 'api/auth/facebook/callback',
            profileFields: ['id', 'displayName', 'photos', 'email', 'gender', 'name']
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value || `fb_${profile.id}@facebook.com`;
                let user = await User.findOne({ email: email });
                if (!user) {
                    const hashedPassword = await bcrypt.hash(Math.random().toString(36).substring(7), 10);
                    user = new User({
                        name: profile.displayName,
                        email: email,
                        password: hashedPassword
                    });
                    await user.save();
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);
