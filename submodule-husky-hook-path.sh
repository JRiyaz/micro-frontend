#!/usr/bin/env bash

if [ ! $PREVENT_WEBHOOKS ]
then
    cd projects/shell && git config core.hooksPath ../../.husky
    cd ../..
    cd projects/user/frontend && git config core.hooksPath ../../.husky
    cd ../..
fi
