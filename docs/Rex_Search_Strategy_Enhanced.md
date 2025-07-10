# Rex Search Strategy: Felix Problem Integration

## Felix-Driven Search Queries for AgentQL

Based on the 40 Felix problems, Rex should search for these specific contractor opportunities:

### **Plumbing Searches (Problems 1-8)**
\`\`\`python
plumbing_queries = {
    "craigslist_gigs": [
        "toilet repair running water",
        "faucet leak dripping kitchen bathroom", 
        "clogged drain sink tub shower",
        "garbage disposal replacement install",
        "water heater problems repair",
        "sump pump check replace",
        "shower valve leak repair",
        "basement pipe leak emergency"
    ],
    "sams_gov": [
        "plumbing maintenance services",
        "facility plumbing repairs",
        "emergency plumbing contractor"
    ]
}
\`\`\`

### **Electrical Searches (Problems 7, 15, 32, 39)**
\`\`\`python
electrical_queries = {
    "craigslist_gigs": [
        "light fixture replacement install",
        "electrical outlet replace GFCI",
        "ceiling fan installation mount",
        "circuit breaker replace panel",
        "bathroom exhaust fan install",
        "smart thermostat installation"
    ],
    "sams_gov": [
        "electrical maintenance contractor",
        "facility electrical repairs",
        "lighting system upgrades"
    ]
}
\`\`\`

### **HVAC Searches (Problems 17, 38, 39)**
\`\`\`python
hvac_queries = {
    "craigslist_gigs": [
        "HVAC repair heating cooling",
        "air conditioning service repair",
        "furnace maintenance install",
        "ductwork cleaning repair",
        "thermostat smart programmable"
    ],
    "sams_gov": [
        "HVAC maintenance services",
        "building climate control",
        "energy efficiency upgrades"
    ]
}
\`\`\`

### **Carpentry/Handyman (Problems 4, 12, 25, 35)**
\`\`\`python
carpentry_queries = {
    "craigslist_gigs": [
        "drywall repair patch holes",
        "deck staining sealing maintenance",
        "cabinet hardware repair install",
        "door lock replacement install",
        "furniture assembly IKEA",
        "shelf mounting wall install"
    ],
    "sams_gov": [
        "facility maintenance carpenter",
        "building repairs handyman",
        "interior renovation services"
    ]
}
\`\`\`

### **Roofing/Exterior (Problems 18, 14, 35)**
\`\`\`python
roofing_queries = {
    "craigslist_gigs": [
        "roof leak repair emergency",
        "gutter cleaning maintenance",
        "deck board replacement repair",
        "fence post repair install",
        "exterior painting maintenance"
    ],
    "sams_gov": [
        "roofing contractor services",
        "building envelope repairs",
        "exterior maintenance contract"
    ]
}
\`\`\`

## Value Thresholds by Felix Problem Type

### **High-Value Problems (Pro Recommended)**
- **HVAC System Problems** ($200-$1500+)
- **Water Heater Issues** ($150-$1000+)
- **Roof Leak Repair** ($300-$1500+)
- **Foundation Crack Repair** ($200-$1000+)
- **Electrical Panel Work** ($200-$800+)

### **Medium-Value Problems** 
- **Appliance Installation** ($100-$300)
- **Ceiling Fan Install** ($50-$200 + labor)
- **Toilet Installation** ($100-$300 + labor)
- **Smart Lock Install** ($100-$250 + labor)

### **Quick Wins (Easy DIY → Pro Upsell)**
- **Running Toilet Repair** → Bathroom renovation leads
- **Leaky Faucet** → Kitchen/bathroom remodel opportunities  
- **Light Bulb Changes** → Electrical system upgrades
- **Cabinet Hardware** → Kitchen renovation projects

## Geographic Targeting Strategy

### **Urban Markets (Miami-area)**
- Focus on **high-value Felix problems** (HVAC, electrical, plumbing)
- Minimum project value: **$7,000**
- Target luxury condos, commercial buildings

### **Suburban Markets (Cleveland-area)**  
- Mix of **medium and high-value** Felix problems
- Minimum project value: **$3,000**
- Target single-family homes, small commercial

## AgentQL Integration Points

### **1. Problem Classification**
\`\`\`python
def classify_lead_by_felix(lead_description):
    felix_mapping = {
        "toilet": {"felix_id": 1, "category": "plumbing", "difficulty": "easy"},
        "faucet": {"felix_id": 2, "category": "plumbing", "difficulty": "easy"},
        "electrical outlet": {"felix_id": 15, "category": "electrical", "difficulty": "hard"},
        "roof leak": {"felix_id": 18, "category": "roofing", "difficulty": "hard"}
    }
    return felix_mapping.get(extract_keywords(lead_description))
\`\`\`

### **2. Quality Scoring Enhancement**
\`\`\`python
def calculate_felix_quality_score(lead):
    base_score = calculate_recency_score(lead.posted_time)
    
    # Boost score for high-value Felix problems
    if lead.felix_id in [17, 16, 18, 19]:  # HVAC, Water Heater, Roof, Foundation
        base_score *= 1.5
    
    # Reduce score for oversaturated easy problems
    if lead.felix_id in [1, 2, 3, 28]:  # Basic plumbing, light bulbs
        base_score *= 0.8
        
    return base_score
\`\`\`

### **3. Contractor Matching**
\`\`\`python
def match_contractor_to_felix_problem(contractor_profile, felix_id):
    contractor_services = contractor_profile.selected_services
    felix_problem = get_felix_problem(felix_id)
    
    if felix_problem.category in contractor_services:
        if felix_problem.is_pro_recommended and contractor_profile.tier == "scale":
            return {"match": True, "priority": "high"}
        elif not felix_problem.is_pro_recommended:
            return {"match": True, "priority": "medium"}
    
    return {"match": False}
\`\`\`

## Search Automation Schedule

### **Peak Posting Times (Based on Felix Categories)**
- **Emergency Problems** (Water heater, roof leaks): Monitor every 2 hours
- **Planned Projects** (Kitchen, bathroom remodel): Daily sweeps
- **Seasonal Work** (Deck staining, gutter cleaning): Weekly during peak seasons

### **Platform Priority by Felix Type**
1. **Craigslist Labor Gigs**: Best for immediate Felix problems (1-20)
2. **SAMs.gov**: Best for large-scale Felix applications (commercial facilities)
3. **Municipal Sites**: Best for ongoing maintenance contracts
4. **NextDoor/Local**: Best for residential Felix problems (21-40)

This integration ensures Rex searches for actual contractor work that matches the Felix problem framework, improving lead quality and contractor success rates.
