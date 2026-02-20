-- Run this to see stuck users (users with no company)
SELECT
  u.id as user_id,
  u.email,
  u.created_at,
  cm.company_id,
  cm.role
FROM auth.users u
LEFT JOIN company_members cm ON u.id = cm.user_id
WHERE cm.company_id IS NULL
ORDER BY u.created_at DESC;

-- If you want to delete the stuck user and start over:
-- (Replace the email with your actual email)
-- DELETE FROM auth.users WHERE email = 'your-email@example.com';
