FROM google/nodejs-runtime
ONBUILD RUN npm install -g bower gulp
ONBUILD RUN bower install --allow-root
