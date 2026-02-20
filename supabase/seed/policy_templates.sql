-- Seed: UK HR Policy Templates
-- These are placeholder templates. Replace with licensed content before production.

INSERT INTO policy_templates (title, category, description, content, is_mandatory, version, applicable_sectors) VALUES

-- Employment & Contracts
('Equal Opportunities Policy', 'employment', 'Outlines commitment to equality and prevention of discrimination under the Equality Act 2010.', 'This is a placeholder template. Replace with licensed legal content.', true, '1.0', '{}'),
('Recruitment & Selection Policy', 'employment', 'Fair and consistent approach to hiring in compliance with employment law.', 'This is a placeholder template. Replace with licensed legal content.', false, '1.0', '{}'),
('Probationary Period Policy', 'employment', 'Sets expectations and procedures for employee probation periods.', 'This is a placeholder template. Replace with licensed legal content.', false, '1.0', '{}'),
('Fixed-Term Contracts Policy', 'employment', 'Guidance on the use and management of fixed-term employment contracts.', 'This is a placeholder template. Replace with licensed legal content.', false, '1.0', '{}'),

-- Health & Safety
('Health & Safety Policy', 'health_safety', 'Statement of general policy on health and safety at work as required by the Health and Safety at Work Act 1974.', 'This is a placeholder template. Replace with licensed legal content.', true, '1.0', '{}'),
('Lone Working Policy', 'health_safety', 'Procedures for employees who work alone or in isolation.', 'This is a placeholder template. Replace with licensed legal content.', false, '1.0', '{care_homes,construction}'),
('Display Screen Equipment Policy', 'health_safety', 'Compliance with the Health and Safety (Display Screen Equipment) Regulations 1992.', 'This is a placeholder template. Replace with licensed legal content.', false, '1.0', '{}'),

-- Leave & Absence
('Annual Leave Policy', 'leave', 'Holiday entitlement, booking procedures, and carry-over rules compliant with the Working Time Regulations 1998.', 'This is a placeholder template. Replace with licensed legal content.', true, '1.0', '{}'),
('Sickness Absence Policy', 'leave', 'Procedures for reporting absence, sick pay, and return-to-work processes.', 'This is a placeholder template. Replace with licensed legal content.', true, '1.0', '{}'),
('Maternity Leave Policy', 'leave', 'Rights and procedures for maternity leave and pay.', 'This is a placeholder template. Replace with licensed legal content.', true, '1.0', '{}'),
('Paternity Leave Policy', 'leave', 'Rights and procedures for paternity leave and pay.', 'This is a placeholder template. Replace with licensed legal content.', true, '1.0', '{}'),
('Shared Parental Leave Policy', 'leave', 'Options and procedures for shared parental leave.', 'This is a placeholder template. Replace with licensed legal content.', false, '1.0', '{}'),

-- Conduct & Discipline
('Disciplinary Policy', 'conduct', 'Formal disciplinary procedure aligned with ACAS Code of Practice.', 'This is a placeholder template. Replace with licensed legal content.', true, '1.0', '{}'),
('Grievance Policy', 'conduct', 'Formal grievance procedure aligned with ACAS Code of Practice.', 'This is a placeholder template. Replace with licensed legal content.', true, '1.0', '{}'),
('Anti-Harassment & Bullying Policy', 'conduct', 'Zero tolerance approach to workplace harassment and bullying.', 'This is a placeholder template. Replace with licensed legal content.', true, '1.0', '{}'),
('Code of Conduct', 'conduct', 'Expected standards of behaviour and professional conduct.', 'This is a placeholder template. Replace with licensed legal content.', false, '1.0', '{}'),
('Whistleblowing Policy', 'conduct', 'Protection for employees who raise genuine concerns about malpractice.', 'This is a placeholder template. Replace with licensed legal content.', true, '1.0', '{}'),

-- Data & Privacy
('Data Protection Policy', 'data_privacy', 'Compliance with UK GDPR and Data Protection Act 2018.', 'This is a placeholder template. Replace with licensed legal content.', true, '1.0', '{}'),
('Employee Privacy Notice', 'data_privacy', 'Notice to employees about how their personal data is processed.', 'This is a placeholder template. Replace with licensed legal content.', true, '1.0', '{}'),
('IT & Acceptable Use Policy', 'data_privacy', 'Rules for use of company IT systems, email, and internet.', 'This is a placeholder template. Replace with licensed legal content.', false, '1.0', '{}'),
('Social Media Policy', 'data_privacy', 'Guidelines for employee use of social media in relation to the company.', 'This is a placeholder template. Replace with licensed legal content.', false, '1.0', '{}'),

-- Sector-Specific
('Safeguarding Policy', 'sector_specific', 'Protection of children and vulnerable adults. Required for regulated sectors.', 'This is a placeholder template. Replace with licensed legal content.', true, '1.0', '{care_homes,education}'),
('Manual Handling Policy', 'sector_specific', 'Safe practices for manual handling as per Manual Handling Operations Regulations 1992.', 'This is a placeholder template. Replace with licensed legal content.', true, '1.0', '{care_homes,construction,hospitality}'),
('Alcohol & Drug Policy', 'sector_specific', 'Zero tolerance/testing policy for safety-critical environments.', 'This is a placeholder template. Replace with licensed legal content.', false, '1.0', '{construction,hospitality}'),
('Tips & Gratuities Policy', 'sector_specific', 'Fair distribution of tips in compliance with Employment (Allocation of Tips) Act 2023.', 'This is a placeholder template. Replace with licensed legal content.', true, '1.0', '{hospitality}');
