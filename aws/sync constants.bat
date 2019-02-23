cd constants
aws s3 sync . s3://completejudging-constants --acl public-read

exit
