# Architecture & Planning Document

## 1. System Architecture Blueprint (ארכיטקטורת המערכת)

The architecture follows a standard layered modular pattern using a decoupled API Gateway boundary.

```mermaid
graph TD
    subgraph Client Layer
        CLI["💻 command_line_interface"]
        GUI["🖥️ graphical_user_interface"]
        Test["🧪 test_runner"]
    end

    subgraph SDK Interface
        SDK["🧱 SDK Wrapper Layer<br>(Unified Entry Point)"]
    end

    subgraph Domain Engine (Services)
        Service["⚙️ Core Business Engines"]
    end

    subgraph Shared Utility Block
        Gate["🛡️ API Gatekeeper<br>(Rate Limits & Retry Queue)"]
        Config["⚙️ Configuration Manager"]
        Version["🏷️ Version Manager"]
    end

    Client Layer -->|Calls ONLY| SDK
    SDK -->|Validates Config| Config
    SDK -->|Monitors Version| Version
    SDK -->|Filters Calls| Gate
    Gate -->|Executes| Service
```

---

## 2. Structural Layer Descriptions (תכולה ארכיטקטונית)

### 2.1 Unified SDK Layer (Section 4.1)
All external modules access internal functions exclusively through the **SDK Interface**. Internal namespaces, files, and database integrations are completely hidden from the consumer. 

### 2.2 Domain Service Layer (Section 16)
Core algorithms are structured as standalone, immutable, independent "Building Blocks" satisfying the **Single Responsibility Principle**. Each component defines:
- **Input Data Formats**: Strictly validated range boundaries (Section 16.1).
- **Output Contracts**: Formatted outputs with deterministic boundary behavior.
- **Setup Params**: Clear fallback defaults.

### 2.3 Shared Utilities Layer (Section 5)
- **API Gatekeeper**: A thread-safe call manager enforcing rate limits, monitoring usage metrics, handling transient retries, and holding requests in a FIFO buffer.
- **Configuration Manager**: Safe configuration loaders fetching from static files.

---

## 3. Architectural Decision Records (ADRs)
*[Record the central engineering tradeoffs made during this project. Example template below.]*

### ADR 01: Layered Decoupled SDK vs Direct Service Imports
- **Status**: Accepted
- **Context**: Bypassing gatekeepers leads to rate failures and credentials leaks.
- **Decision**: Force all clients to access internal engines via a unified `SDK` boundary.
- **Consequence**: Ensures uniform rate limiting, safety audits, and clean modular structures.

---

## 4. API Schemas & Contract Specification
*[Define the method signatures, expected payload keys, and response status codes.]*
