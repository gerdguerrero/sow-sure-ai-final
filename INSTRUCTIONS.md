# Documentation Update Instructions

This document provides guidelines for maintaining project documentation and tracking progress consistently throughout the development process.

## 📋 Documentation Files Overview

### Core Documentation Files:
- **`PROJECT_PLAN.md`** - Master task list, project roadmap, and architecture documentation
- **`CHANGELOG.md`** - Detailed change history and version tracking  
- **`README.md`** - User-facing documentation with installation, usage examples, and CLI commands
- **`INSTRUCTIONS.md`** - This file (documentation update guidelines only)

## 🔄 Task Completion Workflow

### When Starting a New Task:
1. **Reference `PROJECT_PLAN.md`** to identify the next task
2. **Read task description** carefully and understand requirements
3. **Begin implementation** following the task specifications

### When Completing a Task:
1. **Update `PROJECT_PLAN.md`**:
   ```markdown
   [x] 1.X Task description here
   ```
   - Change `[ ]` to `[x]` for the completed task
   - Update progress counters in both files if applicable
   - Add architectural notes for major features to architecture section
   - Add completion details for significant tasks

2. **Update `CHANGELOG.md`**:
   - Add new features to **"Added"** section
   - Document modifications in **"Changed"** section  
   - Note any removals in **"Removed"** section
   - Record bug fixes in **"Fixed"** section
   - Update **"Development Notes"** progress counter
   - Update **"Last Updated"** timestamp

3. **Update `README.md`** (when applicable):
   - Update CLI usage examples for new commands
   - Add new features to feature list
   - Update script names if package.json changed
   - Refresh Quick Start section with current commands
   - Add migration notes for breaking changes
   - Update installation/setup instructions for new dependencies

4. **Test thoroughly** before marking as complete
5. **Commit changes** with descriptive commit message

## 📝 PROJECT_PLAN.md Update Guidelines

### Task Status Format:
```markdown
[x] 1.1 Completed task description
[ ] 1.2 Pending task description
```

### Progress Tracking:
- Update the **"Current Phase"** progress counter
- Example: `Progress: 4/6 tasks completed (67%)`
- Move completed tasks to **"Completed Tasks"** section in changelog

### Phase Completion:
- When a phase is 100% complete, update **"Current Phase"** to next phase
- Add phase completion note in changelog

### Architecture Documentation:
- Add major architectural changes to the architecture section
- Document new modules, integrations, or system changes
- Include technical implementation details and rationale

## 📚 CHANGELOG.md Update Guidelines

### Version Management:
- All current work goes under **`[Unreleased]`** section
- Use semantic versioning when creating releases
- Date format: `YYYY-MM-DD`

### Change Categories (in order):
1. **Added** - New features, functionality, files
2. **Changed** - Modifications to existing features
3. **Removed** - Deleted code, deprecated features
4. **Fixed** - Bug fixes, error corrections
5. **Technical Improvements** - Under-the-hood enhancements
6. **Testing** - Test additions, coverage improvements

### Entry Format:
```markdown
### Added
- New feature description with technical details
- Another feature with `code examples` when relevant

### Changed
- **BREAKING**: Mark breaking changes clearly
- Modified functionality description
```

### Development Notes Section:
Always update:
- **Current Phase** and progress percentage
- **Completed Tasks** list with checkboxes
- **Next Tasks** list
- **Last Updated** date

## 📖 README.md Update Guidelines

### When to Update README.md:
- **New CLI commands** added or changed
- **Package.json scripts** modified
- **New features** added to the tool
- **Breaking changes** that affect user workflow
- **New dependencies** that require installation steps

### Sections to Maintain:
1. **Features Section**: Add new capabilities
2. **Quick Start**: Update command examples with current script names
3. **Installation/Setup**: Keep current with any new dependencies
4. **CLI Usage Examples**: Reflect current recommended commands
5. **Migration Guide**: Document changes for existing users

### Script Name Updates:
When package.json scripts change, update README examples:
```markdown
# OLD (if deprecated)
npx tsx index.ts get "Manila"

# NEW (current recommendation)
pnpm sow-cli address "Manila"
pnpm hazard-get "Manila"
```

### README Structure Guidelines:
- Keep README focused on **user usage** and **getting started**
- Move detailed architecture docs to `PROJECT_PLAN.md`
- Include brief overview of features and commands
- Link to other documentation files when appropriate
- Maintain clear sections for different user types (CLI vs Web)

