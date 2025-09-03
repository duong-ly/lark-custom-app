# Lark Embed TypeScript Application

A TypeScript-based application that integrates Lark/Feishu authentication with Holistics embedded analytics.

## Features

- **TypeScript Implementation**: Full TypeScript support for server-side code
- **Type Safety**: Comprehensive type definitions for Lark SDK and Embed APIs
- **Modular Architecture**: Separated services for Lark authentication and embed functionality
- **Lark H5SDK Integration**: Seamless authentication flow with Lark/Feishu
- **Holistics Embed**: Secure JWT-based dashboard embedding
- **Real-time Token Management**: Automatic token refresh and expiration handling
- **Production Ready**: Clean, optimized code without development tools

## Architecture

### Server (TypeScript)
- **Express.js** with TypeScript for the web server
- **Modular Services**: Separated Lark and embed functionality
  - `larkService.ts` - Lark authentication and SDK management
  - `embedService.ts` - Holistics embed token generation
- **@larksuiteoapi/node-sdk** for Lark API integration
- **JWT** for secure embed token generation
- **Type-safe** API endpoints and error handling

### Client (JavaScript)
- **Plain JavaScript** for the browser (no build step needed)
- **Lark H5SDK** integration for authentication
- **Simple state management** 
- **Error handling and logging**
- **Clean production interface** (no debug tools)

## Project Structure

```
my-lark-embed-app/
├── src/                          # TypeScript source (server-only)
│   ├── server/                   # Server-side application
│   │   ├── server.ts            # Main Express server
│   │   └── services/            # Modular service layer
│   │       ├── larkService.ts   # Lark SDK & authentication
│   │       └── embedService.ts  # Holistics embed tokens
│   └── shared/                   # Shared code and types
│       └── types/               # Type definitions
│           ├── lark.d.ts        # Lark SDK types
│           └── embed.d.ts       # Embed API types
├── public/                       # Static web files
│   ├── script.js                # Client JavaScript (plain JS)
│   └── index.html               # Main HTML page
├── dist/                        # Compiled server JavaScript
├── tsconfig.json                # Base TypeScript config
├── tsconfig.server.json         # Server-specific config
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## Setup and Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Lark/Feishu app credentials
- Holistics embed credentials

### Environment Variables
Create a `.env` file in the root directory:

```env
# Lark/Feishu Configuration
LARK_APP_ID=your_lark_app_id
LARK_APP_SECRET=your_lark_app_secret

# Holistics Embed Configuration  
EMBED_SECRET=your_holistics_embed_secret
EMBED_BASE=https://staging.holistics.io/embed
EMBED_HASHCODE=your_embed_hashcode

# Server Configuration
PORT=3001
SESSION_SECRET=your_session_secret
NODE_ENV=development
```

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build TypeScript:**
   ```bash
   npm run build
   ```

3. **Development mode (with hot reload):**
   ```bash
   npm run dev
   ```

4. **Production mode:**
   ```bash
   npm run build
   npm start
   ```

## Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with TypeScript hot reload |
| `npm run build` | Build server TypeScript |
| `npm run build:server` | Build server TypeScript |
| `npm start` | Start production server from compiled JavaScript |

## TypeScript Features (Server-Only)

### Type Definitions

- **SDK-Inferred Types**: Leverages `@larksuiteoapi/node-sdk` types where available
- **Hybrid Approach**: Combines SDK types with custom extensions for complete coverage
- **Lark API Types**: Properly typed responses based on official API documentation
- **Embed Types**: Structured types for JWT payloads and API responses

### Type Safety Benefits

- **SDK Compatibility**: Uses official SDK types where possible, ensuring compatibility
- **Compile-time Error Checking**: Catch errors before runtime
- **IntelliSense Support**: Enhanced IDE autocomplete and documentation
- **Refactoring Safety**: Confident code changes with type checking
- **API Contract Enforcement**: Ensure API request/response consistency

### Client-Side Simplicity

The client-side uses plain JavaScript for maximum simplicity:

```html
<!-- Plain JavaScript - no build step needed -->
<script src="script.js"></script>
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Lark Integration
- `GET /get_app_id` - Get Lark app ID
- `GET /get_config_parameters?url=<page_url>` - Get JSAPI configuration
- `GET /get_user_info?code=<auth_code>` - Get user information

