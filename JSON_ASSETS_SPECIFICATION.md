# JSON Assets Specification for FixItForMe Contractor UI

## 🎯 Overview

This document defines all JSON asset structures required for the FixItForMe contractor platform's dynamic UI generation. These assets enable the brain/skin architecture to render intelligent, agent-driven interfaces.

## 🤖 Agent Response Schema

### Base Agent Response Structure

All agent responses adhere to this base schema, providing conversational text, structured UI assets, and actionable buttons.

```json
{
  "message": "Conversational response text that accompanies the UI assets.",
  "ui_assets": {
    "type": "cost_breakdown | lead_summary | onboarding_checklist | material_analysis | etc.",
    "data": {
      // Agent-specific data structure, see below for details
    }
  },
  "actions": [
    {
      "type": "update_profile" | "submit_bid" | "schedule_call" | "save_lead" | "open_document_uploader",
      "data": { 
        "lead_id": "lead_12345",
        "form_id": "contractor_profile"
        /* action-specific payload */ 
      },
      "label": "Action Button Text (e.g., 'Submit Bid')",
      "variant": "primary" | "secondary" | "outline" | "destructive"
    }
  ],
  "metadata": {
    "agent": "lexi" | "alex" | "rex",
    "timestamp": "ISO 8601 datetime string",
    "session_id": "unique_session_identifier",
    "requires_auth": true
  }
}
```

---

## 👤 Agent-Specific Response Types

### 👩‍💼 Lexi the Liaison - Onboarding & Guidance Assets

#### 1. Onboarding Checklist
Used to guide new contractors through the setup process.

**JSON Schema: `onboarding_checklist`**
```json
{
  "ui_assets": {
    "type": "onboarding_checklist",
    "data": {
      "completion_percentage": 0.75,
      "current_step": 4,
      "total_steps": 6,
      "steps": [
        {
          "id": 1,
          "title": "Basic Profile Setup",
          "description": "Complete your contractor profile with essential information.",
          "status": "completed",
          "required_fields": ["name", "phone", "email", "license_number", "business_address"],
          "completion_date": "2024-01-10T10:30:00Z",
          "validation_errors": []
        },
        {
          "id": 2,
          "title": "License Verification",
          "description": "Upload and verify your contractor license.",
          "status": "completed",
          "documents": [{
            "name": "license.pdf",
            "size": 2048576,
            "url": "https://supabase.co/storage/v1/object/public/documents/license.pdf",
            "uploaded_at": "2024-01-10T11:15:00Z"
          }],
          "verification_status": "approved",
          "approval_date": "2024-01-11T09:00:00Z"
        },
        {
          "id": 3,
          "title": "Insurance Documentation",
          "description": "Provide proof of liability insurance.",
          "status": "in_progress",
          "documents_needed": ["general_liability", "workers_comp"],
          "deadline": "2024-01-20T23:59:59Z",
          "progress": 0.5
        }
      ],
      "next_actions": [{
        "title": "Upload Insurance Documents",
        "description": "Upload your general liability and workers' compensation insurance certificates.",
        "priority": "high",
        "estimated_time": "5 minutes",
        "cta_label": "Upload Insurance",
        "cta_action": "open_document_uploader"
      }]
    }
  }
}
```

---

### 📊 Alex the Assessor - Bidding & Analysis Assets

#### 1. Cost Breakdown
Provides a detailed cost estimate for a specific job.

**JSON Schema: `cost_breakdown`**
```json
{
  "ui_assets": {
    "type": "cost_breakdown",
    "data": {
      "job_id": "job_12345",
      "total_estimate": 2500,
      "breakdown": {
        "materials": {
          "amount": 1200,
          "percentage": 0.48,
          "items": [{
            "name": "Hardwood Flooring", "category": "flooring", "quantity": "300 sq ft",
            "unit_price": 3.50, "total": 1050, "supplier": "Home Depot", "grade": "premium"
          }]
        },
        "labor": {
          "amount": 800, "percentage": 0.32, "hours": 16, "rate": 50,
          "breakdown": {
            "installation": { "hours": 12, "rate": 50, "total": 600 },
            "preparation": { "hours": 4, "rate": 50, "total": 200 }
          }
        },
        "permits": {
          "amount": 150, "percentage": 0.06,
          "items": [{ "name": "Building Permit", "cost": 150, "processing_time": "5-7 days", "required": true }]
        },
        "overhead": {
          "amount": 350, "percentage": 0.14,
          "includes": ["insurance", "transportation", "tools", "cleanup"]
        }
      },
      "timeline": {
        "estimated_days": 4, "start_date": "2024-01-15", "completion_date": "2024-01-19",
        "milestones": [{ "date": "2024-01-15", "task": "Site preparation and material delivery" }]
      },
      "confidence_level": 0.85,
      "market_comparison": { "low": 2200, "high": 2800, "median": 2500 },
      "risk_factors": [{ "factor": "Subfloor condition", "impact": "medium", "mitigation": "Additional inspection required" }]
    }
  }
}
```

#### 2. Material Analysis
Compares different materials for a job.

**JSON Schema: `material_analysis`**
```json
{
  "ui_assets": {
    "type": "material_analysis",
    "data": {
      "job_type": "flooring",
      "recommended_materials": [
        {
          "name": "Engineered Hardwood", "cost_per_unit": 4.50,
          "pros": ["Durable", "Water resistant"], "cons": ["Higher initial cost"], "suitability_score": 0.9
        },
        {
          "name": "Luxury Vinyl Plank", "cost_per_unit": 2.75,
          "pros": ["Waterproof", "Low maintenance"], "cons": ["Not as durable"], "suitability_score": 0.8
        }
      ],
      "quantity_calculations": { "room_area": 300, "waste_factor": 0.1, "total_needed": 330, "unit": "sq ft" },
      "supplier_comparison": [
        { "name": "Home Depot", "price": 3.50, "availability": "in_stock", "delivery_time": "2-3 days" },
        { "name": "Lowes", "price": 3.75, "availability": "in_stock", "delivery_time": "1-2 days" }
      ]
    }
  }
}
```

