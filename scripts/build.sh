#!/bin/bash

npx next build && npx next export
mkdir out/2fa && mkdir out/admin && mkdir out/dashboard
mv out/2fa.html out/2fa/index.html
mv out/admin.html out/admin/index.html
mv out/dashboard.html out/dashboard/index.html
