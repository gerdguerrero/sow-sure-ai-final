# 🏛️ SOW SURE AI - Philippine Disaster Risk Assessment Tool

A comprehensive disaster risk assessment tool for the Philippines, combining OpenStreetMap geocoding with official ULAP hazard reports to provide location-specific disaster risk analysis for any Philippine address.

## 🌟 Features

- **Address-Based Geocoding**: Convert any Philippine address to precise coordinates using OpenStreetMap
- **Official Hazard Reports**: Download official disaster risk assessments from ULAP (Philippine government)
- **Dual CLI Interface**: Choose between modern modular CLI or legacy interface
- **Web Dashboard**: Interactive Next.js web interface with address search and mapping
- **Multiple Address Formats**: Support for landmarks, cities, full addresses, institutions
- **Batch Processing**: Process multiple addresses from CSV files with progress tracking
- **Favorites System**: Save and manage frequently used locations
- **Health Monitoring**: Built-in API availability checks and system diagnostics
- **Error Handling**: Robust validation and user-friendly error messages

## 🚀 Quick Start

### Prerequisites

```bash
# Install Node.js dependencies
pnpm install

# Set up Python environment for AI features
curl -LsSf https://astral.sh/uv/install.sh | sh  # Install uv package manager
uv venv .venv                                     # Create virtual environment
uv pip install -r requirements.txt               # Install Python dependencies

# Set up environment variables (for AI features)
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
# Edit .env and replace with your actual OpenAI API key
```

### New Modular CLI (Recommended)

```bash
# Single address processing
pnpm sow-cli address "Rizal Park, Manila"
pnpm sow-cli address "University of the Philippines, Diliman" --output ./reports

# Batch processing from CSV
pnpm sow-cli batch addresses.csv --delay 2000
pnpm sow-cli batch --create-sample sample.csv

# Favorites management
pnpm sow-cli favorites add "Home" "Rizal Park, Manila"
pnpm sow-cli favorites list
pnpm sow-cli favorites report "Home"

# System health and examples
pnpm sow-cli health
pnpm sow-cli examples
```

### Quick Access Scripts

```bash
# Simplified commands for common tasks
pnpm hazard-get "Manila City"
pnpm hazard-batch addresses.csv
pnpm hazard-favorites list
pnpm hazard-health
pnpm hazard-examples
```

### Legacy CLI (Backward Compatibility)

```bash
# Original CLI interface (still functional)
pnpm legacy-cli get "Rizal Park, Manila"
pnpm legacy-cli batch addresses.txt --verbose
pnpm legacy-cli favorites add "Home" "Manila"
```

### Web Interface

```bash
# Start the Next.js web dashboard
pnpm dev
# Open http://localhost:3000
```

## 📍 CLI Comparison

| **Feature** | **New Modular CLI** (`pnpm sow-cli`) | **Legacy CLI** (`pnpm legacy-cli`) |
|-------------|--------------------------------------|-------------------------------------|
| **Status** | ✅ **Recommended** | 🔒 **Legacy Support** |
| **Structure** | Modular, clean commands | Monolithic (1221 lines) |
| **Health Checks** | ✅ Built-in | ❌ Not available |
| **Examples** | ✅ Interactive examples | ❌ Limited help |
| **User Experience** | 🎨 Enhanced UX | 📝 Basic interface |
| **Maintenance** | 🔧 Easy to extend | 🗂️ Hard to maintain |

### Favorite Locations

Save frequently used addresses for quick access:

```bash
# Add favorite locations (New CLI)
pnpm sow-cli favorites add "Home" "Rizal Park, Manila"
pnpm sow-cli favorites add "Office" "Makati CBD, Philippines"

# List all favorites
pnpm sow-cli favorites list

# Get hazard report for favorite
pnpm sow-cli favorites report "Home"

# Remove a favorite
pnpm sow-cli favorites remove "Office"

# Quick access scripts
pnpm hazard-favorites list
```

### Batch Processing

Create a CSV file with addresses:

```csv
address
Manila City Hall, Philippines
University of the Philippines Diliman
Boracay Island, Aklan
Cebu City, Philippines
```

Process the file:

```bash
# New modular CLI
pnpm sow-cli batch addresses.csv
pnpm sow-cli batch addresses.csv --delay 2000 --output custom-reports

# Create sample CSV
pnpm sow-cli batch --create-sample sample-addresses.csv

# Quick access
pnpm hazard-batch addresses.csv
```

### Using NPM Scripts

```bash
# Quick commands via package.json scripts
pnpm hazard-get "Mayon Volcano, Albay"           # Single address
pnpm hazard-batch addresses.csv                  # Batch processing  
pnpm hazard-favorites list                       # List favorites
pnpm hazard-health                               # Check system health
pnpm hazard-examples                             # Show examples
pnpm sow-cli --help                              # Full CLI help
```

## ⭐ Enhanced Features

### Favorite Locations System
- **Quick Access**: Save frequently used addresses with custom names
- **Usage Tracking**: Monitor how often each favorite is used  
- **Smart Sorting**: Favorites automatically sorted by usage frequency
- **Persistent Storage**: Favorites saved in `favorites.json` for persistence
- **Seamless Integration**: Use favorites with both CLI and web interface

