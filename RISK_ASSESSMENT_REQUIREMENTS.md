# Risk Assessment Form - Complete Requirements Documentation

## 1. Complete Functionality Inventory

### Form Fields & Input Types

#### Financial Information Section
| Field Name | Input Type | Validation Rules | Required | Default Value |
|------------|------------|------------------|----------|---------------|
| Annual Income (₱) | Number | Min: 0, Integer | Yes | 0 |
| Annual Expenses (₱) | Number | Min: 0, Integer | Yes | 0 |
| Annual Loan Payments (₱) | Number | Min: 0, Integer | Yes | 0 |
| Income Sources | Select Dropdown | Must select from predefined options | Yes | '' |
| Loan Payment History | Select Dropdown | Must select from predefined options | Yes | '' |

**Income Sources Options:**
- `multiple` - Multiple income sources
- `rice` - Rice farming
- `corn` - Corn farming
- `vegetables` - Vegetable farming
- `livestock` - Livestock
- `other` - Other crops

**Loan Payment History Options:**
- `on_time` - Always on time
- `late_1_2` - 1-2 late payments
- `late_3_5` - 3-5 late payments
- `late_5_plus` - More than 5 late payments

#### Assets & Capital Section
| Field Name | Input Type | Validation Rules | Required | Default Value |
|------------|------------|------------------|----------|---------------|
| Land Ownership | Select Dropdown | Must select from predefined options | Yes | '' |
| Equipment & Savings Value (₱) | Number | Min: 0, Integer | Yes | 0 |
| Crops in Storage Value (₱) | Number | Min: 0, Integer | Yes | 0 |
| Collateral Ratio | Number | Min: 0, Step: 0.1, Decimal | Yes | 0 |
| Insurance Coverage | Select Dropdown | Must select from predefined options | Yes | '' |

**Land Ownership Options:**
- `owned_large` - Owned large farm (5+ hectares)
- `owned_medium` - Owned medium farm (2-5 hectares)
- `titled_1ha_plus` - Titled land (1+ hectare)
- `small_or_shared` - Small plot or shared ownership
- `tenant` - Tenant farmer
- `none` - No land ownership

**Insurance Coverage Options:**
- `crop_life` - Crop & Life insurance
- `crop_only` - Crop insurance only
- `none` - No insurance

#### Credit History & Character Section
| Field Name | Input Type | Validation Rules | Required | Default Value |
|------------|------------|------------------|----------|---------------|
| Banking History | Select Dropdown | Must select from predefined options | Yes | '' |
| Cooperative Membership | Checkbox | Boolean | No | false |

**Banking History Options:**
- `savings_and_good_loans` - Savings & good loan history
- `savings_only` - Savings account only
- `none` - No banking history

#### Environmental Hazards Section
| Field Name | Input Type | Validation Rules | Required | Default Value |
|------------|------------|------------------|----------|---------------|
| Location Input | Text with Autocomplete | Min 3 characters for search | Yes | '' |
| Seismic Risk | Auto-populated | low/moderate/high | Yes | '' |
| Flood/Typhoon Risk | Auto-populated | low/moderate/high | Yes | '' |
| Other Risks | Auto-populated | low/moderate/high | Yes | '' |
| Coordinates | Auto-populated | Lat/Lng numbers | Yes | null |

### Conditional Logic

#### Location Autocomplete Flow
```
IF user types 3+ characters in location field
  THEN trigger geocoding API search
  THEN display dropdown with suggestions
  IF user clicks suggestion
    THEN populate location field
    THEN store coordinates
    THEN hide dropdown
```

#### Hazard Data Flow
```
IF location is selected AND coordinates exist
  THEN enable "Get Hazards" button
  IF "Get Hazards" clicked
    THEN show status: "🔍 Processing location..."
    THEN call geocoding API (if coordinates not already stored)
    THEN show status: "📥 Downloading hazard assessment..."
    THEN call hazard-report API
    THEN show status: "🤖 Analyzing hazard data with AI..."
    THEN call ai-risk-analysis API
    THEN populate hazard risk levels
    THEN show status: "✅ Hazard data loaded successfully!"
    THEN enable PDF download button
```

#### Form Submission Flow
```
IF calculate button clicked
  THEN validate all required fields
  IF any required field empty
    THEN show error: "Please fill in all required fields: [field names]"
    THEN stop submission
  IF hazard data missing
    THEN show error: "Please fetch hazard assessment data"
    THEN stop submission
  ELSE
    THEN submit to risk-assessment API
    THEN show results section
```

