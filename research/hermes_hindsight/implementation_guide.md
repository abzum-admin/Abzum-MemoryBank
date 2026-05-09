---
id: res-hermes-impl-guide
title: Hermes + Hindsight Implementation Guide
summary: Step-by-step implementation instructions
tags: [research, hermes, hindsight, implementation]
updated: 2026-05-09
load_priority: 25
load_lane: reference
status: active
---
# Implementation Guide: Hermes + Hindsight for BI Memory Architecture

## Quick Start (15 minutes)

### Prerequisites
- Python 3.10+
- PostgreSQL 14+ (for Hindsight backend)
- ~2GB disk space for initial setup

### Step 1: Install Hermes

```bash
# Clone Hermes repository
git clone https://github.com/nousresearch/hermes-agent.git
cd hermes-agent

# Install dependencies
pip install -e .

# Initialize with Hindsight memory provider
hermes init \
  --memory-provider hindsight \
  --hindsight-mode local \
  --storage postgresql
```

### Step 2: Configure for BI

Create `~/.hermes/config.yaml`:

```yaml
# Core Hermes configuration
agent:
  name: "BI Analyst Agent"
  personality_file: "agent/soul.md"
  
# Memory configuration
memory:
  built_in:
    memory_max_tokens: 2000
    user_max_tokens: 1000
  
  providers:
    - type: hindsight
      mode: local
      backend: postgresql
      host: localhost
      port: 5432
      database: hermes_hindsight
      
# Hindsight-specific settings
hindsight:
  prefetch:
    enabled: true
    max_results: 50
    timeout_ms: 500
  
  # BI entity types
  entity_types:
    - name: Customer
      attributes:
        - name
        - tier
        - region
        - lifetime_value
        - churn_risk
    
    - name: Product
      attributes:
        - name
        - sku
        - category
        - revenue_ytd
        - inventory
    
    - name: Transaction
      attributes:
        - date
        - amount
        - status
        - channel
    
    - name: Metric
      attributes:
        - formula
        - last_updated
        - trending_direction
    
    - name: Report
      attributes:
        - owner
        - schedule
        - consumers_count
  
  # Performance tuning
  indexes:
    Customer:
      - by_segment: ['tier', 'region']
      - by_risk: ['churn_risk', 'ltv_category']
      - temporal: ['created_at', 'last_update']
    
    Transaction:
      - by_date_customer: ['date', 'customer_id']
      - by_product_metric: ['product_id', 'amount']
```

### Step 3: Create BI-Specific Skills

Create `~/.hermes/skills/bi-customer-analysis.md`:

```markdown
# Customer Segment Analysis

## When to Use
Asked to analyze customer segments, identify high-value customers, or assess churn risk

## Steps

1. **Parse the Question**
   - Identify target segments (tier, region, or custom)
   - Identify metric (revenue, churn_risk, engagement)
   - Identify time period if specified

2. **Retrieve Entities**
   - Use `hindsight_recall` with query like "customers in Enterprise tier in North America"
   - Returns Customer entities with all attributes

3. **Synthesize Insights**
   - Use `hindsight_reflect` to find patterns across customer group
   - Extract: average LTV, distribution of churn_risk, common product usage

4. **Generate Recommendations**
   - "High-value customers with churn risk >0.7 need intervention"
   - "Low-tier customers outperforming segment average"

5. **Document Finding**
   - Store key insights as Metric entities
   - Link metrics back to source customers for traceability

## Tools Used
- hindsight_recall (multi-strategy search)
- hindsight_reflect (cross-entity synthesis)
- session_search (historical context)

## Example Output
```
Segment: Enterprise, Region: US-West
Count: 247 customers
Average LTV: $1.2M
High Churn Risk (>0.7): 34 customers (13.8%)

Recommendation: Trigger account health reviews for 34 at-risk enterprise customers
```
```

Create `~/.hermes/skills/bi-metric-definition.md`:

