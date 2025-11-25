#!/bin/bash

# KindMinds Quick Deployment Script
# Usage: ./deploy.sh [start|stop|restart|logs|update]

set -e

COMPOSE_FILE="docker-compose.yml"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$PROJECT_DIR/deploy"

case "${1:-start}" in
  start)
    echo "🚀 Starting KindMinds services..."
    docker-compose -f $COMPOSE_FILE up -d --build
    echo "✅ Services started!"
    echo "📊 Check status: docker-compose -f $COMPOSE_FILE ps"
    echo "📝 View logs: docker-compose -f $COMPOSE_FILE logs -f"
    ;;
  stop)
    echo "🛑 Stopping KindMinds services..."
    docker-compose -f $COMPOSE_FILE down
    echo "✅ Services stopped!"
    ;;
  restart)
    echo "🔄 Restarting KindMinds services..."
    docker-compose -f $COMPOSE_FILE restart
    echo "✅ Services restarted!"
    ;;
  logs)
    echo "📝 Showing logs (Ctrl+C to exit)..."
    docker-compose -f $COMPOSE_FILE logs -f
    ;;
  update)
    echo "🔄 Updating and rebuilding services..."
    cd "$PROJECT_DIR"
    git pull || echo "⚠️  Git pull failed, continuing with rebuild..."
    cd deploy
    docker-compose -f $COMPOSE_FILE up -d --build
    echo "✅ Services updated!"
    ;;
  status)
    echo "📊 Service Status:"
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    echo "💾 Disk Usage:"
    docker system df
    ;;
  clean)
    echo "🧹 Cleaning up unused Docker resources..."
    docker system prune -f
    echo "✅ Cleanup complete!"
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|logs|update|status|clean}"
    echo ""
    echo "Commands:"
    echo "  start   - Start all services"
    echo "  stop    - Stop all services"
    echo "  restart - Restart all services"
    echo "  logs    - View logs (follow mode)"
    echo "  update  - Pull latest code and rebuild"
    echo "  status  - Show service status"
    echo "  clean   - Clean up unused Docker resources"
    exit 1
    ;;
esac

