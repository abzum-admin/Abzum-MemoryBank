# Two-Tier Agent Architecture

**Date:** 2026-04-05  
**Source:** Vijay's Proposal  
**Status:** Proposed — Pending Implementation

---

## Summary

Vijay proposed a **two-tier agent architecture** for Abzum, featuring:
- **Tier 1 (Paperclip Container):** Global/meta agents that manage orchestration, routing, planning, strategy, compliance, cost optimization, memory management, project allocation, RBAC, provisioning, and monitoring/audit.
- **Tier 2 (Project Containers):** Per-project isolated containers, each running project-specific agents (Coder, Reviewer, Tester, Documentation, Scrum Master, domain-specific agents).

This architecture provides enterprise-grade isolation, scalability, and clean operational boundaries.

---

## Architecture

### Tier 1 — Paperclip Container (Global/Meta Layer)

The "paperclip" container is the global orchestration layer. It runs **meta agents** that coordinate everything:

| Agent | Role |
|-------|------|
| Orchestrator | Coordinates all agent activity |
| Router | Routes requests to appropriate agents/containers |
| Planner | Strategic project planning |
| Strategy | Long-term direction and decision-making |
| Compliance | Ensures regulatory/policy adherence |
| Cost-Optimizer | Manages token usage and cost efficiency |
| Memory Manager | Coordinates BIMemoryBank across projects |
| Project Allocator | Assigns projects to appropriate teams/containers |
| RBAC | Role-based access control enforcement |
| Provisioning | Manages container/agent provisioning |
| Monitoring/Audit | Centralized logging and audit trail |

### Tier 2 — Project Containers (Per-Project Isolation)

Each project gets its **own isolated container** with:

- **Project-specific agents:** Coder, Reviewer, Tester, Documentation, Scrum Master, domain-specialists
- **Project-specific context:** Tailored instructions, knowledge, and memory
- **Project-specific secrets:** Doppler integration for secure credential management
- **Project-specific tools:** Tools and integrations unique to the project
- **Project-specific memory:** Isolated ByteRover context tree

### Why This Architecture is Ideal

| Benefit | Description |
|---------|-------------|
| **Isolation** | Each project container is fully isolated — no cross-contamination of context, secrets, or state |
| **Scalability** | Project containers can be scaled independently based on workload |
| **Clean Boundaries** | Clear separation between global coordination (Tier 1) and project execution (Tier 2) |
| **Easy Provisioning** | Containers can be spun up/down on demand per project lifecycle |
| **Doppler Integration** | Native secrets management per project via Doppler |
| **Enterprise-Grade** | Validated by Vijay as suitable for enterprise workloads |

---

## Integration Map

This architecture validates and extends the existing agent framework by integrating with:

| Action | System | Integration Point |
|--------|--------|-------------------|
| A41 | BIMemoryBank | Memory management across containers |
| A42 | Change Management | Change tracking for container provisioning |
| A43 | CMDB | Configuration management for all containers and agents |
| A49 | Agent Size | Right-sizing agent teams per project container |
| A59 | Customer Isolation | Per-customer isolation alignment |
| A66 | Hermes | Local dev/test environment for container development |

---

## Implementation Notes

- **Paperclip container** = the meta/global layer named "Paperclip" in Vijay's proposal
- **Project containers** = individual Docker containers per project
- **Doppler** = secrets management platform for per-project credentials
- **ByteRover** = per-container context tree for project memory
- **CMDB registration** = all containers and agents must be registered in the Configuration Management Database

---

## Related Actions

- **A71** (this architecture): Implement Two-Tier Agent Architecture (Paperclip + Project Containers)
- **A41**: BIMemoryBank Git Sync Architecture
- **A42**: Centralised Change Management System
- **A43**: Configuration Management Database (CMDB)
- **A49**: Agent Team Size Optimization
- **A59**: Customer Isolation Architecture
- **A66**: Hermes Local Development Environment
