c#!/bin/bash

# Step 1: Install required npm packages
echo "Installing required npm packages..."
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Please ensure you are in the correct directory."
    exit 1
fi
npm install || { echo "npm install failed."; exit 1; }

# Step 2: Check for Node.js and Prisma CLI
if ! command -v node &> /dev/null; then
    echo "Node.js could not be found. Please install Node.js."
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo "npx could not be found. Please install it."
    exit 1
fi

npx prisma migrate resolve --applied 20241116211800_init

# Step 4: Run Prisma migrations
echo "Running Prisma migrations..."
if [ -f ".env" ]; then
    echo "Using environment variables from .env file."
else
    echo "Warning: .env file not found. Ensure database credentials are set correctly."
fi
npx prisma migrate deploy || { echo "Prisma migrations failed."; exit 1; }

# Step 5: Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate || { echo "Failed to generate Prisma client."; exit 1; }

# Step 6: Seed the database (create admin user)
echo "Seeding the database..."
if [ -f "prisma/seed.mjs" ] || [ -f "prisma/seed.ts" ]; then
    npx prisma db seed || { echo "Database seeding failed."; exit 1; }
else
    echo "Warning: No seed file found in prisma/ directory."
fi

# Step 7: Build Docker images for all languages
echo "Building Docker images for all languages..."
declare -A DOCKERFILES=(
    ["python"]="dockerfiles/python.Dockerfile"
    ["javascript"]="dockerfiles/javascript.Dockerfile"
    ["java"]="dockerfiles/java.Dockerfile"
    ["ruby"]="dockerfiles/ruby.Dockerfile"
    ["cpp"]="dockerfiles/cpp.Dockerfile"
    ["c"]="dockerfiles/c.Dockerfile"
    ["csharp"]="dockerfiles/csharp.Dockerfile"
    ["php"]="dockerfiles/php.Dockerfile"
    ["go"]="dockerfiles/go.Dockerfile"
    ["rust"]="dockerfiles/rust.Dockerfile"
    ["perl"]="dockerfiles/perl.Dockerfile"
    ["r"]="dockerfiles/r.Dockerfile"
    ["haskell"]="dockerfiles/haskell.Dockerfile"
)

for language in "${!DOCKERFILES[@]}"; do
    dockerfile=${DOCKERFILES[$language]}
    image_name="code-runner-${language}"

    echo "Building Docker image for ${language} using ${dockerfile}..."
    docker build -f "${dockerfile}" -t "${image_name}" . || {
        echo "Failed to build Docker image for ${language}."
        exit 1
    }
done
echo "All Docker images built successfully!"

# Final Step
echo "Setup complete. Run the run.sh script to start the server."
