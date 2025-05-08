export interface AnalyzeRequest {
  title?: string;
  content: string;
}

export interface AnalysisResponse {
  status: 'success';
  data: {
    summary: string;
    categories: string[];
    primaryKeyword: string;
    secondaryKeywords: string[];
    sentiment: string;
  };
}

export interface ErrorResponse {
  status: 'error';
  message: string;
}
