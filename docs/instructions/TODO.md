# Project Task Tracker (TODO List)

## 1. Release Phases & Milestone Plan

| Phase | Milestone | Focus Area | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | M1.1 | Project Directory Structures & Baseline Configs | Completed ✅ |
| **Phase 1** | M1.2 | Setup Documentation Framework (PRD, PLAN, TODO) | Completed ✅ |
| **Phase 2** | M2.1 | API Gatekeeper Queue Logic & Thread-safe Checks | Not Started ⏳ |
| **Phase 2** | M2.2 | Configuration Manager Engine | Not Started ⏳ |
| **Phase 3** | M3.1 | Core Analytical Engine & Business Building Blocks | Not Started ⏳ |
| **Phase 3** | M3.2 | Decoupled SDK unified entry layer wrapper | Not Started ⏳ |
| **Phase 4** | M4.1 | Write Unit & Integration Test Suites | Not Started ⏳ |
| **Phase 4** | M4.2 | Reach >85% Coverage and enforce Zero-violations Linter | Not Started ⏳ |

---

## 2. Definition of Done (DoD) per Task

To mark any task block as "Completed", the following criteria must be satisfied without exception:
1. **Linting Check**: The target files must compile and execute through `ruff check` with **0 infractions** (Section 7.1).
2. **Size Constraints**: No Python source code file exceeds **150 lines** (excluding docstrings and comments) (Section 3.2).
3. **Comments & Documentation**: All public classes and functions must include precise Google-style Docstrings documenting exceptions and types (Section 3.3).
4. **Local Coverage**: Tests covering the modified classes must reach a minimum of **85% statement coverage** (Section 6.2).
5. **No Embedded Secrets**: Verify no direct values, tokens, or hardcoded configurations exist in the commit (Section 7.2).

---

## 3. Detailed Tasks Matrix

### Phase 1: Setup & Groundwork
- [x] **Repo Setup**: Initialize Git repo and link with GitHub remote destination. *(Assigned: AI)*
- [x] **Config Base**: Create `.gitignore`, `pyproject.toml`, and `.env-example`. *(Assigned: AI)*
- [x] **Release Docs**: Deploy standard `docs/PRD.md`, `docs/PLAN.md`, and `docs/TODO.md`. *(Assigned: AI)*

### Phase 2: System Foundations
- [ ] **Config Engine**: Write config file loaders parsing JSON metadata parameters safely. *(Assigned: TBD)*
- [ ] **Gatekeeper Mechanism**: Code thread-safe rate-limit tracker enforcing minute/hour/concurrent caps. *(Assigned: TBD)*
- [ ] **Task Buffer Queue**: Implement FIFO retry/backpressure queueing on rate overflows. *(Assigned: TBD)*

### Phase 3: Core Capabilities
- [ ] **Service Layer Blocks**: Code standalone business algorithms under `src/homework_2/services/`. *(Assigned: TBD)*
- [ ] **Public API SDK Wrapper**: Code public wrapper delegating safely to the gatekeeper wrapper. *(Assigned: TBD)*
- [ ] **Version Tracking**: Configure immutable version tag files. *(Assigned: TBD)*

### Phase 4: Release Quality
- [ ] **Test fixtures suite**: Write pytest mocks and setup context in `tests/conftest.py`. *(Assigned: TBD)*
- [ ] **Unit Tests**: Secure >85% coverage of internal module classes. *(Assigned: TBD)*
- [ ] **Integration Tests**: Execute full client SDK simulation tests. *(Assigned: TBD)*
