import { Meteor } from "meteor/meteor";
import { UsersCollection, createUser } from "/imports/api/users";
import { FilesCollection, seedFiles } from "/imports/api/files";
import { Roles } from "/imports/api/roles";
import "./methods"; // Import server methods

async function seedUsers() {
  const dummyUsers = [
    {
      email: "john@example.com",
      name: "John Doe",
      color: "#FF5733",
      password: "password", // In a real app, use hashed passwords!
      role: Roles.ADMIN, // Admin role
    },
    {
      email: "jane@example.com",
      name: "Jane Smith",
      color: "#33FF57",
      password: "password",
      role: Roles.VIEWER, // Viewer role
    },
    {
      email: "bob@example.com",
      name: "Bob Johnson",
      color: "#3357FF",
      password: "password",
      role: Roles.GUEST, // Guest role
    },
  ];

  for (const user of dummyUsers) {
    await createUser({
      email: user.email,
      name: user.name,
      color: user.color,
      password: user.password,
      role: user.role,
    });
  }
}

Meteor.startup(async () => {
  // Seed users if the collection is empty
  if ((await UsersCollection.find().countAsync()) === 0) {
    await seedUsers();
  }

  // Seed files if the collection is empty
  if ((await FilesCollection.find().countAsync()) === 0) {
    await seedFiles();
  }

  // Publish the Users collection to all clients
  Meteor.publish("users", function () {
    return UsersCollection.find();
  });

  // Publish the Files collection to all clients
  Meteor.publish("files", function () {
    return FilesCollection.find();
  });
});