### Multi-Step Workflows

#### Hazard Assessment Workflow
1. **Location Entry** → User types location
2. **Autocomplete** → Show suggestions from geocoding API
3. **Selection** → User selects location, coordinates stored
4. **Hazard Fetch** → Multi-step API calls with status updates
5. **Results Display** → Show risk levels and enable PDF download
6. **Map Display** → Show interactive map with marker

#### Risk Calculation Workflow
1. **Form Validation** → Check all required fields
2. **Hazard Validation** → Ensure location data exists
3. **API Submission** → Send complete data to backend
4. **Results Processing** → Parse and display risk score
5. **Recommendations Display** → Show AI-generated recommendations

### Required vs Optional Fields

#### Required Fields (Form won't submit without these)
- All Financial Information fields
- All Assets & Capital fields  
- Banking History
- Location with hazard data (seismic, flood_typhoon, other)

#### Optional Fields
- Cooperative Membership (checkbox)

### Auto-Calculations & Real-Time Updates

#### Real-Time Features
- **Location Autocomplete**: Triggers after 3+ characters
- **Status Updates**: Real-time progress during hazard fetching
- **Coordinate Display**: Updates when location selected
- **Map Updates**: Refreshes when coordinates change
- **Risk Color Coding**: Dynamic styling based on risk levels

#### Auto-Populated Fields
- Hazard risk levels (from AI analysis)
- Coordinates (from geocoding)
- Map location (from coordinates)

## 2. Technical Requirements

### API Endpoints

#### `/api/geocode`
- **Method**: GET
- **Parameters**: `q` (query string)
- **Purpose**: Address search and coordinate lookup
- **Response**: Array of location objects with lat/lng
- **Error Handling**: Return empty array on failure

#### `/api/hazard-report`
- **Method**: POST
- **Payload**: `{ coordinates: {lat, lng}, address: string }`
- **Purpose**: Fetch government hazard data from ULAP
- **Response**: Hazard report data
- **Error Handling**: Return error message

#### `/api/ai-risk-analysis`
- **Method**: POST  
- **Payload**: `{ coordinates: {lat, lng}, address: string }`
- **Purpose**: AI analysis of hazard data
- **Response**: `{ aiAnalysis: { hazardTypes: [], riskLevel: string } }`
- **Error Handling**: Return error message

#### `/api/risk-assessment`
- **Method**: POST
- **Payload**: Complete `ApplicantData` object
- **Purpose**: Calculate risk score and recommendations
- **Response**: `RiskResult` object
- **Error Handling**: Return error status and message

#### `/api/download-hazard-pdf`
- **Method**: GET
- **Parameters**: `lat`, `lng`, `address`
- **Purpose**: Generate and download PDF report
- **Response**: PDF file stream
- **Error Handling**: Return error page

### Database Fields

#### Applicant Data Storage
```typescript
interface ApplicantData {
  income: number
  expenses: number
  loan_payments: number
  income_sources: string
  loan_history: string
  land_ownership: string
  equipment_savings: number
  crops_storage: number
  collateral_ratio: number
  insurance: string
  banking_history: string
  coop_member: boolean
  hazards: {
    seismic: string
    flood_typhoon: string
    other: string
  }
}
```

#### Risk Result Storage
```typescript
interface RiskResult {
  score: number
  classification: string
  recommendations?: {
    priorityRecommendations: string[]
    financialImprovements: string[]
    riskMitigation: string[]
    nextSteps: string[]
    potentialScoreImprovement: {
      description: string
      targetScore: string
    }
  }
}
```

### File Upload Capabilities
- **PDF Generation**: Server-side PDF creation for hazard reports
- **File Download**: Direct download links for generated PDFs
- **No User Uploads**: Form does not accept file uploads from users

### Integration Points

#### External Systems
- **ULAP Government API**: Philippine hazard data source
- **OpenStreetMap**: Map display integration
- **Geocoding Service**: Address to coordinate conversion

#### Internal Systems
- **AI Risk Analysis Engine**: Custom risk assessment logic
- **PDF Generation Service**: Report creation system
- **Database**: Applicant and result storage

### Authentication/Authorization Requirements
- **Public Access**: No authentication required for form usage
- **API Rate Limiting**: Implement to prevent abuse
- **Data Privacy**: Secure handling of financial information

## 3. User Experience Features

### Progress Indicators

#### Multi-Step Process Indicators
- **Hazard Fetching**: 4-step process with emoji status updates
  1. 🔍 Processing location...
  2. 🔍 Geocoding location...
  3. 📥 Downloading hazard assessment...
  4. 🤖 Analyzing hazard data with AI...
  5. ✅ Hazard data loaded successfully!

