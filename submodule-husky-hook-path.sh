#!/usr/bin/env bash

if [ -z "$PREVENT_WEBHOOKS" ]; then
    # Shell project is 2 levels deep
    cd projects/shell && git config core.hooksPath ../../.husky
    cd ../..
    
    # User project is 3 levels deep (projects/user/frontend)
    cd projects/user/frontend && git config core.hooksPath ../../../.husky
    cd ../../../..
fi
