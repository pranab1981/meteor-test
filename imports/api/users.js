import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { Roles } from "./roles";

// Define the Users collection
export const UsersCollection = new Mongo.Collection("users");

// Define the schema for a user
export const UserSchema = {
  email: String,
  password: String, // For simplicity, we're storing plaintext passwords - in a real app use proper auth
  createdAt: Date,
  profile: {
    name: String,
    color: String,
  },
  role: {
    type: String,
    default: Roles.GUEST, // Default role is guest
  },
};

// Current logged-in user tracking (client-side only)
export const CurrentUser = {
  _id: null,
  set(userId) {
    this._id = userId;
    // Store in session storage for persistence
    if (Meteor.isClient) {
      sessionStorage.setItem("currentUserId", userId);
    }
  },
  get() {
    if (Meteor.isClient && !this._id) {
      this._id = sessionStorage.getItem("currentUserId");
    }
    return this._id;
  },
  clear() {
    this._id = null;
    if (Meteor.isClient) {
      sessionStorage.removeItem("currentUserId");
    }
  },
};

// Helper function to create a new user
export const createUser = async ({
  email,
  name,
  color,
  password,
  role = Roles.GUEST,
}) => {
  const user = {
    email,
    password, // In a real app, you would hash this
    createdAt: new Date(),
    profile: {
      name,
      color,
    },
    role,
  };

  return await UsersCollection.insertAsync(user);
};
