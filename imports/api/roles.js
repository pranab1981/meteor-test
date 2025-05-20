import { Meteor } from "meteor/meteor";
import { UsersCollection } from "./users";

// Define roles and their capabilities
export const Roles = {
  ADMIN: "admin",
  VIEWER: "viewer",
  GUEST: "guest",
};

// Define permissions for each role
export const RolePermissions = {
  [Roles.ADMIN]: {
    canViewUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canAddUsers: true,
    canViewFiles: true,
    canEditFiles: true,
    canDeleteFiles: true,
    canAddFiles: true,
  },
  [Roles.VIEWER]: {
    canViewUsers: true, // Can view basic user information
    canEditUsers: false,
    canDeleteUsers: false,
    canAddUsers: false,
    canViewFiles: true,
    canEditFiles: false,
    canDeleteFiles: false,
    canAddFiles: true,
  },
  [Roles.GUEST]: {
    canViewUsers: false, // Cannot access Users area
    canEditUsers: false,
    canDeleteUsers: false,
    canAddUsers: false,
    canViewFiles: true, // Can only view files
    canEditFiles: false,
    canDeleteFiles: false,
    canAddFiles: false,
  },
};

// Helper functions to check permissions
export const hasPermission = (userId, permission) => {
  if (!userId) return false;

  const user = UsersCollection.findOne(userId);
  if (!user) return false;

  const role = user.role || Roles.GUEST;
  return RolePermissions[role][permission] || false;
};

// Method to check user's role
export const getUserRole = (userId) => {
  if (!userId) return Roles.GUEST;

  const user = UsersCollection.findOne(userId);
  return user?.role || Roles.GUEST;
};

// Method to update a user's role
export const updateUserRole = async (userId, newRole) => {
  if (!Object.values(Roles).includes(newRole)) {
    throw new Meteor.Error("invalid-role", "The provided role is not valid");
  }

  return await UsersCollection.updateAsync(userId, {
    $set: { role: newRole },
  });
};
