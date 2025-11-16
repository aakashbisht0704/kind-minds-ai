import sys
sys.path.insert(0, '/Users/rahulbajaj/Desktop/kindminds_website/backend')

from main import app
import uvicorn

# Print all routes
print("="*50)
print("Registered routes:")
for route in app.routes:
    print(f"  - {route.path} ({route.methods if hasattr(route, 'methods') else 'N/A'})")
print("="*50)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

