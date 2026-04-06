

## Plan: Add Profile & Settings Page

### What We're Building
A dedicated Profile/Settings page where users can view and edit their personal info, nutrition goals, and account settings — all in one place.

### Page Sections

1. **Profile Header** -- Avatar with initials, name, and email display

2. **Personal Info Card** (editable)
   - Name, gender, age, weight, height
   - Inline edit with save button

3. **Nutrition Goals Card** (editable)
   - Daily calories, protein, carbs, fat targets
   - Option to recalculate based on current body stats using existing `calculateNutritionNeeds`

4. **App Settings**
   - Dark/Light mode toggle
   - Share app button

5. **Account Section**
   - Subscription status (Free / Premium badge)
   - Upgrade button if not subscribed (links to /pricing)
   - Logout button

6. **Danger Zone**
   - Sign out (confirmation dialog)

### Technical Details

**Files to create:**
- `src/pages/Profile.tsx` -- the settings page with form fields using existing `useProfile` and `useUpdateProfile` hooks

**Files to modify:**
- `src/App.tsx` -- add `/profile` route (protected)
- `src/components/ProfileDropdown.tsx` -- add "Profile & Settings" menu item linking to `/profile`; update "Coloxy" references to "Caloxy"

**No database changes needed** -- all profile fields already exist in the `profiles` table.

### UI Approach
- Mobile-first layout (max-w-lg, matching dashboard style)
- Back button in header to return to dashboard
- Form inputs using existing shadcn/ui components (Input, Select, Button)
- Toast notifications on save success/failure
- "Recalculate Goals" button that re-runs `calculateNutritionNeeds` and updates values

