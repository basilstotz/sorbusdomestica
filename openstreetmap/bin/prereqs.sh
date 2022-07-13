#!/bin/sh

if false; then

if test -n "$(which puavo-conf)"; then
    NPM_PACKAGES="$HOME/.npm-packages"
    mkdir -p "$NPM_PACKAGES"
    echo "prefix = $NPM_PACKAGES" >> ~/.npmrc

    cat <<EOF >>./bashrc
# Tell our environment about user-installed node tools
PATH="$NPM_PACKAGES/bin:$PATH"
# Unset manpath so we can inherit from /etc/manpath via the `manpath` command
#unset MANPATH  # delete if you already modified MANPATH elsewhere in your configuration
#MANPATH="$NPM_PACKAGES/share/man:$(manpath)"

# Tell Node about these packages
NODE_PATH="$NPM_PACKAGES/lib/node_modules:$NODE_PATH"
EOF

fi

fi

cd
npm install query-overpass
npm install @mapbox/geojson-merge

#if test -z "$(which pip3)";then
#   sudo apt install python3-pip
#fi

#some tools
pip install sqlite-utils
pip install geojson-to-sqlite


#datasette
pip install datasette
#pip install datasette-render-images
datasette install datasette-geojson-map
datasette install datasette-cluster-map
datasette install datasette-leaflet-geojson


