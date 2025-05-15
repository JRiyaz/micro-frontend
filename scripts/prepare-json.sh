#!/bin/bash

# Set default values if environment variables are not set
WORKING_PATH=${WORKING_PATH:-"../projects/shell/public"}
USER_PORT=${USER_PORT:-"4210"}
USER_HOST=${USER_HOST:-"http://localhost"}

# Generate env.json
cat > "$WORKING_PATH/env.json" <<EOF
{
  "user-app": "$USER_HOST:$USER_PORT/remoteEntry.json"
}
EOF
echo "Generated $WORKING_PATH/env.json"

# Generate env.prod.json
cat > "$WORKING_PATH/env.prod.json" <<EOF
{
  "user-app": "$USER_HOST:$USER_PORT/user/remoteEntry.json"
}
EOF
echo "Generated $WORKING_PATH/env.prod.json"
