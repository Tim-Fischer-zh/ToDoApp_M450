FROM nginx:1.27-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY deploy/nginx/nginx.conf /etc/nginx/nginx.conf

# Copy static files from TodoApi/wwwroot
COPY TodoApi/wwwroot /usr/share/nginx/html

# Create cache directory
RUN mkdir -p /var/cache/nginx/client_temp && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check - simply check if nginx process is running
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
    CMD pgrep nginx || exit 1

CMD ["nginx", "-g", "daemon off;"]