```markdown
# Metric Definition & Tracking

## When to Use
When asked to define, track, or explain a business metric

## Steps

1. **Find or Create Metric Entity**
   - Use `hindsight_recall` to search for existing metric definitions
   - If new, create Metric entity with:
     - Name and description
     - Formula/calculation logic
     - Data sources required
     - Update frequency

2. **Link to Source Data**
   - Create relationships from Metric to Transaction, Customer, Product entities
   - Store calculation logic as relationship property

3. **Track Changes**
   - Record metric trends with temporal validity windows
   - Use hindsight_reflect to identify metric movements

4. **Validate Against History**
   - Use session_search to find previous metric definitions
   - Ensure consistency with past calculations

## Example
Metric: "Enterprise Revenue MTD"
- Formula: SUM(Transaction.amount) WHERE Customer.tier='Enterprise' AND MONTH(Transaction.date)=CURRENT_MONTH
- Sources: Transaction, Customer
- Update Frequency: Daily
- Last Updated: 2026-04-12
- Trend: +2.3% vs LM
```

### Step 4: Test the Setup

```bash
# Start Hermes
hermes start

# Send a test query
hermes message "What are our top 10 customers by revenue this month?"

# Check memory was populated
hindsight query --entity-type Customer --limit 5

# Verify prefetch is working
hermes logs --follow | grep prefetch
```

---

## Phase 2: Enhanced Episodic Memory (1-2 weeks)

### Add Session Summarization Hook

Create a custom memory provider extension `plugins/memory/episodic_enhancement/hooks.py`:

```python
from typing import Dict, List
from datetime import datetime
import json

class EpisodicMemoryHooks:
    """Enhance Hermes episodic memory with automatic summarization"""
    
    def __init__(self, hindsight_client):
        self.hindsight = hindsight_client
    
    def on_session_end(self, session_data: Dict):
        """Called when a session ends - create compressed episode"""
        turns = session_data['turns']
        
        # Extract decision points and outcomes
        decisions = self._extract_decisions(turns)
        outcomes = self._extract_outcomes(turns)
        key_entities = self._extract_entities(turns)
        
        # Create episode summary
        episode = {
            'title': self._generate_title(session_data),
            'domain': session_data.get('domain', 'general'),
            'date': datetime.now().isoformat(),
            'decisions': decisions,
            'outcomes': outcomes,
            'key_entities': key_entities,
            'source_turn_count': len(turns),
            'compression_ratio': self._calculate_compression(turns),
        }
        
        # Store as episodic memory in Hindsight
        self.hindsight.store_episode(
            title=episode['title'],
            content=json.dumps(episode, indent=2),
            domain=episode['domain'],
            source_turns=[t['id'] for t in turns],
            metadata={
                'type': 'compressed_episode',
                'compression_ratio': episode['compression_ratio']
            }
        )
        
        return episode
    
    def _extract_decisions(self, turns: List[Dict]) -> List[Dict]:
        """Extract decision points from turns"""
        decisions = []
        decision_keywords = ['decided', 'chose', 'selected', 'use', 'implement']
        
        for turn in turns:
            reasoning = turn.get('reasoning', '')
            for keyword in decision_keywords:
                if keyword in reasoning.lower():
                    # Extract the sentence with the decision
                    sentences = reasoning.split('.')
                    for sentence in sentences:
                        if keyword in sentence.lower():
                            decisions.append({
                                'statement': sentence.strip(),
                                'turn_index': turn['index'],
                                'confidence': 0.85
                            })
        
        return decisions
    
    def _extract_outcomes(self, turns: List[Dict]) -> List[Dict]:
        """Extract outcomes and results"""
        outcomes = []
        outcome_keywords = ['result', 'found', 'discovered', 'revealed', 'showed']
        
        for turn in turns:
            content = turn.get('content', '')
            for keyword in outcome_keywords:
                if keyword in content.lower():
                    outcomes.append({
                        'statement': content[:200],  # First 200 chars
                        'turn_index': turn['index']
                    })
        
        return outcomes
    
    def _extract_entities(self, turns: List[Dict]) -> List[str]:
        """Extract referenced entities (customers, products, metrics)"""
        entities = set()
        
        for turn in turns:
            # Look for entity references in tool calls
            for tool_call in turn.get('tool_calls', []):
                if 'hindsight_recall' in str(tool_call):
                    # Extract entity types from recall query
                    entities.add(tool_call.get('entity_type', 'unknown'))
        
        return list(entities)
    
    def _generate_title(self, session_data: Dict) -> str:
        """Auto-generate episode title"""
        domain = session_data.get('domain', 'Unknown')
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M')
        return f"{domain} Analysis - {timestamp}"
    
    def _calculate_compression(self, turns: List[Dict]) -> float:
        """Calculate compression ratio"""
        raw_size = sum(len(str(t)) for t in turns)
        summary_size = len(str(self._extract_decisions(turns))) + \
                       len(str(self._extract_outcomes(turns)))
        return summary_size / raw_size if raw_size > 0 else 1.0
```

