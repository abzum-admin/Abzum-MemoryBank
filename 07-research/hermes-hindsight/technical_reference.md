---
id: res-hermes-tech-ref
title: Hermes + Hindsight Technical Reference
summary: Technical architecture and implementation details
tags: [research, hermes, hindsight, technical]
updated: 2026-05-09
load_priority: 25
load_lane: reference
status: active
---
# Technical Reference: Hermes + Hindsight Memory Architecture

## System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    Application Layer                              │
│  (BI Dashboard, Analytics API, Report Engine, Chat Interface)    │
└─────────────────────┬────────────────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────────────────┐
│                   Hermes Agent Kernel                             │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Prompt Engineering Layer                                   │  │
│  │ • Personality (02-org/01-executive/felix-caio/soul.md)                                    │  │
│  │ • Memory Injection (10-memory/long_term.md, 12-private/vijay.md frozen snapshots)  │  │
│  │ • Skills Loading (3-tier: names → full → references)      │  │
│  │ • Tool Guidance & Model-specific Instructions             │  │
│  └────────────────────────────────────────────────────────────┘  │
│                            ▲                                      │
│                            │                                      │
│  ┌────────────────────────┴─────────────────────────────────┐   │
│  │ Session Management                                        │   │
│  │ • Turn tracking & sequencing                             │   │
│  │ • Context window management                              │   │
│  │ • Tool invocation & result handling                       │   │
│  └─────────────────────────────────────────────────────────┘    │
└───────────┬──────────────────┬──────────────────┬─────────────┘
            │                  │                  │
    ┌───────▼────────┐  ┌──────▼──────────┐  ┌───▼─────────────┐
    │  Built-in      │  │  Skills        │  │  Hindsight      │
    │  Memory        │  │  System        │  │  Provider       │
    │                │  │                │  │                 │
    │ ~2.2K chars    │  │ ~/.hermes/     │  │ Memory Hooks:   │
    │ Durable facts  │  │  skills/       │  │ • prefetch      │
    │ 10-memory/long_term.md      │  │                │  │ • session_end   │
    │                │  │ ~40+ skills    │  │ • pre_compress  │
    │ ~1.4K chars    │  │ Auto-extracted │  │                 │
    │ User profile   │  │ from tasks     │  │ Knowledge Graph │
    │ 12-private/vijay.md        │  │                │  │ • Entities      │
    │                │  │ Self-improving │  │ • Relationships │
    │ Frozen at      │  │ as reused      │  │ • Temporal data │
    │ session start  │  │                │  │                 │
    │                │  │ 3 load levels: │  │ Multi-strategy  │
    │ SQLite         │  │ L0: names only │  │ Search:         │
    │ (~/.hermes/    │  │ L1: full text  │  │ • Semantic      │
    │  state.db)     │  │ L2: reference  │  │ • BM25          │
    │                │  │                │  │ • Hybrid        │
    │ FTS5 indexed   │  │                │  │                 │
    │ Session search │  │                │  │ Entity tools:   │
    │                │  │                │  │ • hindsight_    │
    │ Gemini Flash   │  │                │  │   retain        │
    │ summarization  │  │                │  │ • hindsight_    │
    │                │  │                │  │   recall        │
    │                │  │                │  │ • hindsight_    │
    │                │  │                │  │   reflect       │
    └────────────────┘  └──────────────────┘  └───┬────────────┘
                                                   │
                                    ┌──────────────▼──────────────┐
                                    │   PostgreSQL (Hindsight)    │
                                    │                              │
                                    │ Entity Subgraph:             │
                                    │ • Customer (tier, ltv, risk) │
                                    │ • Product (sku, revenue)     │
                                    │ • Transaction (date, amount) │
                                    │ • Metric (formula, updated)  │
                                    │ • Report (owner, schedule)   │
                                    │                              │
                                    │ Relationships:               │
                                    │ • Customer uses Product      │
                                    │ • Customer in Region         │
                                    │ • Transaction for Product    │
                                    │ • Decision justified_by Reason│
                                    │                              │
                                    │ Temporal Layers:             │
                                    │ • Absolute timestamps        │
                                    │ • Validity windows           │
                                    │ • Change tracking            │
                                    │                              │
                                    │ Vector Embeddings:           │
                                    │ • Entity embeddings          │
                                    │ • Semantic search index      │
                                    │ • Relationship vectors       │
                                    └──────────────────────────────┘
