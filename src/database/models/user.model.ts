import { Document, Model, model, Schema } from 'mongoose';
import { IUser } from '../../interfaces/user-interface';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { JWT_SECRET } from "../../utilities/secrets";
import mongooseUniqueValidator = require("mongoose-unique-validator");


export default interface IUserModel extends IUser, Document {
  token?: string;
  favorites: [Schema.Types.ObjectId];

  generateJWT(): string;
  toAuthJSON(): any;
  setPassword(password: string): void;
  validPassword(password: string): boolean;
  toProfileJSONFor(user: IUserModel): any;
  isFollowing(id: string): boolean;
  follow(id: string): Promise<IUser>;
  unfollow(id: string): Promise<IUser>;
  favorite(id: string): Promise<IUser>;
  unfavorite(id: string): Promise<IUser>;
  isFavorite(id: string): boolean;
}


// ISSUE: Own every parameter and any missing dependencies
const UserSchema = new Schema({
  username : {
    type     : Schema.Types.String,
    lowercase: true,
    unique   : true,
    required : [true, "can't be blank"],
    match    : [/^[a-zA-Z0-9]+$/, 'is invalid'],
    index    : true
  },
  email    : {
    type     : Schema.Types.String,
    lowercase: true,
    unique   : true,
    required : [true, "can't be blank"],
    match    : [/\S+@\S+\.\S+/, 'is invalid'],
    index    : true
  },
  bio      : {
    type: Schema.Types.String
  },
  image    : {
    type: Schema.Types.String
  },
  favorites: [
    {
      type: Schema.Types.ObjectId,
      ref : 'Article'
    }
  ],
  following: [
    {
      type: Schema.Types.ObjectId,
      ref : 'User'
    }
  ],
  hash     : {
    type: Schema.Types.String
  },
  salt     : {
    type: Schema.Types.String
  },
}, {timestamps: true});


UserSchema.plugin(mongooseUniqueValidator, {message: 'is already taken.'});

UserSchema.methods.validPassword = function (password: string): boolean {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UserSchema.methods.setPassword = function (password: string) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.generateJWT = function (): string {
  const today = new Date();
  const exp   = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    id      : this._id,
    username: this.username,
    exp     : exp.getTime() / 1000,
  }, JWT_SECRET);
};

UserSchema.methods.toAuthJSON = function (): any {
  return {
    username: this.username,
    email   : this.email,
    token   : this.generateJWT(),
    bio     : this.bio,
    image   : this.image
  };
};

UserSchema.methods.toProfileJSONFor = function (user: IUserModel) {
  return {
    username : this.username,
    bio      : this.bio,
    image    : this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
    following: user ? user.isFollowing(this._id) : false
  };
};

UserSchema.methods.favorite = function (id: string) {
  if (this.favorites.indexOf(id) === -1) {
    this.favorites.push(id);
  }

  return this.save();
};

UserSchema.methods.unfavorite = function (id: string) {
  this.favorites.remove(id);
  return this.save();
};

UserSchema.methods.isFavorite = function (id: string) {
  return this.favorites.some(function (favoriteId: string) {
    return favoriteId.toString() === id.toString();
  });
};

UserSchema.methods.follow = function (id: string) {
  if (this.following.indexOf(id) === -1) {
    this.following.push(id);
  }

  return this.save();
};

UserSchema.methods.unfollow = function (id: string) {
  this.following.remove(id);
  return this.save();
};

UserSchema.methods.isFollowing = function (id: string) {
  return this.following.some(function (followId: string) {
    return followId.toString() === id.toString();
  });
};


export const User: Model<IUserModel> = model<IUserModel>('User', UserSchema);
