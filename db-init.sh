#! /bin/bash

cd studio-rat
npx prisma migrate deploy
npx prisma db seed