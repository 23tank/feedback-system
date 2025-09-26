# Maven Integration for Feedback Management System

This document explains how to use Maven with your existing Node.js project for enhanced CI/CD capabilities in Jenkins.

## Overview

The Maven integration provides:
- **Unified build system** for both frontend and backend
- **Docker image building** through Maven plugins
- **Deployment packages** creation
- **Jenkins-friendly** build process
- **No disruption** to existing Node.js workflows

## Project Structure

```
├── pom.xml                          # Main Maven configuration
├── mvnw                            # Maven wrapper (Unix)
├── mvnw.cmd                        # Maven wrapper (Windows)
├── .mvn/
│   ├── wrapper/
│   │   ├── maven-wrapper.jar       # Auto-downloaded
│   │   └── maven-wrapper.properties
│   └── jvm.config                   # JVM settings
├── src/assembly/
│   └── deployment.xml              # Deployment package configuration
└── Jenkinsfile                     # Updated for Maven support
```

## Maven Profiles

### Available Profiles

1. **dev** (default)
   - Skips tests and Docker builds
   - Fast development builds
   - Usage: `./mvnw clean compile`

2. **ci**
   - Runs all tests
   - Builds Docker images
   - Usage: `./mvnw clean package -Pci`

3. **prod**
   - Full production build
   - Creates deployment packages
   - Usage: `./mvnw clean package -Pprod`

4. **docker**
   - Docker-only operations
   - Skips tests, builds images
   - Usage: `./mvnw clean package -Pdocker`

## Common Maven Commands

### Development
```bash
# Clean and compile (fast)
./mvnw clean compile

# Install dependencies only
./mvnw clean install -DskipTests -DskipDocker

# Run tests only
./mvnw test
```

### CI/CD
```bash
# Full CI build
./mvnw clean package -Pci

# Production build with deployment package
./mvnw clean package -Pprod

# Docker-only build
./mvnw clean package -Pdocker
```

### Docker Operations
```bash
# Build Docker images
./mvnw clean package -Pdocker

# Build with specific Docker registry
./mvnw clean package -Pdocker -Ddocker.registry=your-registry.com

# Build with custom image tags
./mvnw clean package -Pdocker -Ddocker.tag=v1.2.3
```

## Jenkins Integration

### Prerequisites
1. **Maven tool** configured in Jenkins (Manage Jenkins → Tools)
2. **Node.js tool** configured in Jenkins
3. **Docker** available on Jenkins agents
4. **Credentials** for Git, Docker registry, and SSH

### Jenkins Configuration

1. **Install Maven Tool**:
   - Go to Manage Jenkins → Tools
   - Add Maven installation (e.g., "Maven 3.9.6")
   - Use "Install automatically" or specify path

2. **Update Jenkinsfile**:
   - The provided Jenkinsfile supports both Maven and Node.js
   - Uses Maven for unified build process
   - Falls back to Node.js for specific operations

### Jenkins Pipeline Features

- **Unified Build**: Single Maven command builds everything
- **Parallel Execution**: Frontend and backend build in parallel
- **Docker Integration**: Automatic image building and pushing
- **Deployment Packages**: Creates tar.gz and zip archives
- **Artifact Management**: Archives deployment packages

## Configuration

### Docker Registry Settings

Update these properties in `pom.xml`:

```xml
<properties>
    <docker.registry>docker.io</docker.registry>
    <docker.namespace>your-dockerhub-username</docker.namespace>
    <docker.backend.image>${docker.namespace}/feedback-backend</docker.backend.image>
    <docker.frontend.image>${docker.namespace}/feedback-frontend</docker.frontend.image>
</properties>
```

### Node.js Versions

Update Node.js and npm versions in `pom.xml`:

```xml
<properties>
    <node.version>18.19.0</node.version>
    <npm.version>10.2.3</npm.version>
</properties>
```

## Deployment Packages

Maven creates deployment packages containing:
- All source code (excluding node_modules, target, .git)
- Package.json files
- Docker files (Dockerfile, docker-compose.yml)
- Deployment scripts (deploy.sh, update.sh)
- Nginx configuration
- Database schema
- Documentation

### Package Formats
- `feedback-system-{version}.tar.gz`
- `feedback-system-{version}.zip`

## Troubleshooting

### Common Issues

1. **Maven Wrapper Not Found**
   ```bash
   # Make wrapper executable
   chmod +x mvnw
   ```

2. **Node.js Version Conflicts**
   - Maven downloads and uses specified Node.js version
   - Doesn't interfere with system Node.js

3. **Docker Build Failures**
   - Ensure Docker daemon is running
   - Check Dockerfile paths in pom.xml
   - Verify Docker registry credentials

4. **Memory Issues**
   - Adjust JVM settings in `.mvn/jvm.config`
   - Increase heap size: `-Xmx2048m`

### Debug Commands

```bash
# Verbose Maven output
./mvnw clean package -X

# Debug Docker builds
./mvnw clean package -Pdocker -Ddocker.verbose=true

# Skip specific phases
./mvnw clean package -DskipTests -DskipDocker
```

## Benefits

### For Development
- **Consistent builds** across environments
- **Faster CI/CD** with parallel execution
- **Unified tooling** for complex projects
- **Better dependency management**

### For Jenkins
- **Simplified pipeline** with single build command
- **Better artifact management**
- **Easier debugging** with Maven logs
- **Standardized build process**

### For Deployment
- **Deployment packages** ready for distribution
- **Docker images** with proper tagging
- **Environment-specific** configurations
- **Rollback capabilities**

## Migration Guide

### Existing Workflows
Your existing Node.js workflows remain unchanged:
- `npm run dev` - Still works for development
- `npm run build` - Still works for frontend builds
- `docker-compose up` - Still works for local development

### New Capabilities
- `./mvnw clean package` - Builds everything
- `./mvnw test` - Runs all tests
- `./mvnw package -Pprod` - Creates deployment packages

## Best Practices

1. **Use Maven for CI/CD**, Node.js for development
2. **Keep profiles simple** - one purpose per profile
3. **Use Maven wrapper** for consistent builds
4. **Archive deployment packages** in Jenkins
5. **Test Docker builds** locally before CI/CD
6. **Monitor build times** and optimize as needed

## Support

For issues with Maven integration:
1. Check Maven logs: `./mvnw clean package -X`
2. Verify Node.js and Docker installations
3. Test individual profiles: `./mvnw clean package -Pci`
4. Check Jenkins console output for detailed logs
