
import { Document, Schema, Model, model } from 'mongoose';
import { IUser } from '../interfaces/user-interface';
import * as jwt from 'jsonwebtoken';
import { jwtSecret } from './authentication';
import * as crypto from 'crypto';


export interface IUserModel extends IUser, Document {
	token: string;
	generateJWT();
	formatAsUserJSON();
	setPassword(password);
	passwordIsValid(password);
	formatAsProfileJSON(user);
	isFollowing(id);
	follow(id);
	unfollow(id);
	isFavorite(id);
}


// ISSUE: Own every parameter and any missing dependencies
const UserSchema = new Schema({
	username: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"],
		match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
	email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"],
		match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
	bio: String,
	image: String,
	favorites: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
	following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	hash: String,
	salt: String
}, {timestamps: true});


UserSchema.methods.generateJWT = function(): string {
	const today = new Date();
	const exp = new Date(today);
	exp.setDate(today.getDate() + 60);

	return jwt.sign({
		id: this._id,
		username: this.username,
		exp: exp.getTime() / 1000
	}, jwtSecret);
};


UserSchema.methods.formatAsUserJSON = function() {
	return {
		username: this.username,
		email: this.email,
		token: this.generateJWT(),
		bio: this.bio,
		image: this.image
	};
};


UserSchema.methods.setPassword = function(password: string) {
	this.salt = crypto.randomBytes(16).toString('hex');
	this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};


UserSchema.methods.passwordIsValid = function(password: string) {
	const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
	return hash === this.hash;
};


UserSchema.methods.formatAsProfileJSON = function(user: IUserModel) {
	return {
		username: this.username,
		bio: this.bio,
		image: this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
		following: user ? user.isFollowing(this._id) : false
	};
};


UserSchema.methods.isFollowing = function(id: Schema.Types.ObjectId): boolean {
	return this.following.some( (followingId: Schema.Types.ObjectId) => {
		return followingId.toString() === id.toString();
	});
};
// ISSUE: Why did these have to be converted to strings to evaluate correctly?


UserSchema.methods.follow = function(id: Schema.Types.ObjectId) {
	if (this.following.indexOf(id) === -1) {
		this.following.push(id);
	}
	return this.save();
};


UserSchema.methods.unfollow = function(id: Schema.Types.ObjectId) {
	this.following.remove(id);
	return this.save();
};


UserSchema.methods.isFavorite = function(id: Schema.Types.ObjectId): boolean {
	return this.following.some( (favoriteId: Schema.Types.ObjectId) => {
		return favoriteId.toString() === id.toString();
	});
};
// ISSUE: Why did these have to be converted to strings to evaluate correctly?


export const User: Model<IUserModel> = model<IUserModel>('User', UserSchema);