### Register the Hook

In `~/.hermes/config.yaml`:

```yaml
memory:
  providers:
    - type: hindsight
      hooks:
        on_session_end: plugins.memory.episodic_enhancement.hooks.EpisodicMemoryHooks
```

---

## Phase 3: Causal Relationship Extraction (1-2 weeks)

### Add Causal Pattern Extraction

Create `plugins/memory/causal_extraction/extractor.py`:

```python
import re
from typing import List, Dict
from enum import Enum

class CausalConfidence(Enum):
    HIGH = 0.9
    MEDIUM = 0.7
    LOW = 0.5

class CausalExtractor:
    """Extract causal relationships from reasoning"""
    
    # Patterns for causal statements
    CAUSAL_PATTERNS = {
        'explicit_because': r"([\w\s]+?)\s+because\s+([\w\s]+?)(?:\.|,|$)",
        'decided_reason': r"decided to (\w+)\s+(?:due to|because|since)\s+([\w\s]+?)(?:\.|,|$)",
        'chose_reason': r"chose\s+([\w\s]+?)\s+(?:because|due to|since)\s+([\w\s]+?)(?:\.|,|$)",
        'optimal_reason': r"(\w+)\s+is\s+(?:best|optimal|ideal)\s+(?:because|due to)\s+([\w\s]+?)(?:\.|,|$)",
    }
    
    def extract_causals(self, reasoning: str) -> List[Dict]:
        """Extract causal statements from reasoning text"""
        causals = []
        
        for pattern_name, pattern in self.CAUSAL_PATTERNS.items():
            matches = re.finditer(pattern, reasoning, re.IGNORECASE | re.MULTILINE)
            
            for match in matches:
                action = match.group(1).strip() if len(match.groups()) > 0 else ""
                reason = match.group(2).strip() if len(match.groups()) > 1 else ""
                
                if action and reason:
                    causals.append({
                        'action': action,
                        'reason': reason,
                        'pattern': pattern_name,
                        'confidence': self._score_confidence(action, reason),
                        'source_span': (match.start(), match.end())
                    })
        
        return causals
    
    def _score_confidence(self, action: str, reason: str) -> float:
        """Score confidence of extracted causal relationship"""
        score = CausalConfidence.MEDIUM.value
        
        # Boost confidence for longer, more detailed reasons
        if len(reason) > 50:
            score += 0.1
        
        # Boost for specific, quantifiable reasons
        if any(word in reason.lower() for word in ['improve', 'increase', 'reduce', '%', '$']):
            score += 0.05
        
        return min(score, 1.0)
    
    def store_in_hindsight(self, hindsight_client, causals: List[Dict], context: Dict):
        """Store extracted causals as relationship entities"""
        
        for causal in causals:
            # Create a decision entity
            decision = {
                'type': 'Decision',
                'attributes': {
                    'action': causal['action'],
                    'context': context.get('domain', 'general'),
                    'confidence': causal['confidence'],
                    'created_at': datetime.now().isoformat()
                }
            }
            
            # Create reason entity
            reason = {
                'type': 'Reason',
                'attributes': {
                    'statement': causal['reason'],
                    'pattern_type': causal['pattern']
                }
            }
            
            # Link them with causal relationship
            hindsight_client.add_relationship(
                source=decision,
                target=reason,
                relationship_type='justified_by',
                properties={'confidence': causal['confidence']}
            )
```

### Integrate into Session Processing

