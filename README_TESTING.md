# Employee Corner Test Setup Guide

This guide will help you set up the Employee Corner application on your local machine for validation and testing.

## Prerequisites
Before you begin, ensure you have the following installed on your computer:

1.  **Node.js (v18 or higher)**: [Download Here](https://nodejs.org/)
2.  **Python (v3.10 or higher)**: [Download Here](https://www.python.org/downloads/)
    *   *Note: During installation, checks the box "Add Python to PATH"*
3.  **LibreOffice**: [Download Here](https://www.libreoffice.org/download/download-libreoffice/)
    *   *Required for converting Word documents to PDF.*
    *   *Default installation path assumed: `C:\Program Files\LibreOffice`*

## Installation Steps

1.  **Unzip the Project**
    *   Extract the folder sent to you (e.g., `EMPLOYEE CORNER 1.0`).

2.  **Install Node.js Dependencies**
    *   Open a terminal/command prompt in the main folder (`EMPLOYEE CORNER 1.0`).
    *   Run the command:
        ```bash
        npm install
        ```
    *   *This downloads all website libraries.*

3.  **Install Python Dependencies**
    *   In the same terminal, navigate to the `medical_gen` folder:
        ```bash
        cd medical_gen
        ```
    *   Run the command:
        ```bash
        pip install -r requirements.txt
        ```
    *   Return to the main folder:
        ```bash
        cd ..
        ```

## How to Run the Application

1.  **Start the Server**
    *   Ensure you are in the main `EMPLOYEE CORNER 1.0` folder.
    *   Run the simple start command:
        ```bash
        npm start
        ```

2.  **Access the App**
    *   The application should open automatically in your browser.
    *   If not, go to: `http://localhost:5173`

## Troubleshooting

*   **PDF Generation Failed?**
    *   Ensure LibreOffice is installed.
    *   Check if `C:\Program Files\LibreOffice\program\soffice.exe` exists.
*   **"npm" not found?**
    *   Reinstall Node.js and restart your computer.
