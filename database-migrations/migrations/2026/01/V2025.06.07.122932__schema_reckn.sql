CREATE SCHEMA app AUTHORIZATION migrator_user;
GRANT USAGE ON SCHEMA app TO service_user;
ALTER DEFAULT PRIVILEGES FOR USER migrator_user IN SCHEMA app GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_user;
ALTER DEFAULT PRIVILEGES FOR USER migrator_user IN SCHEMA app GRANT USAGE ON SEQUENCES TO service_user;

-- ######################
-- factor_groups
-- ######################

CREATE TABLE app.factor_groups (
  id UUID PRIMARY KEY DEFAULT generate_uuid_v7(),
  user_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  consistency_ratio DOUBLE PRECISION,
  is_consistent BOOLEAN,
  is_prioritized BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES identity.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_factor_groups__user_id ON app.factor_groups(user_id);

CREATE TRIGGER update_timestamp
BEFORE UPDATE ON app.factor_groups
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ######################
-- factors
-- ######################

CREATE TABLE app.factors (
  id UUID PRIMARY KEY DEFAULT generate_uuid_v7(),
  user_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES identity.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_factors__user_id ON app.factors(user_id);

CREATE TRIGGER update_timestamp
BEFORE UPDATE ON app.factors
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ######################
-- factor_groups__factors
-- ######################

CREATE TABLE app.factor_groups__factors (
  id UUID PRIMARY KEY DEFAULT generate_uuid_v7(),
  user_id UUID,
  factor_group_id UUID NOT NULL,
  factor_id UUID NOT NULL,
  engine TEXT,
  weight DOUBLE PRECISION,
  inconsistency DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES identity.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_factor_group FOREIGN KEY (factor_group_id) REFERENCES app.factor_groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_factor FOREIGN KEY (factor_id) REFERENCES app.factors(id),

  CONSTRAINT unique_factor_group__factor UNIQUE (factor_group_id, factor_id)
);

CREATE INDEX idx_factor_groups__factors__user_id ON app.factor_groups__factors(user_id);
CREATE INDEX idx_factor_groups__factors__factor_set_id ON app.factor_groups__factors(factor_group_id);
CREATE INDEX idx_factor_groups__factors__factor_id ON app.factor_groups__factors(factor_id);

CREATE TRIGGER update_timestamp
BEFORE UPDATE ON app.factor_groups__factors
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ######################
-- comparisons
-- ######################

CREATE TYPE app.comparisons__preferred AS ENUM ('A', 'B', 'EQUAL');
CREATE TYPE app.comparisons__requirement_level AS ENUM ('REQUIRED', 'RECOMMENDED', 'OPTIONAL');

CREATE TABLE app.comparisons (
  id UUID PRIMARY KEY DEFAULT generate_uuid_v7(),
  user_id UUID NOT NULL,
  factor_group_id UUID NOT NULL,
  description TEXT,
  factor_a_id UUID NOT NULL,
  factor_b_id UUID NOT NULL,
  preferred app.comparisons__preferred,
  requirement_level app.comparisons__requirement_level NOT NULL DEFAULT 'REQUIRED',
  strength INTEGER CHECK (strength BETWEEN 1 AND 9),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES identity.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_factor_group FOREIGN KEY (factor_group_id) REFERENCES app.factor_groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_factor_a FOREIGN KEY (factor_a_id) REFERENCES app.factors(id),
  CONSTRAINT fk_factor_b FOREIGN KEY (factor_b_id) REFERENCES app.factors(id),
  CONSTRAINT unique_factor_group_comparison UNIQUE (factor_group_id, factor_a_id, factor_b_id)
);

CREATE INDEX idx_comparisons__user_id ON app.comparisons(user_id);
CREATE INDEX idx_comparisons__factor_group_id ON app.comparisons(factor_group_id);

CREATE TRIGGER update_timestamp
BEFORE UPDATE ON app.comparisons
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ######################
-- questions
-- ######################

CREATE TABLE app.questions (
  id UUID PRIMARY KEY DEFAULT generate_uuid_v7(),
  user_id UUID NOT NULL,
  factor_group_id UUID,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES identity.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_factor_group FOREIGN KEY (factor_group_id) REFERENCES app.factor_groups(id) ON DELETE CASCADE
);

CREATE INDEX idx_questions__user_id ON app.questions(user_id);
CREATE INDEX idx_questions__factor_group_id ON app.questions(factor_group_id);

CREATE TRIGGER update_timestamp
BEFORE UPDATE ON app.questions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ######################
-- evaluations
-- ######################

CREATE TABLE app.evaluations (
  id UUID PRIMARY KEY DEFAULT generate_uuid_v7(),
  user_id UUID NOT NULL,
  question_id UUID NOT NULL,
  factor_id UUID NOT NULL,
  description TEXT,
  weight DOUBLE PRECISION NOT NULL,
  probability JSONB NOT NULL,
  impact JSONB NOT NULL,
  frequency JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES identity.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_question FOREIGN KEY (question_id) REFERENCES app.questions(id) ON DELETE CASCADE,
  CONSTRAINT fk_factor FOREIGN KEY (factor_id) REFERENCES app.factors(id) ON DELETE CASCADE
);

CREATE INDEX idx_evaluations__user_id ON app.evaluations(user_id);
CREATE INDEX idx_evaluations__question_id ON app.evaluations(question_id);
CREATE INDEX idx_evaluations__factor_id ON app.evaluations(factor_id);

CREATE TRIGGER update_timestamp
BEFORE UPDATE ON app.evaluations
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ######################
-- decisions
-- ######################

CREATE TABLE app.decisions (
  id UUID PRIMARY KEY DEFAULT generate_uuid_v7(),
  user_id UUID NOT NULL,
  question_id UUID NOT NULL,
  engine TEXT NOT NULL,
  score JSONB NOT NULL,
  data JSONB,
  notes TEXT,
  rating INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES identity.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_question FOREIGN KEY (question_id) REFERENCES app.questions(id) ON DELETE CASCADE
);

CREATE INDEX idx_decisions__user_id ON app.decisions(user_id);
CREATE INDEX idx_decisions__question_id ON app.decisions(question_id);

CREATE TRIGGER update_timestamp
BEFORE UPDATE ON app.decisions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ######################
-- snapshots
-- ######################

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE app.snapshots (
  id UUID PRIMARY KEY DEFAULT generate_uuid_v7(),
  user_id UUID NOT NULL,
  question_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  snapshot JSONB NOT NULL,           -- the full frozen decision
  hash TEXT NOT NULL,                -- SHA256 of the snapshot for tamper detection
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES identity.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_question FOREIGN KEY (question_id) REFERENCES app.questions(id)
);

-- ######################
-- configurations
-- ######################

CREATE TABLE app.configurations (
  id UUID PRIMARY KEY DEFAULT generate_uuid_v7(),
  user_id UUID,
  type TEXT NOT NULL,         -- e.g., "RISK_BANDS", "SCORING_CONSTANTS"
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES identity.users(id) ON DELETE CASCADE,
  CONSTRAINT unique_type__name__version__user UNIQUE (type, name, version)
);