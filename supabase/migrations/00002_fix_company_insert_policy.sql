-- Fix: Allow authenticated users to create companies during onboarding
-- The original schema only had SELECT and UPDATE policies for companies

-- Add INSERT policy so users can create their first company
CREATE POLICY "Authenticated users can create companies" ON companies
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add INSERT policy for company_members so users can add themselves as owner
CREATE POLICY "Users can insert themselves as members" ON company_members
  FOR INSERT
  WITH CHECK (user_id = auth.uid());