#### Loading States
- Button text changes: "Get Hazards" → "Getting Hazards..."
- Button disabled during operations
- Spinner/loading indicators where appropriate

### Save/Resume Functionality
- **Browser Storage**: Use localStorage for form persistence
- **Auto-Save**: Save form data on field changes
- **Resume**: Restore data on page reload
- **Clear Option**: Reset all form data

### Error Handling & Messaging

#### Validation Errors
- **Required Field Alerts**: "Please fill in all required fields: [field names]"
- **Hazard Data Missing**: "Please fetch hazard assessment data by entering a location"
- **Location Not Found**: "Location not found. Please try a different address."

#### API Errors
- **Geocoding Failure**: "Failed to geocode location. Please try a different address."
- **Hazard Report Failure**: "Failed to download hazard report"
- **AI Analysis Failure**: "Failed to analyze hazard data"
- **Risk Assessment Failure**: "Error calculating risk score: [error details]"

#### Success Messages
- **Hazard Success**: Status updates with checkmark emoji
- **Calculation Success**: Risk score and recommendations display
- **PDF Download**: Silent success (file downloads)

### Success/Completion Flows

#### Successful Risk Assessment
1. Form validation passes
2. Show loading state
3. Display risk score with color coding
4. Show detailed recommendations in categorized sections
5. Provide actionable next steps

#### Successful Hazard Assessment
1. Location processing complete
2. Display risk levels with color coding
3. Show interactive map
4. Enable PDF download
5. Display transparency note about data sources

### Mobile Responsiveness Requirements

#### Responsive Breakpoints
- **Mobile**: < 768px (stack all elements)
- **Tablet**: 768px - 1024px (2-column grid)
- **Desktop**: > 1024px (3-column grid)

#### Mobile-Specific Features
- **Touch-Friendly**: Larger tap targets (44px minimum)
- **Keyboard Optimization**: Proper input types for mobile keyboards
- **Viewport Optimization**: Proper scaling and zooming
- **Reduced Motion**: Respect user preferences

## 4. Business Logic

### Risk Scoring Algorithms

#### Risk Level Mapping
```javascript
const mapRiskLevel = (aiRisk: string) => {
  const normalized = aiRisk.toLowerCase()
  if (normalized.includes('low')) return 'low'
  if (normalized.includes('high') || normalized.includes('very high')) return 'high'
  return 'moderate' // Default for moderate/unknown
}
```

#### Hazard Type Classification
- **Seismic**: earthquake, seismic, fault
- **Flood/Typhoon**: flood, typhoon, storm, cyclone
- **Other**: All other hazard types

### Decision Trees & Branching Logic

#### Form Submission Decision Tree
```
START → Validate Required Fields
├─ FAIL → Show Error Message → STOP
└─ PASS → Validate Hazard Data
   ├─ FAIL → Show Hazard Error → STOP
   └─ PASS → Submit to API
      ├─ API ERROR → Show API Error → STOP
      └─ SUCCESS → Display Results → END
```

#### Hazard Processing Decision Tree
```
START → Check Location Input
├─ EMPTY → Show Location Error → STOP
└─ VALID → Check Coordinates
   ├─ MISSING → Call Geocoding API
   │  ├─ FAIL → Show Geocoding Error → STOP
   │  └─ SUCCESS → Store Coordinates → Continue
   └─ EXISTS → Continue
      → Call Hazard Report API
      ├─ FAIL → Show Hazard Error → STOP
      └─ SUCCESS → Call AI Analysis API
         ├─ FAIL → Show AI Error → STOP
         └─ SUCCESS → Process Results → END
```

### Data Validation Rules

#### Field-Level Validation
- **Numbers**: Must be non-negative integers
- **Decimals**: Collateral ratio allows 1 decimal place
- **Dropdowns**: Must select from predefined options
- **Text**: Location must be at least 3 characters for search

#### Cross-Field Validation
- **Financial Logic**: Income should exceed expenses
- **Collateral Logic**: Ratio should typically be > 1.0
- **Location Logic**: Coordinates must exist before hazard assessment

### Compliance Requirements

#### Data Privacy
- **No Sensitive Storage**: Don't persist financial data permanently
- **Secure Transmission**: HTTPS for all API calls
- **User Consent**: Clear disclosure of data usage

