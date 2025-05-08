# express-typescript-eslint-prettier-template

An Express.js template with TypeScript, ESLint and Prettier, built for Node.js 22.

Read the full tutorial here: https://medium.com/@gabrieldrouin/node-js-2025-guide-how-to-setup-express-js-with-typescript-eslint-and-prettier-b342cd21c30d

# Content Analysis API

## Project Architecture

### Service Architecture

```mermaid
flowchart TB
    subgraph Server["Server Layer"]
        A[server.ts] --> B[app.ts]
    end

    subgraph API["API Layer"]
        B --> C[analyze.routes.ts]
        C --> D[analyze.controller.ts]
    end

    subgraph Services["Service Layer"]
        D --> E[content-analyzer.service.ts]
        E --> F[openai-tasks.ts]
        F --> G[openai-services.ts]
    end

    subgraph Config["Configuration"]
        H[config.ts] --> G
        H --> A
    end

    subgraph Utils["Utils"]
        I[retry-utils.ts] --> F
        J[timeout-utils.ts] --> G
        K[json-utils.ts] --> G
    end

    subgraph Types["Types"]
        L[api.types.ts] --> D
    end

    subgraph Docs["Documentation"]
        M[swagger.ts] --> B
    end

    subgraph Mid["Middleware"]
        N[middlewares.ts] --> B
    end

    classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef highlight fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    class A,B highlight
```

### Class Diagram

```mermaid
classDiagram
    class Server {
        +port: number
        +start()
    }

    class App {
        +express: Express
        +routes()
        +middleware()
    }

    class AnalyzeController {
        +analyze(req, res)
        +health(req, res)
    }

    class ContentAnalyzerService {
        +analyzeContent(content)
    }

    class OpenAITasks {
        +summarize(content)
        +categorize(content)
        +extractKeywords(content)
        +analyzeSentiment(content)
    }

    class OpenAIService {
        -apiKey: string
        -model: string
        +run<T>(prompt, defaultValue)
    }

    class Config {
        +port: number
        +maxConcurrency: number
        +model: string
        +apiKey: string
    }

    Server --> App
    App --> AnalyzeController
    AnalyzeController --> ContentAnalyzerService
    ContentAnalyzerService --> OpenAITasks
    OpenAITasks --> OpenAIService
    Config --> OpenAIService
    Config --> Server
```
