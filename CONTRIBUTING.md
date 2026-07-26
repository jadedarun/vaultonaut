# Contributing to Vaultonaut

Thank you for your interest in contributing to Vaultonaut! This document outlines our development workflow, coding standards, and pull request process.

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and professional environment for all contributors.

---

## Development Workflow

1. **Fork & Clone**:
   ```bash
   git clone https://github.com/your-username/vaultonaut.git
   cd vaultonaut
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   alembic upgrade head
   ```

3. **Frontend Setup**:
   ```bash
   cd ..
   npm install
   ```

4. **Running Tests**:
   - Backend Pytest Suite:
     ```bash
     cd backend
     pytest
     ```
   - Frontend Production Build Test:
     ```bash
     npm run build
     ```

---

## Coding Standards

### Python (Backend)
- Follow PEP 8 style guidelines.
- Use explicit type hints for function signatures.
- Ensure all database queries use SQLAlchemy 2.0 mapping standards (`Mapped`, `mapped_column`).
- Maintain 100% test pass rate across pytest suites.

### JavaScript / React (Frontend)
- Use standard functional components and custom React hooks.
- Format styled components using Vanilla CSS tokens in `App.css`.
- Ensure all interactive buttons include visible focus rings and ARIA accessibility labels.

---

## Commit Conventions

We follow Conventional Commits:
- `feat:` New user-facing feature
- `fix:` Bug fix or diagnostic patch
- `docs:` Documentation updates
- `test:` Pytest or frontend build test additions
- `refactor:` Code restructuring without behavioral changes
