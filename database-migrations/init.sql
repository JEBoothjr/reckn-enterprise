-- Migrator user (full control)
CREATE USER migrator_user WITH PASSWORD 'S3cret';
CREATE DATABASE reckn OWNER migrator_user;

\c reckn

-- Service user (data only)
CREATE USER service_user WITH PASSWORD 'S3cret';

ALTER SCHEMA public OWNER TO migrator_user;
GRANT CONNECT ON DATABASE reckn TO service_user;
GRANT USAGE ON SCHEMA public TO service_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_user;
ALTER DEFAULT PRIVILEGES FOR USER migrator_user GRANT USAGE ON SCHEMAS TO service_user;
ALTER DEFAULT PRIVILEGES FOR USER migrator_user GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_user;
ALTER DEFAULT PRIVILEGES FOR USER migrator_user GRANT USAGE ON SEQUENCES TO service_user;