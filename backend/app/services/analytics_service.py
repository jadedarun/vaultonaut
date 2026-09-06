import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.knowledge import Knowledge
from app.models.conversation import Conversation, ConversationMessage
from app.schemas.analytics import (
    OverviewMetrics,
    FileTypeCount,
    RecentDocumentItem,
    KnowledgeLibraryAnalysis,
    DailyActivityPoint,
    StudyActivity,
    MostStudiedItem,
    ActivityEvent,
    LearningProgress,
    LearningInsight,
    AnalyticsOverviewResponse,
)


def _format_bytes(bytes_count: Optional[int]) -> str:
    if not bytes_count or bytes_count <= 0:
        return "0 KB"
    kb = bytes_count / 1024.0
    if kb < 1024.0:
        return f"{kb:.1f} KB"
    mb = kb / 1024.0
    return f"{mb:.1f} MB"


def _normalize_dt(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


class AnalyticsService:
    def get_user_analytics(
        self,
        db: Session,
        user_id: uuid.UUID,
        time_range: str = "30d"
    ) -> AnalyticsOverviewResponse:
        """
        Computes factual, user-scoped personal learning and knowledge analytics from PostgreSQL records.
        """
        now = datetime.utcnow()
        if time_range == "7d":
            cutoff = now - timedelta(days=7)
            day_count = 7
        elif time_range == "all":
            cutoff = None
            day_count = 14
        else:
            time_range = "30d"
            cutoff = now - timedelta(days=30)
            day_count = 30

        # -------------------------------------------------------------
        # 1. Documents Aggregations
        # -------------------------------------------------------------
        docs_query = db.query(Document).filter(Document.user_id == user_id)
        all_user_docs = docs_query.all()
        total_documents = len(all_user_docs)
        ai_ready_count = sum(1 for d in all_user_docs if d.status == "completed")

        total_storage_bytes = sum(d.file_size for d in all_user_docs if d.file_size)
        total_storage_mb = round(total_storage_bytes / (1024.0 * 1024.0), 2)
        total_words = sum(d.word_count for d in all_user_docs if d.word_count)
        total_pages = sum(d.page_count for d in all_user_docs if d.page_count)
        total_reading_time_mins = sum(d.reading_time for d in all_user_docs if d.reading_time)

        # File type distribution
        ext_map: Dict[str, int] = {}
        for d in all_user_docs:
            clean_ext = (d.file_extension or "FILE").replace(".", "").upper()
            ext_map[clean_ext] = ext_map.get(clean_ext, 0) + 1

        file_type_distribution: List[FileTypeCount] = []
        for ext, count in sorted(ext_map.items(), key=lambda x: x[1], reverse=True):
            pct = round((count / total_documents) * 100.0, 1) if total_documents > 0 else 0.0
            file_type_distribution.append(FileTypeCount(extension=ext, count=count, percentage=pct))

        # -------------------------------------------------------------
        # 2. Knowledge & Study Materials (Flashcards & Quizzes)
        # -------------------------------------------------------------
        flashcard_entries = db.query(Knowledge).filter(
            Knowledge.user_id == user_id,
            Knowledge.category == "Flashcards"
        ).all()

        total_flashcards = 0
        doc_ids_with_flashcards = set()
        for fc in flashcard_entries:
            try:
                cards = json.loads(fc.content)
                total_flashcards += len(cards)
            except Exception:
                pass
            if fc.title.startswith("Flashcards - "):
                doc_ids_with_flashcards.add(fc.title.replace("Flashcards - ", "").strip())

        quiz_entries = db.query(Knowledge).filter(
            Knowledge.user_id == user_id,
            Knowledge.category == "Quizzes"
        ).all()

        total_quiz_questions = 0
        doc_ids_with_quizzes = set()
        for qz in quiz_entries:
            try:
                data = json.loads(qz.content)
                questions = data.get("questions", [])
                total_quiz_questions += len(questions)
            except Exception:
                pass
            if qz.title.startswith("Quiz - "):
                doc_ids_with_quizzes.add(qz.title.replace("Quiz - ", "").strip())

        flashcard_decks = len(flashcard_entries)
        quizzes_count = len(quiz_entries)
        total_study_materials = flashcard_decks + quizzes_count

        docs_with_materials_count = sum(
            1 for d in all_user_docs
            if str(d.id) in doc_ids_with_flashcards or str(d.id) in doc_ids_with_quizzes
        )

        # Recent documents
        recent_docs_sorted = sorted(
            all_user_docs,
            key=lambda d: _normalize_dt(d.uploaded_at or d.created_at) or datetime.min,
            reverse=True
        )[:5]

        recent_documents: List[RecentDocumentItem] = [
            RecentDocumentItem(
                id=d.id,
                title=d.original_filename,
                file_extension=(d.file_extension or "").replace(".", "").upper(),
                file_size_formatted=_format_bytes(d.file_size),
                status=d.status,
                uploaded_at=d.uploaded_at or d.created_at,
                has_study_materials=(str(d.id) in doc_ids_with_flashcards or str(d.id) in doc_ids_with_quizzes)
            )
            for d in recent_docs_sorted
        ]

        # -------------------------------------------------------------
        # 3. Conversations & Questions Aggregations
        # -------------------------------------------------------------
        all_convs = db.query(Conversation).filter(Conversation.user_id == user_id).all()
        total_conversations = len(all_convs)

        user_messages = db.query(ConversationMessage).join(
            Conversation, ConversationMessage.conversation_id == Conversation.id
        ).filter(
            Conversation.user_id == user_id,
            ConversationMessage.role == "user"
        ).all()
        total_questions_asked = len(user_messages)

        # Time range filtered activity
        if cutoff:
            period_questions = sum(
                1 for m in user_messages if _normalize_dt(m.created_at) and _normalize_dt(m.created_at) >= cutoff
            )
            period_conversations = sum(
                1 for c in all_convs if _normalize_dt(c.created_at) and _normalize_dt(c.created_at) >= cutoff
            )
            period_materials = sum(
                1 for k in (flashcard_entries + quiz_entries)
                if _normalize_dt(k.created_at) and _normalize_dt(k.created_at) >= cutoff
            )
        else:
            period_questions = total_questions_asked
            period_conversations = total_conversations
            period_materials = total_study_materials

        # -------------------------------------------------------------
        # 4. Daily Activity Timeline
        # -------------------------------------------------------------
        daily_activity: List[DailyActivityPoint] = []
        for i in range(day_count - 1, -1, -1):
            day_date = (now - timedelta(days=i)).date()
            day_str = day_date.strftime("%Y-%m-%d")
            day_label = day_date.strftime("%b %d")

            q_count = sum(
                1 for m in user_messages
                if _normalize_dt(m.created_at) and _normalize_dt(m.created_at).date() == day_date
            )
            d_count = sum(
                1 for d in all_user_docs
                if _normalize_dt(d.uploaded_at or d.created_at) and _normalize_dt(d.uploaded_at or d.created_at).date() == day_date
            )
            m_count = sum(
                1 for k in (flashcard_entries + quiz_entries)
                if _normalize_dt(k.created_at) and _normalize_dt(k.created_at).date() == day_date
            )

            daily_activity.append(
                DailyActivityPoint(
                    date=day_str,
                    label=day_label,
                    questions=q_count,
                    documents=d_count,
                    study_materials=m_count
                )
            )

        # -------------------------------------------------------------
        # 5. Most Studied Knowledge (from real assistant citations)
        # -------------------------------------------------------------
        assistant_messages = db.query(ConversationMessage).join(
            Conversation, ConversationMessage.conversation_id == Conversation.id
        ).filter(
            Conversation.user_id == user_id,
            ConversationMessage.role == "assistant"
        ).all()

        citation_counts: Dict[str, int] = {}
        last_cited_at: Dict[str, datetime] = {}
        for am in assistant_messages:
            meta = am.retrieval_metadata or {}
            citations = meta.get("citations", [])
            for cit in citations:
                fn = cit.get("filename") or cit.get("document_title")
                if fn:
                    citation_counts[fn] = citation_counts.get(fn, 0) + 1
                    msg_dt = _normalize_dt(am.created_at)
                    if fn not in last_cited_at or (msg_dt and msg_dt > last_cited_at[fn]):
                        if msg_dt:
                            last_cited_at[fn] = msg_dt

        # Map document objects with citations or fall back to recent docs
        most_studied: List[MostStudiedItem] = []
        doc_by_filename = {d.original_filename: d for d in all_user_docs}

        for fn, count in sorted(citation_counts.items(), key=lambda x: x[1], reverse=True):
            matched_doc = doc_by_filename.get(fn)
            doc_id = matched_doc.id if matched_doc else None
            ext = matched_doc.file_extension.replace(".", "").upper() if matched_doc else "DOC"
            has_fc = str(doc_id) in doc_ids_with_flashcards if doc_id else False
            has_qz = str(doc_id) in doc_ids_with_quizzes if doc_id else False

            most_studied.append(
                MostStudiedItem(
                    document_id=doc_id,
                    title=fn,
                    file_extension=ext,
                    query_citations_count=count,
                    has_flashcards=has_fc,
                    has_quiz=has_qz,
                    last_studied_at=last_cited_at.get(fn)
                )
            )

        # If few or no citations yet, fill with user's top documents with 0 query citations
        if len(most_studied) < 4:
            for d in all_user_docs:
                if d.original_filename not in citation_counts:
                    most_studied.append(
                        MostStudiedItem(
                            document_id=d.id,
                            title=d.original_filename,
                            file_extension=(d.file_extension or "").replace(".", "").upper(),
                            query_citations_count=0,
                            has_flashcards=str(d.id) in doc_ids_with_flashcards,
                            has_quiz=str(d.id) in doc_ids_with_quizzes,
                            last_studied_at=_normalize_dt(d.uploaded_at or d.created_at)
                        )
                    )
                if len(most_studied) >= 4:
                    break

        # -------------------------------------------------------------
        # 6. Recent Activity Timeline (Chronological Merge)
        # -------------------------------------------------------------
        events: List[ActivityEvent] = []

        # Document uploads
        for d in all_user_docs[:6]:
            dt = d.uploaded_at or d.created_at
            events.append(
                ActivityEvent(
                    id=f"doc-up-{d.id}",
                    event_type="document_upload",
                    title=f"Uploaded {d.original_filename}",
                    details=f"{_format_bytes(d.file_size)} • {(d.file_extension or '').replace('.', '').upper()}",
                    timestamp=dt,
                    target_id=str(d.id),
                    target_type="document"
                )
            )
            if d.status == "completed" and d.processed_at:
                events.append(
                    ActivityEvent(
                        id=f"doc-proc-{d.id}",
                        event_type="document_processed",
                        title=f"AI indexing completed for {d.original_filename}",
                        details=f"{d.word_count or 0} words • {d.page_count or 1} pages",
                        timestamp=d.processed_at,
                        target_id=str(d.id),
                        target_type="document"
                    )
                )

        # Conversations
        for c in all_convs[:5]:
            events.append(
                ActivityEvent(
                    id=f"conv-{c.id}",
                    event_type="conversation_start",
                    title=f"Started conversation: {c.title}",
                    details="AI study chat session",
                    timestamp=c.created_at,
                    target_id=str(c.id),
                    target_type="conversation"
                )
            )

        # Recent user questions
        recent_questions = sorted(
            user_messages,
            key=lambda m: _normalize_dt(m.created_at) or datetime.min,
            reverse=True
        )[:5]
        for q in recent_questions:
            snippet = q.content.strip()
            if len(snippet) > 60:
                snippet = snippet[:60] + "..."
            events.append(
                ActivityEvent(
                    id=f"q-{q.id}",
                    event_type="question_asked",
                    title=f"Asked: \"{snippet}\"",
                    details="Study inquiry",
                    timestamp=q.created_at,
                    target_id=str(q.conversation_id),
                    target_type="conversation"
                )
            )

        # Study materials generated
        for fc in flashcard_entries[:4]:
            events.append(
                ActivityEvent(
                    id=f"fc-{fc.id}",
                    event_type="study_material",
                    title=f"Created {fc.title}",
                    details="AI Flashcards deck",
                    timestamp=fc.created_at,
                    target_id=fc.title.replace("Flashcards - ", "") if fc.title.startswith("Flashcards - ") else None,
                    target_type="knowledge"
                )
            )
        for qz in quiz_entries[:4]:
            events.append(
                ActivityEvent(
                    id=f"qz-{qz.id}",
                    event_type="study_material",
                    title=f"Generated {qz.title}",
                    details="AI Practice Quiz",
                    timestamp=qz.created_at,
                    target_id=qz.title.replace("Quiz - ", "") if qz.title.startswith("Quiz - ") else None,
                    target_type="knowledge"
                )
            )

        # Sort merged events by timestamp descending
        events.sort(key=lambda e: _normalize_dt(e.timestamp) or datetime.min, reverse=True)
        recent_activity = events[:10]

        # -------------------------------------------------------------
        # 7. Deterministic Learning Insights
        # -------------------------------------------------------------
        insights: List[LearningInsight] = []

        if total_documents > 0:
            if ai_ready_count == total_documents:
                insights.append(
                    LearningInsight(
                        id="insight-ready",
                        category="library",
                        title="Knowledge Vault AI-Ready",
                        text=f"All {total_documents} uploaded documents are indexed and ready for grounded study conversations.",
                        type="success"
                    )
                )
            else:
                insights.append(
                    LearningInsight(
                        id="insight-indexing",
                        category="library",
                        title="Vault Processing",
                        text=f"{ai_ready_count} of {total_documents} documents are ready for study sessions. Remaining items are completing indexing.",
                        type="info"
                    )
                )

        if most_studied and most_studied[0].query_citations_count > 0:
            top_doc = most_studied[0]
            insights.append(
                LearningInsight(
                    id="insight-focus",
                    category="focus",
                    title="Primary Study Focus",
                    text=f"Your most queried material is \"{top_doc.title}\" with {top_doc.query_citations_count} citations across study chats.",
                    type="highlight"
                )
            )

        if total_study_materials > 0:
            insights.append(
                LearningInsight(
                    id="insight-materials",
                    category="practice",
                    title="Study Materials Synthesized",
                    text=f"You have {total_flashcards} flashcards and {total_quiz_questions} quiz questions ready for self-assessment in the Learning Studio.",
                    type="info"
                )
            )
        elif total_documents > 0:
            insights.append(
                LearningInsight(
                    id="insight-no-materials",
                    category="practice",
                    title="Generate Practice Materials",
                    text="You haven't generated study cards yet. Visit the Learning Studio to create AI flashcards and quizzes from your documents.",
                    type="highlight"
                )
            )

        if period_questions > 0:
            insights.append(
                LearningInsight(
                    id="insight-momentum",
                    category="activity",
                    title="Active Study Momentum",
                    text=f"You asked {period_questions} questions across {period_conversations} conversations in this {time_range} period.",
                    type="success"
                )
            )
        elif total_documents > 0:
            insights.append(
                LearningInsight(
                    id="insight-idle",
                    category="activity",
                    title="Resume Your Learning",
                    text=f"No questions asked in the past {time_range}. Head over to the AI Workspace to explore concepts from your documents.",
                    type="info"
                )
            )

        if total_reading_time_mins > 0:
            insights.append(
                LearningInsight(
                    id="insight-reading",
                    category="volume",
                    title="Library Reading Load",
                    text=f"Your library spans ~{total_reading_time_mins} minutes of estimated reading ({total_words:,} words across {total_pages} pages).",
                    type="info"
                )
            )

        # -------------------------------------------------------------
        # 8. Learning Progress State
        # -------------------------------------------------------------
        has_data = (total_documents > 0 or total_conversations > 0 or total_study_materials > 0)
        learning_progress = LearningProgress(
            quizzes_available=quizzes_count,
            total_quiz_questions=total_quiz_questions,
            flashcard_decks=flashcard_decks,
            total_flashcards=total_flashcards,
            quiz_attempts_recorded=False,
            message="Learning progress and quiz mastery scores will appear as you complete study sessions in the Learning Studio."
        )

        return AnalyticsOverviewResponse(
            time_range=time_range,
            has_data=has_data,
            overview=OverviewMetrics(
                total_documents=total_documents,
                ai_ready_documents=ai_ready_count,
                total_conversations=total_conversations,
                total_questions_asked=total_questions_asked,
                total_study_materials=total_study_materials,
                flashcard_decks=flashcard_decks,
                total_flashcards=total_flashcards,
                quizzes_count=quizzes_count,
                total_quiz_questions=total_quiz_questions
            ),
            knowledge_library=KnowledgeLibraryAnalysis(
                total_documents=total_documents,
                ai_ready_count=ai_ready_count,
                file_type_distribution=file_type_distribution,
                total_storage_mb=total_storage_mb,
                total_words=total_words,
                total_pages=total_pages,
                total_reading_time_mins=total_reading_time_mins,
                documents_with_study_materials=docs_with_materials_count,
                recent_documents=recent_documents
            ),
            study_activity=StudyActivity(
                time_range=time_range,
                period_questions=period_questions,
                period_conversations=period_conversations,
                period_materials=period_materials,
                daily_activity=daily_activity
            ),
            most_studied=most_studied,
            learning_progress=learning_progress,
            recent_activity=recent_activity,
            insights=insights
        )


analytics_service = AnalyticsService()
