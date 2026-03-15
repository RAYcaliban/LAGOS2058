-- Add positions column to parties for storing the 28-dimension position vector
ALTER TABLE parties ADD COLUMN IF NOT EXISTS positions jsonb DEFAULT NULL;

COMMENT ON COLUMN parties.positions IS 'Array of 28 floats representing party positions on each issue dimension (-5 to +5). Null until set.';
