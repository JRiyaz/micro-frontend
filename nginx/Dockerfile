FROM nginx:stable-alpine3.21

# # Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# # Copy your custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/my-site.conf.template

# If you have a custom headers file (e.g., headers.conf)
# COPY headers.conf /etc/nginx/conf.d/

# Nginx runs by default
CMD envsubst < /etc/nginx/conf.d/my-site.conf.template > /etc/nginx/nginx.conf && nginx -g "daemon off;"
