# S.P.R.E.A.D.

### System for Processing, Routing, Equipment, Allocation, and Distribution

S.P.R.E.A.D. is a food supply traceback system designed to help track potential foodborne outbreaks through the food supply chain.

The system connects food products, production lots, shipments, locations, laboratory testing, recalls, and reported illness cases to help identify potential sources of contamination.

## Project Description

Foodborne outbreaks can involve multiple products, locations, and stages of the supply chain, making it difficult to determine where contamination may have originated.

S.P.R.E.A.D. is being developed to organize this information in a relational database and provide a user interface for tracing food products through the supply chain.

The planned system architecture is:

React Frontend → C++ REST API → MySQL Database

## Technologies

- React
- JavaScript
- C++
- cpp-httplib
- CMake
- MySQL
- Vite
- Git / GitHub
- Leaflet (planned for mapping and visualization)

## Current Development

The project currently includes:

- A MySQL relational database schema for food supply traceback data
- A C++ REST API that builds and runs successfully
- A health endpoint for verifying that the backend service is running
- Dynamic API endpoints for retrieving product and lot information
- A React frontend for entering a Lot ID
- Communication between the React frontend and C++ backend
- JSON responses from the C++ API displayed in the React interface

### Current API Endpoints

GET /health

Returns the status of the S.P.R.E.A.D. API.

GET /api/products/{id}

Returns test product information using the supplied product ID.

GET /api/lots/{id}

Returns test lot information using the supplied lot ID.

Example:

GET /api/lots/1

Response:

{
  "lot_id": 1,
  "lot_code": "LOT-2026-001",
  "status": "active"
}

## Database

The MySQL database currently contains tables for:

- Pathogens
- Food Products
- Locations
- Illness Reports
- Exposures
- Lots
- Shipments
- Shipment Items
- Lab Tests
- Recalls
- Recall Items

These tables are designed to represent relationships between food products, their movement through the supply chain, testing results, recalls, and reported illnesses.

## How to Run the Project

### Requirements

Before running S.P.R.E.A.D., make sure the following software is available:

- Git
- CMake (version 3.16 or newer)
- A C++17-compatible compiler
- Node.js and npm
- A Linux environment, such as MTSU JupyterHub

**Note:** The startup script has been tested in MTSU JupyterHub. Native Windows setup has not yet been tested.

### 1. Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/skabby213/S.P.R.E.A.D.git
cd S.P.R.E.A.D
```

### 2. Start S.P.R.E.A.D.

Run the startup script:

```bash
./start.sh
```

The script automatically:

- Configures and builds the C++ backend.
- Installs frontend dependencies if they are missing.
- Builds the React frontend.
- Starts the C++ API on port `8080`.
- Starts the React frontend on port `4173`.

Keep the terminal running while using the application.

### 3. Open the Application

**In MTSU JupyterHub:**

Open the **PORTS** tab in VS Code and select port `4173` to open S.P.R.E.A.D. in your browser.

**In a local Linux environment:**

Open:

http://localhost:4173

### 4. Test the Application

1. Enter Lot ID `1`.
2. Click **Search** or press **Enter**.
3. Verify that the following information appears:

```text
Lot ID: 1
Lot Code: LOT-2026-001
Status: active
```

### 5. Stop the Application

Return to the terminal running S.P.R.E.A.D. and press **Ctrl + C**.

### Current Limitations

The current API returns demonstration data. MySQL database integration is still under development.

The startup script has been verified in the project's existing JupyterHub environment. A fresh installation and native Windows compatibility still require testing.

## Running with Docker (optional)

Requires Docker Desktop (or Docker Engine + Compose). From the project root:

```bash
docker compose up --build
```

Then open http://localhost:4173 and search for Lot ID `1`. The API is at http://localhost:8080/health. Stop with `Ctrl + C` (or `docker compose down`).

The Docker setup is separate from `start.sh`; the JupyterHub workflow is unchanged.

## Current System Flow

1. The user enters a Lot ID in the React interface.
2. React sends a request to the C++ REST API.
3. The C++ backend processes the request.
4. The API returns a JSON response containing lot information.
5. React displays the returned information to the user.

## Development Status

S.P.R.E.A.D. is currently under development.

The React frontend and C++ REST API are communicating successfully. Product and lot API responses currently use test data.

The MySQL database has been created, but database integration with the C++ backend is still in development.

## Next Steps

- Connect the C++ REST API to the MySQL database
- Retrieve real lot and product information from the database
- Expand traceback information to include shipments and locations
- Add laboratory test and recall information
- Improve the React user interface
- Add Leaflet mapping for supply chain visualization
- Expand API testing and error handling