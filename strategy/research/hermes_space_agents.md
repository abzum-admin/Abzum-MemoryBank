---
id: res-hermes-space
title: Hermes × Space Agent Integration
summary: Integration plan between Hermes and Space Agents
tags: [research, hermes, agents]
updated: 2026-05-09
load_priority: 35
load_lane: reference
status: active
---
# Hermes Agent × Space Agent: Comprehensive Integration Plan

**Date:** 2026-05-05  
**Status:** Strategy Draft  
**Author:** Vijay Tilak (via Abzum AI Research)  
**Category:** A-Series → A-Future (Platform Architecture)

---

## Executive Summary

This document presents a comprehensive integration strategy for making **Hermes Agent** the AI brain powering a **Space Agent-style UI**. After deep analysis of both codebases and their official documentation, we recommend a **Hybrid Plugin Bridge + Schema Training** approach that allows Hermes to autonomously manage Space Agent workspaces — creating, reading, updating, and deleting spaces and widgets — while preserving Space Agent's elegant file-based architecture.

**Key findings:**
- Space Agent uses a file-based JSON + ZIP workspace system with an Alpine.js frontend
- Hermes Agent is a Python-based autonomous agent with a rich plugin/skill/hook system
- The integration can be achieved as a Hermes plugin (`space-agent-ui`) without forking either codebase
- Full integration (Phase 1–5) estimated at 13 weeks, with a working proof-of-concept in 3 weeks
- The resulting product would be the first AI agent with a visual, widget-based workspace UI

---

## 1. Space Agent Architecture (Deep Analysis)

### 1.1 Core File-Based Workspace System

Space Agent stores all workspace data in a flat-file system. Each "space" (workspace) consists of two files:
- `{SPACE_ID}.json` — metadata, layout, widget configuration
- `{SPACE_ID}.zip` — associated assets (uploads, exports)

**Space JSON Schema:**
```json
{
  "id": "uuid-v4",
  "name": "string",
  "description": "string",
  "theme": "auto | light | dark",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601",
  "widgets": [
    {
      "id": "uuid-v4",
      "type": "clock | chart | gauge | table | form | timeline | embed | markdown | image | counter",
      "title": "string",
      "position": { "x": 0, "y": 0, "w": 4, "h": 3 },
      "config": {}
    }
  ]
}
```

### 1.2 Widget Type Catalogue

| Widget | Config Keys | Primary Use |
|--------|-------------|-------------|
| `clock` | timezone, format | Time display |
| `chart` | type (line/bar/pie), data_source, refresh_interval | Data visualization |
| `gauge` | min, max, value, thresholds | KPI monitoring |
| `table` | columns, data_source, sortable | Tabular data |
| `form` | fields, submit_action | Data input |
| `timeline` | events, date_field | Process tracking |
| `embed` | url, sandbox | External content |
| `markdown` | content, render_mode | Rich text |
| `image` | src, alt, caption | Media display |
| `counter` | value, label, delta | Metric counting |

### 1.3 Frontend Architecture

Space Agent's frontend is built with **Alpine.js** — a lightweight reactive framework chosen for simplicity and embeddability.

Key frontend patterns:
- `x-data` for reactive component state
- `x-bind` for dynamic attribute binding
- `@click` for event handling
- Widgets rendered as Alpine components with `data-widget-type` attributes
- Dashboard uses CSS Grid for layout

### 1.4 agent/instructions.md Documentation System

Each folder in the Space Agent repo contains an `agent/instructions.md` file documenting the purpose of the folder, key files, conventions for contributors and AI agents, and integration points. This mirrors Hermes's `SKILL.md` pattern — both codebases are designed to be AI-readable from first principles.

### 1.5 Three-Layer Customware Architecture (L0/L1/L2)

- **L0 (Core):** The base Space Agent runtime — not modified
- **L1 (Plugin):** Hermes plugin bridge (`space-agent-ui`) — our addition
- **L2 (Skills):** Hermes SKILL.md files for workspace operations — our addition

### 1.6 Time Travel (Git Rollback)

Space Agent includes a "Time Travel" feature that uses Git to version workspace files. Every space save creates a Git commit, allowing rollback to any previous state. Hermes's episodic memory can log which commands caused which workspace states, enabling AI-assisted rollback.

### 1.7 Electron Desktop Packaging