## 🧪 Testing Guidelines

### Before Marking Task Complete:
1. **Functionality Test**: Ensure new feature works as expected
2. **Error Scenarios**: Test edge cases and error conditions
3. **Integration Test**: Verify compatibility with existing code
4. **Documentation**: Confirm all changes are documented

### Test Documentation:
- Document test scenarios in changelog
- Include test results for significant features
- Note any dependencies or setup requirements

## 🎯 Task-Specific Documentation Guidelines

### Phase 1-2 Tasks (CLI Features):
- Focus on CLI command updates in README
- Document new package.json scripts
- Update command examples and usage patterns

### Phase 3-4 Tasks (Web Interface):
- Document web interface features in README
- Update installation instructions if new dependencies added
- Include setup steps for development environment

### Phase 5 Tasks (Production):
- Document deployment instructions
- Update installation/setup for production use
- Include configuration and environment setup

## 📁 File Management Guidelines

### Naming Conventions:
- Use kebab-case for file names: `project-plan.md`
- Use consistent markdown formatting across all files
- Include table of contents for longer documents

### Documentation Structure:
- Keep all documentation in project root
- Use consistent section headers and formatting
- Cross-reference between documents when appropriate

## ✅ Quick Checklist for Task Completion

- [ ] Task functionality implemented and tested
- [ ] `PROJECT_PLAN.md` updated (task marked as `[x]`)
- [ ] `CHANGELOG.md` updated with changes
- [ ] `README.md` updated if CLI commands or features changed
- [ ] Progress counters updated in documentation files
- [ ] Date stamps updated
- [ ] Test scenarios documented
- [ ] Integration with existing features verified

---

*Instructions maintained by: Development Team*  
*Last Updated: August 22, 2025*

### **Current Architecture Overview:**

The project now uses a **hybrid architecture** combining Next.js for web services and Python for specialized data processing:

#### **Frontend Layer (React/Next.js)**:
- **`app/page.tsx`** - Main web interface with interactive map
- **`app/layout.tsx`** - Application layout and global styles
- **`lib/utils.ts`** - Utility functions shared across components

#### **Backend API Layer (Node.js/Next.js)**:
- **`app/api/hazard-report/route.ts`** - PDF download from ULAP API
- **`app/api/ai-risk-analysis/route.ts`** - AI analysis orchestrator (calls Python)
- Uses Next.js API routes for serverless deployment compatibility

#### **Python Integration Layer**:
- **`pdf_extractor.py`** - Standalone PDF text extraction script
- **`.venv/`** - Python virtual environment (isolated dependencies)
- **`requirements.txt`** - Python dependencies (pypdf, openai, python-dotenv)
- **Communication**: Node.js spawns Python child processes

#### **Shared Business Logic (Node.js)**:
- **`lib/`** - Reusable modules for CLI and web interface
- **`cli/`** - Command-line interface using shared modules
- **`index.ts`** - Legacy CLI (preserved for backward compatibility)

### **Data Flow Architecture:**
```
User Interface (React)
    ↓
Next.js API Routes (Node.js)
    ↓
Python Script (Child Process)
    ↓
OpenAI API (GPT-4o-mini)
    ↓
Structured Response (JSON)
    ↓
Frontend Display (React)
```

### **Why This Hybrid Approach:**

✅ **Industry Standard**: Hybrid architectures are common when:
- JavaScript ecosystem lacks reliable libraries (PDF parsing)
- Python has superior libraries for data processing
- Need to leverage existing Python ML/AI tooling

✅ **Technical Benefits**:
- **Reliability**: Python's `pypdf` is more stable than Node.js alternatives
- **Performance**: Python excels at text processing and AI integration
- **Scalability**: Easy to add more Python-based data processing
- **Deployment**: Next.js handles containerization and scaling

✅ **Development Benefits**:
- **Best Tools**: Use the right tool for each job
- **Maintainability**: Clear separation of concerns
- **Team Skills**: Leverage both JavaScript and Python expertise

### **File Organization:**
```
sow-sure-ai/
├── app/                     # Next.js frontend & API routes
│   ├── api/                 # Backend API endpoints
│   │   ├── hazard-report/   # PDF download service
│   │   └── ai-risk-analysis/ # AI analysis orchestrator
│   ├── page.tsx            # Main web interface
│   └── layout.tsx          # App layout
├── lib/                    # Shared Node.js modules
├── cli/                    # Command-line interface
├── .venv/                  # Python virtual environment
├── pdf_extractor.py        # Python PDF processing script
├── requirements.txt        # Python dependencies
└── package.json           # Node.js dependencies
```

