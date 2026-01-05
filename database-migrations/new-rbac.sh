#!/usr/bin/env bash

# ^(?!.*--).*core.*health.*

# Check if exactly one argument is provided
if [ "$#" -ne 1 ]; then
    echo "Error: Script requires exactly one argument"
    echo "Usage: $0 lowercase.alphanumeric.words"
    exit 1
fi

# Store the argument
NAME="rbac_$1"

# If all checks pass, echo success and the validated argument
echo "Valid argument: $NAME"

SOURCE_FILE="./templates/rbac.template.sql"

chmod 755 new-migration-file.sh

MIGRATION_FILE=$(./new-migration-file.sh $NAME)

echo $SOURCE_FILE
echo $MIGRATION_FILE

cp $SOURCE_FILE $MIGRATION_FILE

exit 0