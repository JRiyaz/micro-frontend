#!/usr/bin/env bash

if [ -z "$PREVENT_WEBHOOKS" ]; then
    # Shell project is 2 levels deep
    (cd projects/shell && git config core.hooksPath ../../.husky)
    
    # User submodule root is at projects/user (same depth as shell)
    (cd projects/user && git config core.hooksPath ../../.husky)
fi