### Embed Generation
- `POST /api/embed-url` - Generate embed URL with user authentication
  - **Body**: `{ userInfo: LarkUserInfo }`
  - **Response**: `{ url, token, exp, userInfo }`

## Authentication Flow

1. **Client Initialization**: Load Lark H5SDK with JSAPI configuration
2. **Authorization Request**: Request user authorization code via H5SDK
3. **User Info Retrieval**: Exchange code for user information (via `larkService`)
4. **Embed Token Generation**: Create signed JWT for Holistics embed (via `embedService`)
5. **Dashboard Loading**: Load embedded dashboard with authentication

## Service Architecture

### Lark Service (`larkService.ts`)
- **Client Management**: Singleton Lark SDK client instance
- **Authentication**: OAuth flow and token management
- **JSAPI Configuration**: H5SDK setup and signature generation
- **User Information**: Secure user profile retrieval

### Embed Service (`embedService.ts`)
- **Token Generation**: JWT creation with configurable expiration
- **URL Construction**: Dynamic embed URL generation
- **User Attributes**: Secure user context embedding

## Error Handling

### Type-Safe Error Responses
```typescript
interface ApiError {
  error: string;
  code?: number;
  details?: any;
}
```

### Client-Side Error Recovery
- **Token Refresh**: Automatic token renewal before expiration
- **Connection Retry**: Graceful handling of network issues
- **User Feedback**: Clear error messages and status updates
- **Production Logging**: Error tracking without debug overhead

## Security Considerations

- **JWT Tokens**: Time-limited embed tokens (15 minutes)
- **HTTPS**: Enforce secure connections in production
- **CORS**: Controlled cross-origin resource sharing
- **Session Security**: HTTP-only cookies with secure flags

## Troubleshooting

### Common TypeScript Issues

1. **Module Resolution**: Ensure proper import paths and file extensions
2. **Type Conflicts**: Check for conflicting type declarations
3. **Build Errors**: Verify tsconfig.json settings are compatible

### Build Issues

```bash
# Clean build
rm -rf dist
npm run build

# Check TypeScript configuration
npx tsc --noEmit
```

### Service Integration Issues

```bash
# Check server logs
npm run dev

# Verify service imports
npm run build:server
```

## Deployment

### Docker Deployment (Recommended)

#### Quick Start
```bash
# 1. Ensure you have Docker and Docker Compose installed
# 2. Create your .env file with configuration
# 3. Deploy with one command:
./docker-deploy.sh
```

#### Manual Docker Commands
```bash
# Build and start production
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Development mode (with hot reload)
docker-compose --profile dev up -d --build
```

### Traditional Deployment

#### Production Build
```bash
npm run build
NODE_ENV=production npm start
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure secure session secrets
- Enable HTTPS/SSL
- Set appropriate CORS policies

## Recent Improvements

### ✨ Version 2.0 Features
- **🏗️ Modular Architecture**: Separated Lark and embed functionality into dedicated services
- **🧹 Production Ready**: Removed development tools and debug code for clean production deployment
- **🔒 Enhanced Security**: Improved error handling without exposing debug information
- **⚡ Better Performance**: Eliminated VConsole and debug overhead
- **🎯 Clear API**: Simplified and focused external interface

### Service Separation Benefits
- **Maintainability**: Clear separation of concerns between authentication and embedding
- **Testability**: Independent testing of Lark and embed functionality
- **Reusability**: Services can be imported and used in other components
- **Type Safety**: Comprehensive TypeScript coverage across all services

## Contributing

1. **Code Style**: Follow TypeScript best practices
2. **Service Architecture**: Maintain clean separation between Lark and embed services
3. **Type Coverage**: Ensure comprehensive type definitions
4. **Production Focus**: Keep code clean and optimized for production use

## License

## Docker Configuration

### Dockerfile Features
- **Multi-stage build** for optimized production images
- **Security-focused** with non-root user
- **Health checks** for container monitoring
- **Alpine Linux** for minimal image size

### Docker Compose Services
- **Production**: `lark-embed-app` on port 3001
- **Development**: `lark-embed-dev` on port 3002 (optional)
- **Networking**: Isolated bridge network
- **Volumes**: Optional logs mounting

### Environment Variables
All environment variables from `.env` are automatically passed to containers:
- Lark/Feishu credentials
- Holistics embed configuration
- Server settings

## License

ISC License - see package.json for details.