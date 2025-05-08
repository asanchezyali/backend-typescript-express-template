# Content Analysis API

A sophisticated text analysis API using OpenAI's GPT models to provide content summarization, sentiment analysis, keyword extraction, and categorization.

## Getting Started

### Prerequisites

- Node.js 22 or higher
- npm 10 or higher
- An OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/growthx-app.git
cd growthx-app
```

2. Install dependencies:

```bash
npm install
```

3. Create your environment file:

```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:

```env
# Required
OPENAI_API_KEY=your_api_key_here

# Optional (defaults shown)
PORT=3000
NODE_ENV=development
OPENAI_MODEL=o3-mini
MAX_CONCURRENCY=8
MAX_RPM=100
MAX_TPM=10000
REQUEST_TIMEOUT=30000
```

### Available Scripts

- `npm run dev`: Start the development server with hot reload
- `npm run build`: Build the project for production
- `npm start`: Run the production build
- `npm run type-check`: Check TypeScript types
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix ESLint issues automatically
- `npm run format`: Format code with Prettier
- `npm run format:check`: Check code formatting
- `npm test`: Run tests in watch mode
- `npm run test:run`: Run tests once
- `npm run test:ui`: Run tests with UI
- `npm run coverage`: Generate test coverage report

### Setting up Git Hooks

The project uses Husky for Git hooks to ensure code quality. To set up:

1. Install husky (already done by npm install)

```bash
npm install
```

2. Initialize husky:

```bash
npm run prepare
```

3. The pre-commit hook will automatically run:
   - Type checking
   - Linting
   - Unit tests
   - Code formatting

### Development Workflow

1. Create a new branch for your feature:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit them:

```bash
git add .
git commit -m "feat: your feature description"
```

The pre-commit hook will automatically run checks before the commit is created.

3. Push your changes:

```bash
git push origin feature/your-feature-name
```

### API Documentation

Once the server is running, you can access the API documentation at:

```
http://localhost:3000/api-docs
```

## Architecture

### Current Architecture Overview

The project follows a modified MVC (Model-View-Controller) pattern adapted for a REST API, with a focus on scalability and maintainability.

### Class Diagram

```mermaid
classDiagram
    class OpenAIService {
        -model: string
        -openai: OpenAI
        -requestTimeout: number
        -rpmLimiter: RateLimiterMemory
        -tpmLimiter: RateLimiterMemory
        +runJsonResponse<T>(prompt: string, fallback: T)
        +runRawResponse(prompt: string, fallback: string)
        -getCompletion(prompt: string)
    }

    class OpenAITasks {
        -limiter: ReturnType
        -openaiService: OpenAIService
        +analyzeSentiment(content: string)
        +categorize(content: string)
        +extractKeywords(content: string)
        +summarize(content: string)
    }

    class ContentAnalyzerService {
        -openaiTasks: OpenAITasks
        +analyzeContent(content: string)
    }

    class AnalyzeController {
        +analyze(req: Request, res: Response)
        +health(req: Request, res: Response)
    }

    AnalyzeController --> ContentAnalyzerService
    ContentAnalyzerService --> OpenAITasks
    OpenAITasks --> OpenAIService
```

### Service Architecture

```mermaid
graph TB
    subgraph Client Layer
        A[Client Request] --> B[Express Router]
    end

    subgraph API Layer
        B --> C[AnalyzeController]
        C --> D[ContentAnalyzerService]
    end

    subgraph Service Layer
        D --> E[OpenAITasks]
        E --> F[OpenAIService]
    end

    subgraph External Services
        F --> G[OpenAI API]
    end

    subgraph Utils
        H[Rate Limiter]
        I[Retry Logic]
        J[Timeout Handler]
    end

    F --> H
    F --> I
    F --> J
```

### Request Flow Sequence

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Router
    participant AC as AnalyzeController
    participant CS as ContentAnalyzerService
    participant OT as OpenAITasks
    participant OS as OpenAIService
    participant API as OpenAI API

    C->>R: POST /analyze
    R->>AC: Route request
    AC->>CS: analyzeContent()
    par Parallel Execution
        CS->>OT: categorize()
        CS->>OT: summarize()
        CS->>OT: extractKeywords()
        CS->>OT: analyzeSentiment()
    end
    OT->>OS: Make API requests
    OS->>API: Send prompts
    API-->>OS: Return responses
    OS-->>OT: Process responses
    OT-->>CS: Return results
    CS-->>AC: Combine results
    AC-->>C: Send response
```

### Architecture Decisions

1. **Modified MVC Pattern**

   - **Controllers**: Handle HTTP requests and responses
   - **Services**: Contain business logic and orchestration
   - **Models**: Represented through TypeScript interfaces

2. **Scalability Features**

   - Rate limiting for API calls
   - Concurrent request handling
   - Retry mechanisms with exponential backoff
   - Request timeout handling

3. **Current Benefits**

   - Clear separation of concerns
   - Easy to test components in isolation
   - Simple to add new features or modify existing ones
   - Efficient error handling and retry mechanisms

4. **Path to Hexagonal Architecture**

If needed, the current architecture can be evolved to a hexagonal (ports and adapters) architecture:

```mermaid
graph TB
    subgraph Domain Core
        A[Business Logic]
        B[Domain Models]
    end

    subgraph Ports
        C[Primary Ports<br>Application Services]
        D[Secondary Ports<br>Repository Interfaces]
    end

    subgraph Adapters
        E[Primary Adapters<br>Controllers]
        F[Secondary Adapters<br>OpenAI Client]
    end

    E --> C
    C --> A
    A --> D
    D --> F
```

This evolution would involve:

- Creating domain models for analysis results
- Defining ports (interfaces) for AI services
- Implementing adapters for different AI providers
- Isolating the business logic in the domain core

### Why This Architecture?

1. **Maintainability**

   - Clear component responsibilities
   - Easy to understand code organization
   - Simplified testing and debugging

2. **Scalability**

   - Easy to add new AI providers
   - Simple to implement caching
   - Ready for horizontal scaling

3. **Reliability**

   - Built-in error handling
   - Rate limiting protection
   - Timeout management

4. **Extensibility**
   - New endpoints can be added easily
   - Support for different AI models
   - Simple integration of additional services
