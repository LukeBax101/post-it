#!/usr/bin/env bash

git stash
git pull
git stash pop
cd frontend
npm run build
cd ..
docker-compose -f post-it-compose.yml down
docker-compose -f post-it-compose.yml up --build -d