```

---

## Core Components

### 1. Hermes Kernel

**Location:** `hermes/agent/`

**Key Functions:**
- Turn-by-turn reasoning
- Tool invocation and result handling
- Context window management
- Prompt assembly from multi-layer sources

**Python Interface:**
```python
from hermes.agent import Agent

agent = Agent(
    model="claude-opus-4",
    memory_provider="hindsight",
    storage_backend="postgresql"
)

response = agent.process_turn(
    user_input="What are our top customers?",
    context={
        'domain': 'BI',
        'session_id': 'sess_12345'
    }
)
```

### 2. Memory Provider Interface

**Location:** `hermes/memory/provider.py`

**Abstract Base Class:**
```python
from abc import ABC, abstractmethod
from typing import Dict, Any, List

class MemoryProvider(ABC):
    """Base interface for memory providers"""
    
    @abstractmethod
    def prefetch(self, context: Dict) -> Dict:
        """Retrieve memories before turn (non-blocking)"""
        pass
    
    @abstractmethod
    def store_turn(self, turn_data: Dict) -> None:
        """Store completed turn"""
        pass
    
    @abstractmethod
    def recall(self, query: str, limit: int = 10) -> List[Dict]:
        """Search memory with multi-strategy approach"""
        pass
    
    @abstractmethod
    def on_session_end(self, session_data: Dict) -> None:
        """Called when session ends"""
        pass
    
    @abstractmethod
    def on_pre_compress(self, context: Dict) -> Dict:
        """Compress memory before storing"""
        pass
```

**Hindsight Implementation:** `plugins/memory/hindsight/provider.py`

### 3. Hindsight Knowledge Graph

**Entity Model:**
```python
class Entity:
    id: str  # UUID
    type: str  # Customer, Product, Transaction, Metric, Report
    attributes: Dict[str, Any]  # type-specific attributes
    embeddings: List[float]  # vector for semantic search
    created_at: datetime
    updated_at: datetime
    valid_from: datetime  # temporal validity window
    valid_to: datetime

class Relationship:
    source_id: str
    target_id: str
    type: str  # 'uses_product', 'in_region', 'justified_by', etc.
    properties: Dict[str, Any]  # weight, confidence, effective_date
    confidence: float  # extraction confidence
    created_at: datetime
```

**SQL Schema (PostgreSQL):**
```sql
CREATE TABLE entities (
    id UUID PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    attributes JSONB NOT NULL,
    embeddings vector(1536),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    valid_from TIMESTAMP,
    valid_to TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_created (created_at),
    INDEX idx_embeddings ON entities USING ivfflat (embeddings vector_cosine_ops)
);

CREATE TABLE relationships (
    id UUID PRIMARY KEY,
    source_id UUID NOT NULL REFERENCES entities(id),
    target_id UUID NOT NULL REFERENCES entities(id),
    type VARCHAR(100) NOT NULL,
    properties JSONB,
    confidence FLOAT,
    created_at TIMESTAMP NOT NULL,
    INDEX idx_source (source_id),
    INDEX idx_target (target_id),
    INDEX idx_type (type)
);

CREATE TABLE turns (
    id UUID PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    turn_index INT NOT NULL,
    user_input TEXT NOT NULL,
    assistant_reasoning TEXT NOT NULL,
    tool_calls JSONB,
    result TEXT,
    entities_extracted JSONB,
    created_at TIMESTAMP NOT NULL,
    INDEX idx_session (session_id),
    INDEX idx_created (created_at)
);

CREATE TABLE episodes (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    domain VARCHAR(50),
    source_turns UUID[] NOT NULL,
    decisions JSONB,
    outcomes JSONB,
    compression_ratio FLOAT,
    created_at TIMESTAMP NOT NULL,
    INDEX idx_domain (domain)
);
```

### 4. Lifecycle Hooks

**Hook Timing:**
```
Session Start
    ↓
[prefetch] ← Retrieved from Hindsight before turn
    ↓
User Input
    ↓
Turn Processing
    ↓
Tool Calls
    ↓
Result Processing
    ↓
[store_turn] ← After turn completes
    ↓
(... next turn ...)
    ↓
