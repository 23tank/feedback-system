pipeline {
  agent any

  environment {
    // Docker info
    REGISTRY = 'docker.io'
    DOCKERHUB_NAMESPACE = '2300033913' // your Docker Hub username
    BACKEND_IMAGE = "${env.DOCKERHUB_NAMESPACE}/feedback-backend"
    FRONTEND_IMAGE = "${env.DOCKERHUB_NAMESPACE}/feedback-frontend"

    // Git & deploy info
    GIT_BRANCH_BUILD = 'main'
    DEPLOY_HOST = 'your.server.hostname'
    DEPLOY_USER = 'ubuntu'
    PROJECT_DIR = '/opt/feedbackapp'

    // Tools
    NODEJS_TOOL = 'Node 18'
    MAVEN_TOOL = 'Maven 3.9.6'
  }

  options {
    skipDefaultCheckout(true)
    timestamps()
  }

  tools {
    jdk 'Java 21'
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
          bat '.\\mvnw.cmd clean compile -Pci'
          bat '.\\mvnw.cmd test -Pci'
          bat '.\\mvnw.cmd package -Pci -DskipDocker=true'
        }
      }
    }

    stage('Docker Login') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker_registry_creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          bat 'echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin'
        }
      }
    }

    stage('Docker Build & Push') {
      steps {
        script {
          // Build Docker images
          bat "docker build -t %BACKEND_IMAGE%:%BUILD_NUMBER% ./backend"
          bat "docker build -t %FRONTEND_IMAGE%:%BUILD_NUMBER% ./frontend"

          // Tag as latest
          bat "docker tag %BACKEND_IMAGE%:%BUILD_NUMBER% %BACKEND_IMAGE%:latest"
          bat "docker tag %FRONTEND_IMAGE%:%BUILD_NUMBER% %FRONTEND_IMAGE%:latest"

          // Push images
          bat "docker push %BACKEND_IMAGE%:%BUILD_NUMBER%"
          bat "docker push %FRONTEND_IMAGE%:%BUILD_NUMBER%"
          bat "docker push %BACKEND_IMAGE%:latest"
          bat "docker push %FRONTEND_IMAGE%:latest"
        }
      }
    }

    stage('Deploy') {
      steps {
        sshagent(credentials: ['deploy_ssh_key']) {
          bat """
            ssh -o StrictHostKeyChecking=no %DEPLOY_USER%@%DEPLOY_HOST% "cd %PROJECT_DIR% && git fetch --all && git checkout %GIT_BRANCH_BUILD% && git pull"
            ssh -o StrictHostKeyChecking=no %DEPLOY_USER%@%DEPLOY_HOST% "echo '$DOCKER_PASS' | docker login -u '$DOCKER_USER' --password-stdin"
            ssh -o StrictHostKeyChecking=no %DEPLOY_USER%@%DEPLOY_HOST% "cd %PROJECT_DIR% && docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d"
          """
        }
      }
    }

    stage('Create Deployment Package') {
      steps {
        script {
          bat '.\\mvnw.cmd package -Pprod'
          archiveArtifacts artifacts: 'target/feedback-system-*.tar.gz, target/feedback-system-*.zip', fingerprint: true
        }
      }
    }
  }

  post {
    always {
      bat 'docker logout || exit 0'
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
