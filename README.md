HotShop: A Modern E-Commerce Platform
HotShop is a full-stack e-commerce application built with Next.js 14 (App Router), designed for flash sales and efficient product management. It provides a seamless shopping experience for users and a robust administration panel for store owners.

✨ Features
User-Facing:

Product Listings: Browse all products with category filtering.

Product Details: View detailed product information, including prices, descriptions, and images.

Flash Sales: Products marked as flash sales display a countdown timer and discounted prices.

Shopping Cart: Add products to a persistent shopping cart.

Wishlist: Save products to a personal wishlist.

User Authentication: Secure login and signup using NextAuth.js (supporting Google OAuth and credentials).

User Account Management: View order history, manage reviews, and update profile settings.

Responsive Design: Optimized for a smooth experience across mobile, tablet, and desktop devices.

Toasts: User-friendly notifications for actions (e.g., "Product added to cart!").

Admin Panel:

Dashboard Overview: Key statistics on products, categories, users, reviews, and orders.

Product Management: Add new products (with image uploads).

Category Management: Add new product categories.

User Management: (Placeholder for future implementation)

Review Management: (Placeholder for future implementation)

Order Management: (Placeholder for future implementation)

🚀 Technologies Used
Frontend:

Next.js 14 (App Router): React framework for building performant web applications with Server Components and Client Components.

React: JavaScript library for building user interfaces.

TypeScript: Strongly-typed superset of JavaScript for enhanced code quality and maintainability.

Tailwind CSS: Utility-first CSS framework for rapid and consistent styling.

Lucide React: Beautiful, open-source icons.

react-hot-toast: Lightweight and customizable toast notifications.

colorthief: (Client-side) For extracting dominant colors from images for dynamic backgrounds.

Backend & Database:

NextAuth.js: Flexible authentication library for Next.js applications (Google OAuth, Credentials Provider).

Prisma ORM: Next-generation ORM for Node.js and TypeScript, used for database interactions.

PostgreSQL (via Supabase): Relational database for storing application data.

Supabase Storage: For storing product images and other media assets.

Next.js API Routes: For building server-side API endpoints (/api/cart, /api/wishlist, etc.).

Deployment:

Vercel (Recommended): Ideal for deploying Next.js applications.

⚡ Performance Optimizations
A strong focus has been placed on optimizing the application's performance, as evidenced by high Lighthouse scores (typically 95+ for Performance on both mobile and desktop). Key strategies implemented include:

Next.js Server Components: Leveraging Server Components to fetch data and render HTML on the server, reducing client-side JavaScript and improving Time To First Byte (TTFB).

Code Splitting & Lazy Loading: Using React.lazy and React.Suspense to dynamically import and render client-side components (e.g., modals, countdown timers, UI elements) only when they are needed, significantly reducing Total Blocking Time (TBT).

next/image Optimization: Configured next.config.ts to enable automatic image optimization (resizing, format conversion to WebP/AVIF) for images hosted on Supabase and other external domains (lh3.googleusercontent.com), drastically improving Largest Contentful Paint (LCP).

Efficient Data Fetching: Optimized API routes and Prisma queries to minimize database calls (e.g., addressing N+1 query problems) and ensure data is fetched efficiently.

Asynchronous Script Loading: External scripts like ColorThief are loaded asynchronously to prevent render-blocking.

🛠️ Getting Started
Follow these steps to set up and run the HotShop project locally:

Prerequisites
Node.js (v18.x or later recommended)

npm or Yarn

Git

1. Clone the Repository
git clone <your-repository-url>
cd hotshop

2. Install Dependencies
npm install
# or
yarn install

3. Set up Environment Variables
Create a .env.local file in the root of your project and add the following environment variables. Replace the placeholder values with your actual credentials.

# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[YOUR_DB_PASSWORD]@db.[YOUR_SUPABASE_PROJECT_REF].supabase.co:5432/postgres?schema=public"

# Supabase Storage (for images)
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_SUPABASE_PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR_SUPABASE_ANON_KEY]"

# NextAuth.js
NEXTAUTH_SECRET="[A_VERY_LONG_RANDOM_STRING_FOR_PRODUCTION]" # Generate with `openssl rand -base64 32` or similar
NEXTAUTH_URL="http://localhost:3000" # For local development

# Google OAuth (Optional, if you enable Google login)
GOOGLE_CLIENT_ID="[YOUR_GOOGLE_CLIENT_ID]"
GOOGLE_CLIENT_SECRET="[YOUR_GOOGLE_CLIENT_SECRET]"

# Application URL (for server-side fetches in API routes)
NEXT_PUBLIC_APP_URL="http://localhost:3000" # For local development

Important Notes:

DATABASE_URL: Get this from your Supabase Project Settings -> Database -> Connection String. Ensure you use the prisma user or a user with full access.

NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY: Get these from your Supabase Project Settings -> API.

NEXTAUTH_SECRET: Crucial for production security. Generate a strong, random string.

NEXT_PUBLIC_APP_URL: This is used for server-side fetches within API routes. In production, this should be your deployed domain (e.g., https://your-hotshop-domain.vercel.app).

4. Set up Supabase Storage
In your Supabase project, go to Storage.

Create a new bucket named product-images.

Set its policies to allow public reads (if you want images to be publicly accessible without authentication). A common policy for public read is:

CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

And for authenticated upload:

CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

Adjust policies as per your security requirements.

5. Run Prisma Migrations
This will sync your Prisma schema with your Supabase PostgreSQL database.

npx prisma migrate dev --name init

6. Run the Development Server
npm run dev
# or
yarn dev

Open http://localhost:3000 in your browser to see the application.

📁 Project Structure (Key Directories)
src/app/: Next.js App Router pages and API routes.

src/_components/: Reusable React components (categorized by function, e.g., account, admin, ui).

src/lib/: Backend logic, database services (Prisma interactions), authentication setup, Supabase client.

src/styles/: Global CSS.

prisma/schema.prisma: Your database schema definition.

💡 Future Enhancements
Full implementation of Product, Category, User, Order, and Review tables in the Admin Dashboard with search, pagination, and filtering.

Advanced analytics and charting in the Admin Dashboard.

Payment gateway integration (e.g., Stripe).

Search functionality for products.

Product filtering and sorting options on the frontend.

Email notifications for orders and other events.

More robust error handling and user feedback.

📄 License
This project is open-source and available under the MIT License.

✍️ Author
[Your Name/GitHub Profile Link]