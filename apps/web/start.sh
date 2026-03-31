#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd /Users/treyvititoe/projects/scoutie/apps/web
npm run dev -- --port ${PORT:-3000}
