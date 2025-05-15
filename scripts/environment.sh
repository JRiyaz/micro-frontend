#!/bin/sh

export WORKING_PATH=/usr/share/nginx/shell

# Run the JavaScript file using Node.js
. /app/scripts/prepare-json.sh

# After the JavaScript file finishes, run the nginx command
nginx -g "daemon off;"
