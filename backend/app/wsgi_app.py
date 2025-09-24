import json
from wsgiref.simple_server import make_server
from urllib.parse import parse_qs, urlparse

class RTGSApp:
    def __init__(self):
        self.routes = {
            '/': self.home,
            '/health': self.health,
            '/api/health': self.health,
            '/docs': self.docs,
        }
    
    def __call__(self, environ, start_response):
        path = environ['PATH_INFO']
        method = environ['REQUEST_METHOD']
        
        if path in self.routes:
            return self.routes[path](environ, start_response)
        else:
            return self.not_found(environ, start_response)
    
    def json_response(self, data, start_response, status='200 OK'):
        response_body = json.dumps(data).encode('utf-8')
        response_headers = [
            ('Content-Type', 'application/json'),
            ('Content-Length', str(len(response_body))),
            ('Access-Control-Allow-Origin', '*'),
            ('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'),
            ('Access-Control-Allow-Headers', 'Content-Type, Authorization'),
        ]
        start_response(status, response_headers)
        return [response_body]
    
    def home(self, environ, start_response):
        return self.json_response({
            "message": "Welcome to RTGS Automation API",
            "version": "1.0.0",
            "status": "working",
            "docs": "/docs"
        }, start_response)
    
    def health(self, environ, start_response):
        return self.json_response({
            "status": "healthy",
            "service": "RTGS Backend",
            "timestamp": "2024-09-24"
        }, start_response)
    
    def docs(self, environ, start_response):
        html = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>RTGS API Documentation</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
                .method { background: #4CAF50; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px; }
            </style>
        </head>
        <body>
            <h1>RTGS Automation API</h1>
            <h2>Available Endpoints:</h2>
            
            <div class="endpoint">
                <span class="method">GET</span> <strong>/</strong>
                <p>Welcome message and API information</p>
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> <strong>/health</strong>
                <p>Health check endpoint</p>
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> <strong>/api/health</strong>
                <p>API health check endpoint</p>
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> <strong>/docs</strong>
                <p>This documentation page</p>
            </div>
            
            <h2>Status</h2>
            <p>✅ Backend is deployed and running successfully!</p>
            <p>🚀 Ready for frontend integration</p>
        </body>
        </html>
        """
        response_body = html.encode('utf-8')
        response_headers = [
            ('Content-Type', 'text/html'),
            ('Content-Length', str(len(response_body))),
        ]
        start_response('200 OK', response_headers)
        return [response_body]
    
    def not_found(self, environ, start_response):
        return self.json_response({
            "error": "Not Found",
            "message": "The requested endpoint was not found",
            "path": environ['PATH_INFO']
        }, start_response, '404 Not Found')

# Create the application
app = RTGSApp()

if __name__ == "__main__":
    # For local development
    with make_server('', 8000, app) as httpd:
        print("Serving on port 8000...")
        httpd.serve_forever()