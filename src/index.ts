// API
import dotenv from 'dotenv';
dotenv.config();

import express, {Application} from 'express'
import morgan from 'morgan'
import bcrypt from 'bcrypt'
import {v4 as uuid} from 'uuid'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import {Strategy as JwtStrategy , ExtractJwt } from 'passport-jwt'


// initialization
const app:Application = express();
import {IUser} from './interfaces';

let users:IUser[] = [] ;

// middlewares

app.use(morgan('dev'));
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use(passport.initialize());


passport.use( new JwtStrategy({
	jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey:process.env.AUTHETICATION_JWT
},  (payload_jwt, done) => {
	
	console.log(typeof(payload_jwt));
	
			const user = users.find( item => item.id ===payload_jwt.id )
			
			if(user==undefined){
				return done(null,false);
			}else{
				return done(null,user);
			}

		}
)	
);


// routes

app.get('/users', passport.authenticate("jwt", {session:false}) , (req,res) => {
	 res.status(200).json({users});
})

app.get('/' , (req:express.Request, res:express.Response): express.Response => {
	return res.status(200).send('Welcome to my Api.')
});

app.post('/signup' , async (req, res): Promise<express.Response> => {
	
	const { email, password } = req.body;
	
	try{
		const hash = await bcrypt.hash(password, 10);
	
		users.push({
			id:uuid(),
			email,
			password:hash
		});
		
		return res.status(201).json({msg:"Created"});
		
	}catch(e){
		return res.status(500).send({e});
	}
	
	
});




app.post('/signin' , async (req, res): Promise<express.Response> => {
	
	const {email, password} = req.body;
	
	try{
		
		//search the email into de arraylist
		
		const user = users.find( user => user.email===email )
		
		if(user==undefined){
			return res.status(400).send("No find the email")
		}
		
		// compare the password
		
		 if( await bcrypt.compare(password, user.password) )
		 {
			 // Create a token with jwt method
			 
			 return res.status(200).json({token:jwt.sign(user , `${process.env.AUTHETICATION_JWT}`)});
		 }else{
			return res.status(400).send("Password not match...") 
		 }
		
	}catch(e){
		return res.status(500).send({e});
	}
	
	
});


app.listen(5000);