```python
# In memory provider hooks
def on_turn_complete(self, turn_data: Dict):
    """Process completed turn to extract causals"""
    reasoning = turn_data.get('assistant_reasoning', '')
    
    extractor = CausalExtractor()
    causals = extractor.extract_causals(reasoning)
    
    if causals:
        extractor.store_in_hindsight(
            self.hindsight,
            causals,
            context={'domain': turn_data.get('domain')}
        )
```

---

## Phase 4: BI Query Optimization (2-3 weeks)

### Define BI-Specific Query Patterns

Create `bi_queries.py`:

```python
from functools import lru_cache
from datetime import datetime, timedelta

class BIQueryOptimizer:
    """Optimize common BI queries in Hindsight"""
    
    def __init__(self, hindsight_client):
        self.hindsight = hindsight_client
        self.cache_ttl = 3600  # 1 hour
    
    @lru_cache(maxsize=128)
    def get_customer_segment_metrics(self, segment: str, date_range: str = 'MTD'):
        """Query customers in segment with aggregated metrics"""
        
        date_filter = self._parse_date_range(date_range)
        
        # Query Hindsight
        customers = self.hindsight.query(
            entity_type='Customer',
            filters={'tier': segment, 'created_at': date_filter},
            fields=['id', 'name', 'lifetime_value', 'churn_risk', 'last_purchase_date']
        )
        
        # Aggregate metrics
        metrics = {
            'count': len(customers),
            'avg_ltv': sum(c.lifetime_value for c in customers) / len(customers),
            'high_risk_count': sum(1 for c in customers if c.churn_risk > 0.7),
            'recently_active': sum(1 for c in customers if self._is_recently_active(c)),
        }
        
        return {'customers': customers, 'metrics': metrics}
    
    @lru_cache(maxsize=128)
    def get_product_revenue_breakdown(self, date_range: str = 'YTD', category: str = None):
        """Query products with revenue metrics"""
        
        date_filter = self._parse_date_range(date_range)
        
        # Get transactions
        transactions = self.hindsight.query(
            entity_type='Transaction',
            filters={'date': date_filter},
            fields=['product_id', 'amount', 'status']
        )
        
        # Group by product
        product_revenue = {}
        for txn in transactions:
            if txn.status == 'completed':
                if txn.product_id not in product_revenue:
                    product_revenue[txn.product_id] = 0
                product_revenue[txn.product_id] += txn.amount
        
        # Add product details
        products = self.hindsight.query(
            entity_type='Product',
            filters={'id': list(product_revenue.keys())},
            fields=['id', 'name', 'category']
        )
        
        return {
            'total_revenue': sum(product_revenue.values()),
            'by_product': product_revenue,
            'product_details': products
        }
    
    def _parse_date_range(self, range_str: str):
        """Convert date range string to filter"""
        today = datetime.now()
        
        if range_str == 'MTD':
            start = today.replace(day=1)
        elif range_str == 'YTD':
            start = today.replace(month=1, day=1)
        elif range_str == 'LM':
            first = today.replace(day=1)
            start = (first - timedelta(days=1)).replace(day=1)
        else:
            start = today - timedelta(days=30)
        
        return {'gte': start, 'lte': today}
```

### Create BI Query Skill

```markdown
# BI Query Execution

## When to Use
When asked for specific BI metrics or customer/product analytics

## Steps

1. **Parse the Query**
   - Identify metric (revenue, churn, engagement)
   - Identify dimension (customer segment, product category, date)
   - Identify time period

2. **Execute Optimized Query**
   - Use BIQueryOptimizer for common patterns
   - Falls back to general hindsight_recall for custom queries

3. **Format Results**
   - Aggregate and summarize
   - Highlight outliers or trends
   - Link back to source entities

4. **Provide Context**
   - Compare to historical period
   - Explain trends using hindsight_reflect

## Tools
- BIQueryOptimizer (cached queries)
- hindsight_recall (custom queries)
- hindsight_reflect (trend analysis)
```

---

## Testing & Validation

### Test Suite

Create `tests/test_bi_memory.py`:

