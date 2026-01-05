#!/usr/bin/env bash

# ^(?!.*--).*core.*health.*

# Check if exactly one argument is provided
if [ "$#" -ne 1 ]; then
    echo "Error: Script requires exactly one argument"
    echo "Usage: $0 lowercase.alphanumeric.words"
    exit 1
fi

# Store the argument
NAME="$1"

# Check if the input contains uppercase letters
if echo "$NAME" | grep -q "[[:upper:]]"; then
    echo "Error: Argument must be lowercase"
    exit 1
fi

# Check if the input contains only lowercase letters, numbers, dots and underscores
if ! echo "$NAME" | grep -q "^[a-z0-9._]*$"; then
    echo "Error: Argument can only contain lowercase letters, numbers, dots and underscores"
    exit 1
fi

# Check if the input starts or ends with a dot
if ["$NAME" =~ ^\..*$ || "$NAME" =~ ^.*\.$ ]; then
    echo "Error: Argument cannot start or end with a dot"
    exit 1
fi

# Check if the input contains consecutive dots
if echo "$NAME" | grep -q "\.\."; then
    echo "Error: Argument cannot contain consecutive dots"
    exit 1
fi

# If all checks pass, echo success and the validated argument
echo "Valid argument: $NAME"

SOURCE_FILE="./templates/table.template.sql"

chmod 755 new-migration-file.sh

MIGRATION_FILE=$(./new-migration-file.sh $NAME)

echo $SOURCE_FILE
echo $MIGRATION_FILE

cp $SOURCE_FILE $MIGRATION_FILE

exit 0
