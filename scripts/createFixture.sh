#!/bin/bash

CURRENT_DIR=`dirname $0`
PACKAGE=$1
VERSIONS=$(npm view $PACKAGE versions | tr -d "'[,]")

cd $CURRENT_DIR/../packages

if [ -z "$PACKAGE" ]; then
  echo -e "missing package name parameter\nusage: ./createFixture.sh <packgeName>"
  exit 1
fi

mkdir -p $PACKAGE && cd $PACKAGE

echo "Creating fixture for package: $PACKAGE"

for version in $VERSIONS;
    do
    if [ -d "$version" ]; then
      echo "version $version of package $PACKAGE is already exists"
      continue
    fi
    mkdir $version
    cd $version
    npm init -f
    npm install $PACKAGE@$version --save
    find . -name '*node_modules' -mindepth 2 -type d -exec rm -rf {} \;
    cd ..;
done

echo "Done."
