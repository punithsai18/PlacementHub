# PlacementHub – AI-Powered Cloud-Based Placement Management System

A full-stack placement management platform featuring AI-powered resume analysis, real-time chat, and intelligent candidate search, deployed entirely on Microsoft Azure.

---

## Project Modules
- **Student Portal**: Enables students to register, authenticate securely, upload their resumes, browse available job postings, and track their application statuses.
- **Company Portal**: Allows companies to register, authenticate securely, post new jobs, manage applicants, update application statuses, and search for candidates by skills.
- **AI Resume Processing**: An automated pipeline that takes uploaded student resumes and extracts key insights, specifically identifying technical skills.
- **Real-Time Communication**: A WebSocket-based chat system enabling instant messaging between candidates and company HR representatives.
- **Candidate Intelligence & Search**: An intelligent search system that allows companies to discover candidates based on complex skill queries.

---

## Cloud Services Used
- Azure App Service
- Azure SQL Database
- Azure Blob Storage
- Azure AI Document Intelligence
- Azure Functions
- Azure Web PubSub
- Azure Cosmos DB
- Azure Cognitive Search
- Azure Key Vault
- Azure Application Insights & Log Analytics

---

## Cloud Services Used and Their Purpose

1. **Azure App Service (Web Apps)**
   - **Purpose:** Hosts the Express.js Node backend API and serves the production-ready React frontend application.

2. **Azure SQL Database**
   - **Purpose:** Acts as the primary relational database to securely store structured data such as user profiles (Students/Companies), Job listings, and Application statuses.

3. **Azure Blob Storage**
   - **Purpose:** Securely manages and stores unstructured binary files, specifically the resume documents (PDFs, DOCX) uploaded by students.

4. **Azure AI Document Intelligence (Form Recognizer)**
   - **Purpose:** Automatically scans, parses, and extracts critical text and technical skills from the uploaded student resumes, replacing manual data entry.

5. **Azure Functions (Serverless)**
   - **Purpose:** Runs background, event-driven processes. Specifically, it executes `ResumeProcessor` to analyze a resume asynchronously the moment it is uploaded to Blob Storage.

6. **Azure Web PubSub**
   - **Purpose:** Powers the real-time, bi-directional WebSocket chat features, handling persistent connections without overwhelming the backend server.

7. **Azure Cosmos DB**
   - **Purpose:** A globally distributed NoSQL database utilized to rapidly store and retrieve high-velocity, unstructured real-time chat message histories.

8. **Azure Cognitive Search**
   - **Purpose:** Enables advanced, full-text intelligent searching to help companies find candidates based on complex skill matching.

9. **Azure Key Vault**
   - **Purpose:** Centrally manages and securely stores sensitive application secrets like database passwords, API keys, and connection strings.

10. **Azure Application Insights & Log Analytics**
    - **Purpose:** Monitors the live application to detect performance anomalies, log application errors, and analyze user telemetry.

---

## Project Execution Steps

### Step 1: Define Requirements and Architecture
- Store structured user data (Students/Companies) securely in **Azure SQL Database**.
- Use **Azure App Service** to securely host the frontend client and backend API.
- Incorporate Event-Driven Architecture using **Azure Blob Storage** and **Azure Functions** for file processing.

### Step 2: Setup Azure Database for Users and Entities
- Provision an **Azure SQL Database** instance.
- Define relational tables with appropriate fields: `Students` (id, email, passwordHash, skills), `Companies`, `Jobs`, and `Applications`.
- Secure the databases by restricting network access via Azure Firewall and managing credentials using **Azure Key Vault**.

### Step 3: Implement User Registration and Authentication
- Develop Express.js routes to handle Student and Company registration.
- Hash text passwords using `bcrypt` before storing the user details in the Azure SQL database.
- Create an authentication route that verifies credentials and returns JSON Web Tokens (JWT) for secure session management.

### Step 4: Implement AI Resume Processing
- Develop a backend endpoint that accepts file uploads and securely transfers the resumes into **Azure Blob Storage**.
- Configure a serverless **Azure Function** using a Blob Trigger to actively watch the storage container.
- Within the function, utilize **Azure AI Document Intelligence** to analyze the document, extract candidate skills, and update the student's record in the Azure SQL Database.

### Step 5: Implement Job Management and Candidate Discovery
- Build API controllers allowing Companies to perform CRUD operations on job postings.
- Incorporate **Azure Cognitive Search** to allow companies to perform complex keyword searches against the pool of student skills.
- Develop endpoints for students to apply for jobs, creating junction records in the `Applications` table.

### Step 6: Implement Real-Time Chat Communication
- Set up **Azure Web PubSub** to establish and maintain bi-directional WebSocket connections between the client and server.
- Intercept chat messages and persist them into an **Azure Cosmos DB** collection for highly available chat history retrieval.

### Step 7: Test and Deploy
- Test all REST API endpoints using Postman and validate real-time WebSocket communication.
- Deploy the frontend bundle and backend server to their respective **Azure App Service** instances.
- Enable and monitor live API usage, throughput, and error rates using **Azure Application Insights** and monitor backend logs using **Azure Log Analytics**.
    