#!/bin/bash
# setup_dev_env.sh
# Usage: First run `chmod +x setup_dev_env.sh` to make this script executable.
# Then run: `./setup_dev_env.sh`
# Full setup script for D1 database and R2 assets for the development/testing environment.

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
# D1 Configuration
D1_BINDING_NAME="PUPPIES_DB" # This is the BINDING NAME from wrangler.toml
SCHEMA_FILE="master_schema.sql"
SEED_FILE="master_seed.sql"

# R2 Configuration for Application Static Assets (e.g., from ./dist)
# IMPORTANT: User needs to confirm this binding name or if a direct bucket name should be used.
# If no specific binding for app static assets, this might need to be the same as R2_SEED_IMAGES_BUCKET_BINDING
# or the script adapted to take a bucket name directly.
R2_APP_ASSETS_BUCKET_BINDING="STATIC_CONTENT_BUCKET" # Example binding name for app's static assets
APP_ASSETS_SOURCE_DIR="./dist" # Build output directory for the frontend application

# R2 Configuration for Seed Images (User Media like puppy photos, etc.)
R2_SEED_IMAGES_BUCKET_BINDING="PUPPY_IMAGES" # Binding for puppy images, breed photos etc.
SEED_IMAGES_SOURCE_DIR="./seed_assets_for_r2" # Local directory with sample images

# MIME types for application static assets
declare -A MIME_TYPES
MIME_TYPES=(
    [".js"]="application/javascript"
    [".css"]="text/css"
    [".html"]="text/html"
    [".svg"]="image/svg+xml"
    [".ico"]="image/x-icon"
    [".png"]="image/png"
    [".jpg"]="image/jpeg"
    [".jpeg"]="image/jpeg"
    [".gif"]="image/gif"
    [".webp"]="image/webp"
    [".webmanifest"]="application/manifest+json"
    [".txt"]="text/plain"
    [".woff"]="font/woff"
    [".woff2"]="font/woff2"
    [".map"]="application/json"
)
DEFAULT_MIME_TYPE="application/octet-stream"

# --- Helper Functions ---
ask_confirmation() {
    read -r -p "${1} [y/N] " response
    case "$response" in
        [yY][eE][sS]|[yY])
            true
            ;;
        *)
            false
            ;;
    esac
}

