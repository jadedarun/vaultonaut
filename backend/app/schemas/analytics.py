import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class OverviewMetrics(BaseModel):
    total_documents: int
    ai_ready_documents: int
    total_conversations: int
    total_questions_asked: int
    total_study_materials: int
    flashcard_decks: int
    total_flashcards: int
    quizzes_count: int
    total_quiz_questions: int

    model_config = ConfigDict(from_attributes=True)


class FileTypeCount(BaseModel):
    extension: str
    count: int
    percentage: float


class RecentDocumentItem(BaseModel):
    id: uuid.UUID
    title: str
    file_extension: str
    file_size_formatted: str
    status: str
    uploaded_at: datetime
    has_study_materials: bool


class KnowledgeLibraryAnalysis(BaseModel):
    total_documents: int
    ai_ready_count: int
    file_type_distribution: List[FileTypeCount]
    total_storage_mb: float
    total_words: int
    total_pages: int
    total_reading_time_mins: int
    documents_with_study_materials: int
    recent_documents: List[RecentDocumentItem]


class DailyActivityPoint(BaseModel):
    date: str
    label: str
    questions: int
    documents: int
    study_materials: int


class StudyActivity(BaseModel):
    time_range: str
    period_questions: int
    period_conversations: int
    period_materials: int
    daily_activity: List[DailyActivityPoint]


class MostStudiedItem(BaseModel):
    document_id: Optional[uuid.UUID] = None
    title: str
    file_extension: str
    query_citations_count: int
    has_flashcards: bool
    has_quiz: bool
    last_studied_at: Optional[datetime] = None


class ActivityEvent(BaseModel):
    id: str
    event_type: str
    title: str
    details: str
    timestamp: datetime
    target_id: Optional[str] = None
    target_type: Optional[str] = None


class LearningProgress(BaseModel):
    quizzes_available: int
    total_quiz_questions: int
    flashcard_decks: int
    total_flashcards: int
    quiz_attempts_recorded: bool
    message: str


class LearningInsight(BaseModel):
    id: str
    category: str
    title: str
    text: str
    type: str


class AnalyticsOverviewResponse(BaseModel):
    time_range: str
    has_data: bool
    overview: OverviewMetrics
    knowledge_library: KnowledgeLibraryAnalysis
    study_activity: StudyActivity
    most_studied: List[MostStudiedItem]
    learning_progress: LearningProgress
    recent_activity: List[ActivityEvent]
    insights: List[LearningInsight]
