#!/bin/sh
set -e
DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$DIR/../application"
java -Dfile.encoding=UTF-8 -jar "./NativeApplication.jar"