# Function to attempt to get R2 bucket name from wrangler.toml based on binding name
# Looks for preview_bucket_name first, then bucket_name.
get_r2_bucket_name_from_binding() {
    local binding_name="$1"
    local toml_file="wrangler.toml"

    if [ ! -f "$toml_file" ]; then
        echo "Error: wrangler.toml not found in current directory." >&2
        return 1
    fi

    # Use GNU awk (gawk) for compatibility on Ubuntu
    local bucket_name=$(awk -v binding="^binding[[:space:]]*=[[:space:]]*\"${binding_name}\"" '
        $0 ~ binding {in_section=1; next}
        in_section && /\[\[r2_buckets\]\]/ {in_section=0}
        in_section && /preview_bucket_name[[:space:]]*=[[:space:]]*"(.*)"/ {gsub(/"/, "", $3); print $3; found=1; exit}
        in_section && /bucket_name[[:space:]]*=[[:space:]]*"(.*)"/ {if(!found){gsub(/"/, "", $3); print $3; exit}}
        ' "$toml_file")

    if [ -z "$bucket_name" ]; then
        echo "Error: Could not determine R2 bucket name for binding '${binding_name}' from ${toml_file}." >&2
        echo "Please ensure ${toml_file} contains 'bucket_name' or 'preview_bucket_name' for binding '${binding_name}' under an [[r2_buckets]] section." >&2
        return 1
    fi
    echo "$bucket_name"
}


# --- Prerequisite Checks ---
REQUIRED_CMDS=("awk" "npx" "wrangler")
for cmd in "${REQUIRED_CMDS[@]}"; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: Required command '$cmd' not found. Please install it before running this script." >&2
    exit 1
  fi
done

# --- Cloudflare API Token Check ---
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "Error: CLOUDFLARE_API_TOKEN environment variable is not set."
  echo "Please set it with:"
  echo "  export CLOUDFLARE_API_TOKEN=your_token_here"
  echo "You can find your API token in the Cloudflare dashboard (see docs/DEPLOYMENT_GUIDE.md)."
  exit 1
fi

# --- D1 Database Setup ---
echo ""
echo "--- Starting D1 Database Setup for binding '${D1_BINDING_NAME}' ---"

# Confirm required SQL files exist
if [ ! -f "$SCHEMA_FILE" ]; then
    echo "Error: Schema file '${SCHEMA_FILE}' not found. Aborting D1 setup." >&2
    exit 1
fi
if [ ! -f "$SEED_FILE" ]; then
    echo "Error: Seed file '${SEED_FILE}' not found. Aborting D1 setup." >&2
    exit 1
fi

if ask_confirmation "⚠️ This will RESET the D1 database associated with binding '${D1_BINDING_NAME}'. All existing data will be lost. Continue?"; then
    echo "Resetting D1 database..."

    TABLES_TO_DROP=(
      "blog_post_tags" "blog_tags" "blog_posts" "blog_categories" "adoptions" "transactions"
      "puppies" "litters" "stud_dogs" "breeds" "affiliates" "promo_codes"
      "seo_page_metadata" "site_settings" "email_templates" "third_party_integrations" "users"
    )

    echo "Dropping existing tables (if they exist)..."
    for TABLE_NAME in "${TABLES_TO_DROP[@]}"; do
      echo "  Attempting to drop table ${TABLE_NAME}..."
      npx wrangler d1 execute "${D1_BINDING_NAME}" --command="DROP TABLE IF EXISTS ${TABLE_NAME};" --remote || echo "  Table ${TABLE_NAME} does not exist or could not be dropped (this might be okay)."
    done
    echo "Finished dropping tables."

    echo "Applying schema from ${SCHEMA_FILE}..."
    npx wrangler d1 execute "${D1_BINDING_NAME}" --file="${SCHEMA_FILE}" --remote
    echo "Schema applied."

    echo "Applying seed data from ${SEED_FILE}..."
    npx wrangler d1 execute "${D1_BINDING_NAME}" --file="${SEED_FILE}" --remote
    echo "Seed data applied."

    echo "✅ D1 Database for binding '${D1_BINDING_NAME}' setup complete."
else
    echo "D1 Database setup skipped by user."
fi


# --- R2 Asset Uploads ---
echo ""
echo "--- Starting R2 Asset Uploads ---"

# Section 1: Upload Static Application Assets (from ./dist or similar)
echo ""
echo "Processing Application Static Assets..."
R2_APP_ASSETS_BUCKET_NAME=$(get_r2_bucket_name_from_binding "${R2_APP_ASSETS_BUCKET_BINDING}")

if [ -z "$R2_APP_ASSETS_BUCKET_NAME" ]; then
    echo "Skipping R2 app asset upload as bucket name for binding '${R2_APP_ASSETS_BUCKET_BINDING}' could not be determined."
else
    if [ -d "${APP_ASSETS_SOURCE_DIR}" ]; then
        if ask_confirmation "Upload application assets from '${APP_ASSETS_SOURCE_DIR}' to R2 bucket '${R2_APP_ASSETS_BUCKET_NAME}' (binding: ${R2_APP_ASSETS_BUCKET_BINDING})?"; then
            echo "Uploading application assets to R2 bucket: ${R2_APP_ASSETS_BUCKET_NAME}..."

            find "${APP_ASSETS_SOURCE_DIR}" -type f | while read -r FILE_PATH; do
                RELATIVE_PATH="${FILE_PATH#${APP_ASSETS_SOURCE_DIR}/}"
                EXTENSION_LOWERCASE=$(echo ".${RELATIVE_PATH##*.}" | tr '[:upper:]' '[:lower:]')
                MIME_TYPE="${MIME_TYPES[${EXTENSION_LOWERCASE}]:-$DEFAULT_MIME_TYPE}"

                echo "  → Uploading ${RELATIVE_PATH} as ${MIME_TYPE}"
                npx wrangler r2 object put "${R2_APP_ASSETS_BUCKET_NAME}/${RELATIVE_PATH}" --file="${FILE_PATH}" --content-type="${MIME_TYPE}" --binding="${R2_APP_ASSETS_BUCKET_BINDING}" --remote
            done
            echo "✅ Application asset upload complete for ${R2_APP_ASSETS_BUCKET_NAME}."
        else
            echo "Application asset upload skipped by user."
        fi
    else
        echo "Warning: Application asset source directory '${APP_ASSETS_SOURCE_DIR}' not found. Skipping app asset upload."
    fi
fi

# Section 2: Upload Seed Images (Puppy photos, breed photos, etc.)
echo ""
echo "Processing Seed Images..."
R2_SEED_IMAGES_BUCKET_NAME=$(get_r2_bucket_name_from_binding "${R2_SEED_IMAGES_BUCKET_BINDING}")

if [ -z "$R2_SEED_IMAGES_BUCKET_NAME" ]; then
    echo "Skipping R2 seed image upload as bucket name for binding '${R2_SEED_IMAGES_BUCKET_BINDING}' could not be determined."
else
    if [ -d "${SEED_IMAGES_SOURCE_DIR}" ]; then
        if ask_confirmation "Upload seed images from '${SEED_IMAGES_SOURCE_DIR}' to R2 bucket '${R2_SEED_IMAGES_BUCKET_NAME}' (binding: ${R2_SEED_IMAGES_BUCKET_BINDING})?"; then
            echo "Uploading seed images to R2 bucket: ${R2_SEED_IMAGES_BUCKET_NAME}..."

            find "${SEED_IMAGES_SOURCE_DIR}" -type f | while read -r FILE_PATH; do
                RELATIVE_PATH="${FILE_PATH#${SEED_IMAGES_SOURCE_DIR}/}"
                EXTENSION_LOWERCASE=$(echo ".${RELATIVE_PATH##*.}" | tr '[:upper:]' '[:lower:]')
                MIME_TYPE="${MIME_TYPES[${EXTENSION_LOWERCASE}]:-$DEFAULT_MIME_TYPE}"

                echo "  → Uploading ${RELATIVE_PATH} (as ${MIME_TYPE})"
                npx wrangler r2 object put "${R2_SEED_IMAGES_BUCKET_NAME}/${RELATIVE_PATH}" --file="${FILE_PATH}" --content-type="${MIME_TYPE}" --binding="${R2_SEED_IMAGES_BUCKET_BINDING}" --remote
            done
            echo "✅ Seed image upload complete for ${R2_SEED_IMAGES_BUCKET_NAME}."
            echo "ℹ️ Make sure image URLs in 'master_seed.sql' correctly reference these R2 object keys (e.g., '/${RELATIVE_PATH}' if served from bucket root, or full R2 public URL if applicable)."
        else
            echo "Seed image upload skipped by user."
        fi
    else
        echo "Warning: Seed image source directory '${SEED_IMAGES_SOURCE_DIR}' not found. Skipping seed image upload."
        echo "You may need to create this directory and add sample images (e.g., ${SEED_IMAGES_SOURCE_DIR}/puppies/buddy.jpg)."
    fi
fi

echo ""
echo "🎉 Full Setup Script Finished! 🎉"
echo "Ensure your Cloudflare Worker ('${WORKER_NAME:-YourWorkerName}') is deployed and any necessary public R2 URLs are configured if using R2 for public assets."
echo "You may need to run 'npm run build' before running this script if '${APP_ASSETS_SOURCE_DIR}' is its output."
