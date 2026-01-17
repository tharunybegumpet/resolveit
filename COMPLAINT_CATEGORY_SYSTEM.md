# Complaint Category System

## Overview
Added complaint categories to help with staff assignment based on expertise.

## Categories Available
1. **Maintenance** - Building, equipment, and facility maintenance issues
2. **Technical Issues** - IT, software, hardware problems
3. **Transport** - Transportation and vehicle-related complaints
4. **Facilities** - Amenities, utilities, and facility services
5. **Safety & Security** - Security concerns and safety issues
6. **Administrative** - Administrative and procedural matters
7. **Other** - General complaints not fitting other categories

## Database Changes

### SQL Migration
Run this SQL to add category column to existing database:

```sql
ALTER TABLE complaints 
ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT 'General';

UPDATE complaints SET category = 'General' WHERE category IS NULL OR category = '';
```

**File**: `add_complaint_category.sql`

## Backend Changes

### 1. Complaint Model (`Complaint.java`)
- Added `category` field (String)
- Added getter/setter methods

### 2. ComplaintController (`ComplaintController.java`)
- Updated `submitComplaint()` to accept and validate category
- Updated `convertToMap()` to include category in response

### 3. ComplaintRequest DTO
- Already had category field (no changes needed)

## Frontend Changes

### ComplaintForm.js
- Added **Title** field (separate from category)
- Added **Category** dropdown with 7 predefined categories
- Updated form validation to require both title and category
- Updated API call to send category data

## Staff Application Integration

### StaffApplication Model
- Already has `categories` field (JSON string)
- Stores which categories the staff member can handle
- Used during staff application process

### How It Works
1. **User submits complaint** → Selects category from dropdown
2. **Staff applies** → Declares expertise in specific categories
3. **Admin assigns** → Can see staff expertise and match with complaint category
4. **Smart assignment** → Admin can assign complaints to staff based on their declared expertise

## Usage

### For Users
1. Go to "Submit Complaint"
2. Enter title
3. Select category from dropdown
4. Fill description
5. Submit

### For Staff Applicants
When applying to become staff, answer:
- "Which complaint categories can you handle?" 
- Select from: Maintenance, Technical Issues, Transport, etc.

### For Admins
When assigning complaints:
- View complaint category
- See staff member's expertise categories
- Assign to staff with matching expertise

## Benefits
✅ Better complaint organization  
✅ Faster resolution (right expert handles it)  
✅ Staff specialization tracking  
✅ Improved assignment decisions  
✅ Analytics by category  

## Testing
1. Login as user (user1@yopmail.com)
2. Submit complaint with category
3. Apply to become staff, select expertise categories
4. Login as admin (admin@resolveit.com)
5. View complaints with categories
6. Assign to staff based on expertise match
