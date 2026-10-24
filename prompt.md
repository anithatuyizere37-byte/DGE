# PROJECT PROMPT: D&G E-COMMERCE MOBILE APPLICATION

## 1. Your Role

Act as a senior React Native mobile application developer, UI/UX designer, backend developer, database engineer, and software tester.

Design and develop a complete, functional, professional cross-platform e-commerce mobile application called **D&G E-Commerce** for a single retail shop located in Rwamagana, Rwanda.

Build the actual application, not just a design, prototype, or explanation. Create the project files, implement the screens, configure navigation, connect the backend, test the functionality, and document the system.

Work incrementally, verify each major stage, and fix errors before proceeding.

## 2. Project Requirements

The application must use the following technologies:

- **Mobile application:** React Native CLI, not Expo.
- **Programming language:** JavaScript.
- **Mobile navigation:** React Navigation.
- **Backend:** Node.js and Express.
- **Backend hosting:** Render.
- **Database:** Neon PostgreSQL.
- **API communication:** Axios.
- **State management:** React Context API and useReducer.
- **Authentication:** Secure authentication using password hashing and server-issued tokens.
- **Secure token storage:** A suitable native secure-storage library compatible with React Native CLI.
- **Form validation:** React Hook Form and Yup, or an equivalent suitable solution.
- **Multilingual support:** i18next and react-i18next.
- **Testing:** Jest and React Native Testing Library.

Use compatible package versions and native dependencies. Do not install Expo or use Expo-specific APIs, Expo Go, or Expo-only libraries.

If the repository already exists, inspect it before modifying anything. Preserve working code and build upon the existing project rather than unnecessarily recreating it.

## 3. Strict Brand Color Requirement

The entire application must use ONLY these three brand colors:

1. **White:** #FFFFFF
2. **Blue:** #1565C0
3. **Yellow:** #FFD600

These three colors must be used consistently across every screen, component, form, button, icon, chart, navigation bar, modal, badge, and dashboard.

Do not introduce any additional brand colors.

### Color usage rules

