
# S.P.R.E.A.D.

### System for Processing, Routing, Equipment, Allocation, and Distribution

S.P.R.E.A.D. is a food supply traceback system developed as a Computer Science database project at Middle Tennessee State University.

The purpose of this application is to help investigate potential foodborne illness outbreaks by connecting food products, shipment records, distribution locations, laboratory results, recalls, and reported illness cases.

Using a relational database and web application, S.P.R.E.A.D. allows users to trace food products through the supply chain and visualize potential contamination pathways.

## Technologies Used

### Frontend
- React
- JavaScript
- HTML and CSS
- Vite
- Leaflet and OpenStreetMap

### Backend
- C++
- REST API
- JSON
- PostgreSQL client library (libpq)

### Database
- PostgreSQL
- Supabase

### Development Tools
- Docker and Docker Compose
- Git and GitHub
- Visual Studio Code
- CMake

## System Architecture

S.P.R.E.A.D. uses a full-stack architecture consisting of three main components:

**React Frontend**
- Provides the user interface.
- Allows users to search for food lots.
- Displays shipment records, laboratory results, recalls, and illness information.
- Visualizes geographic data using interactive maps.

**C++ Backend**
- Handles API requests from the frontend.
- Communicates with the PostgreSQL database.
- Retrieves and processes database records.
- Returns structured JSON responses.

**Supabase PostgreSQL Database**
- Stores food supply and outbreak-related records.
- Connects products, lots, shipments, locations, and illness reports through relational tables.
- Supports database queries used for traceback investigations.

### Application Data Flow

```text
           User
            |
            v
     React Frontend
            |
            | HTTP Requests
            v
       C++ REST API
            |
            | SQL Queries
            v
   Supabase PostgreSQL
            |
            | Database Results
            v
       C++ REST API
            |
            | JSON Response
            v
     React Dashboard
```

Docker Compose is used to build and run the application locally.

## Current Features

### 1. Dashboard

The dashboard provides an overview of the food supply traceback system.

It includes:
- Reported illness cases
- Tracked food lots
- Distribution locations
- Product traceback search
- Illness case records
- Outbreak mapping

The dashboard presents information retrieved through the application's backend and database.

### 2. Product Traceback

Users can search for a food product using its Lot ID.

The application retrieves related information from Supabase through the C++ REST API.

Depending on the available records, the traceback results can include:
- Product information
- Lot identification
- Shipment history
- Distribution locations
- Laboratory test results
- Recall information

This feature allows users to investigate where a product originated and how it moved through the supply chain.

### 3. Shipment History

The shipment history section displays transportation and distribution records associated with a selected food lot.

Shipment information can include:
- Shipment identifiers
- Origin locations
- Destination locations
- Shipment dates
- Product quantities

These records help users understand the movement of food products between facilities.

### 4. Laboratory Testing

S.P.R.E.A.D. displays laboratory testing information associated with food lots.

Laboratory records help users review testing outcomes and identify products that may require further investigation.

### 5. Recall Information

The application displays recall records associated with food products and lots.

This information helps users identify products that have been flagged for recall and review their related supply chain records.

### 6. Illness Cases

The Illness Cases section displays reported illness records.

These records provide additional information that can support investigations into potential foodborne outbreaks.

Reported exposures should be treated as possible associations rather than confirmed sources of contamination.

### 7. Interactive Outbreak Map

S.P.R.E.A.D. uses Leaflet and OpenStreetMap to display geographic information.

The map supports:
- Interactive zooming and navigation
- Illness exposure locations
- Distribution facilities
- Shipment routes between locations

The mapping functionality helps users visualize the geographic relationships between food distribution and reported illnesses.

### 8. Relational Database

The application uses PostgreSQL hosted through Supabase.

The database contains related tables for:
- Food products
- Product lots
- Locations
- Shipments
- Shipment items
- Illness reports
- Exposures
- Pathogens
- Laboratory tests
- Recalls

Primary and foreign keys connect these records and help maintain referential integrity.

## How to Run the Project

### Requirements

Before starting, make sure you have:

- Git
- Docker Desktop
- Access to the S.P.R.E.A.D. Supabase database

### Step 1: Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/skabby213/S.P.R.E.A.D.git
cd S.P.R.E.A.D
```

The current project is maintained on the `main` branch.

If you already have the project downloaded, update it using:

```bash
git pull origin main
```

### Step 2: Configure the Database

Create a `.env` file in the main project directory, alongside `docker-compose.yml`.

Add the PostgreSQL connection string:

```env
DATABASE_URL=your_database_connection_string
```

The connection string must be obtained from the project administrator.

**Security:** Never upload your `.env` file, database password, or other credentials to GitHub.

### Step 3: Start Docker

Open Docker Desktop and wait until the Docker engine is running.

From the main project directory, run:

```bash
docker compose up --build
```

Docker will build and start the application containers.

To run the application in the background, use:

```bash
docker compose up --build -d
```

### Step 4: Open the Application

Once Docker finishes starting, open:

http://localhost:4173

You should see the S.P.R.E.A.D. dashboard.

### Step 5: Test Product Traceback

Enter a Lot ID that exists in the database.

For example:

```text
101
```

The application should retrieve the corresponding lot information and display any available related records.

### Step 6: Stop the Application

If Docker is running in the terminal, press:

```text
Ctrl + C
```

To stop and remove the containers, run:

```bash
docker compose down
```

## Project Development

### Database Development

The database was designed to organize food supply and outbreak information through relational tables.

The team developed an entity relationship diagram and implemented the database using PostgreSQL through Supabase.

Database relationships allow records to be connected across products, shipments, locations, testing, and illness reports.

### Backend Development

The backend was developed in C++.

It provides REST API endpoints that allow the frontend to request information from the database.

The backend processes SQL query results and returns JSON responses for the frontend to display.

### Frontend Development

The frontend was developed using React and Vite.

It includes a dashboard, product traceback search, shipment information, illness records, laboratory results, recall information, and interactive geographic visualizations.

### Docker Integration

Docker Compose allows the application components to run together in a consistent local environment.

This simplifies the setup process and helps team members run the application on different computers.

## Team Contributions

### Holly Hernandez
- Worked on the initial Docker configuration and application setup.
- Developed the entity relationship diagram.
- Contributed to the database and system architecture planning.
- Contributed to troubleshooting, testing, and integration.


### Quinn McCord
- Implemented and configured the PostgreSQL database through Supabase.
- Worked on database tables and relationships.
- Contributed to frontend improvements and database integration.
- Contributed to troubleshooting and testing. 


### Abigaid Ortiz
- Developed and improved portions of the React frontend.
- Worked on C++ backend functionality.
- Helped connect frontend features to backend API responses.
- Contributed to troubleshooting, testing, and integration.



## Project Status

S.P.R.E.A.D. is a functional full-stack database application developed for a Computer Science semester project.

The system combines React, C++, PostgreSQL, Supabase, Docker, and interactive mapping to support food supply traceback investigations.

The application demonstrates relational database design, backend API development, frontend integration, and geographic visualization.

## Project Team

- Abigaid Ortiz
- Holly Hernandez
- Quinn McCord

**Middle Tennessee State University**

Fall 2026
