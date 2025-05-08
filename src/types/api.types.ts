export interface AnalysisResponse {
  data: {
    categories: string[];
    primaryKeyword: string;
    secondaryKeywords: string[];
    sentiment: string;
    summary: string;
  };
  status: 'success';
}

// Analysis result used in tests
export interface AnalysisResult {
  readabilityScore: number;
  sentiment: string;
  summary: string;
  topKeywords: string[];
}

export interface AnalyzeRequest {
  content: string;
  title?: string;
}

// Response format for successful analysis API calls
export interface AnalyzeSuccessResponse {
  data: AnalysisResult;
  status: string;
}

export interface ErrorResponse {
  message: string;
  status: string;
}

// Health check response
export interface HealthResponse {
  model: string;
  status: string;
  timestamp: string;
}
