pipeline {
  agent any

  environment {
    // Change these to your values
    REGISTRY = 'docker.io'
    DOCKERHUB_NAMESPACE = 'your-dockerhub-username'
    BACKEND_IMAGE = "${env.DOCKERHUB_NAMESPACE}/feedback-backend"
    FRONTEND_IMAGE = "${env.DOCKERHUB_NAMESPACE}/feedback-frontend"
    GIT_BRANCH_BUILD = 'main'
    DEPLOY_HOST = 'your.server.hostname'
    DEPLOY_USER = 'ubuntu'
    PROJECT_DIR = '/opt/feedbackapp' // directory on server where repo lives
    NODEJS_TOOL = 'Node 18'
    MAVEN_TOOL = 'Maven 3.9.6'
  }

  options {
    skipDefaultCheckout(true)
    timestamps()
  }

  tools {
    nodejs "${env.NODEJS_TOOL}"
    maven "${env.MAVEN_TOOL}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout([$class: 'GitSCM',
          branches: [[name: "*/${env.GIT_BRANCH_BUILD}"]],
          userRemoteConfigs: [[
            url: 'https://github.com/23tank/feedback-system.git'
          ]]
        ])
      }
    }

    stage('Maven Build & Test') {
      steps {
        script {
          // Use Maven to build and test the entire project
          sh './mvnw clean compile -Pci'
          
          // Run tests using Maven
          sh './mvnw test -Pci'
          
          // Build frontend and backend using Maven
          sh './mvnw package -Pci -DskipDocker=true'
        }
      }
    }

    stage('Docker Login') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker_registry_creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
        }
      }
    }

    stage('Docker Build & Push') {
      steps {
        script {
          // Build Docker images using Maven Docker plugin
          sh './mvnw clean package -Pdocker'
          
          // Tag and push images
          sh "docker tag ${BACKEND_IMAGE}:${env.BUILD_NUMBER} ${BACKEND_IMAGE}:latest"
          sh "docker tag ${FRONTEND_IMAGE}:${env.BUILD_NUMBER} ${FRONTEND_IMAGE}:latest"
          
          sh "docker push ${BACKEND_IMAGE}:${env.BUILD_NUMBER}"
          sh "docker push ${FRONTEND_IMAGE}:${env.BUILD_NUMBER}"
          sh "docker push ${BACKEND_IMAGE}:latest"
          sh "docker push ${FRONTEND_IMAGE}:latest"
        }
      }
    }

    stage('Deploy') {
      steps {
        sshagent(credentials: ['deploy_ssh_key']) {
          // Ensure server has repo cloned once: git clone ... ${PROJECT_DIR}
          sh """
            ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} 'cd ${PROJECT_DIR} && git fetch --all && git checkout ${GIT_BRANCH_BUILD} && git pull'
            ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
            ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} 'cd ${PROJECT_DIR} && docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d'
          """
        }
      }
    }

    stage('Create Deployment Package') {
      steps {
        script {
          // Create deployment package using Maven assembly
          sh './mvnw package -Pprod'
          
          // Archive the deployment package
          archiveArtifacts artifacts: 'target/feedback-system-*.tar.gz, target/feedback-system-*.zip', fingerprint: true
        }
      }
    }
  }

  post {
    always {
      sh 'docker logout || true'
      cleanWs()
    }
    success {
      echo 'Build and deployment completed successfully!'
    }
    failure {
      echo 'Build or deployment failed!'
    }
  }
}