Space Agent can be packaged as an Electron desktop app using `electron-builder`. Hermes (Python) runs as a background process; the Electron frontend communicates via a local HTTP API or WebSocket.

---

## 2. Hermes Agent Architecture (Deep Analysis)

### 2.1 Core Design Philosophy

Hermes is a **Python-based autonomous agent** built for production use:
- **Multi-LLM:** Supports Claude, OpenAI, Gemini via a unified interface
- **Plugin system:** First-class plugin architecture with lifecycle hooks
- **Skill system:** SKILL.md files automatically loaded and presented to the LLM
- **Memory:** Hindsight provides episodic + semantic memory
- **Tool registration:** Plugins register tools dynamically

### 2.2 Plugin Lifecycle Hooks

| Hook | Trigger | Primary Use |
|------|---------|-------------|
| `on_session_start` | New conversation begins | Load workspace context |
| `before_execute` | Before LLM generates response | Inject context |
| `after_execute` | After LLM response | Persist results, update UI |
| `on_skill_created` | New SKILL.md loaded | Register skill capabilities |
| `on_tool_registered` | New tool added | Update tool manifest |
| `on_memory_event` | Memory read/write | Sync with workspace |

### 2.3 Memory Providers (Hindsight Integration)

Based on prior BI Memory Research (see `../../research/hermes_hindsight/analysis.md`):
- **Episodic memory:** Records what commands were run and their outcomes
- **Semantic memory:** Stores workspace schemas, widget configs, user preferences
- **Working memory:** Current conversation context + active space state
- Hindsight achieves 85–97% coverage of the 6 required memory types

---

## 3. Integration Approach Evaluation

### Approach A: Hermes as Space Agent Backend API (HTTP)
- Hermes runs a FastAPI server; Space Agent's Alpine.js calls it
- ✅ Clean separation | ❌ Requires modifying Space Agent frontend
- **Score: 6/10**

### Approach B: Space Agent as Hermes Tool (CLI Wrapper)
- Hermes calls Space Agent CLI commands as shell tools
- ✅ Minimal code | ❌ No real-time sync, brittle
- **Score: 4/10**

### Approach C: Full Fork and Merge
- ✅ Maximum control | ❌ Maintenance nightmare
- **Score: 3/10**

### Approach D: Hermes Plugin Bridge (Recommended Core)
- Hermes plugin reads/writes Space Agent JSON files directly
- ✅ No Space Agent modification | ✅ File-based architecture preserved | ✅ Git Time Travel compatible
- **Score: 8/10**

### ✅ Recommended: Hybrid A+D — Plugin Bridge + HTTP bridge for real-time sync (Score: 9/10)

---

## 4. SpaceAgentPlugin: Complete Implementation

### 4.1 Plugin Structure

```
plugins/
  space-agent-ui/
    __init__.py          # Main plugin class
    space_manager.py     # File I/O for spaces
    widget_factory.py    # Widget config builders
    http_bridge.py       # FastAPI server for real-time sync
    SKILL.md             # Auto-loaded skill description
    skills/
      create_space.md
      add_widget.md
      update_widget.md
      delete_widget.md
      list_spaces.md
```

### 4.2 Main Plugin Class (`__init__.py`)

