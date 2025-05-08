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

export interface AnalyzeRequest {
  content: string;
  title?: string;
}

export interface ErrorResponse {
  message: string;
  status: 'error';
}
