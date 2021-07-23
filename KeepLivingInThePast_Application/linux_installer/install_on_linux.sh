#!/bin/sh

set -e
DIR="$( cd "$( dirname "$0" )" && pwd )"
NATIVE_MESSAGING_MANIFEST_JSON_LOCATION="/usr/lib/mozilla/native-messaging-hosts"

# if [ "$(whoami)" = "root" ]; then
  # NATIVE_MESSAGING_MANIFEST_JSON_LOCATION="/usr/lib/mozilla/native-messaging-hosts"
# else
  # NATIVE_MESSAGING_MANIFEST_JSON_LOCATION="~/.mozilla/native-messaging-hosts"
# fi

APPLICATION_HOST_NAME=keep_living_in_the_past_man

# Create native messaging directory in firefox
mkdir -p "$NATIVE_MESSAGING_MANIFEST_JSON_LOCATION"

# copy over the native messaging manifest
HOST_PATH=$DIR/StartNativeApplication.sh
jq --arg HOST_PATH "$HOST_PATH" '.path = $HOST_PATH' "$DIR/$APPLICATION_HOST_NAME.json"|sponge "$NATIVE_MESSAGING_MANIFEST_JSON_LOCATION/$APPLICATION_HOST_NAME.json"

# Update host path in the manifest.
echo "${HOST_PATH}"
ESCAPED_HOST_PATH=HOST_PATH
sed -i -e "s/HOST_PATH/$ESCAPED_HOST_PATH/" "$NATIVE_MESSAGING_MANIFEST_JSON_LOCATION/$APPLICATION_HOST_NAME.json"
# Set permissions for the manifest so that all users can read it.
chmod o+r "$NATIVE_MESSAGING_MANIFEST_JSON_LOCATION/$APPLICATION_HOST_NAME.json"
echo "Native messaging host $APPLICATION_HOST_NAME has been installed."
echo "host manifest path, $NATIVE_MESSAGING_MANIFEST_JSON_LOCATION/$APPLICATION_HOST_NAME.json"
cat "$NATIVE_MESSAGING_MANIFEST_JSON_LOCATION/$APPLICATION_HOST_NAME.json"