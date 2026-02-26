BEGIN;

-- 1. Modify User 7 to release unique constraints
UPDATE users 
SET username = username || '_7_old', 
    email = email || '_7_old',
    discord_nickname = CASE WHEN discord_nickname IS NOT NULL THEN discord_nickname || '_7_old' ELSE NULL END,
    minecraft_nickname = CASE WHEN minecraft_nickname IS NOT NULL THEN minecraft_nickname || '_7_old' ELSE NULL END
WHERE id = 7;

-- 2. Create the brand new User 67 entry
INSERT INTO users (id, username, password, email, discord_nickname, minecraft_nickname, role, avatar_url, banned, in_season, ban_reason, email_verified, email_verification_token, email_verification_token_expiry, totp_enabled, totp_secret, reset_password_token, reset_password_token_expiry, bio, is_player, discord_user_id, discord_verified, discord_oauth_state, in_discord, registration_ip, registration_user_agent, last_login_ip1, last_login_user_agent1, last_login_ip2, last_login_user_agent2)
SELECT 67, 
    replace(username, '_7_old', ''), 
    password, 
    replace(email, '_7_old', ''), 
    replace(discord_nickname, '_7_old', ''), 
    replace(minecraft_nickname, '_7_old', ''), 
    role, avatar_url, banned, in_season, ban_reason, email_verified, email_verification_token, email_verification_token_expiry, totp_enabled, totp_secret, reset_password_token, reset_password_token_expiry, bio, is_player, discord_user_id, discord_verified, discord_oauth_state, in_discord, registration_ip, registration_user_agent, last_login_ip1, last_login_user_agent1, last_login_ip2, last_login_user_agent2
FROM users WHERE id = 7;

-- 3. Point all dependent records to the new ID 67
UPDATE applications SET user_id = 67 WHERE user_id = 7;
UPDATE user_badges SET user_id = 67 WHERE user_id = 7;
UPDATE warnings SET user_id = 67 WHERE user_id = 7;
UPDATE warnings SET issued_by_id = 67 WHERE issued_by_id = 7;
UPDATE audit_logs SET actor_id = 67 WHERE actor_id = 7;
UPDATE audit_logs SET target_user_id = 67 WHERE target_user_id = 7;

-- 4. Clean up original User 7 record
DELETE FROM users WHERE id = 7;

-- 5. Advance the ID sequence so new registrations don't collide with 67
-- This ensures the next automatic ID will be 68 if 67 is currently the highest.
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));

COMMIT;