- White (#FFFFFF): Primary background, cards, input backgrounds, screen backgrounds, and readable spaces.
- Blue (#1565C0): Primary buttons, navigation icons, active tabs, headings, links, selected controls, borders, and important interface elements.
- Yellow (#FFD600): Primary highlights, promotional banners, call-to-action accents, selected indicators, cart badges, and important visual emphasis.

Use blue text on yellow backgrounds and white text on blue buttons where contrast is sufficient. Use blue text on white backgrounds for readability.

Do not use black, grey, green, red, orange, purple, beige, gradients involving other colors, or any additional accent colors.

For errors, success messages, warnings, loading states, and order statuses, communicate meaning using blue or yellow backgrounds, icons, borders, and text labels. Do not introduce red or green.

Product photographs may naturally contain other colors because they are actual product images. Do not apply extra brand-color overlays to product images.

Use a consistent color-token file, for example:

- COLORS.white = '#FFFFFF'
- COLORS.blue = '#1565C0'
- COLORS.yellow = '#FFD600'

All interface components must obtain their brand colors from these shared tokens.

## 4. Brand Identity and UI/UX Style

Brand name: D&G E-Commerce.

Create a modern, clean, trustworthy, user-friendly retail shopping experience.

Use:
- White backgrounds with blue navigation and yellow highlights.
- Clear typography using a font such as Inter.
- Rounded cards and consistent spacing.
- High-quality product photography.
- Simple icons and readable labels.
- Consistent button sizes and input styles.
- Smooth, restrained animations.
- Accessible font sizes and touch targets.
- Responsive layouts for different Android and iOS screen sizes.

Design for a typical 390 × 844 px mobile screen, while supporting other screen sizes and safe areas.

Avoid overcrowded screens and excessive decorative effects.

The application should look like one unified product, not separate applications with inconsistent styling.

## 5. Business Model and User Roles

D&G is a single retail shop. The application must support exactly two roles:

### Role A: Client

Clients can:
- Register an account.
- Log in and log out.
- Recover their passwords.
- Browse products.
- Search and filter products.
- View product details.
- Add products to the cart.
- Change quantities and remove items.
- Checkout and place orders.
- Select an available payment method.
- View their own order history.
- Track order progress.
- Manage their profiles and delivery addresses.
- Change the application language.

### Role B: Seller / Owner

There is only one shop owner: the owner of D&G.

The owner can:
- Log in securely.
- View the owner dashboard.
- Add, edit, and remove products.
- Upload and manage product images.
- Manage product categories, prices, and stock.
- View customer orders.
- Update permitted order statuses.
- View customer information necessary for order fulfilment.
- View sales summaries.
- View product, stock, customer, and order reports.
- Manage the shop's inventory.

Do not implement multiple vendors, seller registration, vendor dashboards, marketplace commissions, or multiple shops.

Public registration must create client accounts only. The owner account must be created through a secure setup process and must not be created by selecting an owner role in public registration.

Enforce all permissions on the backend, not only through the mobile interface.

## 6. Authentication Module

Create a separate authentication module.

Implement the following screens:

1. Splash screen.
2. Welcome screen.
3. Login screen.
4. Client registration screen.
5. Forgot-password screen.
6. Reset-password screen, when supported by the backend.
7. Authentication loading screen.
8. Logout confirmation dialog.

### Login fields

- Email or phone number, according to the backend API.
- Password.
- Show/hide password control.
- Forgot Password link.
- Login button.
- Link to client registration.

### Registration fields

- Full name.
- Email address.
- Phone number.
- Password.
- Confirm password.
- Terms and conditions acceptance.

Validate fields and display useful feedback using the approved blue and yellow palette.

Prevent unauthenticated users from accessing protected functions.

Restore the authentication session securely when the application restarts, where supported.

## 7. Client Home Screen

Create a polished home screen with:

- D&G brand logo or wordmark.
- Greeting message.
- Search bar.
- Promotional banner using blue, yellow, and white.
- Shop by Category section.
- Featured products.
- New arrivals.
- Best sellers, when supported by available data.
- Product cards with images, names, prices, and stock availability.
- Add to Cart controls.
- Cart icon with an item-count badge.

Product categories:

- Clothes.
- Shoes.
- Bags.
- Household Equipment.
- Jewellery.
- Cosmetics.

Use Rwandan francs (RWF) for displayed prices.

Create a bottom navigation bar with:

- Home.
- Categories.
- Cart.
- Orders.
- Profile.

Use blue for active navigation items, white for the navigation background, and yellow for selected indicators or badges.

## 8. Product Browsing and Search

Implement the following screens:

### Categories Screen

Display category cards with product images, category names, and item counts where available.

### Product Listing Screen

Include:
- Product image.
- Product name.
- Price in RWF.
- Availability.
- Search field.
- Filter control.
- Sort control.
- Add to Cart button.

### Search and Filtering

Support:
- Search by product name.
- Filter by category.
- Minimum and maximum price.
- Filter by stock availability.
- Sort by price ascending.
- Sort by price descending.
- Sort by newest, when supported.

### Product Details Screen

Display:
- Product image gallery.
- Product name.
- Description.
- Price.
- Category.
- Stock availability.
- Quantity selector.
- Add to Cart button.
- Related products when available.

Handle out-of-stock products, loading states, network failures, and empty search results.

## 9. Shopping Cart

Implement a complete shopping cart.

Each cart item should display:
- Product image.
- Product name.
- Unit price.
- Quantity controls.
- Item subtotal.
- Remove action.

Include:
- Continue Shopping.
- Clear Cart with confirmation.
- Subtotal.
- Delivery fee where applicable.
- Discount where applicable.
- Total cost.
- Proceed to Checkout.

Recalculate totals when quantities change. Validate stock and prices against the backend before placing an order.

Persist cart data according to the chosen backend and state-management design.

Handle empty carts, unavailable products, quantity limits, and API failures.

## 10. Checkout and Payments

Create a checkout flow with these screens or steps:

### Delivery Information

- Customer name.
- Phone number.
- Delivery address.
- City or district.
- Additional delivery instructions.

### Payment Method

Support payment methods actually configured by the backend, such as:
- Cash on Delivery.
- Mobile Money, if a provider is integrated.

Do not pretend that online payments are operational without a real payment-provider integration.

### Order Review

Display:
- Ordered products.
- Quantities.
- Unit prices.
- Subtotal.
- Delivery fee.
- Discount.
- Total.
- Delivery address.
- Payment method.

### Order Confirmation

Display:
- Confirmation message.
- Order number.
- Order summary.
- Total amount.
- Payment status.
- Track Order button.
- Continue Shopping button.

Prevent duplicate order submissions. Only show success when the backend confirms that the order was created.

## 11. Order History and Tracking

Create an Order History screen showing:
- Order number.
- Order date.
- Total cost.
- Item count.
- Payment status.
- Order status.
- View Details button.

Provide status filters when supported by the backend.

Create an Order Details screen showing the purchased items, prices, delivery address, payment information, and current status.

Create an Order Tracking screen with a visual timeline for applicable stages:

1. Order Placed.
2. Order Confirmed.
3. Processing.
4. Shipped or Out for Delivery.
5. Delivered.

Display only statuses and timestamps returned by the backend. Support cancellation states and unavailable tracking information.

## 12. Client Profile and Settings

Implement:
- Profile information.
- Edit Profile.
- Manage Delivery Addresses.
- My Orders.
- Language Settings.
- Help and Support.
- About D&G.
- Privacy Policy.
- Terms and Conditions.
- Logout.

Support English, Kinyarwanda, and French through a multilingual framework. Translate interface labels, buttons, validation messages, navigation labels, and order statuses.

Use the same white, blue, and yellow color scheme for every language.

## 13. Owner Dashboard

Create a separate, protected owner interface.

Use a professional dashboard layout with white cards, blue headings, yellow highlights, and blue/yellow charts.

Display:
- Total sales for a selected period.
- Total orders.
- Pending orders.
- Delivered orders.
- Products in stock.
- Low-stock count.
- Recent orders.
- Best-selling products.
- Sales trend chart.

Support date filters such as Today, Last 7 Days, and Last 30 Days where the API supports them.

Do not hardcode production sales metrics. Use data from the backend.

Owner bottom navigation:

- Dashboard.
- Products.
- Orders.
- Reports.
- Profile.

## 14. Product and Inventory Management

Create these owner screens:

### Product Management

Display a searchable product list with:
- Product image.
- Name.
- Price.
- Stock quantity.
- Category.
- Availability.
- Edit action.
- Delete action.

### Add Product

Fields:
- Product name.
- Description.
- Category.
- Price in RWF.
- Stock quantity.
- Product image upload.
- Optional SKU.

### Edit Product

Allow the owner to update product information, price, category, image, and stock.

### Inventory Screen

Display:
- Available stock.
- Low-stock products.
- Out-of-stock products.
- Stock update controls.

Validate prices and stock quantities before submission.

Use confirmation dialogs for destructive actions and show clear feedback after operations.

## 15. Owner Order Management

Create an order-management interface showing:
- Order number.
- Customer name.
- Order date.
- Total amount.
- Payment status.
- Order status.
- View Details action.

Allow the owner to open an order and view relevant customer information, ordered items, quantities, totals, delivery address, and payment status.

Provide status-update controls subject to backend permissions and valid order transitions.

Require confirmation for important changes. Do not automatically mark an order as paid unless payment has been confirmed.

## 16. Reports and Analytics

Implement report screens for:

### Sales Reports
- Total sales.
- Order count.
- Average order value.
- Sales trends.
- Date-range filters.

### Product Reports
- Product catalogue.
- Stock levels.
- Low-stock products.
- Out-of-stock products.
- Best-selling products.

### Order Reports
- Orders by status.
- Order dates.
- Order totals.
- Payment and delivery statuses.

### Customer Reports
- Customer account information required for shop operations.
- Order counts.
- Purchase totals where supported.

Allow CSV or PDF export only if implemented and supported.

Restrict reports and customer information to the authenticated owner.

All report interfaces must use only the approved brand colors.

## 17. Navigation Architecture

Use React Navigation with separate navigators:

- Root Navigator.
- Authentication Navigator.
- Client Navigator.
- Owner Navigator.

After authentication, obtain the user's actual role from the backend and navigate to the correct interface.

Clients must never access owner-only screens or operations.

The owner must not be able to create additional owners through public registration.

Implement loading screens while restoring sessions and handling authentication changes.

## 18. Backend Architecture

Create a separate Node.js and Express backend project if one does not already exist.

Deploy the backend on Render and use Neon PostgreSQL for persistent storage.

Use environment variables for:
- Database connection string.
- JWT signing secret or other authentication secrets.
- Allowed origins or security settings as appropriate.
- Payment-provider credentials, if needed.

Never commit secrets to Git or include the database connection string in the mobile application.

Use a PostgreSQL connection pool configured for Neon and parameterized SQL queries or a suitable ORM.

Create database tables for:
- Users.
- Categories.
- Products.
- Addresses.
- Carts.
- Cart items.
- Orders.
- Order items.
- Payments.

Use appropriate foreign keys, constraints, indexes, timestamps, and transaction handling.

Implement secure password hashing, token verification, role-based authorization, request validation, error handling, and secure order creation.

Suggested API modules:
- Authentication.
- Users and profiles.
- Categories.
- Products.
- Cart.
- Checkout and orders.
- Payments.
- Reports.

If an API has already been provided, inspect its documentation and integrate its real endpoints instead of replacing it with a new API.

If the API has not been provided, build the backend and document the API endpoints that the mobile app requires.

## 19. API Integration

Use Axios with a shared API client.

Configure the API base URL using an appropriate application configuration mechanism.

Implement:
- Request and response handling.
- Authentication headers.
- Loading states.
- Error handling.
- Request timeouts.
- Network failure messages.
- Retry controls where appropriate.
- Session expiry handling.
- Consistent response parsing.

Use HTTPS for the production API.

Never connect directly to Neon from the mobile application.

Never hardcode real credentials, tokens, customer information, or secret keys.

## 20. State Management

Use React Context API and useReducer, or another justified lightweight state-management approach.

Separate state for:
- Authentication.
- Products.
- Cart.
- Orders.
- User profile.
- Language settings.

Keep the cart and displayed totals consistent across screens.

Synchronize order status with backend data.

Avoid unnecessary duplicate API requests and stale data.

## 21. Testing and Quality Assurance

Test the application on Android and iOS simulators or devices.

Create tests for:
- Registration and login.
- Invalid credentials.
- Role-based navigation.
- Product listing.
- Search and filtering.
- Cart quantity changes.
- Cart totals.
- Checkout validation.
- Order creation.
- Order tracking.
- Product management.
- Owner-only authorization.
- API errors.
- Network disconnection.
- Empty states.
- Language switching.

Check responsiveness, performance, accessibility, and usability.

Fix runtime errors, build errors, navigation issues, and failed tests before declaring the implementation complete.

Use only white, blue, and yellow for all interface states, including testing demonstrations.

## 22. Project Structure

Use a maintainable structure similar to:

DGECommerce/
  android/
  ios/
  src/
    api/
    assets/
    components/
    constants/
    context/
    hooks/
    navigation/
    screens/
      auth/
      client/
      owner/
    services/
    translations/
    utils/
  App.js
  package.json

DGECommerceBackend/
  src/
    config/
    controllers/
    middleware/
    routes/
    services/
    validators/
    utils/
  migrations/
  tests/
  .env.example
  package.json
  server.js

Adapt this structure to the actual project and library versions.

Keep the React Native app and backend independently runnable and deployable.

## 23. Required Deliverables

Produce:
1. Complete React Native CLI source code.
2. Separate authentication module.
3. Client shopping interface.
4. Owner management interface.
5. Product browsing, search, and filtering.
6. Shopping cart and checkout.
7. Order history and tracking.
8. Backend API source code if required.
9. Neon PostgreSQL schema and migrations.
10. Render deployment configuration and instructions.
11. Environment-variable example files without secrets.
12. Automated test cases and results.
13. Screenshots of implemented features.
14. Technical documentation.
15. API documentation.
16. Final project report.
17. Setup instructions for Android and iOS.
18. A record of known limitations and incomplete integrations.

## 24. Development Workflow

Follow this workflow:

PHASE 1: Inspect the workspace, available files, installed tools, and existing code.

PHASE 2: Establish the project structure, design system, color tokens, and navigation.

PHASE 3: Implement authentication and role-based navigation.

PHASE 4: Implement product browsing, search, filtering, and product details.

PHASE 5: Implement the shopping cart and checkout.

PHASE 6: Implement order history and tracking.

PHASE 7: Implement the owner dashboard, product management, inventory, and orders.

PHASE 8: Implement reports and multilingual support.

PHASE 9: Build and connect the backend and Neon database, then deploy to Render.

PHASE 10: Test all workflows, fix issues, capture screenshots, and prepare documentation.

If a backend dependency or API detail is missing, identify it clearly and use a safe, documented development configuration until the required information is available. Do not claim an external integration is working when it has not been configured or tested.

## FINAL INSTRUCTION

Start by inspecting the current workspace and determining whether a React Native CLI project or backend already exists. Then implement the application incrementally.

Prioritize a working, maintainable application over generating large amounts of untested code.

**The most important design requirement is absolute consistency: use only WHITE (#FFFFFF), BLUE (#1565C0), and YELLOW (#FFD600) as interface brand colors throughout the entire D&G E-Commerce application.**

The finished product must represent one D&G shop with only two user roles: Client and Seller/Owner.