-- Cendrixa Seed Data: Policy Templates & Legal Alerts
-- Run this in Supabase SQL Editor after schema migration

-- ============================================
-- POLICY TEMPLATES
-- ============================================

-- Clear existing templates
DELETE FROM policy_templates;

INSERT INTO policy_templates (title, category, description, content, applicable_sectors, is_mandatory, version, effective_date, last_legal_review) VALUES

-- MANDATORY POLICIES (all employers)
(
  'Equal Opportunities Policy',
  'Employment Law',
  'Outlines commitment to eliminating discrimination and promoting equality of opportunity under the Equality Act 2010.',
  E'# Equal Opportunities Policy\n\n## 1. Purpose\nThis policy sets out our approach to equal opportunities and the avoidance of discrimination at work.\n\n## 2. Scope\nThis policy applies to all employees, workers, contractors, and job applicants.\n\n## 3. Legal Framework\nWe comply with the Equality Act 2010 and associated regulations.\n\n## 4. Protected Characteristics\nWe will not discriminate on the grounds of:\n- Age\n- Disability\n- Gender reassignment\n- Marriage and civil partnership\n- Pregnancy and maternity\n- Race (including colour, nationality, ethnic or national origins)\n- Religion or belief\n- Sex\n- Sexual orientation\n\n## 5. Types of Discrimination\nDiscrimination includes:\n- Direct discrimination\n- Indirect discrimination\n- Harassment\n- Victimisation\n\n## 6. Recruitment and Selection\nAll recruitment decisions will be made on the basis of merit and ability to perform the role.\n\n## 7. Monitoring\nWe monitor the composition of our workforce and review our procedures regularly.\n\n## 8. Complaints\nAny employee who believes they have been discriminated against should raise a grievance using the company grievance procedure.',
  '{}',
  true,
  '2.0',
  '2024-04-01',
  '2024-04-01'
),

(
  'Health & Safety Policy',
  'Health & Safety',
  'Sets out employer responsibilities for health and safety at work under the Health and Safety at Work Act 1974.',
  E'# Health & Safety Policy\n\n## 1. Statement of Intent\nWe are committed to ensuring the health, safety, and welfare of all employees.\n\n## 2. Responsibilities\n### Employer\n- Provide a safe working environment\n- Ensure equipment is maintained\n- Provide adequate training\n- Carry out risk assessments\n\n### Employees\n- Take reasonable care of their own health and safety\n- Cooperate with health and safety procedures\n- Report hazards and concerns\n\n## 3. Risk Assessment\nWe conduct regular risk assessments and act upon findings.\n\n## 4. Accidents and Incidents\nAll accidents must be reported and recorded in the accident book. RIDDOR reports will be made as required.\n\n## 5. Fire Safety\nFire risk assessments are conducted annually. Fire evacuation procedures are displayed prominently.\n\n## 6. First Aid\nFirst aiders are appointed and first aid equipment is maintained.\n\n## 7. Review\nThis policy is reviewed annually or following any significant incident.',
  '{}',
  true,
  '2.0',
  '2024-01-01',
  '2024-01-01'
),

(
  'Disciplinary Procedure',
  'Employee Relations',
  'ACAS-compliant disciplinary procedure covering investigation, hearing, and appeal stages.',
  E'# Disciplinary Procedure\n\n## 1. Purpose\nThis procedure is designed to help and encourage employees to achieve and maintain acceptable standards of conduct.\n\n## 2. Scope\nApplies to all employees who have completed their probationary period.\n\n## 3. Principles\n- Issues will be dealt with promptly\n- Employees will be informed of complaints\n- Employees have the right to be accompanied\n- No dismissal for a first breach (except gross misconduct)\n- Right of appeal\n\n## 4. Investigation\nBefore any disciplinary hearing, an investigation will be conducted by a manager not involved in the matter.\n\n## 5. Disciplinary Stages\n### Stage 1: Verbal Warning\nFor minor offences. Remains on file for 6 months.\n\n### Stage 2: First Written Warning\nFor repeated minor offences or more serious matters. Remains on file for 12 months.\n\n### Stage 3: Final Written Warning\nFor continued misconduct. Remains on file for 12 months.\n\n### Stage 4: Dismissal\nFor gross misconduct or continued failure to meet standards.\n\n## 6. Gross Misconduct\nExamples include theft, fraud, violence, serious negligence, and breach of confidentiality.\n\n## 7. Appeals\nEmployees may appeal in writing within 5 working days of receiving the decision.',
  '{}',
  true,
  '2.0',
  '2024-01-01',
  '2024-01-01'
),

