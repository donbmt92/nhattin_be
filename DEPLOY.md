# Deploying to Render

This guide will walk you through the steps to deploy your NestJS application to Render.

## Prerequisites

- A [Render account](https://render.com/)
- Your project code pushed to a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

### 1. Connect your Git repository to Render

1. Log in to your Render account
2. Go to the Dashboard and click "New" > "Web Service"
3. Connect your Git repository
4. Select the repository containing your NestJS application

### 2. Configure your Web Service

Fill in the following configuration options:

- **Name**: nhattin-api (or your preferred name)
- **Runtime**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:pro`
- **Plan**: Select an appropriate plan (Starter is a good starting point)

### 3. Configure Environment Variables

Add the following environment variables in the Render dashboard:

- `NODE_ENV`: product
- `MONGOURL`: Your MongoDB connection string
- `DATABASE`: remote
- `JWT_SECRET`: Your JWT secret key
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

### 4. Deploy

Click "Create Web Service" to start the deployment process.

## Using render.yaml (Alternative Method)

You can also deploy using the `render.yaml` file included in the repository:

1. Go to the Render Dashboard
2. Click "New" > "Blueprint"
3. Connect your Git repository
4. Render will automatically detect the `render.yaml` file and configure the services

## Post-Deployment

After deployment, your application will be available at the URL provided by Render.
You can access your API documentation at `https://your-render-url.onrender.com/docs`.

## Troubleshooting

If you encounter issues with your deployment:

1. Check the logs in the Render dashboard
2. Verify that all environment variables are correctly set
3. Make sure your MongoDB connection string is accessible from Render
4. Check that your application is listening on the port provided by Render via `process.env.PORT` 