import { swaggerSpec } from './spec';

// Generate Swagger UI HTML
export function generateSwaggerUI(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>GDS Puppies API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
    }
    .swagger-ui .topbar {
      background: #E53E3E;
    }
    .swagger-ui .topbar .download-url-wrapper .select-label {
      color: white;
    }
    .swagger-ui .topbar .download-url-wrapper input[type=text] {
      border: 2px solid #E53E3E;
    }
    .swagger-ui .info .title {
      color: #E53E3E;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js"></script>
  <script>
  window.onload = function() {
    const ui = SwaggerUIBundle({
      url: '/api/swagger.json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIStandalonePreset
      ],
      plugins: [
        SwaggerUIBundle.plugins.DownloadUrl
      ],
      layout: "StandaloneLayout",
      validatorUrl: null,
      tryItOutEnabled: true,
      requestInterceptor: function(req) {
        // Add any auth headers or modifications here
        return req;
      }
    });
  };
  </script>
</body>
</html>
  `;
}

// Serve Swagger JSON spec
export function serveSwaggerSpec(): Response {
  return new Response(JSON.stringify(swaggerSpec, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Serve Swagger UI
export function serveSwaggerUI(): Response {
  return new Response(generateSwaggerUI(), {
    headers: {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
    },
  });
}