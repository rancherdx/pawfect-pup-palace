-- Step 1: Add comments to clarify the purpose of the table and its columns.
COMMENT ON TABLE public.third_party_integrations IS 'Stores encrypted credentials and settings for third-party services.';
COMMENT ON COLUMN public.third_party_integrations.service IS 'The canonical name of the service (e.g., ''Square'', ''MailChannels'').';
COMMENT ON COLUMN public.third_party_integrations.environment IS 'The environment for the credentials (e.g., ''production'', ''sandbox'').';
COMMENT ON COLUMN public.third_party_integrations.data_ciphertext IS 'The encrypted JSON blob containing all credentials and settings for the integration, using AES-GCM.';

-- Step 2: Clean up redundant columns.
-- The 'name' column is redundant; 'service' is the canonical identifier.
ALTER TABLE public.third_party_integrations DROP COLUMN IF EXISTS name;

-- The 'id' column is a surrogate key that is no longer needed.
-- We will use the natural composite key (service, environment) as the primary key.
ALTER TABLE public.third_party_integrations DROP COLUMN IF EXISTS id;

-- Step 3: Set the composite natural key as the primary key.
-- The underlying unique index for (service, environment) already exists.
ALTER TABLE public.third_party_integrations
ADD PRIMARY KEY (service, environment);

-- Note: No data migration is performed as analysis concluded the table was
-- created with the correct schema, and any data inserted with the old,
-- insecure frontend would have failed. This migration locks in the secure schema.