Session End
    ↓
[on_session_end] ← Create episode summaries
[on_pre_compress] ← Prepare for storage
    ↓
Stored in PostgreSQL
```

**Hook Implementation Example:**
```python
class HindsightMemoryProvider(MemoryProvider):
    
    def prefetch(self, context: Dict) -> Dict:
        """3-tier retrieval: 90% hooks, 10% MCP"""
        
        # Extract entities from context
        entity_types = context.get('entity_types', [])
        query = context.get('query', '')
        
        # Native plugin: use lifecycle hooks
        # (this is the fast path—90% of retrieval)
        relevant_entities = self._prefetch_native(
            entity_types=entity_types,
            query=query,
            timeout_ms=500  # non-blocking
        )
        
        return {
            'entities': relevant_entities,
            'relationships': self._get_relationships(relevant_entities),
            'temporal_context': self._get_temporal_context()
        }
    
    def store_turn(self, turn_data: Dict) -> None:
        """Store completed turn to Hindsight"""
        
        # Extract entities from turn
        entities = self._extract_entities(turn_data)
        
        # Extract relationships
        relationships = self._extract_relationships(entities, turn_data)
        
        # Store in PostgreSQL
        for entity in entities:
            self.db.execute(
                "INSERT INTO entities VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                (entity.id, entity.type, entity.attributes, 
                 entity.embeddings, entity.created_at, entity.updated_at,
                 entity.valid_from, entity.valid_to)
            )
        
        # Create turn record
        self.db.execute(
            "INSERT INTO turns VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (turn_data['id'], turn_data['session_id'], turn_data['index'],
             turn_data['user_input'], turn_data['reasoning'],
             turn_data['tool_calls'], turn_data['result'],
             [e.id for e in entities], datetime.now())
        )
    
    def recall(self, query: str, limit: int = 10) -> List[Dict]:
        """Multi-strategy retrieval"""
        
        # Strategy 1: Semantic search (embeddings)
        semantic_results = self._semantic_search(
            query, limit=limit//2
        )
        
        # Strategy 2: BM25 full-text search
        bm25_results = self._bm25_search(
            query, limit=limit//2
        )
        
        # Hybrid merge (dedup, re-rank)
        merged = self._merge_results(
            semantic_results, bm25_results
        )
        
        return merged
    
    def on_session_end(self, session_data: Dict) -> None:
        """Create episode summary"""
        
        turns = session_data['turns']
        
        # Extract key elements
        decisions = self._extract_decisions(turns)
        outcomes = self._extract_outcomes(turns)
        entities = self._extract_entities_from_session(turns)
        
        # Create episode
        episode = {
            'title': self._generate_title(session_data),
            'domain': session_data.get('domain'),
            'decisions': decisions,
            'outcomes': outcomes,
            'source_turns': [t['id'] for t in turns],
            'compression_ratio': self._calculate_compression(turns)
        }
        
        # Store episode
        self.db.execute(
            "INSERT INTO episodes VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (episode['id'], episode['title'], episode['summary'],
             episode['domain'], episode['source_turns'],
             episode['decisions'], episode['outcomes'],
             episode['compression_ratio'], datetime.now())
        )
```

---

## Memory Type Implementation Details

### Working Memory

**Implementation:**
- Stored in LLM context window (100K+ tokens typical)
- Assembled at session start from:
  - 10-memory/long_term.md (2,200 chars)
  - 12-private/vijay.md (1,375 chars)
  - Skills metadata (varies)
  - Prefetched entities from Hindsight (up to 50 results)

**Retrieval Latency:** <50ms (frozen snapshot + prefetch)

**Storage:** In-memory during session, not persisted

### Short-Term Memory

**Implementation:**
- SQLite FTS5 full-text index
- All turns in ~/.hermes/state.db
- Session search with Gemini Flash summarization

**Query:**
```python
# Search past sessions
results = agent.session_search("What did we discuss about customer churn?")

