# Implementing Role-Based Authentication in a Meteor App

## Exploration and Initial Assessment

When I first began exploring the FileNest Meteor application, I needed to understand the existing structure and functionality before making changes. My exploration process involved:

1. **Reading the README.md** to understand the app's purpose and intended functionality
2. **Examining the file structure** to understand the organization of components, APIs, and server code
3. **Tracing data flow** from the server to the client to understand how user and file data was being managed
4. **Identifying gaps in the authentication system** that would need to be addressed

The original application had a very basic user structure with no authentication system at all:
- A simple `UsersCollection` with basic fields (email, name, color)
- No login system or user session management
- No concept of roles or permissions to restrict access to features

I approached this implementation in two phases:
1. First, I implemented a simple user-switching mechanism to establish the role framework
2. Then, I replaced this with a proper login-based authentication system to better reflect real-world applications

## Focus Areas

I focused my implementation efforts in the following order:

### 1. Designing the Role System

First, I designed the core of the role-based access control system:
- Created a new `roles.js` file that defined:
  - A `Roles` object with three role types: ADMIN, VIEWER, and GUEST
  - A `RolePermissions` object specifying granular permissions for each role
  - Helper functions for permission checking
- Extended the user schema to include role information 
- Updated the server-side seed data to assign different roles to demo users

### 2. Initial User-Switching Implementation

As a first step toward the final system, I implemented a simple user-switching mechanism:
- Created a component that allowed selecting from available users
- Modified the UI to respond to the selected user's role
- Implemented initial permission checks based on the selected user's role
- This approach allowed me to test role functionality while building out the complete system

### 3. Full Authentication System

Next, I replaced the user-switching mechanism with a proper authentication system:
- Created a new `Login.jsx` component with a form for email and password
- Added a password field to the user schema in `users.js`
- Implemented a `users.login` Meteor method in `methods.js` for authentication
- Added session storage to maintain user state between page refreshes
- Implemented logout functionality in the application header

### 4. Role-Based Access Control Implementation

With the authentication and role systems in place, I then:
- Modified `App.jsx` to maintain the current user state and pass it to child components
- Modified the `Users.jsx` component to display user information based on permissions
- Modified the `Files.jsx` component to restrict operations based on role permissions
- Implemented permission checks for all UI elements and operations
- Created a modal for role changes with immediate UI updates when roles change

### 5. UX and Security Improvements

Finally, I enhanced the user experience and security:
- Added loading states during data fetching
- Implemented proper error handling for all operations
- Added validation for user inputs
- Protected sensitive operations with appropriate permission checks
- Added feedback through message notifications for all user actions

## Unexpected Issues and Assumptions

During implementation, I encountered several challenges:

1. **Permission Design Decisions**: While the role structure (admin, viewer, guest) was specified in the requirements, I needed to decide:
   - How granular permissions should be for each role (I chose to define specific capabilities like "canViewUsers" rather than broader permissions)
   - How to implement the exact restrictions for each role (e.g., what "restricted access" meant for viewers)
   - Where to store and check permissions (both client-side UI and server-side methods)

2. **Reactive Data Updates**: Meteor's reactivity system required careful handling to ensure UI components would update immediately when data changed. This was particularly important for role changes.

3. **Asynchronous Method Calls**: I needed to ensure all method calls were properly handled as async/await to prevent race conditions and properly handle errors.

4. **Server-Client Security Boundary**: I realized that client-side permission checks for UI rendering weren't sufficient - I needed to implement server-side permission validation in all methods to prevent unauthorized API access.

5. **Password Storage**: For the demo, I implemented a simplified authentication system using plaintext passwords. In a production application, this would need to be replaced with proper password hashing and additional security measures.

## Verification

To verify that my newly implemented role system works as expected, I developed a testing strategy:

1. **Login Testing**: Verified login functionality with the three demo accounts I created:
   - Admin (john@example.com / password)
   - Viewer (jane@example.com / password)
   - Guest (bob@example.com / password)

2. **Permission Testing**: For each role, I tested:
   - UI visibility (whether certain components are shown/hidden)
   - Verified that the Users component is completely hidden for Guest users
   - Confirmed that Viewers can see but not modify user roles
   - Validated that only Admins can delete files
   - Server-side restrictions (attempted operations that should be blocked)

3. **Role Change Testing**: Verified that when an admin changes another user's role:
   - The change is persisted in the database
   - The UI immediately reflects the change if the user is currently logged in
   - The user's permissions are updated without requiring a page refresh
   - Testing the role change modal functionality works correctly

4. **Edge Cases**: Tested several edge cases:
   - Attempting to access restricted features by directly calling Meteor methods
   - Verifying that users cannot change their own roles (preventing privilege escalation)
   - Testing behavior when a user's session is active but their role is changed by an admin

The implementation now provides a proper role-based authentication system that enforces permissions at both the UI and server levels, ensuring a secure and user-friendly experience aligned with the specified user roles.

## Conclusion

Building a role-based authentication system from scratch in this Meteor application required careful planning and implementation across multiple layers of the application. The key achievements include:

1. **Comprehensive Role Design**: Created a complete role system with three distinct roles and granular permissions for each action in the application

2. **Proper Authentication Flow**: Replaced the simple user-switching mechanism with a full login/logout system that properly maintains user sessions

3. **Consistent Permission Enforcement**: Implemented permission checks at both the UI level (for component visibility) and the server level (for operation security)

4. **Reactive UI Updates**: Ensured that role changes are immediately reflected in the UI without requiring page refreshes

5. **Improved User Experience**: Added clear feedback about permissions and operations through messages and UI state management

The architecture is now more secure and provides a foundation that could be extended with additional features such as registration, password recovery, or more granular permissions in the future. The code is also organized in a modular way that would make it easy to add more roles or permissions as the application grows.
