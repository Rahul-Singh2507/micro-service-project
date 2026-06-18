import dotenv from "dotenv"
import express from "express"
import morgan from "morgan"
import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import cookies from "cookie-parser"


const app = express()
app.use(morgan("dev"))
app.use(cookies())
app.use(passport.initialize())


export default app