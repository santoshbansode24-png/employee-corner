import os

# Configuration for Domain/URL

# Base URL for XAMPP (Apache) hosting
# On Railway, we use the HTTPS deployment URL
XAMPP_BASE_URL = os.environ.get("XAMPP_BASE_URL", "https://employeecorner.veeruapp.in")

# Base URL for React Frontend
# On Railway, this is the main deployment domain
REACT_BASE_URL = os.environ.get("REACT_BASE_URL", "https://employeecorner.veeruapp.in")
