import React, { useState } from 'react'
import axios from 'axios'

function JPGtoPDF() {
    const [selectedFiles, setSelectedFiles] = useState([])
    const [loading, setLoading] = useState(false)

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files)
        setSelectedFiles(files)
    }

    const handleConvert = async () => {
        if (selectedFiles.length === 0) return

        setLoading(true)
        const formData = new FormData()
        selectedFiles.forEach(file => formData.append('images', file))

        try {
            const response = await axios.post(`http://${window.location.hostname}:5001/api/jpg-to-pdf`, formData, {
                responseType: 'blob'
            })

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'images.pdf')
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

        } catch (error) {
            console.error('Error converting files:', error)
            alert('Conversion failed. Please ensure the backend server is running.')
        } finally {
            setLoading(false)
        }
    }

    const removeFile = (index) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
    }

    return (
        <div className="animate-fade-in">
            <div className="card">
                <div className="card-header">
                    <h1 className="card-title">🖼️ JPG to PDF Converter</h1>
                    <p className="card-subtitle">Convert multiple images to a single PDF file</p>
                </div>

                <div className="card-body">
                    <div className="form-group">
                        <label className="form-label">Select Images</label>
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            multiple
                            onChange={handleFileSelect}
                            className="form-input"
                        />
                        <span className="form-help">You can select multiple images (JPG, JPEG, PNG)</span>
                    </div>

                    {selectedFiles.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-4">Selected Files ({selectedFiles.length})</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm font-semibold truncate">{file.name}</span>
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="btn btn-sm btn-error"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <div className="text-xs text-neutral-600">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="card-footer mt-6">
                        <button
                            onClick={handleConvert}
                            disabled={selectedFiles.length === 0 || loading}
                            className="btn btn-primary btn-lg flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Converting...
                                </>
                            ) : (
                                'Convert to PDF'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="card mt-8">
                <div className="card-body">
                    <h3 className="text-lg font-semibold mb-4">📌 Features</h3>
                    <ul className="space-y-2">
                        <li className="flex items-start">
                            <span className="text-success mr-2">✓</span>
                            <span>Upload multiple images at once</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-success mr-2">✓</span>
                            <span>Supports JPG, JPEG, and PNG formats</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-success mr-2">✓</span>
                            <span>Drag and reorder images before conversion</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-success mr-2">✓</span>
                            <span>Download as single or multi-page PDF</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default JPGtoPDF
