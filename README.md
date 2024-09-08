# Visited European Countries

The Backend of this project provides a simple API to add, remove, and retrieve countries from a MongoDB database using Flask, along with a frontend that interacts with the backend.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed

### Setting Up the Backend

#### Network Setup

Before running the app, ensure you have a Docker network called `EuNetwork`. If you don't have this network, create it using:

```bash
docker network create EuNetwork
```

#### Container Setup

1. Open a terminal in the project directory.
2. Enter the following command to select the backend folder:

   ```bash
   cd backend
   ```

3. Run the following command to build and start the Docker containers:

   ```bash
   docker-compose up --build
   ```
