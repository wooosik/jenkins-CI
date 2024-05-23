node {
    stage('Clone repository'){
        git credentialsId: '[git-access]', url: '[https://github.com/wooosik/jenkins-CI.git]'
    }
    
    stage('Build image'){
        dockerImage = docker.build("[wooosik/agorafront:1.0]")
    }
    
    stage('Push Image') {
        withDockerRegistry([ credentialsId: "[docker-access]", url: "" ]) {
        dockerImage.push()
        }
    }
}