#### Government Data Usage
- **Attribution**: Credit ULAP as data source
- **Transparency**: Provide access to source PDF reports
- **Accuracy Disclaimer**: Note that data is for assessment purposes

## 5. Testing Checklist

### Functional Tests for Each Feature

#### Form Field Testing
- [ ] All required fields trigger validation errors when empty
- [ ] Number fields reject non-numeric input
- [ ] Dropdown selections populate correctly
- [ ] Checkbox toggles properly
- [ ] Form data persists across browser refresh

#### Location & Geocoding Testing
- [ ] Autocomplete triggers after 3+ characters
- [ ] Suggestions appear in dropdown
- [ ] Clicking suggestion populates field and stores coordinates
- [ ] Invalid locations show appropriate error messages
- [ ] Coordinates display correctly

#### Hazard Assessment Testing
- [ ] "Get Hazards" button disabled without location
- [ ] Multi-step status updates display correctly
- [ ] Hazard levels populate from AI analysis
- [ ] Color coding applies correctly to risk levels
- [ ] Error states handle API failures gracefully

#### Risk Calculation Testing
- [ ] Form validation prevents submission with missing data
- [ ] Loading states display during calculation
- [ ] Risk score displays with correct classification
- [ ] Recommendations appear in categorized sections
- [ ] Error handling works for API failures

#### PDF Download Testing
- [ ] Download button appears after hazard assessment
- [ ] PDF generates with correct location data
- [ ] Download works in all supported browsers
- [ ] Error handling for PDF generation failures

### Edge Cases to Verify

#### Data Edge Cases
- [ ] Zero values in financial fields
- [ ] Extremely large numbers
- [ ] Special characters in location input
- [ ] Non-existent addresses
- [ ] Locations with no hazard data

#### Network Edge Cases
- [ ] API timeouts
- [ ] Network connectivity loss
- [ ] Malformed API responses
- [ ] Rate limiting responses
- [ ] Server errors (500, 503, etc.)

#### UI Edge Cases
- [ ] Very long location names
- [ ] Multiple rapid clicks on buttons
- [ ] Browser back/forward navigation
- [ ] Page refresh during API calls
- [ ] Concurrent form submissions

### Cross-Browser Compatibility Needs

#### Desktop Browsers
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)

#### Mobile Browsers
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Samsung Internet
- [ ] Mobile Firefox

#### Feature Support Testing
- [ ] Fetch API support
- [ ] LocalStorage availability
- [ ] CSS Grid/Flexbox support
- [ ] Touch event handling
- [ ] File download functionality

### Performance Testing
- [ ] Form renders within 2 seconds
- [ ] Autocomplete responses under 500ms
- [ ] Risk calculation completes within 10 seconds
- [ ] PDF downloads initiate within 5 seconds
- [ ] Memory usage remains stable during long sessions

### Accessibility Testing
- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader compatibility
- [ ] Color contrast meets WCAG guidelines
- [ ] Focus indicators are visible
- [ ] Error messages are announced to screen readers

---

## Sample Data for Testing

```javascript
const sampleFormData = {
  income: 50000,
  expenses: 30000,
  loan_payments: 5000,
  income_sources: 'multiple',
  loan_history: 'on_time',
  land_ownership: 'owned',
  equipment_savings: 75000,
  crops_storage: 30000,
  collateral_ratio: 1.2,
  insurance: 'crop_life',
  banking_history: 'savings_and_good_loans',
  coop_member: true,
  hazards: {
    seismic: 'low',
    flood_typhoon: 'moderate',
    other: 'low'
  }
}
```

## API Response Examples

### Geocoding Response
```json
[
  {
    "lat": "15.4897",
    "lon": "120.9370",
    "display_name": "Cabanatuan City, Nueva Ecija, Philippines"
  }
]
```

### Risk Assessment Response
```json
{
  "score": 23,
  "classification": "Low Risk",
  "recommendations": {
    "priorityRecommendations": [
      "Consider increasing crop insurance coverage",
      "Diversify income sources to reduce dependency"
    ],
    "financialImprovements": [
      "Build emergency fund equivalent to 6 months expenses",
      "Explore additional income streams"
    ],
    "riskMitigation": [
      "Implement water management systems",
      "Join local farmers' cooperative"
    ],
    "nextSteps": [
      "Apply for agricultural loan",
      "Schedule financial planning consultation"
    ],
    "potentialScoreImprovement": {
      "description": "With improved insurance coverage and diversified income",
      "targetScore": "15-18 (Lower Risk)"
    }
  }
}
```

---

*Last Updated: August 24, 2025*
*Version: 1.0*