## 🐍 Python Integration Guidelines

### **Setting Up Python Environment:**
```bash
# Install uv package manager
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment
uv venv .venv

# Install dependencies
uv pip install -r requirements.txt
```

### **When Adding Python Functionality:**

1. **Add Dependencies**: Update `requirements.txt`
2. **Create Scripts**: Add to project root (same level as `pdf_extractor.py`)
3. **Node.js Integration**: Call from Next.js API routes using `child_process.spawn`
4. **Error Handling**: Ensure proper cleanup of temporary files
5. **Testing**: Test both standalone Python and integrated Node.js calls

### **Python Script Standards:**
- **Input/Output**: Use JSON for data exchange
- **Error Handling**: Return structured error responses
- **Logging**: Use `sys.stderr` for debug output
- **Cleanup**: Handle temporary files properly
- **Documentation**: Include docstrings and usage examples

### **Node.js → Python Communication Pattern:**
```typescript
// In Next.js API route
const { spawn } = await import('child_process')
const pythonProcess = spawn('.venv/bin/python', ['script.py', ...args])

// Handle data streams
pythonProcess.stdout.on('data', (data) => { ... })
pythonProcess.stderr.on('data', (data) => { ... })
pythonProcess.on('close', (code) => { ... })
```

## 🧪 Testing Hybrid Architecture

### **When Making Changes Affecting Both Systems:**

1. **Test Python Standalone**:
   ```bash
   .venv/bin/python pdf_extractor.py sample.pdf
   ```

2. **Test Next.js API Integration**:
   ```bash
   npm run dev
   # Test via web interface or API calls
   ```

3. **Test CLI Compatibility**:
   ```bash
   pnpm sow-cli address "Test Location"
   ```

4. **Integration Test**:
   - Full workflow: Address → PDF → Python Extraction → AI Analysis → UI Display

### When Working with Modules:

#### Adding New Functionality:
1. **Determine the appropriate module**:
   - `lib/types.ts` - New interfaces or types
   - `lib/geocoding.ts` - Address processing logic
   - `lib/hazard-api.ts` - ULAP API interactions
   - `lib/favorites.ts` - Favorites management
   - `lib/batch.ts` - Batch processing logic

2. **Update imports** in both CLI and web interface
3. **Maintain type safety** with proper TypeScript interfaces
4. **Add JSDoc documentation** to new functions

#### CLI Command Structure:
- **New commands**: Add to `cli/commands/` directory
- **Main CLI**: Update `cli/index.ts` to register new commands
- **Import pattern**: Use relative imports `../../lib/module-name`

#### Legacy Compatibility:
- **`index.ts`** should remain functional but not be enhanced
- **New features** should be added to modular structure only
- **Test both CLI options** when making changes that affect shared modules

### Documentation Updates for Architecture Changes:
1. **PROJECT_PLAN.md**: Update architecture section with new modules
2. **README.md**: Update CLI usage examples to prefer new modular CLI
3. **Package.json**: Add scripts for new CLI commands
4. **Type exports**: Ensure new types are properly exported from `lib/types.ts`

## 📝 PROJECT_PLAN.md Update Guidelines

### Task Status Format:
```markdown
[x] 1.1 Completed task description
[ ] 1.2 Pending task description
```

### Progress Tracking:
- Update the **"Current Phase"** progress counter
- Example: `Progress: 4/6 tasks completed (67%)`
- Move completed tasks to **"Completed Tasks"** section in changelog

### Phase Completion:
- When a phase is 100% complete, update **"Current Phase"** to next phase
- Add phase completion note in changelog

## 📚 CHANGELOG.md Update Guidelines

### Version Management:
- All current work goes under **`[Unreleased]`** section
- Use semantic versioning when creating releases
- Date format: `YYYY-MM-DD`

### Change Categories (in order):
1. **Added** - New features, functionality, files
2. **Changed** - Modifications to existing features
3. **Removed** - Deleted code, deprecated features
4. **Fixed** - Bug fixes, error corrections
5. **Technical Improvements** - Under-the-hood enhancements
6. **Testing** - Test additions, coverage improvements

### Entry Format:
```markdown
### Added
- New feature description with technical details
- Another feature with `code examples` when relevant

### Changed
- **BREAKING**: Mark breaking changes clearly
- Modified functionality description
```

