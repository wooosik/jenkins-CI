node {
    // 환경 변수 설정
    def dockerImageName = "wooosik/agorafront"
    def dockerTag = "1.0"  // 또는 "1.0-${env.BUILD_NUMBER}"와 같이 빌드 번호를 포함할 수 있음
    def dockerRegistryUrl = ""

    try {
        stage('Clone repository'){
            git credentialsId: 'git-access', url: 'https://github.com/wooosik/jenkins-CI.git'
        }

        stage('Build image'){
            dockerImage = docker.build("${dockerImageName}:${dockerTag}")
        }

        stage('Push Image') {
            withDockerRegistry([ credentialsId: "docker-access", url: dockerRegistryUrl ]) {
                dockerImage.push()
            }
        }

    } catch (Exception e) {
        currentBuild.result = 'FAILURE'
        echo "An error occurred: ${e.getMessage()}"
        throw e
    }
}

