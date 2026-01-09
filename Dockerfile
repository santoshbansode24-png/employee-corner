# Base Image: Node.js 18 on Debian Bullseye (includes Python build tools support)
FROM node:18-bullseye

# 1. Install System Dependencies (Python, LibreOffice, PIP)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libreoffice \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# 2. Set Up Work Directory
WORKDIR /app

# 3. Copy Python Requirements and Install
# Copying valid requirements (medical_gen/requirements.txt needs to be in root context)
# We assume the user has requirements.txt in medical_gen/requirements.txt
# Let's check where it is. It is in medical_gen/requirements.txt.
# We'll create a merged install step.

COPY medical_gen/requirements.txt ./medical_gen/requirements.txt
# Install Python deps globally in the container
RUN pip3 install -r medical_gen/requirements.txt
# Ensure docxtpl and streamlit are installed (requirements.txt should have them)
RUN pip3 install streamlit docxtpl

# 4. Copy Node.js Dependencies and Install
COPY package*.json ./
RUN npm install

# 5. Copy Source Code
COPY . .

# 6. Build React Frontend
RUN npm run build

# 7. Expose Port (Railway uses env PORT)
ENV PORT=5001
EXPOSE $PORT

# 8. Start Command
# We use concurrently to run Node (Server) and Streamlit (Worker)
# Node listens on $PORT. Streamlit listens on 8501.
# Streamlit needs to know it serves from a subpath if proxied, OR just run internally.
# Proxy in server.js forwards /reimbursement-gen -> localhost:8501.
# Streamlit needs --server.baseUrlPath=/reimbursement-gen to handle assets correctly.

CMD ["npx", "concurrently", \
     "npm run server", \
     "python3 -m streamlit run medical_gen/main.py --server.port=8501 --server.address=0.0.0.0 --server.headless=true --server.baseUrlPath=/reimbursement-gen"]
