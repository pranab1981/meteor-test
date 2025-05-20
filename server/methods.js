import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { UsersCollection } from "../imports/api/users";
import { FilesCollection, createFile } from "../imports/api/files";
import { Roles } from "../imports/api/roles";

Meteor.methods({
  // Authentication methods
  async "users.login"(email, password) {
    check(email, String);
    check(password, String);

    const user = await UsersCollection.findOneAsync({ email, password });
    if (!user) {
      throw new Meteor.Error("auth-failed", "Invalid email or password");
    }

    return user._id;
  },

  // Role management methods
  async "users.updateRole"(userId, newRole) {
    check(userId, String);
    check(newRole, String);

    // Ensure the new role is valid
    if (!Object.values(Roles).includes(newRole)) {
      throw new Meteor.Error("invalid-role", "The provided role is not valid");
    }

    // Check if user exists
    const userToUpdate = await UsersCollection.findOneAsync(userId);
    if (!userToUpdate) {
      throw new Meteor.Error("user-not-found", "User not found");
    }

    return await UsersCollection.updateAsync(userId, {
      $set: { role: newRole },
    });
  },

  // Files management methods
  async "files.add"(fileData) {
    check(fileData, {
      name: String,
      type: String,
      url: String,
      metadata: Object,
    });

    // In a real app, I'd validate the user has permission to add files
    return await createFile(fileData);
  },

  async "files.delete"(fileId) {
    check(fileId, String);

    // In a real app, I'd validate the user has permission to delete files
    return await FilesCollection.removeAsync(fileId);
  },
});
