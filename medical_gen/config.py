import os

# Configuration for Domain/URL

# Base URL for XAMPP (Apache) hosting
# On Railway, we might not use this, but for backward compat:
XAMPP_BASE_URL = os.environ.get("XAMPP_BASE_URL", "http://veeruapp.in/EMPLOYEE CORNER 1.0")

# Base URL for React Frontend
# On Railway, this is just the domain
REACT_BASE_URL = os.environ.get("REACT_BASE_URL", "http://veeruapp.in:3000")
