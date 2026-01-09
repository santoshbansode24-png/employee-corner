# Project Migration Guide: EMPLOYEE CORNER 1.0

This guide explains how to move your project to a new computer and set it up correctly.

## 1. Preparation on CURRENT PC
**Goal:** Pack your project files.

1.  **Stop all running servers** (Streamlit, Node Server, Vite).
2.  **Generate Python Requirements** (I have already done this for you):
    *   Check for `requirements.txt` in your project folder.
3.  **Zip the Project Folder:**
    *   Go to `c:\xampp\htdocs\`
    *   Right-click `EMPLOYEE CORNER 1.0` -> **Send to** -> **Compressed (zipped) folder**.
    *   **Tip:** To make the file smaller, you can delete the `node_modules` and `.venv` folders *before* zipping. You will recreate them on the new PC anyway.
4.  **Transfer the Zip file** to your new PC (via USB, Google Drive, etc.).

---

## 2. Setup on NEW PC
**Goal:** Install necessary software.

1.  **Install Node.js:**
    *   Download and install from [nodejs.org](https://nodejs.org/).
2.  **Install Python:**
    *   Download and install from [python.org](https://www.python.org/).
    *   **Important:** Check the box **"Add Python to PATH"** during installation.
3.  **Install LibreOffice:**
    *   Likely required for PDF conversion. Download from [libreoffice.org](https://www.libreoffice.org/).
    *   Default path is usually `C:\Program Files\LibreOffice`.
4.  **Install XAMPP (Optional/Recommended):**
    *   If you want to keep the same path structure (`c:\xampp\htdocs`), install XAMPP.
5.  **Unzip the Project:**
    *   Extract the folder to `c:\xampp\htdocs\EMPLOYEE CORNER 1.0` (or your preferred location).

---

## 3. Installation & Running on NEW PC
**Goal:** Re-install dependencies and start the app.

Open your **Terminal** (PowerShell or Command Prompt) and navigate to the project folder:
```powershell
cd "c:\xampp\htdocs\EMPLOYEE CORNER 1.0"
```

### Step A: Setup Python (Streamlit)
1.  **Create a virtual environment:**
    ```powershell
    python -m venv .venv
    ```
2.  **Activate it:**
    ```powershell
    .\.venv\Scripts\activate
    ```
3.  **Install dependencies:**
    ```powershell
    pip install -r requirements.txt
    ```

### Step B: Setup Node.js (React & Server)
1.  **Install dependencies:**
    ```powershell
    npm install
    ```

### Step C: Start the Application
You will need **3 separate terminals** (as you do now):

*   **Terminal 1 (Backend Server):**
    ```powershell
    npm run server
    ```
*   **Terminal 2 (React Frontend):**
    ```powershell
    npm run dev
    ```
*   **Terminal 3 (Streamlit App):**
    ```powershell
    .\.venv\Scripts\activate
    streamlit run medical_gen/main.py
    ```

## Troubleshooting
*   **LibreOffice Error:** If PDF generation fails, check if LibreOffice is installed and the path in `medical-pdf-server.js` matches your installation.
*   **Database:** If you used a local MySQL database, you will need to export it from the old PC (via phpMyAdmin) and import it on the new PC.
