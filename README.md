#FindItHere - Campus Lost and Found

##🚀Introduction
FindItHere is designed to be a hub for lost and found items in a college campus, which is built with a secure microservice architecture. The platform ensures only verified students can participate.

##Core Features:
**-> User Authentication:**
1. College-Only Registration: Only users with valid college email domain can sign up.
2. OTP Email Verification: User authenticity is ensured by sending a One Time Password to the user's email for verification.
3. JWT-Based Sessions: JSON Web Tokens are used for secured and stateless user login sessions.

**-> Item Management:**
1. Dashboard View: A clean UI displaying all recently reported loss and found items.
2. Report Items: Valid users can easily report a lost or found item by clicking 'Report an item' and describe the items.
3. Cloudinary Image Uploads: Uploads item images via the Cloudinary CDN for high performance and scalabilty.

**-> Search Management:** Allows users to search for items through keywords or filtering by category and item type.

🛠️Tech Stack & Architecture
The backend is built using a Microservice Architecture, each functionality is independent and self-contained services. The three services are :
1. Authentication Service: User Registration, OTP Verification, login and JWT Generation.
2. Item Management Service: Create items found or lost, including image uploads.
3. Search & Filter Service: Dedicated endpoints for search and filtering logic.

Technologies Used:
Frontend: React.js (with Vite), Tailwind CSS, Axios
Backend: Node.js, Express.js
Database: MongoDB (with Mongoose)
Image Storage: Cloudinary
Email Service: Nodemailer
Authentication: JSON Web Tokens (JWT), bcrypt.js

⛓️Setup And Installation
In order to run the project on your local machine, the following steps must be followed:

1. Clone the repository
   ```git clone https://github.com/mangalton/FindItHere
   cd FindItHere```

2. Backend Setup
   Each of the three microservices needs to be configured and run separately.
   For every microservice:
   A. Create and Configure a ```.env``` file:
       a ```.env``` file must be created for each of the three service directories.
         It must contain the following, replace the placeholders with your credentials:
   ```#MongoDB Connection
   MONGO_URI = <your_mongodb_url>

   #JWT Configuration
   JWT_SECRET= <your_secret_key>

   #College domain
   COLLEGE_DOMAIN = @iitj.ac.in

   #Cloudinary Credentials:
   CLOUDINARY_CLOUD_NAME = <your_cloud_name>
   CLOUDINARY_API_KEY = <your_api_key>
   CLOUDINARY_API_SECRET = <your_api_secret>

   #Email Configuration
   EMAIL_HOST = smtp.gmail.com
   EMAIL_USER = <your_email>
   EMAIL_PASS = <16_character_gmail_app_password>```

B. Install Dependencies:
    After navigating into each service's directory , run:
    ```npm install```

C. Run the services:
    On three different terminal windows, go to each directories and run the server.
    ```Terminal 1(Auth Service)
    cd backend/auth-service
    node index.js

    Terminal 2(Item Service)
    cd backend/iterm-service
    node index.js

    Terminal 3(Search Service)
    cd backend/search-service
    node index.js```

3. Frontend Setup:
   A. Install Dependecies:
       ```cd findithere-app
       npm install```
   B. Run the development server:
       ```npm run dev```
   
