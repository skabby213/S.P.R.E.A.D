# S.P.R.E.A.D.

### System for Processing, Routing, Equipment, Allocation, and Distribution

**S.P.R.E.A.D.** is a food supply traceback system designed to help identify and investigate potential foodborne illness outbreaks by tracking products throughout the food supply chain.

The system is being developed to connect food products, production lots, shipments, locations, laboratory testing, recalls, and reported illness cases to help identify potential sources of contamination.

## Project Description

Foodborne outbreaks can involve multiple products, geographic locations, and stages of the supply chain, making it difficult to determine where contamination may have originated.

S.P.R.E.A.D. aims to organize this information in a relational database and provide an interactive web interface for tracing food products and visualizing potential outbreaks.

The current application architecture is:

**React + Leaflet Frontend → C++ REST API → Relational Database (Integration Pending)**

The team is also developing Docker support to simplify application setup and deployment.

## Technologies

### Frontend
- React
- JavaScript (JSX)
- Vite
- HTML and CSS
- React Leaflet
- Leaflet
- OpenStreetMap

### Backend
- C++17
- cpp-httplib
- CMake
- REST API
- JSON

### Database
- MySQL (original database design)
- PostgreSQL / Supabase (under consideration)

### Development and Deployment
- Git / GitHub
- Docker
- Docker Compose
- Nginx
- Linux / MTSU JupyterHub

## Current Development

### 1. React Frontend

The React frontend has been developed into a dashboard for viewing food supply traceback information.

Completed frontend features include:

- S.P.R.E.A.D. application header and branding
- Dashboard Overview section
- Product Traceback search interface
- Lot ID search using a form
- Search functionality using either the Search button or Enter key
- Communication with the C++ backend
- Traceback Results panel
- Structured display of returned lot information
- Illness Cases table
- Responsive layout and updated CSS styling
- Empty-state messages when data is unavailable
- Removal of fictional dashboard statistics and illness case records

The Dashboard Overview currently contains three summary categories:

- Reported Cases
- Tracked Lots
- Locations

These categories are prepared for database integration. Until data becomes available, the dashboard displays dashes rather than fabricated statistics.

### 2. Product Traceback

The Product Traceback feature allows users to enter a Lot ID and retrieve information from the C++ REST API.

The frontend sends an HTTP request to the backend and displays the returned JSON data.

Currently displayed information includes:

- Lot ID
- Lot Code
- Status

Example demonstration result:

```text
Lot ID: 1
Lot Code: LOT-2026-001
Status: active
```

The current backend returns test data. Database-driven traceback functionality is still under development.

### 3. Illness Cases Interface

An Illness Cases table has been added to the React dashboard.

The table is designed to display:

- Case ID
- Location
- Lot Code
- Status

The interface currently displays:

```text
No case data available.
```

This section is prepared for future integration with the team's mock illness case database.

### 4. Leaflet Outbreak Mapping

Leaflet and React Leaflet have been integrated into the frontend.

The application now includes an interactive **Outbreak Map** centered on Middle Tennessee.

Implemented mapping features include:

- Interactive geographic map
- OpenStreetMap tile layer
- Map navigation and zoom controls
- Map dragging and panning
- Dedicated `OutbreakMap.jsx` React component
- Integration into the main dashboard
- CSS styling consistent with the application

The map currently displays geographic information without illness case markers.

Future development will connect geographic coordinates from the database to Leaflet markers, allowing users to visualize reported cases and potentially affected locations.

### 5. C++ REST API

The C++ backend has been implemented using `cpp-httplib` and CMake.

The backend:

- Builds successfully using CMake
- Runs an HTTP server on port `8080`
- Supports API requests for product and lot information
- Returns JSON responses
- Communicates with the React frontend
- Includes a health endpoint
- Includes error handling in the frontend for failed API requests

The Docker development branch also introduces CORS headers to support requests between frontend and backend services running on different ports.

#### Current API Endpoints

**GET /health**

Returns the status of the S.P.R.E.A.D. API.

**GET /api/products/{id}**

Returns demonstration product information using the supplied product ID.

**GET /api/lots/{id}**

Returns demonstration lot information using the supplied lot ID.

Example request:

```http
GET /api/lots/1
```

Example response:

```json
{
  "lot_id": 1,
  "lot_code": "LOT-2026-001",
  "status": "active"
}
```

The API currently uses demonstration data rather than database queries.

### 6. Docker Integration

Docker configuration has been introduced on the development branch:

`holly-docker-test`

The configuration includes:

- `backend/Dockerfile`
- `frontend/Dockerfile`
- `docker-compose.yml`
- Docker ignore files

The backend Dockerfile uses a multi-stage build to compile the C++ application and create a runtime container.

The frontend Dockerfile builds the React application using Node.js and serves the generated files through Nginx.

Docker Compose defines two services:

| Service | Port | Purpose |
|---|---|---|
| Backend | 8080 | C++ REST API |
| Frontend | 4173 | React web application |

The frontend also supports the `VITE_API_BASE` environment variable to configure the backend address during the build.

The Docker branch has been locally combined with the updated React dashboard and Leaflet integration, and the combined frontend has built successfully.

**Docker container execution has not yet been independently verified in the current JupyterHub environment.** Docker is not available in that environment's terminal.

The Docker changes remain under testing before integration into the main branch.

## Database

The project's original relational database design uses MySQL.

The database schema includes the following tables:

1. Pathogens
2. Food Products
3. Locations
4. Illness Reports
5. Exposures
6. Lots
7. Shipments
8. Shipment Items
9. Lab Tests
10. Recalls
11. Recall Items

These tables are designed to represent relationships between food products, supply chain movements, illness reports, laboratory testing, and recalls.

### Current Database Status

