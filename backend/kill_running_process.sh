PIDS=$(lsof -ti tcp:3001)

if [ -n "$PIDS" ]; then
  echo "Killing processes on port 3001: $PIDS"
  kill -9 $PIDS
else
  echo "No processes found on port 3001."
fi