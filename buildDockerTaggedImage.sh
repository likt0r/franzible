#/bin/bash
# requirement jq package
show_help()
{
echo "
        Usage: buildDockerImage [-p Project Path] [-d Dockerfile] -u

  
        -u HUB_USER Docker hub user
        For Example: ./buildDockerTaggedImage.sh -p package.json -d Dockerfile

        -h              Help
"
return 1
}

while getopts u:h flag
do
    case "${flag}" in
        
        u) HUB_USER=${OPTARG};;
        h) show_help;;
    esac
done

PROJECT_NAME=$(cat package.json | jq -r '.name')
VERSION=$(cat package.json | jq -r '.version')

IMAGE_NAME=${HUB_USER}/${PROJECT_NAME}
TAG_LATEST=${IMAGE_NAME}:latest
TAG_VERSION=${IMAGE_NAME}:${VERSION}
echo ${PROJECT_NAME}
docker build -t ${TAG_LATEST} -t ${TAG_VERSION} . 
