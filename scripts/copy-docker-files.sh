# copy files so augur.js is consistant with docker image
IMAGE="augurproject/dev-pop-geth:latest"
TEMP1="./temp.file"
ADD_TEMP2="./temp2.file"
BLOCK_TEMP2=".temp3.file"
ADDRESSES="./src/contracts/addresses.json"
BLOCKS="./src/contracts/upload-block-numbers.json"

docker run --rm --entrypoint cat $IMAGE /augur.js/src/contracts/addresses.json > $TEMP1
node ./scripts/merge-json-files -p $ADDRESSES -s $TEMP1 -o $ADD_TEMP2
ADD_RESULT_CODE=$?

docker run --rm --entrypoint cat $IMAGE /augur.js/src/contracts/upload-block-numbers.json > $TEMP1
node ./scripts/merge-json-files -p $BLOCKS -s $TEMP1 -o $BLOCK_TEMP2
ADD_BLOCK_CODE=$?

if [ $ADD_RESULT_CODE -eq 1 ]; then
 echo 'ERROR occurred in updating Addresses.json file'
 exit
fi

if [ $ADD_BLOCK_CODE -eq 1 ]; then
 echo 'ERROR occurred in updating upload-block-numbers.json file'
 exit
fi

cat $ADD_TEMP2 > $ADDRESSES
cat $BLOCK_TEMP2 > $BLOCKS
rm -rf $TEMP1 $ADD_TEMP2 $BLOCK_TEMP2