```python
from hermes.plugin import HermesPlugin, hook, tool
from .space_manager import SpaceManager
from .widget_factory import WidgetFactory
from .http_bridge import SpaceAgentHTTPBridge
import uuid
from pathlib import Path
from datetime import datetime, timezone

class SpaceAgentPlugin(HermesPlugin):
    name = "space-agent-ui"
    version = "1.0.0"
    description = "Manage Space Agent workspaces: create spaces, add widgets, update layouts"

    def __init__(self, spaces_dir="./spaces", enable_http=True):
        self.spaces_dir = Path(spaces_dir)
        self.spaces_dir.mkdir(exist_ok=True)
        self.manager = SpaceManager(self.spaces_dir)
        self.factory = WidgetFactory()
        self.http_bridge = SpaceAgentHTTPBridge(self.manager) if enable_http else None
        self._active_space_id = None

    @hook("on_session_start")
    def load_context(self, session):
        spaces = self.manager.list_spaces()
        session.inject_context({
            "available_spaces": spaces,
            "active_space": self._active_space_id,
            "widget_types": self.factory.available_types()
        })
        if self.http_bridge:
            self.http_bridge.start()

    @hook("after_execute")
    def persist_memory(self, result, session):
        session.memory.record_episode({
            "action": result.get("tool_called"),
            "space_id": self._active_space_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "outcome": result.get("success", False)
        })

    @tool(name="space_create", description="Create a new Space Agent workspace")
    def space_create(self, name, description="", theme="auto"):
        space_id = str(uuid.uuid4())
        space = {
            "id": space_id, "name": name, "description": description,
            "theme": theme,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "widgets": []
        }
        self.manager.write_space(space_id, space)
        self._active_space_id = space_id
        return {"success": True, "space_id": space_id, "space": space}

    @tool(name="space_list", description="List all available workspaces")
    def space_list(self):
        return {"success": True, "spaces": self.manager.list_spaces()}

    @tool(name="space_get", description="Get full details of a specific workspace")
    def space_get(self, space_id):
        space = self.manager.read_space(space_id)
        if not space:
            return {"success": False, "error": f"Space {space_id} not found"}
        return {"success": True, "space": space}

    @tool(name="space_update", description="Update workspace metadata")
    def space_update(self, space_id, name=None, description=None, theme=None):
        space = self.manager.read_space(space_id)
        if not space:
            return {"success": False, "error": f"Space {space_id} not found"}
        if name: space["name"] = name
        if description: space["description"] = description
        if theme: space["theme"] = theme
        space["updated_at"] = datetime.now(timezone.utc).isoformat()
        self.manager.write_space(space_id, space)
        return {"success": True, "space": space}

    @tool(name="space_delete", description="Delete a workspace permanently")
    def space_delete(self, space_id):
        success = self.manager.delete_space(space_id)
        if not success:
            return {"success": False, "error": f"Space {space_id} not found"}
        if self._active_space_id == space_id:
            self._active_space_id = None
        return {"success": True, "deleted_space_id": space_id}

    @tool(name="widget_add", description="Add a new widget to a workspace")
    def widget_add(self, space_id, widget_type, title, config=None, position=None):
        """
        widget_type: clock | chart | gauge | table | form | timeline | embed | markdown | image | counter
        config examples:
          chart: {"type": "line", "data_source": "url", "refresh_interval": 30}
          gauge: {"min": 0, "max": 100, "value": 75, "thresholds": [50, 80]}
          counter: {"value": 1234, "label": "Revenue", "delta": "+12%"}
        position: {"x": 0, "y": 0, "w": 4, "h": 3}
        """
        space = self.manager.read_space(space_id)
        if not space:
            return {"success": False, "error": f"Space {space_id} not found"}
        widget = self.factory.create(
            widget_type=widget_type, title=title,
            config=config or {},
            position=position or self._auto_position(space["widgets"])
        )
        space["widgets"].append(widget)
        space["updated_at"] = datetime.now(timezone.utc).isoformat()
        self.manager.write_space(space_id, space)
        return {"success": True, "widget_id": widget["id"], "widget": widget}

    @tool(name="widget_update", description="Update a widget's config or position")
    def widget_update(self, space_id, widget_id, title=None, config=None, position=None):
        space = self.manager.read_space(space_id)
        if not space:
            return {"success": False, "error": f"Space {space_id} not found"}
        widget = next((w for w in space["widgets"] if w["id"] == widget_id), None)
        if not widget:
            return {"success": False, "error": f"Widget {widget_id} not found"}
        if title: widget["title"] = title
        if config: widget["config"].update(config)
        if position: widget["position"].update(position)
        space["updated_at"] = datetime.now(timezone.utc).isoformat()
        self.manager.write_space(space_id, space)
        return {"success": True, "widget": widget}

    @tool(name="widget_delete", description="Remove a widget from a workspace")
    def widget_delete(self, space_id, widget_id):
        space = self.manager.read_space(space_id)
        if not space:
            return {"success": False, "error": f"Space {space_id} not found"}
        original_count = len(space["widgets"])
        space["widgets"] = [w for w in space["widgets"] if w["id"] != widget_id]
        if len(space["widgets"]) == original_count:
            return {"success": False, "error": f"Widget {widget_id} not found"}
        space["updated_at"] = datetime.now(timezone.utc).isoformat()
        self.manager.write_space(space_id, space)
        return {"success": True, "deleted_widget_id": widget_id}

    @tool(name="widget_list", description="List all widgets in a workspace")
    def widget_list(self, space_id):
        space = self.manager.read_space(space_id)
        if not space:
            return {"success": False, "error": f"Space {space_id} not found"}
        return {"success": True, "widgets": space["widgets"]}

    def _auto_position(self, existing_widgets):
        if not existing_widgets:
            return {"x": 0, "y": 0, "w": 4, "h": 3}
        max_y = max(w["position"]["y"] + w["position"]["h"] for w in existing_widgets)
        return {"x": 0, "y": max_y, "w": 4, "h": 3}
```