# Returns:
[
    {
        'session_id': 'sess_xyz',
        'turn_index': 3,
        'summary': 'Discussed churn risk factors: price sensitivity, competitor features',
        'timestamp': '2026-03-15T14:30:00Z'
    }
]
```

**Retrieval Latency:** 100-500ms (SQLite + optional summarization)

**Storage:** SQLite local file

### Long-Term Memory

**Implementation:**
- Hindsight Knowledge Graph (PostgreSQL)
- Entities, relationships, temporal validity
- Semantic embeddings for vector search

**Query Example:**
```python
# Find customers at high churn risk
results = hindsight.recall(
    query="Enterprise customers with churn risk above 0.7",
    entity_type="Customer",
    filters={'tier': 'Enterprise', 'churn_risk': {'gte': 0.7}}
)

# Returns entities with all attributes + embeddings
```

**Retrieval Latency:** 50-300ms (PostgreSQL with indexes)

**Storage:** PostgreSQL persistent

### Persona Memory

**Implementation:**
- 02-org/01-executive/felix-caio/soul.md (Hermes personality document)
- Frozen at session start, injected into system prompt
- Skills encode learned personality/approach patterns

**Injection Order (System Prompt):**
1. Personality/instructions (02-org/01-executive/felix-caio/soul.md)
2. Memory context (10-memory/long_term.md)
3. User profile (12-private/vijay.md)
4. Active skills
5. Tool definitions
6. Model-specific guidance

### Episodic Memory

**Implementation:**
- Raw: Full turns in Hindsight.turns table
- Compressed: Episodes in Hindsight.episodes table
- Pattern synthesis via hindsight_reflect tool

**Three-Tier Storage:**
```
Raw Episode (100%)
├─ User input: "What about customer retention?"
├─ Reasoning: "Need to check churn factors..."
├─ Tool calls: [hindsight_recall, hindsight_reflect]
├─ Results: "Found 47 at-risk customers..."
└─ Metadata: timestamp, entities_extracted, etc.

Compressed Episode (15-20% of raw)
├─ Title: "Customer Retention Analysis"
├─ Decisions: ["Focused on Enterprise segment"]
├─ Outcomes: ["Identified 47 at-risk customers"]
├─ Key entities: [Customer:123, Customer:456, ...]
└─ Compression ratio: 0.18

Consolidated Semantics (pattern only)
├─ Pattern: "For retention queries, always check..."
├─ Frequency: "Observed in 7 of 10 similar sessions"
└─ Confidence: 0.92
```

### Entity Memory

**Implementation:**
- Custom entity types defined in config
- Automatic extraction from conversations
- Relationship graph linking entities
- Temporal validity windows

**BI Entity Types:**
```python
entity_types = {
    'Customer': {
        'attributes': ['name', 'tier', 'region', 'lifetime_value', 
                      'churn_risk', 'created_at', 'last_purchase_date'],
        'relationships': ['uses_product', 'in_region', 'associated_account_manager'],
        'indexes': ['by_segment', 'by_risk', 'temporal']
    },
    'Product': {
        'attributes': ['name', 'sku', 'category', 'revenue_ytd', 
                      'inventory_level', 'launch_date'],
        'relationships': ['used_by_customer', 'in_category'],
        'indexes': ['by_category', 'by_revenue']
    },
    'Transaction': {
        'attributes': ['date', 'customer_id', 'product_id', 'amount', 
                      'status', 'channel'],
        'relationships': ['involves_customer', 'involves_product'],
        'indexes': ['by_date_customer', 'by_product_metric']
    },
    'Metric': {
        'attributes': ['name', 'formula', 'last_updated', 'trending_direction'],
        'relationships': ['depends_on_transaction', 'depends_on_customer'],
        'indexes': ['by_domain']
    },
    'Report': {
        'attributes': ['name', 'owner', 'schedule', 'consumers_count'],
        'relationships': ['uses_metric', 'accesses_customer_data'],
        'indexes': ['by_owner']
    }
}
```

---

## Search Strategies

### Semantic Search

```python
def semantic_search(query: str, limit: int = 10):
    """Search by meaning, not keywords"""
    
    # Embed query
    query_embedding = embedding_model.encode(query)
    
    # Find similar entities by cosine distance
    results = db.execute("""
        SELECT id, type, attributes, 
               1 - (embeddings <=> %s::vector) as similarity
        FROM entities
        ORDER BY similarity DESC
        LIMIT %s
    """, (query_embedding, limit))
    
    return results
