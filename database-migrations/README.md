# database-migrations

The database migration system uses Flyway. It has a strict file naming convention. A bash script is available to help ensure that the convention is followed.

All of the migration are tracked in the `public.flyway_schema_history` table in the database.

Details can be found here: https://www.red-gate.com/blog/database-devops/flyway-naming-patterns-matter

This system is set up to run locally as well as on AWS via GitHub actions.

# Creating a Migration File

Create a migration file with the required naming convention.
Example:

`V2025.02.21.124500__my_migration_script.yml`

The first portion, prior to the double underscore is in a format that:

- Flyway accepts
- Creates a clean order of applying
- Is easily understood
- Helps with uniqueness to all other migration files

The structure of the first portion is as follows:

- `V` - Required by Flyway to denote a 'Versioned Migration'
- `2025` - The current year
- `02` - The current month
- `21` - The current day
- `124500` - The current time of file creation (including seconds) in UTC

The double underscore `__` is required by Flyway to separate the version from the note

The second portion, after the double underscore is a note. It must be alpha-numeric and can include spaces. Spaces are converted to underscores by Flyway.

Usage:

`./create_migration.sh "my migration script"`

To create a data migration, use the following steps:

Run:

```
bash create-migration-file.sh "my short note"
```

## Arguments

The short note must be in quotes, ie "creates a new integrations table" and alpha-numeric with spaces, only.

Example:

```
bash create-migration-file.sh "creates new integrations table"
```

> The note is required

The above command will create an empty file in the `./migrations` folder similar to this:

`V2025.02.21.124500__creates_new_integrations_table.yml`

This file must be unique to ALL files the migrations folder and any subfolder. This script simply helps to avoid those collisions while adhereing to the Flyway naming convention requirements.

## Running Migrations

The ordering of script run is determined by eveything before the "__" in the name. If we need to coordinate script order, we can feel free to manually modify the names or combine the scripts, however we must be careful with manually manipulating the file name as the Flyway naming convention is strict.

> Only modify the `time` component of the file name as other portions are useful for audit purposes.

You can run `bash execute-validate.sh` to validate it with Flyway (See `Other Executions` below)

> Flyway will run all migrations that it not currently tracking, in file name order.

### Running Migrations Locally

Do a pull to make sure the repo has the latest files and run the following:

```
bash execute-migration.sh
```

This will run Docker and execute the migrations in the folder against your local database.

### Running Migrations In AWS

The following diagram shows the steps:

1. Go to the https://github.com/jeboothjr/database-migrations repo
2. Click on the `Actions` tab
3. On the left are the workflows. Select `Execute Migrate`
4. Click the `Run workflow` dropdown
5. Leave the branch as main. I wouldn't recommend running from a branch and you can't in QA, UAT or Prod.
6. Select a delay if you like.
7. Click the Green `run workflow` button
8. Wait for the job to complete.

<p align="center">
  <img src="./docs/diagrams/out/migration.sequence.png"/>
</p>

## Supported Executions

There are othes executions available. Each are contained in their own Docker file for AWS and script for local development. There are teams and branch permissions associated with each one.

### baseline

> The Baseline command is intended to make it easy to turn any preexisting production database into a Flyway database so that, subsequently, versioned migrations can then be applied to it, bringing greater stability and predictability to database deployments.

Locally: `bash execute-baseline.sh`

AWS: `Execute Baseline` workflow

| Environment  | Team    | Branch  |
| ------------ | ------- | ------- |
| development  | devops  | main    |
| qa           | devops  | main    |
| uat          | devops  | main    |
| production   | devops  | main    |


You can read more here: https://www.red-gate.com/hub/product-learning/flyway/flyways-baseline-command-explained-simply

### Info

> If you need the current version of your Flyway database, and a history of the changes that were applied to build that version, then the info command is the place to go. It allows you to review applied and pending migrations, track migration status, and troubleshoot any issues that may have occurred during the migration process.

Locally: `bash execute-info.sh`

AWS: `Execute Info` workflow

| Environment  | Team         | Branch  |
| ------------ | ------------ | ------- |
| development  | engineering  | any     |
| qa           | engineering  | any     |
| uat          | engineering  | main    |
| production   | engineering  | main    |

You can read more here: https://www.red-gate.com/hub/product-learning/flyway/the-flyway-info-command-explained-simply

### Validate

> The Validate command aims to ensure that Flyway can reliably reproduce an existing version of a database from the source migration scripts by warning you if files are retrospectively added, removed or altered that would prevent it from doing so. Validation errors are Flyway's warning that "the source for this version has changed".

Locally: `bash execute-validate.sh`

AWS: `Execute Validate` workflow

| Environment  | Team         | Branch  |
| ------------ | ------------ | ------- |
| development  | engineering  | any     |
| qa           | engineering  | any     |
| uat          | engineering  | main    |
| production   | engineering  | main    |

You can read more here: https://www.red-gate.com/hub/product-learning/flyway/flyways-validate-command-explained-simply

### Migrate

> The 'Migrate' command automates the process of applying the database schema changes that are defined in migration scripts, while Flyway tracks the version of every copy of the database. This makes it much easier to maintain consistency across different database environments, and so facilitates continuous integration, continuous deployment, and database version control practices.

Locally: `bash execute-validate.sh`

AWS: `Execute Validate` workflow

| Environment  | Team         | Branch  |
| ------------ | ------------ | ------- |
| development  | engineering  | main    |
| qa           | qa-team      | main    |
| uat          | qa-team      | main    |
| production   | qa-team      | main    |

You can read more here: https://www.red-gate.com/hub/product-learning/flyway/the-flyway-migrate-command-explained-simply

