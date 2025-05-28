# Image Moderation API

A comprehensive FastAPI-based image moderation service that automatically detects and flags harmful, illegal, or unwanted imagery using AI-powered content analysis.

## Features

- 🛡️ **Content Safety**: Detects explicit nudity, violence, hate symbols, and extremist content
- 🔐 **Secure Authentication**: Bearer token-based authentication with admin privileges
- 📊 **Usage Tracking**: Comprehensive logging and analytics
- 🐳 **Containerized**: Full Docker support with docker-compose
- 🎨 **Modern UI**: Clean, responsive web interface
- 📈 **Scalable**: Built with FastAPI for high performance

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd image-moderation-api
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build and start services**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost
   - API: http://localhost:7000
   - API Documentation: http://localhost:7000/docs

### Initial Setup

The system creates an initial admin token: `admin-token-12345`

Use this token to:
1. Access the admin panel in the web interface
2. Create additional tokens
3. Manage the system

## API Endpoints

### Authentication (Admin Only)
- `POST /auth/tokens` - Create new bearer token
- `GET /auth/tokens` - List all active tokens
- `DELETE /auth/tokens/{token}` - Delete a token

### Moderation
- `POST /moderate` - Analyze uploaded image for harmful content

### System
- `GET /` - API information
- `GET /health` - Health check

## Development

### Local Development Setup

1. **Backend Development**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 7000
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   # Serve with any static server
   python -m http.server 8080
   ```

### Git Workflow

This project follows GitFlow:

1. **Feature Development**
   ```bash
   git checkout -b feature/your-feature-name
   # Make changes
   git commit -m "Add your feature"
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Open PR against `main` branch
   - Ensure tests pass
   - Get code review approval

3. **Merge to Main**
   ```bash
   git checkout main
   git pull origin main
   git merge feature/your-feature-name
   ```

### Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## Architecture

### Backend Components

- **FastAPI Application**: High-performance async API framework
- **MongoDB**: Document storage for tokens and usage tracking
- **Image Processing**: OpenCV and PIL for image analysis
- **Authentication**: Bearer token-based security
- **Moderation Engine**: AI-powered content safety detection

### Frontend Components

- **Vanilla JavaScript**: No framework dependencies
- **Responsive Design**: Works on desktop and mobile
- **File Upload**: Drag-and-drop image upload
- **Real-time Results**: Live moderation feedback

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `DATABASE_NAME` | Database name | `image_moderation` |
| `API_HOST` | API host | `0.0.0.0` |
| `API_PORT` | API port | `7000` |

### Docker Configuration

- **Backend**: Python 3.11 slim image with OpenCV
- **Frontend**: Nginx Alpine for static file serving
- **Database**: MongoDB 7.0 with persistent storage

## Security Considerations

- All endpoints require authentication
- Admin operations require elevated privileges
- File size limits (10MB max)
- Content type validation
- Secure token generation
- Usage logging for audit trails

## Performance

- Async FastAPI for concurrent request handling
- Thread pool for CPU-intensive image processing
- Efficient MongoDB indexing
- Docker multi-stage builds for optimized images

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

For questions or issues:
- Open a GitHub issue
- Check the API documentation at `/docs`
- Review the code examples in this README
```

## Project Setup Instructions

1. **Create the directory structure** as shown above
2. **Copy each code section** into the appropriate files
3. **Run the setup commands**:
   ```bash
   docker-compose up --build
   ```
4. **Access the application**:
   - Frontend: http://localhost
   - API: http://localhost:7000/docs
   - Use initial admin token: `admin-token-12345`