(
  'Grievance Procedure',
  'Employee Relations',
  'ACAS-compliant grievance procedure for raising workplace concerns.',
  E'# Grievance Procedure\n\n## 1. Purpose\nThis procedure enables employees to raise concerns about their employment.\n\n## 2. Informal Resolution\nEmployees should first try to resolve concerns informally with their line manager.\n\n## 3. Formal Grievance\n### Step 1: Written Grievance\nPut the grievance in writing to your manager or HR.\n\n### Step 2: Grievance Meeting\nA meeting will be arranged within 5 working days. You may be accompanied by a colleague or trade union representative.\n\n### Step 3: Decision\nA written decision will be provided within 5 working days of the meeting.\n\n### Step 4: Appeal\nIf not satisfied, you may appeal in writing within 5 working days. An appeal meeting will be heard by a more senior manager.\n\n## 4. Right to be Accompanied\nAt all formal meetings, employees have the right to be accompanied by:\n- A work colleague\n- A trade union representative\n\n## 5. Confidentiality\nAll grievances will be handled confidentially.',
  '{}',
  true,
  '2.0',
  '2024-01-01',
  '2024-01-01'
),

(
  'Data Protection & GDPR Policy',
  'Data Protection',
  'Sets out how personal data is collected, processed, stored, and protected in compliance with UK GDPR.',
  E'# Data Protection & GDPR Policy\n\n## 1. Introduction\nWe are committed to protecting the privacy and personal data of our employees, clients, and partners.\n\n## 2. Data Protection Principles\nWe process personal data in accordance with the six principles:\n1. Lawfulness, fairness, and transparency\n2. Purpose limitation\n3. Data minimisation\n4. Accuracy\n5. Storage limitation\n6. Integrity and confidentiality\n\n## 3. Lawful Basis for Processing\nWe only process personal data when we have a lawful basis:\n- Consent\n- Contract\n- Legal obligation\n- Vital interests\n- Public task\n- Legitimate interests\n\n## 4. Individual Rights\nIndividuals have the right to:\n- Access their data (Subject Access Request)\n- Rectification\n- Erasure\n- Restrict processing\n- Data portability\n- Object to processing\n\n## 5. Data Breaches\nAll data breaches must be reported immediately. The ICO will be notified within 72 hours where required.\n\n## 6. Data Protection Officer\n[Company Name] has appointed a Data Protection Officer.',
  '{}',
  true,
  '2.0',
  '2024-04-01',
  '2024-04-01'
),

(
  'Right to Work Checks Policy',
  'Immigration',
  'Outlines procedures for conducting right-to-work checks to prevent illegal working under the Immigration, Asylum and Nationality Act 2006.',
  E'# Right to Work Checks Policy\n\n## 1. Purpose\nTo ensure all employees have the legal right to work in the UK before employment begins.\n\n## 2. Legal Obligation\nUnder the Immigration, Asylum and Nationality Act 2006, we must verify that all employees have the right to work in the UK.\n\n## 3. When Checks Must Be Done\n- Before employment starts (no exceptions)\n- Follow-up checks before permission expires (for time-limited right to work)\n\n## 4. How to Conduct a Check\n### Manual Check\n1. Obtain original documents from List A or List B\n2. Check documents in the presence of the holder\n3. Check the documents are genuine\n4. Copy documents and record the date of check\n5. Store copies securely\n\n### Online Check (Share Code)\n1. Obtain the share code from the employee\n2. Check via gov.uk/view-right-to-work\n3. Save the profile page as evidence\n\n## 5. Record Keeping\nRecords must be kept for the duration of employment and for 2 years after employment ends.\n\n## 6. Penalties\nFailure to conduct proper checks can result in civil penalties of up to £45,000 per illegal worker.',
  '{}',
  true,
  '2.0',
  '2024-07-01',
  '2024-07-01'
),