### 4.3 Space Manager (`space_manager.py`)

```python
import json
from pathlib import Path
from typing import Optional, List

class SpaceManager:
    def __init__(self, spaces_dir):
        self.dir = Path(spaces_dir)

    def read_space(self, space_id) -> Optional[dict]:
        path = self.dir / f"{space_id}.json"
        if not path.exists(): return None
        return json.loads(path.read_text())

    def write_space(self, space_id, space):
        (self.dir / f"{space_id}.json").write_text(json.dumps(space, indent=2))

    def delete_space(self, space_id) -> bool:
        json_path = self.dir / f"{space_id}.json"
        if not json_path.exists(): return False
        json_path.unlink()
        zip_path = self.dir / f"{space_id}.zip"
        if zip_path.exists(): zip_path.unlink()
        return True

    def list_spaces(self) -> List[dict]:
        spaces = []
        for path in self.dir.glob("*.json"):
            data = json.loads(path.read_text())
            spaces.append({
                "id": data["id"], "name": data["name"],
                "description": data.get("description", ""),
                "widget_count": len(data.get("widgets", [])),
                "updated_at": data.get("updated_at")
            })
        return sorted(spaces, key=lambda s: s["updated_at"], reverse=True)
```

---

## 5. Primary SKILL.md

```markdown
# Space Agent UI Skills

You have full control over Space Agent workspaces. Use these tools to create and manage visual dashboards.

## Creating a New Workspace
Use `space_create` with a descriptive name. The returned `space_id` is needed for all widget operations.

## Adding Widgets
Use `widget_add` with the `space_id` and a `widget_type`. Available types:
- **chart**: Line, bar, or pie charts with data sources
- **gauge**: Circular gauges for KPIs with thresholds
- **table**: Sortable data tables
- **counter**: Large metric displays with delta indicators
- **markdown**: Rich text content
- **clock**: Timezone-aware clocks
- **timeline**: Process and event timelines
- **embed**: External URLs in iframes
- **image**: Images with captions
- **form**: Data input forms

## Best Practices
1. Always create the space first, note the space_id
2. Add widgets in logical visual order (left-to-right, top-to-bottom)
3. For dashboards: lead with counters/gauges, then charts, then tables
```

---

## 6. End-to-End Command Flows

### 6.1 "Create a Sales Dashboard"

```
User: "Create a sales dashboard for Q2 2026"

Hermes executes:
1. space_create("Q2 2026 Sales Dashboard", "Quarterly sales performance")
   → space_id: "abc-123"
2. widget_add("abc-123", "counter", "Total Revenue", {"value": 0, "label": "Q2 Revenue", "delta": "+0%"})
3. widget_add("abc-123", "gauge", "Revenue vs Target", {"min": 0, "max": 1000000, "value": 0, "thresholds": [500000, 800000]})
4. widget_add("abc-123", "chart", "Weekly Revenue Trend", {"type": "line", "refresh_interval": 3600})
5. widget_add("abc-123", "chart", "Revenue by Product", {"type": "bar"})
6. widget_add("abc-123", "table", "Top Deals", {"columns": ["Deal", "Value", "Stage", "Close Date"], "sortable": true})
```

### 6.2 "Create a Full Ops Dashboard"

```
User: "Create an ops dashboard with uptime, error rate, latency, and alert log"

Hermes executes:
1. space_create("Operations Dashboard", "Real-time system health monitoring", theme="dark")
2. widget_add → gauge "System Uptime" (thresholds: 99%, 99.9%)
3. widget_add → gauge "Error Rate" (thresholds: 1%, 5%)
4. widget_add → gauge "P99 Latency" (thresholds: 200ms, 500ms)
5. widget_add → chart "Error Rate Trend" (type: line, 24h)
6. widget_add → chart "Latency Percentiles" (type: line, p50/p95/p99)
7. widget_add → table "Recent Alerts" (columns: Time, Service, Severity, Message)
8. widget_add → clock "UTC Time"
```

