# Walkthrough

Hello, I started off by exploring the `/tests` and `/server` directories, they were very simple. Then I proceeded to fire off the application to have a gist of what it looks like whilst also exploring the client side code.

As I was firing the application, I saw it installing 3.2 and I know roles packages was added directly to the core recently so I went ahead and installed it along with `accounts-password` package in order to be able to test out the users and roles features.

That's when things went south a bit since there was a pre-defined users collection and `accounts-password` creates its own. In order to avoid such conflicts, I removed the pre-defined one and relied on Meteor.users collection.


The rest was pretty straight forward, I ensured the roles were created and users were seeded with roles. 

```js

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

```

Then I went ahead and added some restrictions to publications in order to ensure a secure flow. Where only the admin user has full access to the users and files collections.

```js

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
    // If no user is logged in, return no data
    if (!this.userId) {
      return this.ready();
    }
    
    // Check user roles
    if (await Roles.userIsInRoleAsync(this.userId, 'admin')) {
      // Admins can see all files
      return FilesCollection.find();
    } else if (await Roles.userIsInRoleAsync(this.userId, 'viewer')) {
      // Viewers can only see URL files
      return FilesCollection.find({ type: 'url' });
    } else {
      // Default (guest) users can only see image files
      return FilesCollection.find({ type: 'image' });
    }
  });

 ```

I used very little AI since the application is pretty small and I've a prior knowledge of Meteor and Roles package.