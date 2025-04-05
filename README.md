# NhatTin Backend API

This repository contains the backend API for the NhatTin e-commerce platform built with NestJS. The system provides a comprehensive set of APIs for user management, product management, inventory tracking, orders, payments, and more.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  Client                                      │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                               API Gateway                                    │
│                        (NestJS Application - main.ts)                        │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
         ┌───────────────────────────────────────────────────┐
         │                                                   │
         ▼                                                   ▼
┌────────────────────┐                            ┌────────────────────────────┐
│  Global Middleware │                            │     Global Exception       │
│ ┌────────────────┐ │                            │         Filter            │
│ │    Validation  │ │                            │  ┌─────────────────────┐  │
│ │      Pipe      │ │                            │  │  HttpExceptionFilter│  │
│ └────────────────┘ │                            │  └─────────────────────┘  │
│ ┌────────────────┐ │                            │  ┌─────────────────────┐  │
│ │  JWT Auth Guard│ │                            │  │    ApiException     │  │
│ └────────────────┘ │                            │  └─────────────────────┘  │
└──────────┬─────────┘                            └────────────────┬───────────┘
           │                                                       │
           └──────────────────────┬────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Application Modules                               │
│                                                                             │
│  ┌─────────────┐   ┌──────────┐   ┌─────────┐   ┌───────────┐   ┌────────┐  │
│  │    Auth     │   │  Users   │   │Products │   │  Orders   │   │ Carts  │  │
│  └─────────────┘   └──────────┘   └─────────┘   └───────────┘   └────────┘  │
│                                                                             │
│  ┌─────────────┐   ┌──────────┐   ┌─────────┐   ┌───────────┐   ┌────────┐  │
│  │  Payment    │   │ Discount │   │ Image   │   │ Inventory │   │Category │  │
│  └─────────────┘   └──────────┘   └─────────┘   └───────────┘   └────────┘  │
│                                                                             │
│  ┌─────────────┐   ┌──────────┐   ┌──────────────┐   ┌────────────────────┐ │
│  │ Warehouses  │   │   Posts  │   │Subscriptions │   │Post-Categories etc. │ │
│  └─────────────┘   └──────────┘   └──────────────┘   └────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             MongoDB Database                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## System Overview

The NhatTin API is a modular NestJS application structured around domain-specific modules that each encapsulate a piece of functionality within the system. The application follows a layered architecture pattern with controllers, services, repositories, and schemas.

### Core Components

1. **API Gateway**: The entry point for all client requests, configured in main.ts
   - Global validation
   - Cross-origin resource sharing (CORS)
   - Swagger documentation

2. **Global Exception Handling**:
   - Custom HttpExceptionFilter for consistent error responses
   - ApiException for application-specific error types
   - Centralized MessengeCode for error message management

3. **Authentication & Authorization**:
   - JWT-based authentication 
   - Role-based access control (Admin/User roles)
   - Public endpoints marked with @Public() decorator

4. **Domain Modules**:
   - Each module follows a similar structure with controllers, services, DTOs, and schemas
   - Clear separation of concerns through repository pattern

## Module Structure

Each feature module typically contains:

- **Controller** (`*.controller.ts`): Handles HTTP requests and returns responses
- **Service** (`*.service.ts`): Contains business logic
- **Repository** (`*.repo.ts`): Handles database operations
- **Schema** (`*.schema.ts`): Defines the MongoDB document structure
- **DTOs** (`dto/*.dto.ts`): Data Transfer Objects for validation
- **Enums** (`enum/*.enum.ts`): Type definitions for fixed values
- **Models** (`model/*.model.ts`): Response models for data mapping

### Key Modules

- **Auth**: Handles authentication, login, token management
- **Users**: User management, profiles, and roles
- **Products**: Product catalog management
- **Carts**: Shopping cart functionality
- **Orders**: Order processing and management
- **Payment**: Payment processing
- **Inventory**: Stock management
- **Warehouses**: Warehouse management
- **Categories**: Product categorization
- **Posts/Post Categories**: CMS functionality

## Common Utilities

The `common` directory contains shared utilities used across modules:

- **Meta**: Decorators and metadata helpers
- **Exception**: Error handling utilities
- **Utils**: General utilities (string manipulation, etc.)
- **Pipes**: Custom validation pipes
- **Interceptors**: Request/response transformation
- **Models**: Base models for inheritance

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB connection details

# Start the application
npm run start:dev
```

### API Documentation

Once the application is running, you can access the Swagger API documentation at:

```
http://localhost:3080/docs
```

## Authentication

Most endpoints require authentication. To authenticate:

1. Create a user with the `/users/createUser` endpoint
2. Login with the `/auth/login` endpoint to get a JWT token
3. Use the token in the Authorization header: `Bearer {token}`

## Error Handling

The application uses custom exception handling to provide consistent error responses:

```json
{
  "statusCode": 400,
  "message": "Số điện thoại đã được sử dụng",
  "code": "PHONE_IS_EXIST"
}
```

## File Upload

The application supports file uploads (primarily images) using multipart/form-data.
Uploaded files are served from the `/uploads` directory.
