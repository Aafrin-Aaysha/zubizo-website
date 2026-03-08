# Zubizo Deployment & Hosting Guide

This guide will walk you through launching the Zubizo Luxury Studio from scratch, ensuring a fast, premium experience for your clients.

## 1. The "Server vs Database" Question
> [!IMPORTANT]
> **Do you need a server?** Yes, but not a traditional one you have to manage.
> - **Next.js (Vercel):** This is your **Server**. It runs your code, handles search, and generates pages. Vercel's "Serverless" architecture means it scales automatically for any amount of traffic without lagging.
> - **MongoDB Atlas:** This is your **Database**. it only stores your products, settings, and inquiries.
> 
> By using **Vercel + MongoDB Atlas**, you get the fastest possible setup without needing to be a server administrator.

---

## Step 1: Buy Your Domain
1. **Providers:** I recommend [Namecheap](https://www.namecheap.com/) or [Google Domains/Squarespace](https://domains.squarespace.com/).
2. **Purchase:** Buy `zubizo.com` (or your preferred extension).
3. **Note:** You keep this domain; we will point it to our hosting later.

---

## Step 2: Set Up the Database (MongoDB Atlas)
Since your local code uses a local database, we must move it to the cloud so the live site can reach it.
1. Sign up for a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Create a Cluster:** Choose "Shared" (it's free). Pick a region close to your customers (e.g., Mumbai for India).
3. **Security:** 
   - Create a database user (e.g., `zubizo_admin`). Save the password!
   - Under "Network Access," click "Add IP Address" and select **"Allow Access from Anywhere"** (required for Vercel).
4. **Connection String:** Click "Connect" -> "Drivers" -> Copy the `mongodb+srv://...` string.
   - *Replace `<password>` with your database user's password.*

---

## Step 3: Hosting the Website (Vercel)
Vercel is built by the same team that created Next.js. It is the gold standard for speed.
1. Sign up at [Vercel](https://vercel.com/) (Login with your GitHub account).
2. **Import Project:** Click "Add New" -> "Project". Import `zubizo-website`.
3. **Configure Environment Variables:** 
   In the "Environment Variables" section of the setup, add these:
   - `MONGODB_URI`: (Your string from Step 2)
   - `JWT_SECRET`: `7e65b9bdb6de50379203f5824de4b594f0020a0f20afe76b6296b1c4d117ebd2`
   - `CLOUDINARY_CLOUD_NAME`: `dh7qf0ime`
   - `CLOUDINARY_UPLOAD_PRESET`: `zubizo_preset`
4. **Deploy:** Click "Deploy". Vercel will build the site and give you a `.vercel.app` URL.

---

## Step 4: Connect Your Domain
1. In your **Vercel Dashboard**, go to **Settings > Domains**.
2. Add your domain (e.g., `zubizo.com`).
3. Vercel will give you "DNS Records" (an `A record` and a `CNAME`).
4. Log into your **Domain Provider** (Namecheap/Google) and paste those records into their DNS settings.
5. In 10-60 minutes, `zubizo.com` will be live with a secure SSL (padlock) icon.

---

## Ensuring High Speed & Flow
To keep the site "running good" as you requested:
- **Edge Caching:** Vercel automatically places your site on servers all over the world, so it loads instantly everywhere.
- **Image Optimization:** We are already using **Cloudinary** and **Next.js Image**, which automatically resizes images for mobile so they don't lag on slow connections.
- **Static Generation:** Your pages are pre-built by the build process I just verified, making them purely fast for the end user.

---

## Final Functional Check
Once live, go to your new URL and verify:
1. **Admin Panel:** Log in and change a title to ensure the DB is connected.
2. **Inquiry Form:** Send a test inquiry to see if it appears in the logs.
3. **Cart:** Add items to ensure the state flow is smooth.
