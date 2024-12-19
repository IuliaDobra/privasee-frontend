export interface QuestionData {
    id?: string;
    record_id?: string;
    question: string;
    question_description: string;
    properties: string;
    answer: string;
    company_name: string;
    company_id: number;
    created_by: string;
    created_at: Date;
    updated_by: string;
    updated_at: Date;
    assigned_to: string;
}