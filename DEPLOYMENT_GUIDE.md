# How to Publish Your App (Make it Public)

The easiest way to share your Inventory App with the world is using **Vercel**. It is free, fast, and works perfectly with React/Vite apps.

## Option 1: The "Magic" Command (Recommended)

1.  Open a new terminal in this folder (or use the one you have).
2.  Run the following command:
    ```bash
    npx vercel
    ```
3.  Follow the prompts:
    *   **Log in**: It will open your browser. Log in with GitHub, Google, or Email.
    *   **Set up and deploy?**: Type `y` (Yes).
    *   **Which scope?**: Press Enter (select your personal account).
    *   **Link to existing project?**: Type `n` (No).
    *   **Project Name**: Press Enter (defaults to folder name) or type a name like `kirana-app`.
    *   **In which directory?**: Press Enter (default `./`).
    *   **Want to modify settings?**: Type `n` (No).

4.  Wait about 1 minute.
5.  Done! It will verify and give you a **Production** link (e.g., `https://kirana-app-sigma.vercel.app`).
6.  Share that link with anyone!

## Option 2: Netlify (Alternative)

1.  Run:
    ```bash
    npx netlify-cli deploy --prod
    ```
2.  It will also ask you to log in via browser and authorize.
3.  Select "Create & configure a new site".
4.  Set "Publish directory" to `dist`.
5.  You will get a link like `https://funny-name-123456.netlify.app`.

---

## Important Note

Since we are using "Local Storage" (`localStorage`) for the database:
*   The data (products, customers, orders) is saved **on the specific device/browser** that opens the app.
*   If you open the link on your phone, you won't see the data you entered on your laptop. You will start with the "initial mock data".
*   This is perfect for an MVP demo! For a real multi-user app, you would need a cloud database (like Firebase) which we removed earlier for simplicity.
