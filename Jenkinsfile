pipeline {
    agent any
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
        stage("SonarQube Analysis") {
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
                    waitForQualityGate abortPipeline: false, credentialsId: 'sonarqube-token'
                }
            }
        }
        stage('Install Dependencies') {
            steps {
                sh "npm install"
            }
        }
	    stage('Owasp Fs Scan') {
	        steps {
                dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit', odcInstallation: 'dp-check'
                dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
            }
        }
        stage('Trivy Scan') {
            steps {
                sh "trivy fs . > trivyfs.txt"
            }
        }
        stage("Build & Push Docker Image") {
            steps {
                script {
                    docker.withRegistry('', DOCKER_PASS) {
                        docker_image = docker.build "${IMAGE_NAME}"
                    }
                    docker.withRegistry('', DOCKER_PASS) {
                        docker_image.push("${IMAGE_TAG}")
                        docker_image.push('latest')
                    }
                }
            }
        }
        stage("Trivy Image Scan") {
	        steps {
                script {
	                sh ('docker run -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image xjohnfit/nextjs15-upscale-banking:latest --no-progress --scanners vuln  --exit-code 0 --severity HIGH,CRITICAL --format table > trivyimage.txt')
                }
            }
        }
	    stage('Cleanup Artifacts') {
	        steps {
                script {
                    sh "docker rmi ${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker rmi ${IMAGE_NAME}:latest"
                }
            }
        }
        stage("Update Kubernetes Deployment for ArgoCD") {
            steps {
                script {
                    sh """
                    git config --global user.name "John Rocha"
                    git config --global user.email "xjohnfitcodes@gmail.com"

                    # Update image tag in deployment YAML
                    sed -i 's|image: .*/nextjs15-upscale-banking:.*|image: xjohnfit/nextjs15-upscale-banking:${IMAGE_TAG}|g' kubernetes/deployment.yaml

                    git add kubernetes/deployment.yaml
                    git commit -m "Update deployment image to ${IMAGE_TAG} via Jenkins"
                    git push origin main
                    """
                }
            }
        }
    }
    post {
      always {
        emailext attachLog: true,
          subject: "'${currentBuild.result}'",
          body: "Project: ${env.JOB_NAME}<br/>" +
          "Build Number: ${env.BUILD_NUMBER}<br/>" +
          "URL: ${env.BUILD_URL}<br/>",
          to: 'xjohnfitcodes@gmail.com',                              
          attachmentsPattern: 'trivyfs.txt,trivyimage.txt'
      }
    }
}