---

### 🔍 Rex the Retriever - Lead Generation Assets

#### 1. Lead Summary
Presents a list of available leads with key details.

**JSON Schema: `lead_summary`**
```json
{
  "ui_assets": {
    "type": "lead_summary",
    "data": {
      "total_leads": 12, "new_leads": 5, "conversion_probability": 0.68,
      "leads": [{
        "id": "lead_12345", "title": "Kitchen Renovation",
        "description": "Complete kitchen remodel including cabinets, countertops, and appliances.",
        "location": { "city": "Seattle", "state": "WA", "zip": "98101", "distance_from_contractor": 5.2 },
        "budget_range": { "min": 15000, "max": 25000, "currency": "USD" },
        "urgency": "high", "timeline": "2-3 months", "posted_date": "2024-01-15T09:00:00Z",
        "match_score": 0.92, "competition_level": "medium",
        "client_profile": { "name": "Sarah Johnson", "previous_projects": 3, "rating": 4.8 },
        "project_details": { "scope": ["Cabinet installation", "Countertop replacement"], "permits_required": true }
      }],
      "market_insights": {
        "trending_keywords": ["sustainable", "energy-efficient", "smart home"],
        "peak_posting_times": ["Tuesday 9:00 AM", "Thursday 2:00 PM"],
        "average_response_time": "4 hours"
      }
    }
  }
}
```

---

## 🎨 UI Component JSON Assets

These assets are not tied to a specific agent but are used to render common UI elements like dashboard widgets and forms.

### 1. Performance Metrics Widget
For displaying key performance indicators on the dashboard.

**JSON Schema: `performance_metrics`**
```json
{
  "ui_assets": {
    "type": "performance_metrics",
    "data": {
      "time_period": "last_30_days",
      "metrics": {
        "total_revenue": { "value": 45000, "change": 0.15, "trend": "up" },
        "jobs_completed": { "value": 12, "change": 0.20, "trend": "up" },
        "client_satisfaction": { "value": 4.8, "change": 0.05, "trend": "up", "scale": 5.0 },
        "response_time": { "value": 3.2, "change": -0.8, "trend": "down", "unit": "hours" }
      },
      "charts": {
        "revenue_trend": {
          "type": "line",
          "data": [
            { "date": "2024-01-01", "value": 1200 },
            { "date": "2024-01-15", "value": 1800 },
            { "date": "2024-01-30", "value": 2500 }
          ]
        },
        "job_distribution": {
          "type": "pie",
          "data": [
            { "category": "kitchen_remodeling", "value": 5, "percentage": 0.42 },
            { "category": "flooring", "value": 4, "percentage": 0.33 },
            { "category": "bathroom_remodeling", "value": 3, "percentage": 0.25 }
          ]
        }
      }
    }
  }
}
```

### 2. Dynamic Form
For rendering forms based on a JSON configuration, used in profile settings and other areas.

**JSON Schema: `dynamic_form`**
```json
{
  "ui_assets": {
    "type": "dynamic_form",
    "data": {
      "form_id": "contractor_profile", "title": "Contractor Profile",
      "description": "Complete your professional profile to attract more clients.",
      "sections": [{
        "id": "basic_info", "title": "Basic Information",
        "fields": [
          {
            "name": "full_name", "type": "text", "label": "Full Name", "required": true,
            "validation": { "min_length": 2, "max_length": 50 }, "placeholder": "Enter your full name"
          },
          {
            "name": "specializations", "type": "multi_select", "label": "Specializations", "required": true,
            "options": [
              { "value": "flooring", "label": "Flooring" },
              { "value": "plumbing", "label": "Plumbing" },
              { "value": "electrical", "label": "Electrical" }
            ]
          }
        ]
      }],
      "actions": [
        { "type": "submit", "label": "Save Profile", "variant": "primary" },
        { "type": "cancel", "label": "Cancel", "variant": "secondary" }
      ]
    }
  }
}
```

### 3. Notification Center
For displaying system notifications to the user.

**JSON Schema: `notification_center`**
```json
{
  "ui_assets": {
    "type": "notification_center",
    "data": {
      "notifications": [
        {
          "id": "notif_001", "type": "lead_available", "title": "New Lead Available",
          "message": "A kitchen renovation project in your area is looking for contractors.",
          "timestamp": "2024-01-15T10:30:00Z", "priority": "high", "read": false,
          "actions": [{ "type": "view_lead", "label": "View Lead", "data": { "lead_id": "lead_12345" } }]
        },
        {
          "id": "notif_002", "type": "payment_received", "title": "Payment Received",
          "message": "Payment of $2,500 received for Project #789.",
          "timestamp": "2024-01-15T08:15:00Z", "priority": "medium", "read": true,
          "actions": [{ "type": "view_payment", "label": "View Payment", "data": { "payment_id": "pay_789" } }]
        }
      ],
      "summary": { "total_count": 8, "unread_count": 3, "high_priority_count": 1 }
    }
  }
}
```

This comprehensive JSON asset specification ensures consistent, predictable data structures for all UI components while maintaining flexibility for future enhancements and agent capabilities.