### Advanced Batch Processing
- **CSV Support**: Process multiple addresses from CSV files with headers
- **Progress Tracking**: Real-time progress with address counters and timestamps
- **Error Recovery**: Continue processing on errors with detailed failure reporting
- **Rate Limiting**: Configurable delays to respect API limits and avoid throttling
- **Comprehensive Reporting**: Success rates, processing times, and detailed summaries
- **Retry Logic**: Built-in retry functionality for failed addresses

### System Health & Monitoring
- **API Availability**: Check ULAP and OpenStreetMap API status
- **Health Diagnostics**: Comprehensive system health reporting
- **Error Handling**: Robust validation with user-friendly error messages
- **Debug Support**: Verbose mode for troubleshooting geocoding issues

## 🏗️ Architecture

### Modular Structure
The project uses a modern modular architecture:

- **`lib/`** - Shared business logic modules for code reuse
- **`cli/`** - New modular command-line interface  
- **`app/`** - Next.js web interface with interactive maps
- **`index.ts`** - Legacy CLI preserved for backward compatibility

### Dual CLI System
- **New CLI** (`pnpm sow-cli`) - Recommended for new users and development
- **Legacy CLI** (`pnpm legacy-cli`) - Maintained for existing scripts and backward compatibility

## 📍 Supported Address Formats

The tool supports various Philippine address formats with high accuracy:

- **Landmarks**: "Rizal Park, Manila", "Boracay Island, Aklan"
- **Educational**: "Ateneo de Manila University, Quezon City"
- **Government**: "Malacañang Palace, Manila"
- **Cities**: "Davao City, Philippines", "Baguio City, Benguet"
- **Full Addresses**: "123 Rizal Street, Makati City, Metro Manila"

## 🏗️ Architecture

### Hybrid Next.js + Python System
The project uses a **hybrid architecture** combining the best tools for each task:

- **Frontend**: Next.js 15 + React 19 + TypeScript for web interface
- **Backend**: Node.js API routes for web services and PDF downloads  
- **AI Processing**: Python scripts with `pypdf` for reliable PDF text extraction
- **AI Analysis**: OpenAI GPT-4o-mini for intelligent risk assessment

### Data Flow
```
Address Search → PDF Download → Python Extraction → AI Analysis → Web Display
```

### Why Hybrid Architecture?
- **Reliability**: Python's PDF libraries are more stable than Node.js alternatives
- **Performance**: Each technology handles what it does best
- **Scalability**: Easy to add more Python-based data processing features
- **Industry Standard**: Common pattern for AI-integrated web applications

## 🛠️ Development & Web Interface

### Next.js Web Dashboard

This project includes a comprehensive Next.js web interface with:

- **Interactive Map**: Leaflet.js-powered maps for location visualization
- **Address Search**: Real-time geocoding with address suggestions  
- **Hazard Report Downloads**: Direct PDF downloads from web interface
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Shared Backend**: Uses same modules as CLI for consistency

```bash
# Run the Next.js development server
pnpm dev
# Open http://localhost:3000
```

### Project Structure
```
lib/                    # Shared business logic modules
├── types.ts           # TypeScript interfaces
├── geocoding.ts       # Address processing
├── hazard-api.ts      # ULAP API integration
├── favorites.ts       # Favorites management
└── batch.ts           # Batch processing

cli/                    # Modular CLI interface
├── index.ts           # CLI entry point
└── commands/          # Individual commands

app/                    # Next.js web interface
├── page.tsx           # Main dashboard
└── api/               # API routes

index.ts               # Legacy CLI (backward compatibility)
```

### Development Commands
```bash
pnpm dev              # Start Next.js development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

## 📖 Documentation

- **[PROJECT_PLAN.md](./PROJECT_PLAN.md)** - Complete project roadmap and architecture documentation
- **[CHANGELOG.md](./CHANGELOG.md)** - Detailed change history and development progress
- **[INSTRUCTIONS.md](./INSTRUCTIONS.md)** - Development guidelines and workflow instructions
- **[WEB_ARCHITECTURE.md](./WEB_ARCHITECTURE.md)** - Web interface specific documentation

## Learn More

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial
- [Next.js GitHub repository](https://github.com/vercel/next.js) - Feedback and contributions welcome

### Philippine APIs
- [ULAP Hazard Assessment](https://ulap-reports.georisk.gov.ph/) - Official Philippine disaster risk data
- [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) - Geocoding service used for address resolution

## 🚀 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 🔄 Migration Guide

### Migrating from Legacy CLI

If you're using the original CLI commands, here's how to migrate:

```bash
# OLD (Legacy)                          # NEW (Recommended)
npx tsx index.ts get "Manila"          → pnpm sow-cli address "Manila"
npx tsx index.ts batch file.txt        → pnpm sow-cli batch file.csv  
npx tsx index.ts favorites list        → pnpm sow-cli favorites list
npx tsx index.ts demo                  → pnpm sow-cli examples

# Quick scripts (same commands work with both)
pnpm hazard-get "Manila"               # Uses new CLI internally
pnpm hazard-batch addresses.csv        # Uses new CLI internally
```

**Benefits of New CLI:**
- ✅ Better error messages and user feedback
- ✅ Built-in health checks and system diagnostics  
- ✅ Enhanced batch processing with CSV support
- ✅ Interactive examples and help documentation
- ✅ Modular codebase for easier maintenance and testing

**Legacy CLI Support:**
- 🔒 Original `index.ts` remains functional for existing scripts
- 🔄 All original commands work exactly as before
- 📋 Recommended for automation that can't be easily updated
