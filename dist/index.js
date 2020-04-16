"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// API
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
// initialization
const app = express_1.default();
let users = [];
// middlewares
app.use(morgan_1.default('dev'));
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
app.use(passport_1.default.initialize());
passport_1.default.use(new passport_jwt_1.Strategy({
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.AUTHETICATION_JWT
}, (payload_jwt, done) => {
    console.log(typeof (payload_jwt));
    const user = users.find(item => item.id === payload_jwt.id);
    if (user == undefined) {
        return done(null, false);
    }
    else {
        return done(null, user);
    }
}));
// routes
app.get('/users', passport_1.default.authenticate("jwt", { session: false }), (req, res) => {
    res.status(200).json({ users });
});
app.get('/', (req, res) => {
    return res.status(200).send('Welcome to my Api.');
});
app.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const hash = yield bcrypt_1.default.hash(password, 10);
        users.push({
            id: uuid_1.v4(),
            email,
            password: hash
        });
        return res.status(201).json({ msg: "Created" });
    }
    catch (e) {
        return res.status(500).send({ e });
    }
}));
app.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        //search the email into de arraylist
        const user = users.find(user => user.email === email);
        if (user == undefined) {
            return res.status(400).send("No find the email");
        }
        // compare the password
        if (yield bcrypt_1.default.compare(password, user.password)) {
            // Create a token with jwt method
            return res.status(200).json({ token: jsonwebtoken_1.default.sign(user, `${process.env.AUTHETICATION_JWT}`) });
        }
        else {
            return res.status(400).send("Password not match...");
        }
    }
    catch (e) {
        return res.status(500).send({ e });
    }
}));
app.listen(5000);