-- NON-MANDATORY BUT RECOMMENDED
(
  'Absence Management Policy',
  'Employee Relations',
  'Covers reporting procedures, sick pay, return-to-work interviews, and managing long-term absence.',
  E'# Absence Management Policy\n\n## 1. Reporting Absence\n- Notify your manager before your normal start time\n- Provide regular updates for extended absence\n- Obtain a fit note after 7 calendar days\n\n## 2. Statutory Sick Pay (SSP)\nSSP is payable from the 4th qualifying day of absence.\n\n## 3. Return to Work\nA return-to-work interview will be conducted after every period of absence.\n\n## 4. Trigger Points\nAbsence management procedures may be triggered by:\n- 3 or more periods of absence in 12 months\n- 10 or more days absence in 12 months\n- A pattern of absence (e.g., Mondays/Fridays)\n\n## 5. Long-Term Absence\nFor absences exceeding 4 weeks, a welfare meeting will be arranged.',
  '{}',
  false,
  '1.0',
  '2024-01-01',
  '2024-01-01'
),

(
  'Whistleblowing Policy',
  'Employment Law',
  'Protected disclosure policy enabling employees to raise concerns about wrongdoing without fear of retaliation.',
  E'# Whistleblowing Policy\n\n## 1. Purpose\nThis policy encourages employees to report suspected wrongdoing as soon as possible.\n\n## 2. What is Whistleblowing?\nWhistleblowing is the disclosure of information that a worker reasonably believes shows one or more of the following:\n- Criminal offence\n- Breach of legal obligation\n- Miscarriage of justice\n- Danger to health and safety\n- Damage to the environment\n- Deliberate concealment of any of the above\n\n## 3. How to Raise a Concern\n- Report to your line manager, senior manager, or director\n- Reports can be made verbally or in writing\n- Anonymous reports will be considered\n\n## 4. Protection\nWhistleblowers are protected under the Employment Rights Act 1996. No worker will suffer detriment for making a protected disclosure.',
  '{}',
  false,
  '1.0',
  '2024-01-01',
  '2024-01-01'
),

(
  'Anti-Bribery & Corruption Policy',
  'Compliance',
  'Compliance with the Bribery Act 2010 covering gifts, hospitality, and facilitation payments.',
  E'# Anti-Bribery & Corruption Policy\n\n## 1. Purpose\nWe have a zero-tolerance approach to bribery and corruption. This policy sets out our position.\n\n## 2. The Bribery Act 2010\nIt is a criminal offence to:\n- Bribe another person\n- Receive a bribe\n- Bribe a foreign public official\n- Fail to prevent bribery (corporate offence)\n\n## 3. Gifts and Hospitality\n- All gifts and hospitality over £50 must be declared and approved\n- A register of gifts and hospitality is maintained\n- Cash gifts are never acceptable\n\n## 4. Facilitation Payments\nFacilitation payments are prohibited.\n\n## 5. Reporting\nAny suspicion of bribery must be reported immediately.',
  '{}',
  false,
  '1.0',
  '2024-01-01',
  '2024-01-01'
),

(
  'Flexible Working Policy',
  'Employment Law',
  'Covers the right to request flexible working under the Employment Relations (Flexible Working) Act 2023.',
  E'# Flexible Working Policy\n\n## 1. Right to Request\nAll employees have the right to request flexible working from day one of employment.\n\n## 2. Types of Flexible Working\n- Part-time working\n- Job sharing\n- Flexitime\n- Compressed hours\n- Remote/hybrid working\n- Term-time only\n- Annualised hours\n\n## 3. Making a Request\n- Submit in writing\n- Up to two requests per year\n- State the change requested and proposed start date\n- Explain any impact on the business\n\n## 4. Decision Process\n- We will decide within 2 months\n- A meeting will be arranged to discuss the request\n- You may be accompanied at the meeting\n\n## 5. Grounds for Refusal\nRequests may only be refused on one of the 8 statutory grounds.',
  '{}',
  false,
  '1.0',
  '2024-04-01',
  '2024-04-01'
),

