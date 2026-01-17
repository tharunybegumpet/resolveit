-- Check all escalations
SELECT 
    e.id,
    e.complaint_id,
    c.title as complaint_title,
    e.escalated_by_id,
    u1.full_name as escalated_by,
    e.escalated_to_id,
    u2.full_name as escalated_to,
    e.reason,
    e.status,
    e.created_at
FROM escalations e
LEFT JOIN complaints c ON e.complaint_id = c.id
LEFT JOIN users u1 ON e.escalated_by_id = u1.id
LEFT JOIN users u2 ON e.escalated_to_id = u2.id
ORDER BY e.created_at DESC;

-- Check if there are any managers in the system
SELECT id, email, full_name, role 
FROM users 
WHERE role = 'MANAGER';

-- Check complaint1 details
SELECT id, title, status_id, assigned_to_id, category
FROM complaints
WHERE id = 1;
