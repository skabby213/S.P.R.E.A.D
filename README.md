
# S.P.R.E.A.D.

### System for Processing, Routing, Equipment, Allocation, and Distribution

S.P.R.E.A.D. is a food supply tracking system designed to help identify possible sources of foodborne illness outbreaks.

The goal of this project is to track food products, shipments, locations, and reported illness cases using a database and web application.

## Technologies Used

### Frontend
- React
- JavaScript
- HTML and CSS
- Leaflet (Interactive Map)

### Backend
- C++
- REST API

### Database
- PostgreSQL
- Supabase

### Other Tools
- Docker
- GitHub
- Visual Studio Code

## Current Features

### 1. Dashboard

The React dashboard provides a simple interface for viewing food supply information.

The dashboard includes:
- Reported Cases
- Tracked Lots
- Locations
- Product Traceback
- Illness Cases
- Outbreak Map

The Tracked Lots section is connected to Supabase and displays the number of lots stored in the database.

The Reported Cases and Locations sections are still being developed.

### 2. Product Traceback

Users can search for food products by entering a Lot ID.

The application connects to the C++ backend, which retrieves information from Supabase.

For testing, users can search for:

```text
Lot ID: 101
```

The application displays information about the selected food lot.

### 3. Illness Cases

The dashboard includes a table for displaying reported illness cases.

The table is currently being developed and will eventually retrieve information from Supabase.

### 4. Outbreak Map

An interactive map has been added using Leaflet and OpenStreetMap.

Users can move around the map and zoom in or out.

Future updates will display illness case locations on the map.

### 5. Database

S.P.R.E.A.D. uses PostgreSQL through Supabase.

The C++ backend is connected to the database and can retrieve lot information.

Additional database features are still being developed.

## How to Run the Project

### Requirements

- Git
- Docker Desktop
- Access to the project's Supabase database

### Step 1: Clone the Repository

```bash
git clone https://github.com/skabby213/S.P.R.E.A.D.git
cd S.P.R.E.A.D
```

To access the current development branch:

```bash
git fetch origin
git switch --track origin/spread-dashboard-integration
```

### Step 2: Configure the Database

Create a `.env` file in the main project folder.

Add the Supabase database connection string:

```env
DATABASE_URL=your_database_connection_string
```

The database connection string must be obtained from the project administrator.

Do not upload the `.env` file to GitHub.

### Step 3: Start the Application

Make sure Docker Desktop is running.

Open the project in VS Code and run:

```bash
docker compose up --build
```

### Step 4: Open the Website

Open your browser and go to:

http://localhost:4173

To test the Product Traceback feature, enter Lot ID `101`.

### Step 5: Stop the Application

Press `Ctrl + C` in the terminal.

You can also run:

```bash
docker compose down
```

## Completed Work

- Created the React frontend
- Created the C++ backend
- Added Product Traceback search
- Added the Illness Cases table
- Added the interactive Outbreak Map
- Connected the backend to Supabase
- Retrieved food lot information from the database
- Connected the Tracked Lots statistic to Supabase
- Updated the dashboard design
- Tested the application using Docker

## Work in Progress

- Connect Reported Cases to Supabase
- Connect Locations to Supabase
- Display illness cases from the database
- Add illness case markers to the map
- Expand shipment and product tracking
- Continue testing and improving the application

## Project Status

S.P.R.E.A.D. is still under development.

The frontend, backend, Docker setup, and Supabase database connection are working.

The application can currently search for food lots and display the total number of tracked lots.

The team is continuing to develop the remaining features before the final project demonstration.