(
  'Modern Slavery Statement',
  'Compliance',
  'Statement of commitment to preventing modern slavery and human trafficking in line with the Modern Slavery Act 2015.',
  E'# Modern Slavery Statement\n\n## 1. Statement\nWe are committed to preventing slavery and human trafficking in our business and supply chain.\n\n## 2. Our Business\n[Company description]\n\n## 3. Our Policies\nWe have the following policies in place:\n- Anti-slavery policy\n- Whistleblowing policy\n- Code of conduct for suppliers\n\n## 4. Due Diligence\nWe undertake due diligence when considering new suppliers and regularly review existing suppliers.\n\n## 5. Risk Assessment\nWe assess the risk of modern slavery in our business and supply chain.\n\n## 6. Training\nAll staff receive training on identifying and reporting concerns.\n\n## 7. Reporting\nAny concerns about modern slavery should be reported through the whistleblowing procedure.',
  '{}',
  false,
  '1.0',
  '2024-01-01',
  '2024-01-01'
),

-- SECTOR-SPECIFIC
(
  'Safeguarding Policy',
  'Safeguarding',
  'Safeguarding procedures for organisations working with vulnerable adults. Required for care homes and education.',
  E'# Safeguarding Policy\n\n## 1. Purpose\nTo protect vulnerable adults and children from abuse and neglect.\n\n## 2. Scope\nApplies to all staff, volunteers, and contractors.\n\n## 3. Types of Abuse\n- Physical abuse\n- Emotional/psychological abuse\n- Sexual abuse\n- Financial abuse\n- Neglect\n- Discriminatory abuse\n- Organisational abuse\n\n## 4. Recognising Abuse\nSigns may include unexplained injuries, behavioural changes, withdrawal, and fear.\n\n## 5. Reporting Concerns\n- Report immediately to the Designated Safeguarding Lead\n- Record concerns using the safeguarding concern form\n- Do not investigate yourself\n\n## 6. DBS Checks\nAll staff working with vulnerable people must have an enhanced DBS check.\n\n## 7. Training\nAll staff receive safeguarding training at induction and annual refresher training.',
  '{care_homes,education}',
  true,
  '2.0',
  '2024-01-01',
  '2024-01-01'
),

(
  'Food Safety & Hygiene Policy',
  'Health & Safety',
  'Food safety procedures for hospitality businesses in compliance with Food Safety Act 1990.',
  E'# Food Safety & Hygiene Policy\n\n## 1. Purpose\nTo ensure food safety and comply with the Food Safety Act 1990 and EU Regulation 852/2004.\n\n## 2. HACCP\nWe operate a Hazard Analysis and Critical Control Point (HACCP) system.\n\n## 3. Personal Hygiene\n- Wash hands before handling food\n- Wear clean protective clothing\n- Report illness to management\n- Cover cuts and wounds\n\n## 4. Temperature Control\n- Hot food: above 63°C\n- Cold food: below 8°C (ideally 5°C)\n- All temperatures recorded daily\n\n## 5. Food Allergens\nThe 14 major allergens must be identified and communicated to customers.\n\n## 6. Cleaning\nCleaning schedules are in place for all areas.\n\n## 7. Training\nAll food handlers must hold a Level 2 Food Safety certificate.',
  '{hospitality}',
  true,
  '1.0',
  '2024-01-01',
  '2024-01-01'
);

-- ============================================
-- LEGAL ALERTS
-- ============================================

DELETE FROM legal_alerts;

INSERT INTO legal_alerts (title, summary, detail, severity, effective_date, affected_sectors, affected_policy_categories, source_url) VALUES

(
  'Employment Rights Bill 2024 - Key Changes',
  'Major employment law reform including day-one unfair dismissal rights, fire-and-rehire restrictions, and zero-hours contract reforms.',
  'The Employment Rights Bill introduces significant changes to UK employment law. Key provisions include: unfair dismissal protection from day one (with a statutory probationary period), restrictions on fire-and-rehire practices, reforms to zero-hours contracts giving workers the right to guaranteed hours, strengthened trade union rights, and establishment of a Fair Work Agency. Employers should begin reviewing their employment contracts and procedures now.',
  'critical',
  '2025-10-01',
  '{}',
  '{Employment Law,Employee Relations}',
  'https://www.gov.uk/government/collections/employment-rights-bill'
),

