"""create knowledge table

Revision ID: 0002_create_knowledge_table
Revises: 0001_create_users_table
Create Date: 2026-07-25 22:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0002_create_knowledge_table'
down_revision: Union[str, None] = '0001_create_users_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'knowledge',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=100), server_default='General', nullable=False),
        sa.Column('tags', sa.JSON(), nullable=False),
        sa.Column('favorite', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('pinned', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('status', sa.String(length=50), server_default='active', nullable=False),
        sa.Column('word_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('reading_time', sa.Integer(), server_default='0', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index(op.f('ix_knowledge_id'), 'knowledge', ['id'], unique=False)
    op.create_index(op.f('ix_knowledge_user_id'), 'knowledge', ['user_id'], unique=False)
    op.create_index(op.f('ix_knowledge_title'), 'knowledge', ['title'], unique=False)
    op.create_index(op.f('ix_knowledge_category'), 'knowledge', ['category'], unique=False)
    op.create_index(op.f('ix_knowledge_favorite'), 'knowledge', ['favorite'], unique=False)
    op.create_index(op.f('ix_knowledge_created_at'), 'knowledge', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_knowledge_created_at'), table_name='knowledge')
    op.drop_index(op.f('ix_knowledge_favorite'), table_name='knowledge')
    op.drop_index(op.f('ix_knowledge_category'), table_name='knowledge')
    op.drop_index(op.f('ix_knowledge_title'), table_name='knowledge')
    op.drop_index(op.f('ix_knowledge_user_id'), table_name='knowledge')
    op.drop_index(op.f('ix_knowledge_id'), table_name='knowledge')
    op.drop_table('knowledge')