- The original MySQL database schema has been developed.
- Mock illness case data is being prepared.
- Database integration with the C++ backend is pending.
- PostgreSQL and Supabase are being considered as alternatives for hosting the database online.

No final database migration has been confirmed.

## How to Run the Project

### Requirements

Before running S.P.R.E.A.D. using the startup script, ensure the following software is available:

- Git
- CMake 3.16 or newer
- A C++17-compatible compiler
- Node.js and npm
- Linux environment, such as MTSU JupyterHub

**Note:** The startup script has been tested in MTSU JupyterHub. Native Windows execution has not yet been verified.

### 1. Clone the Repository

```bash
git clone https://github.com/skabby213/S.P.R.E.A.D.git
cd S.P.R.E.A.D
```

### 2. Start S.P.R.E.A.D.

Run:

```bash
./start.sh
```

The startup script automatically:

- Configures and builds the C++ backend
- Installs frontend dependencies if missing
- Builds the React frontend
- Starts the backend on port `8080`
- Starts the frontend preview server on port `4173`

Keep the terminal running while using the application.

If port `4173` is already occupied, stop any previously running Vite preview server before restarting the application.

### 3. Open the Application

**MTSU JupyterHub**

Open the **PORTS** tab in VS Code and select port `4173`.

**Local Linux environment**

Open:

http://localhost:4173

### 4. Test the Application

1. Open the S.P.R.E.A.D. dashboard.
2. Verify that the Dashboard Overview appears.
3. Enter Lot ID `1`.
4. Click Search or press Enter.
5. Verify that the lot information appears.
6. Confirm that the Illness Cases table displays its empty state.
7. Scroll to the Outbreak Map.
8. Verify that OpenStreetMap tiles load and the map can be navigated.

The Lot ID search requires the C++ backend to be running.

### 5. Stop the Application

Press **Ctrl + C** in the terminal running S.P.R.E.A.D.

## Docker Setup (Development Branch)

The Docker configuration is available on:

`holly-docker-test`

To inspect this branch:

```bash
git fetch origin
git switch --track origin/holly-docker-test
```

If the local branch already exists, use:

```bash
git switch holly-docker-test
```

On a machine with Docker Engine and Docker Compose installed, the intended startup command is:

```bash
docker compose up --build
```

The configured application addresses are:

- Frontend: http://localhost:4173
- Backend health endpoint: http://localhost:8080/health

To stop the containers:

```bash
docker compose down
```

**Note:** These Docker instructions describe the intended configuration. The complete container workflow still requires verification in a Docker-enabled environment.

## Running with Docker (optional)

Requires Docker Desktop (or Docker Engine + Compose). From the project root:

```bash
docker compose up --build
```

Then open http://localhost:4173 and search for Lot ID `1`. The API is at http://localhost:8080/health. Stop with `Ctrl + C` (or `docker compose down`).

The Docker setup is separate from `start.sh`; the JupyterHub workflow is unchanged.

## Current System Flow

The currently implemented Lot ID search follows this process:

1. A user enters a Lot ID into the React interface.
2. React sends an HTTP GET request to the C++ REST API.
3. The C++ backend processes the request.
4. The backend returns a JSON response containing demonstration lot information.
5. React displays the results in the Traceback Results section.

### Planned Database-Driven Flow

Once database integration is complete:

1. A user searches for a product lot or investigates a reported illness case.
2. React sends a request to the C++ REST API.
3. The backend queries the relational database.
4. Related products, shipments, locations, and illness reports are retrieved.
5. React displays the traceback information.
6. Leaflet visualizes geographic locations associated with the retrieved records.

## Current Limitations

S.P.R.E.A.D. remains under active development.

Current limitations include:

- Product and lot API endpoints return demonstration data.
- The C++ backend is not yet connected to the relational database.
- Dashboard statistics are not populated dynamically.
- Illness Cases records are not yet loaded from an API.
- Leaflet does not yet display database-driven case markers.
- Docker container execution still requires verification.
- Native Windows compatibility has not been fully tested.
- The final database hosting solution has not been selected.

## Development Status

### Completed

- C++ REST API foundation
- Health endpoint
- Dynamic product and lot routes
- React frontend setup
- Lot ID search functionality
- Frontend/backend communication
- Dashboard interface and styling
- Traceback Results component
- Illness Cases table structure
- Leaflet interactive map integration
- Frontend build verification
- GitHub version control
- One-command startup script for JupyterHub
- Initial Docker configuration
- Local integration of React/Leaflet updates with the Docker development branch

### In Progress

- Mock database development
- Database hosting evaluation
- Docker container testing
- Frontend/backend/database integration
- Geographic illness case visualization
- Project documentation and reporting

## Next Steps

1. Finalize the database technology and hosting approach.
2. Complete the mock database with fictional cases, products, lots, and locations.
3. Connect the C++ REST API to the selected database.
4. Replace demonstration API responses with database queries.
5. Populate dashboard statistics dynamically.
6. Display illness case records in the React table.
7. Add Leaflet markers using database location coordinates.
8. Expand traceback results to include shipments, laboratory tests, and recalls.
9. Test Docker containers and verify frontend/backend communication.
10. Merge and test the completed team contributions.
11. Update the LaTeX technical report and PowerPoint presentation.
12. Perform final integration testing and prepare the project demonstration.

## Project Status

**S.P.R.E.A.D. is an active academic software development project.**

The React dashboard, C++ REST API, and Leaflet map have been implemented and tested in the existing development environment.

Database integration, Docker verification, and additional traceback functionality remain under development.
- Expand traceback information to include shipments and locations
- Add laboratory test and recall information
- Improve the React user interface
- Add Leaflet mapping for supply chain visualization
- Expand API testing and error handling