---

## 7. Electron Desktop App Packaging

### electron-builder.json
```json
{
  "appId": "com.abzum.hermes-space",
  "productName": "Hermes Space",
  "directories": { "output": "dist" },
  "files": ["frontend/**/*", "preload.js", "main.js"],
  "extraResources": [
    { "from": "../hermes-agent", "to": "hermes", "filter": ["**/*", "!**/__pycache__/**"] }
  ],
  "mac": { "category": "public.app-category.productivity" },
  "win": { "target": "nsis" },
  "linux": { "target": "AppImage" }
}
```

### main.js
```javascript
const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let hermesProcess = null;
let mainWindow = null;

function startHermes() {
  const hermesPath = path.join(process.resourcesPath, 'hermes', 'run.py');
  hermesProcess = spawn('python', [hermesPath, '--port', '7432', '--plugin', 'space-agent-ui']);
  hermesProcess.stdout.on('data', (data) => {
    if (mainWindow) mainWindow.webContents.send('hermes-log', data.toString());
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400, height: 900,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true }
  });
  mainWindow.loadFile('frontend/index.html');
}

app.whenReady().then(() => {
  startHermes();
  setTimeout(createWindow, 2000);
});

app.on('window-all-closed', () => {
  if (hermesProcess) hermesProcess.kill();
  app.quit();
});
```

### preload.js
```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hermes', {
  chat: (message) => ipcRenderer.invoke('hermes-chat', message),
  getSpaces: () => ipcRenderer.invoke('hermes-get-spaces'),
  onUpdate: (callback) => ipcRenderer.on('hermes-update', (_, data) => callback(data)),
  onLog: (callback) => ipcRenderer.on('hermes-log', (_, msg) => callback(msg))
});
```

---

## 8. Implementation Phases

### Phase 1: Proof of Concept (Weeks 1–3)
- Set up both repos in dev environment
- Implement SpaceManager and WidgetFactory
- Implement SpaceAgentPlugin core (create, list, get)
- Write SKILL.md files
- **Success metric:** Natural language → working dashboard in < 30 seconds

### Phase 2: Full CRUD (Weeks 4–6)
- All widget_* tools implemented and tested
- Auto-positioning algorithm refined
- **Success metric:** All 10 widget types work correctly

### Phase 3: HTTP Bridge + Real-Time Sync (Weeks 7–9)
- FastAPI server in http_bridge.py
- WebSocket endpoint for real-time updates
- **Success metric:** UI updates within 500ms of Hermes command

### Phase 4: Electron Packaging (Weeks 10–11)
- main.js, preload.js, electron-builder.json
- Hermes bundled as extraResource
- **Success metric:** Single installer works end-to-end

### Phase 5: Production Hardening (Weeks 12–13)
- Hindsight episodic memory integration
- Multi-user support
- Git Time Travel integration
- **Success metric:** Stable under 8-hour continuous session

---

## 9. Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Space Agent JSON schema changes | Medium | High | Pin to specific commit; add schema validation |
| Hermes plugin API changes | Low | High | Write integration tests against plugin interface |
| Alpine.js reactive sync complexity | Medium | Medium | Use WebSocket polling as fallback |
| Python/Electron IPC latency | Low | Medium | Use local Unix socket instead of TCP |
| Hermes memory context overflow | Medium | High | Summarize space state before injecting into context |
| File lock conflicts (concurrent writes) | Low | High | Use filelock library |

---

## 10. Success Metrics by Phase

| Phase | Metric | Target |
|-------|--------|--------|
| 1 | Time to create dashboard from natural language | < 30 seconds |
| 2 | Widget type coverage | 10/10 types |
| 3 | UI update latency after Hermes command | < 500ms |
| 4 | Installer success rate (clean machine) | > 95% |
| 5 | Session stability | 8 hours without restart |

---

## 11. Related Documents

- [BI Memory Architecture Research](../../research/hermes_hindsight/analysis.md)
- [A-Series Task Index](../../work/actions.md)
- [research/hermes_hindsight/plan_of_action.md](../../research/hermes_hindsight/plan_of_action.md)
- [Hermes Agent GitHub](https://github.com/NousResearch/hermes-agent)
- [Space Agent GitHub](https://github.com/agent0ai/space-agent)

---

*Generated by Abzum AI Research | Vijay Tilak | 2026-05-05*
