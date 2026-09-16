export interface CopiloteRequest {
  question: string;
}

export interface CopiloteResponse {
  confiance: number | null;
  reponse: string;
  sources: string[];
}

export const COPILOTE_QUESTION_MAX_LENGTH = 2000;

export function canSubmitCopiloteQuestion(question: string): boolean {
  const trimmed = question.trim();
  return trimmed.length > 0 && trimmed.length <= COPILOTE_QUESTION_MAX_LENGTH;
}

export function formatCopiloteConfiance(
  confiance: number | null | undefined
): string | null {
  if (confiance === null || confiance === undefined || Number.isNaN(confiance)) {
    return null;
  }
  return `${Math.round(confiance * 100)} %`;
}
