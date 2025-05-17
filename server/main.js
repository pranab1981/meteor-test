import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/roles';
import { createUser } from '/imports/api/users';
import { FilesCollection, seedFiles } from '/imports/api/files';


async function seedUsers() {
  const dummyUsers = [
    { email: 'john@example.com', password: 'admin_password', name: 'John Doe', color: '#FF5733', role: 'admin' }, // admin
    { email: 'jane@example.com', password: 'viewer_password', name: 'Jane Smith', color: '#33FF57', role: 'viewer' }, // viewer
    { email: 'bob@example.com', password: 'guest_password', name: 'Bob Johnson', color: '#3357FF', role: 'guest' } // guest
  ];

  for (const user of dummyUsers) {
    let userId = await createUser(user);
    await Roles.setUserRolesAsync(userId, user.role);
  }
}

Meteor.startup(async () => {
  // Seed users if the collection is empty
  if (await Meteor.users.find().countAsync() === 0) {
    Roles.createRoleAsync('admin');
    Roles.createRoleAsync('viewer');
    Roles.createRoleAsync('guest');

    await seedUsers();
  }

  // Seed files if the collection is empty
  if (await FilesCollection.find().countAsync() === 0) {
    await seedFiles();
  }

  // Publish the Users collection to all clients
  Meteor.publish("users", async function () {
    const isAdmin = await Roles.userIsInRoleAsync(this.userId, 'admin')
    if (this.userId && isAdmin) {
      return Meteor.users.find();
    }
    return this.ready();
  });

  // Publish the Files collection to all clients
  Meteor.publish("files", async function () {
    const isAdmin = await Roles.userIsInRoleAsync(this.userId, 'admin')
    const isViewer = await Roles.userIsInRoleAsync(this.userId, 'viewer')
    
    if (this.userId && isAdmin) {
      return FilesCollection.find();
    } else if (this.userId && !isAdmin && isViewer) {
      return FilesCollection.find({ type: 'url' });
    } else if (this.userId && !isAdmin && !isViewer) {
      return FilesCollection.find({ type: 'image' });
    }
    return this.ready();
  });

});
