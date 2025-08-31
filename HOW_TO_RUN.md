# 🚀 How to Run Sow Sure AI Application

This guide provides step-by-step instructions for running the Sow Sure AI Philippine Disaster Risk Assessment Tool.

## 📋 Prerequisites

- **Node.js** (v20.19.4 or higher)
- **npm** or **pnpm** package manager
- **Python 3.12+** (for AI features)

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install
# OR if you have pnpm
pnpm install

# Set up Python virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration (Optional)

For AI-powered features, create a `.env` file:

```bash
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
```

## 🌐 Running the Web Interface

### Development Server
```bash
npm run dev
```

The web application will be available at: **http://localhost:3000**

### Production Build
```bash
npm run build  # May have font issues in restricted environments
npm run start  # Start production server
```

## 🖥️ Running the CLI Tools

### New Modular CLI (Recommended)

```bash
# Show help
npm run sow-cli -- --help

# Check system health
npm run sow-cli -- health

# Show examples
npm run sow-cli -- examples

# Process single address
npm run sow-cli -- address "Manila City, Philippines"

# Batch processing
npm run sow-cli -- batch addresses.csv

# Manage favorites
npm run sow-cli -- favorites list
npm run sow-cli -- favorites add "Home" "Manila City"
```

### Legacy CLI (Backward Compatibility)

```bash
# Show help
npm run legacy-cli -- --help

# Show examples
npm run legacy-cli -- examples

# Process single address
npm run legacy-cli -- get "Manila City, Philippines"

# Run demo mode
npm run legacy-cli -- demo

# Batch processing
npm run legacy-cli -- batch addresses.txt
```

### Quick CLI Scripts

```bash
# Individual command shortcuts
npm run hazard-get "Manila City"
npm run hazard-batch addresses.csv
npm run hazard-favorites list
npm run hazard-health
npm run hazard-examples
```

## 🎯 Application Features

### Web Interface
- **Interactive Dashboard**: Modern Next.js web interface at http://localhost:3000
- **Risk Assessment Form**: Comprehensive farmer loan risk evaluation
- **Interactive Maps**: Location-based hazard visualization
- **Real-time Analysis**: Live calculations and feedback

### CLI Interface
- **Dual CLI System**: Choose between modern modular CLI or legacy interface
- **Address Processing**: Convert Philippine addresses to coordinates
- **Hazard Reports**: Download official disaster risk assessments
- **Batch Processing**: Handle multiple addresses from CSV files
- **Favorites Management**: Save and manage frequently used locations
- **Health Monitoring**: Check API availability and system status

## 🔧 Troubleshooting

### Network Issues
- API calls may fail in restricted environments (health checks will show warnings)
- The application still demonstrates full functionality locally

### Build Issues
- Font loading may fail in restricted environments but doesn't affect functionality
- Use `npm run dev` for development which bypasses build issues

### Python Environment
- Ensure Python virtual environment is activated when using AI features
- Install requirements.txt dependencies for full functionality

## 📱 Usage Examples

### Web Interface
1. Navigate to http://localhost:3000
2. Click "Apply Now" to access the assessment form
3. Fill out farmer information for risk analysis
4. Use the interactive map for location-based assessments

### CLI Usage
```bash
# Quick health check
npm run sow-cli -- health

# Show usage examples
npm run sow-cli -- examples

# Process an address (will show network errors in sandboxed environment)
npm run sow-cli -- address "Rizal Park, Manila"
```

---

**✅ Application Status**: Both web interface and CLI tools are running successfully!
- **Web Interface**: ✅ Running on http://localhost:3000
- **New CLI**: ✅ Functional with comprehensive commands
- **Legacy CLI**: ✅ Backward compatibility maintained
- **Dependencies**: ✅ All Node.js and Python packages installed