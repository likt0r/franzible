#/bin/bash
pushd backend
npm run docker
popd
pushd frontend
npm run docker
