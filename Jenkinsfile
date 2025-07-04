pipeline {
  agent {
    docker {
      image 'aquasec/trivy' // Specify the Trivy Docker image
      args '-v $(pwd):/app' // Mount the current workspace into the container
    }
  }
  tools {
    jdk 'jdk21'
    nodejs 'node24'
  }
  environment {
    SCANNER_HOME = tool 'sonar-scanner'
    APP_NAME = 'nextjs15-upscale-banking'
    RELEASE = '1.0.0'
    DOCKER_USER = 'xjohnfit'
    DOCKER_PASS = 'dockerhub'
    IMAGE_NAME = "${DOCKER_USER}" + "/" + "${APP_NAME}"
    IMAGE_TAG = "${RELEASE}-${BUILD_NUMBER}"
  }
  stages {
    stage('Clean Workspace') {
      steps {
        cleanWs()
      }
    }
    stage('Checkout from Git') {
      steps {
        git branch: 'main', url: 'https://github.com/xjohnfit/nextjs15-upscale-banking'
      }
    }
    stage("Sonarqube Analysis") {
      steps {
        withSonarQubeEnv('sonarqube-server') {
          sh '''$SCANNER_HOME/bin/sonar-scanner -Dsonar.projectName=Upscale-Banking \
          -Dsonar.projectKey=Upscale-Banking'''
        }
      }
    }
    stage("Quality Gate") {
      steps {
        script {
          waitForQualityGate abortPipeline: false, credentialsId: 'Sonarqube-Token'
        }
      }
    }
    stage('Install Dependencies') {
      steps {
        sh "npm install"
      }
    }
    stage('Trivy Scan') {
      steps {
        sh 'docker run --rm -v $(pwd):/app aquasec/trivy fs . > trivyfs.txt'
      }
    }
    stage('Archive Report') {
      steps {
        archiveArtifacts artifacts: 'trivyfs.txt', fingerprint: true
      }
    }
  }
}