```

**Good for:** "High-value customers at risk" (semantic meaning)

### BM25 Search

```python
def bm25_search(query: str, limit: int = 10):
    """Full-text keyword search"""
    
    # BM25 ranking built into PostgreSQL
    results = db.execute("""
        SELECT id, type, attributes,
               ts_rank(to_tsvector(attributes::text), 
                      plainto_tsquery(%s)) as rank
        FROM entities
        WHERE to_tsvector(attributes::text) @@ plainto_tsquery(%s)
        ORDER BY rank DESC
        LIMIT %s
    """, (query, query, limit))
    
    return results
```

**Good for:** "Find entity X" (exact matches)

### Hybrid Search

```python
def hybrid_search(query: str, limit: int = 10):
    """Combine semantic + BM25, re-rank"""
    
    semantic = semantic_search(query, limit*2)
    bm25 = bm25_search(query, limit*2)
    
    # Merge and dedup
    merged = {}
    for r in semantic:
        merged[r['id']] = {'semantic_score': r['similarity']}
    for r in bm25:
        if r['id'] in merged:
            merged[r['id']]['bm25_score'] = r['rank']
        else:
            merged[r['id']] = {'bm25_score': r['rank']}
    
    # Normalize and combine scores
    final_scores = []
    for entity_id, scores in merged.items():
        combined = (scores.get('semantic_score', 0) * 0.6 + 
                   scores.get('bm25_score', 0) * 0.4)
        final_scores.append((entity_id, combined))
    
    # Return top K
    final_scores.sort(key=lambda x: x[1], reverse=True)
    return final_scores[:limit]
```

**Good for:** General queries (best of both worlds)

---

## Tools API Reference

### hindsight_retain

**Purpose:** Extract and store facts with entity recognition

**Signature:**
```python
def hindsight_retain(
    facts: List[str],
    entity_types: List[str] = None,
    domain: str = 'general'
) -> Dict:
    """
    facts: ["Customer ABC has lifetime value $2M", "Product XYZ revenue $5M YTD"]
    entity_types: ['Customer', 'Product'] (optional, auto-detected if None)
    domain: 'BI', 'general', 'technical', etc.
    
    Returns:
    {
        'entities_created': [{'type': 'Customer', 'id': 'uuid', ...}],
        'relationships_created': [...]
    }
    """
```

### hindsight_recall

**Purpose:** Multi-strategy search for entities

**Signature:**
```python
def hindsight_recall(
    query: str,
    entity_type: str = None,
    filters: Dict = None,
    limit: int = 10,
    strategy: str = 'hybrid'  # 'semantic', 'bm25', 'hybrid'
) -> List[Dict]:
    """
    query: "Enterprise customers with high churn risk"
    entity_type: 'Customer' (optional filter)
    filters: {'tier': 'Enterprise', 'churn_risk': {'gte': 0.7}}
    limit: Number of results
    strategy: Search method
    
    Returns:
    [
        {
            'id': 'entity-123',
            'type': 'Customer',
            'attributes': {...},
            'similarity': 0.95,
            'relationships': [...]
        }
    ]
    """
```

### hindsight_reflect

**Purpose:** Cross-memory synthesis

**Signature:**
```python
def hindsight_reflect(
    entities: List[str],  # entity IDs
    question: str,
    scope: str = 'all'  # 'all', 'semantic', 'temporal', 'causal'
) -> Dict:
    """
    entities: ['customer-123', 'customer-456']
    question: "What patterns connect these customers?"
    scope: Type of relationships to synthesize
    
    Returns:
    {
        'summary': "Both customers are Enterprise, same region, high LTV",
        'patterns': [
            'Enterprise customers in same region correlate with product usage'
        ],
        'confidence': 0.87
    }
    """
