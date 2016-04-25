#!/bin/sh

PACKAGE=$1
VERSIONS=$(npm view ronn versions | tr -d "'[,]")

cd ../packages

if [ -d "$PACKAGE" ]; then
  echo "Directory $PACKAGE is already exists"
  exit 1
fi

mkdir $PACKAGE && cd $PACKAGE

echo "Creating version folders for $PACKAGE"

for version in $VERSIONS; do mkdir $version && cd $version &&
    npm init -f && npm install $PACKAGE@$version --save &&
    find . -name '*node_modules' -mindepth 2 -type d -exec rm -rf {} \; &&
    cd ..;
done

echo "Done."
