pipeline {
    agent any
    environment {
        // Define environment variables if needed
        DEPLOY_USER = 'ec2-user'
        DEPLOY_HOST = '51.20.54.216'
        DEPLOY_PATH = '/home/ec2-user/build'
    }
    stages {
        stage('Checkout') {
            steps {
                script {
                    // Checkout using the credentials stored in Jenkins
                    git branch: 'main', url: 'https://github.com/waseemAnsari11011/sevaBazar_panel.git', credentialsId: 'b51d9fa8-595c-4d12-abcc-4b22263b10bf'
                }
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        stage('Deploy') {
            steps {
                script {
                    // Clean up old build files on the server
                    sh "ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} 'rm -rf ${DEPLOY_PATH}/*'"
                    // Rsync the new build files to the server
                    sh "rsync -avz -e 'ssh -o StrictHostKeyChecking=no' ./build/ ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"
                }
            }
        }
    }
    post {
        success {
            echo 'Deployment succeeded!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}
