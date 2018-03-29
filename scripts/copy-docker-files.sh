# copy files so augur.js is consistant with docker image
IMAGE="augurproject/dev-pop-geth:latest"
TEMP1="./temp.file"
TEMP2="./temp2.file"
ADDRESSES="./src/contracts/addresses.json"
BLOCKS="./src/contracts/upload-block-numbers.json"

docker run --rm --entrypoint cat $IMAGE /augur.js/src/contracts/addresses.json > $TEMP1
node ./scripts/merge-json-files -p $ADDRESSES -s $TEMP1 -o $TEMP2

if [ $? -eq 1 ]; then
 echo 'ERROR occurred in updating Addresses.json file'
 exit
fi

cat $TEMP2 > $ADDRESSES
rm -rf $TEMP1 $TEMP2

docker run --rm --entrypoint cat $IMAGE /augur.js/src/contracts/upload-block-numbers.json > $TEMP1
node ./scripts/merge-json-files -p $BLOCKS -s $TEMP1 -o $TEMP2

if [ $? -eq 1 ]; then
 echo 'ERROR occurred in updating upload-block-numbers.json file'
 exit
fi

cat $TEMP2 > $BLOCKS
rm -rf $TEMP1 $TEMP2
