#!/usr/bin/env bash
# Rebuild and restart the production preview server on a fixed port.
#
# Uses a pidfile so the previous server is stopped by PID rather than by a
# pattern kill, which could match an unrelated process. Exits non-zero with the
# build log if the build fails, so a stale bundle is never served as if it were
# current.
set -u

PORT="${PORT:-12000}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PIDFILE="$ROOT/.preview.pid"
LOGFILE="$ROOT/.preview.log"
BUILDLOG="$ROOT/.preview.build.log"

cd "$ROOT"

if [ -f "$PIDFILE" ]; then
  OLD="$(cat "$PIDFILE" 2>/dev/null || true)"
  if [ -n "${OLD:-}" ] && kill -0 "$OLD" 2>/dev/null; then
    kill "$OLD" 2>/dev/null || true
    for _ in $(seq 1 20); do
      kill -0 "$OLD" 2>/dev/null || break
      sleep 0.25
    done
  fi
  rm -f "$PIDFILE"
fi

if ! npm run build > "$BUILDLOG" 2>&1; then
  echo "BUILD FAILED - last 30 lines:"
  tail -30 "$BUILDLOG"
  exit 1
fi

nohup npx vite preview --port "$PORT" --strictPort > "$LOGFILE" 2>&1 &
echo $! > "$PIDFILE"

for _ in $(seq 1 40); do
  code="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/" || true)"
  if [ "$code" = "200" ]; then
    echo "preview ready on http://localhost:$PORT (pid $(cat "$PIDFILE"))"
    exit 0
  fi
  sleep 0.5
done

echo "preview did not become ready; server log:"
tail -20 "$LOGFILE"
exit 1