(
  'National Minimum Wage Increase - April 2025',
  'National Living Wage increases to £12.21/hour for workers aged 21+. Apprentice rate increases to £7.55/hour.',
  'From 1 April 2025, the National Minimum Wage rates are: Age 21+: £12.21/hour, Age 18-20: £10.00/hour, Under 18: £7.55/hour, Apprentice: £7.55/hour. Employers must ensure all workers are paid at least the appropriate rate.',
  'critical',
  '2025-04-01',
  '{}',
  '{Employment Law}',
  'https://www.gov.uk/national-minimum-wage-rates'
),

(
  'Right to Work Check Updates 2025',
  'Home Office has updated the acceptable documents list and introduced new digital identity verification routes.',
  'The Home Office has updated the right-to-work checking guidance. Key changes include expanded use of Identity Document Validation Technology (IDVT) for British and Irish citizens, updated document lists, and new guidance on follow-up checks for visa holders. Employers should review their RTW checking procedures and train staff on the changes.',
  'warning',
  '2025-01-01',
  '{}',
  '{Immigration}',
  'https://www.gov.uk/government/publications/right-to-work-checks-employers-guide'
),

(
  'Flexible Working - Day One Right',
  'The Employment Relations (Flexible Working) Act 2023 is now in force. All employees can request flexible working from day one.',
  'Key changes: Employees can make 2 requests per year (previously 1). Employers must decide within 2 months (previously 3). Employers must consult with the employee before refusing. The requirement for employees to explain the impact on the employer has been removed.',
  'warning',
  '2024-04-06',
  '{}',
  '{Employment Law}',
  'https://www.gov.uk/flexible-working'
),

(
  'Carer''s Leave Act 2023 - Now In Force',
  'Employees are entitled to 1 week of unpaid carer''s leave per year from day one of employment.',
  'The Carer''s Leave Act 2023 gives employees who are caring for a dependant with a long-term care need the right to take up to 1 week of unpaid leave per year. This is a day-one right. Leave can be taken as individual days or half-days. Employers cannot refuse or delay the leave.',
  'info',
  '2024-04-06',
  '{}',
  '{Employment Law}',
  'https://www.gov.uk/carers-leave'
),

(
  'Redundancy Protection Extended',
  'Protection from redundancy now extends to pregnant employees and those returning from family leave.',
  'The Maternity Leave, Adoption Leave and Shared Parental Leave (Amendment) Regulations 2024 extend redundancy protection. Protected period now covers: from notification of pregnancy through to 18 months after birth, from start of adoption leave to 18 months after placement, and during shared parental leave and 18 months after.',
  'warning',
  '2024-04-06',
  '{}',
  '{Employment Law,Employee Relations}',
  'https://www.gov.uk/redundancy-your-rights'
),

(
  'Sexual Harassment Prevention Duty',
  'New preventative duty on employers to take reasonable steps to prevent sexual harassment of workers.',
  'The Worker Protection (Amendment of Equality Act 2010) Act 2023 places a new positive duty on employers to take reasonable steps to prevent sexual harassment. Employment tribunals can uplift compensation by up to 25% where the duty is breached. Employers should: conduct risk assessments, implement anti-harassment policies, provide training, and establish reporting procedures.',
  'critical',
  '2024-10-26',
  '{}',
  '{Employment Law,Employee Relations}',
  'https://www.gov.uk/workplace-bullying-and-harassment'
),

(
  'Tips and Gratuities - New Rules',
  'The Employment (Allocation of Tips) Act 2023 requires employers to pass on all tips to workers.',
  'From 1 October 2024, employers must: pass on all qualifying tips and service charges to workers without deductions, have a written policy on tip allocation (if tips are received more than occasionally), keep records of tip allocation for 3 years, and allow workers to request information about tipping records.',
  'warning',
  '2024-10-01',
  '{hospitality,retail}',
  '{Employment Law}',
  'https://www.gov.uk/tips-at-work'
);
