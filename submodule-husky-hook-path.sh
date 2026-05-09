#!/usr/bin/env bash

# This script configures the git hooks path for submodules
# to point to the root .husky directory.

if [ -z "$PREVENT_WEBHOOKS" ]; then
    # Helper function to set hooks path safely
    set_hooks_path() {
        local path=$1
        if [ -d "$path" ]; then
            echo "Configuring git hooks for $path..."
            (cd "$path" && git config core.hooksPath ../../.husky)
        else
            echo "Skipping $path (directory not found)"
        fi
    }

    set_hooks_path "projects/shell"
    set_hooks_path "projects/user-service"
    set_hooks_path "projects/inventory-hub"
    set_hooks_path "projects/store-service"
fi