```

---

## Performance Characteristics

### Latency (P95)

| Operation | Time | Notes |
|---|---|---|
| Prefetch (session start) | <50ms | Parallel load, non-blocking |
| Store turn | <10ms | Async write |
| Semantic search | 50-150ms | Depends on result set size |
| BM25 search | 20-80ms | FTS5 indexes |
| Hybrid search | 100-200ms | Combined semantic + BM25 |
| Cross-memory synthesis | 200-500ms | Multiple queries + reasoning |

### Storage

| Component | Size | Scaling |
|---|---|---|
| Built-in memory (10-memory/long_term.md + 12-private/vijay.md) | ~3.5KB | Fixed |
| Skills (~40 skills) | ~500KB | Linear with skill count |
| Session storage (100 sessions) | ~50MB | Linear with turn count |
| Hindsight DB (1000 entities) | ~100MB | Logarithmic with proper indexing |
| Entity embeddings (1536 dim) | ~6MB per 1000 entities | Linear |

### Scalability

- **Single agent, 1000 entities:** PostgreSQL handles natively
- **Single agent, 10K entities:** Recommend connection pooling + read replicas
- **100+ agents, shared Hindsight:** Use PostgreSQL replication + load balancer
- **1M+ entities:** Consider sharding by entity type or temporal windows

---

## Integration Patterns

### With Claude Code

```python
from hermes.agent import Agent

# Initialize Hermes with BI configuration
agent = Agent(
    memory_provider='hindsight',
    config_file='~/.hermes/config.yaml'
)

# Use as Claude Code integration
@app.route('/analyze', methods=['POST'])
def analyze_data():
    query = request.json['question']
    response = agent.process_turn(query, context={'domain': 'BI'})
    return {'analysis': response}
```

### With LangChain

```python
from langchain.agents import Tool
from hermes.agent import Agent

hermes = Agent(memory_provider='hindsight')

# Expose Hermes recall as LangChain tool
hermes_recall_tool = Tool(
    name="hindsight_recall",
    func=hermes.memory_provider.recall,
    description="Search Hermes memory for relevant facts"
)

agent = create_react_agent(
    model=ChatAnthropic(),
    tools=[hermes_recall_tool, ...],
    memory=HermesMemory(agent=hermes)
)
```

### With External Databases

```python
# Sync BI entities from data warehouse to Hermes
def sync_warehouse_to_hermes():
    # Query DW for customers
    customers = dw.query("""
        SELECT id, name, tier, lifetime_value, churn_risk
        FROM dim_customer
    """)
    
    # Create entities in Hermes
    for customer in customers:
        hermes.memory_provider.retain([
            f"Customer {customer['name']} in {customer['tier']} tier"
        ])
```

---

## Monitoring & Observability

### Key Metrics

```python
# Memory health
hermes.metrics.memory.entity_count  # Total entities
hermes.metrics.memory.embedding_freshness  # % recently updated
hermes.metrics.memory.extraction_accuracy  # % correctly extracted

# Query performance
hermes.metrics.search.p95_latency  # 95th percentile latency
hermes.metrics.search.recall_rate  # % relevant results
hermes.metrics.search.precision_rate  # % correct results

# Compression
hermes.metrics.storage.raw_bytes  # Raw turn storage
hermes.metrics.storage.compressed_bytes  # After episode compression
hermes.metrics.storage.compression_ratio  # Ratio
```

### Logging

```python
import logging

logger = logging.getLogger('hermes.hindsight')
logger.setLevel(logging.DEBUG)

# Logs include:
# - Prefetch timing
# - Entity extraction accuracy
# - Query execution plans
# - Storage operations
# - Cache hits/misses
```

---

## Troubleshooting

### Slow Semantic Search

```sql
-- Check embedding index health
ANALYZE entities;

-- Rebuild if fragmented
REINDEX INDEX idx_embeddings;

-- Monitor query plan
EXPLAIN ANALYZE
SELECT * FROM entities 
ORDER BY embeddings <=> '[vector]'::vector 
LIMIT 10;
```

### High Memory Usage

```bash
# Check episode compression
hermes memory stats --detail

# Archive old episodes
hermes memory archive --older-than 180d

# Rebuild compression
hermes memory optimize --rebuild-compression
```

### Entity Extraction Accuracy

```python
# Validate extraction pipeline
validation_results = hermes.memory_provider.validate_extraction(
    sample_size=100,
    expected_entity_types=['Customer', 'Product']
)

# Adjust extraction params if needed
hermes.config.entity_extraction.confidence_threshold = 0.75
```

---

## References

- [Hermes Agent Repository](https://github.com/nousresearch/hermes-agent)
- [PostgreSQL Vector Search (pgvector)](https://github.com/pgvector/pgvector)
- [Full-Text Search in PostgreSQL](https://www.postgresql.org/docs/current/textsearch.html)
- [Karpathy LLM Wiki Pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