### Development Notes Section:
Always update:
- **Current Phase** and progress percentage
- **Completed Tasks** list with checkboxes
- **Next Tasks** list
- **Last Updated** date

## 📖 README.md Update Guidelines

### When to Update README.md:
- **New CLI commands** added or changed
- **Package.json scripts** modified
- **New features** added to the tool
- **Breaking changes** that affect user workflow
- **Architecture changes** that affect usage patterns

### Sections to Maintain:
1. **Features Section**: Add new capabilities
2. **Quick Start**: Update command examples with current script names
3. **CLI Usage Examples**: Reflect new modular CLI vs legacy CLI
4. **Installation/Setup**: Keep current with any new dependencies

### Script Name Updates:
When package.json scripts change, update README examples:
```markdown
# OLD (if deprecated)
npx tsx index.ts get "Manila"

# NEW (current recommendation)
pnpm sow-cli address "Manila"
pnpm hazard-get "Manila"
```

### Architecture Documentation in README:
- Keep README focused on **user usage**
- Move detailed architecture docs to `PROJECT_PLAN.md`
- Include brief overview of CLI options (new vs legacy)
- Link to other documentation files when appropriate

## 🧪 Testing Guidelines

### Before Marking Task Complete:
1. **Functionality Test**: Ensure new feature works as expected
2. **Error Scenarios**: Test edge cases and error conditions
3. **Integration Test**: Verify compatibility with existing code
4. **Documentation**: Confirm all changes are documented

### Test Documentation:
- Document test scenarios in changelog
- Include test results for significant features
- Note any API rate limiting considerations

## 🎯 Task-Specific Guidelines

### Phase 1 Tasks:
- Focus on core geocoding functionality
- Emphasize error handling and user experience
- Test with various Philippine addresses
- Maintain API rate limiting compliance

### Phase 2 Tasks:
- Add CLI enhancements and user interface improvements
- Focus on usability and efficiency features

### Phase 3 Tasks:
- Web interface development using Next.js
- UI/UX considerations for address input and results display

## 📁 File Management

### Naming Conventions:
- Use kebab-case for file names: `project-plan.md`
- Use PascalCase for component files (when applicable)
- Use camelCase for function names in code

### Documentation Structure:
- Keep all documentation in project root
- Use consistent markdown formatting
- Include table of contents for longer documents

## 🔧 Code Guidelines

### When Adding New Functions:
1. **Add TypeScript interfaces** for new data structures
2. **Include JSDoc comments** with parameter descriptions
3. **Add error handling** for all external API calls
4. **Include console logging** with emojis for user feedback
5. **Test thoroughly** with various inputs

### When Modifying Existing Code:
1. **Maintain backward compatibility** when possible
2. **Update function documentation** if behavior changes
3. **Add migration notes** to changelog if breaking changes
4. **Test existing functionality** to ensure no regressions

## 🚀 Deployment Considerations

### Before Moving to Next Phase:
- Ensure all tasks in current phase are complete
- Update both documentation files
- Test entire workflow end-to-end
- Commit all changes with descriptive messages

### Version Releases:
- Move `[Unreleased]` changes to versioned section
- Create git tag for version
- Update version in package.json if applicable

---

## ✅ Quick Checklist for Task Completion

- [ ] Task functionality implemented and tested
- [ ] `PROJECT_PLAN.md` updated (task marked as `[x]`)
- [ ] `CHANGELOG.md` updated with changes
- [ ] `README.md` updated if CLI commands or features changed
- [ ] Progress counters updated in documentation files
- [ ] Date stamps updated
- [ ] Code properly documented with JSDoc comments
- [ ] Error scenarios tested
- [ ] Integration with existing code verified
- [ ] **Hybrid Architecture** tested (Node.js ↔ Python integration)
- [ ] **Python environment** verified (`.venv` and dependencies)
- [ ] **PDF extraction** tested standalone and integrated
- [ ] **AI analysis pipeline** working end-to-end

### 🔄 Dual CLI System Testing:
When making changes that affect shared modules (`lib/`), test:
```bash
# Test new modular CLI
pnpm sow-cli address "Test Address"
pnpm sow-cli health

# Test legacy CLI (should still work)
pnpm legacy-cli get "Test Address"

# Test web interface
pnpm dev
# Visit http://localhost:3000 and test address input
```

---

*Instructions maintained by: Development Team*  
*Last Updated: August 22, 2025*  
*Version: 1.0*