```python
import pytest
from hermes.memory.hindsight import HindsightProvider
from hindsight_client import HindsightClient

@pytest.fixture
def hindsight_client():
    return HindsightClient(host='localhost', port=5432)

def test_customer_entity_creation(hindsight_client):
    """Test creating customer entities"""
    customer = {
        'type': 'Customer',
        'attributes': {
            'name': 'ACME Corp',
            'tier': 'Enterprise',
            'lifetime_value': 1000000
        }
    }
    result = hindsight_client.create_entity(customer)
    assert result['id'] is not None
    assert result['attributes']['tier'] == 'Enterprise'

def test_entity_linking(hindsight_client):
    """Test linking entities"""
    customer = hindsight_client.create_entity({
        'type': 'Customer',
        'attributes': {'name': 'ACME Corp'}
    })
    
    product = hindsight_client.create_entity({
        'type': 'Product',
        'attributes': {'name': 'Premium Service'}
    })
    
    rel = hindsight_client.add_relationship(
        source=customer,
        target=product,
        relationship_type='uses_product'
    )
    
    assert rel['source_id'] == customer['id']
    assert rel['target_id'] == product['id']

def test_semantic_recall(hindsight_client):
    """Test semantic search"""
    # Create test entities
    customers = [
        {'type': 'Customer', 'attributes': {'name': 'Tech Company A'}},
        {'type': 'Customer', 'attributes': {'name': 'Finance Corp B'}},
    ]
    
    for c in customers:
        hindsight_client.create_entity(c)
    
    # Search semantically
    results = hindsight_client.recall(
        query='technology company',
        entity_type='Customer',
        limit=5
    )
    
    assert len(results) > 0
    assert results[0]['attributes']['name'] == 'Tech Company A'

def test_causal_extraction():
    """Test causal relationship extraction"""
    from plugins.memory.causal_extraction.extractor import CausalExtractor
    
    extractor = CausalExtractor()
    reasoning = "We chose the Enterprise tier filter because it contains our highest-value customers."
    
    causals = extractor.extract_causals(reasoning)
    assert len(causals) > 0
    assert 'Enterprise tier filter' in causals[0]['action']
    assert 'highest-value customers' in causals[0]['reason']

def test_episodic_compression():
    """Test episode compression ratio"""
    from plugins.memory.episodic_enhancement.hooks import EpisodicMemoryHooks
    
    hooks = EpisodicMemoryHooks(hindsight_client)
    
    # Create sample turns
    turns = [
        {'index': 0, 'content': 'Query about customers', 'reasoning': 'Need to analyze segment'},
        {'index': 1, 'content': 'Results showing...', 'reasoning': 'Found that...'},
    ]
    
    compression = hooks._calculate_compression(turns)
    assert 0 < compression < 1.0
```

Run tests:

```bash
pytest tests/test_bi_memory.py -v
```

---

## Deployment Checklist

- [ ] PostgreSQL 14+ running
- [ ] Hermes installed and initialized
- [ ] config.yaml created with BI entity types
- [ ] BI skills created and tested
- [ ] Session logging enabled
- [ ] Hindsight database seeded with sample data
- [ ] Query performance benchmarked (<500ms P95)
- [ ] Entity extraction accuracy validated (>95%)
- [ ] Backup strategy defined
- [ ] Monitoring/alerting configured

---

## Troubleshooting

### Hindsight Connection Issues

```bash
# Check PostgreSQL is running
psql -U hermes -d hermes_hindsight -c "SELECT 1"

# Check Hermes can connect
hermes logs --service hindsight | tail -20

# Restart Hindsight daemon
hermes service restart hindsight
```

### Memory Filling Up

```bash
# Check storage usage
du -sh ~/.hermes/

# Archive old sessions
hermes memory archive --older-than 90d --destination ./archive

# Rebuild indexes
hermes memory optimize --rebuild-indexes
```

### Query Performance Slow

```bash
# Analyze query plans
hindsight query --analyze "customers in Enterprise tier"

# Check index statistics
hindsight stats --entity-type Customer

# Rebuild specific index
hindsight index rebuild --entity-type Customer --index-name by_segment
```

---

## Next Steps

1. Complete Phase 1 (Quick Start)
2. Run validation tests
3. Load production data
4. Implement Phase 2 (optional but recommended)
5. Monitor metrics from Part 8 of README.md
6. Iterate on BI skills based on usage patterns
