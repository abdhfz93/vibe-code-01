📁 Core Folders
app/: This is the heart of your website. In Next.js (the framework we're using), the folders inside app define your web pages.
page.tsx is your homepage.
maintenance/page.tsx is the "Maintenance Records" page you've been working on.
components/: Think of these as reusable LEGO blocks. Instead of writing the same code for a table or a form over and over, we build a "component" once here and use it wherever we need it.
lib/: Short for "library." This folder contains setup code for external tools. In your case, it has the connection to Supabase (your database).
supabase/: This contains the "blueprints" for your database. The 
.sql
 files here are instructions for Supabase to create your tables and rules.
types/: This defines the shape of your data. It tells the code, "A Maintenance Record must have a date, a server name, and a reason." This helps prevent errors.
node_modules/: (You can ignore this) This folder is huge and contains all the pre-built code your app needs to run. You never need to touch this yourself.
📄 Important Files
package.json
: This is the recipe card for your project. It lists all the ingredients (tools and libraries) needed to make the app work.
.env.local
: This is a safe for your secrets. It contains your private Supabase keys that connect the app to your database.
README.md
: The instruction manual for humans. It explains what the project is and how to get it running.
tailwind.config.ts
: The "style manual." It controls the colors, fonts, and layout options for the app's design.
tsconfig.json
: Rules for how your code should be checked for mistakes.


