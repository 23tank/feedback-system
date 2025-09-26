# Maven Integration Test Guide

## Quick Test Commands

### 1. Verify Maven Wrapper
```bash
# Test Maven wrapper (should show Maven version)
./mvnw --version

# On Windows
mvnw.cmd --version
```

### 2. Test Basic Maven Operations
```bash
# Clean and validate (no actual build)
./mvnw clean validate

# Compile without tests or Docker
./mvnw clean compile -DskipTests -DskipDocker

# Test only (if you have tests)
./mvnw test -DskipDocker
```

### 3. Test Docker Integration
```bash
# Build Docker images using Maven
./mvnw clean package -Pdocker

# Check if images were created
docker images | grep feedback
```

### 4. Test Deployment Package
```bash
# Create deployment package
./mvnw clean package -Pprod

# Check if packages were created
ls -la target/feedback-system-*
```

## Verification Checklist

- [ ] Maven wrapper executes without errors
- [ ] Node.js builds work through Maven
- [ ] Docker images are created correctly
- [ ] Deployment packages are generated
- [ ] Existing npm scripts still work
- [ ] Docker Compose still works for development

## Expected Outputs

### Maven Build
- Frontend built to `frontend/dist/`
- Backend dependencies installed
- Docker images tagged correctly
- Deployment packages in `target/`

### No Interference
- `npm run dev` still works
- `npm run build` still works
- `docker-compose up` still works
- All existing scripts function normally
