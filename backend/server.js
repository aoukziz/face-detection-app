import express from 'express';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import knex from 'knex';
import dotenv from 'dotenv';
import handleRegister from './controllers/register.js';
import handleSignin from './controllers/signin.js';
import handleProfile from './controllers/profile.js';
import handleImage from './controllers/image.js';

dotenv.config();

const app = express();

app.use(express.json()); 
app.use(express.urlencoded());
app.use(cors());

const db = knex({
    client: 'pg',
    connection: {
        host : '127.0.0.1',
        port : 5432,
        user : 'postgres',
        password : process.env.DATABASE_PASSWORD,
        database : 'face_recognition'
      }
  });

// signin --> POST = success/fail
app.post('/signin', (req, res) => handleSignin(req, res, db, bcrypt))
// register --> POST = user
app.post('/register', (req, res) => handleRegister(req, res, db, bcrypt))

//profile/:userId --> GET = user
app.get('/profile/:id', (req, res) => handleProfile(req, res, db))
//image --> PUT --> user
app.put('/image', (req, res) => handleImage(req, res, db))


app.listen(5000, () => {
    console.log('app is running on port 5000')
})