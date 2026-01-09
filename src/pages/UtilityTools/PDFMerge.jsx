import React, { useState } from 'react'
import axios from 'axios'

function PDFMerge() {
    const [selectedFiles, setSelectedFiles] = useState([])
    const [loading, setLoading] = useState(false)

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files)
        setSelectedFiles([...selectedFiles, ...files])
    }

    const handleMerge = async () => {
        if (selectedFiles.length < 2) return

        setLoading(true)
        const formData = new FormData()
        selectedFiles.forEach(file => formData.append('files', file))

        try {
            const response = await axios.post(`http://${window.location.hostname}:5001/api/merge-pdf`, formData, {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'merged.pdf')
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

        } catch (error) {
            console.error('Error merging files:', error)
            alert('Merge failed. Please ensure the backend server is running.')
        } finally {
            setLoading(false)
        }
    }

    const removeFile = (index) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
    }

    const moveUp = (index) => {
        if (index === 0) return
        const newFiles = [...selectedFiles]
            ;[newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]]
        setSelectedFiles(newFiles)
    }

    const moveDown = (index) => {
        if (index === selectedFiles.length - 1) return
        const newFiles = [...selectedFiles]
            ;[newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]]
        setSelectedFiles(newFiles)
    }

    return (
        <div className="animate-fade-in">
            <div className="card">
                <div className="card-header">
                    <h1 className="card-title">🔗 PDF Merge</h1>
                    <p className="card-subtitle">Combine multiple PDF files into one</p>
                </div>

                <div className="card-body">
                    <div className="form-group">
                        <label className="form-label">Select PDF Files</label>
                        <input
                            type="file"
                            accept=".pdf,application/pdf"
                            multiple
                            onChange={handleFileSelect}
                            className="form-input"
                        />
                        <span className="form-help">You can select multiple PDF files</span>
                    </div>

                    {selectedFiles.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-4">Selected PDFs ({selectedFiles.length})</h3>
                            <div className="space-y-3">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="text-2xl font-bold text-neutral-400">{index + 1}</div>
                                            <div>
                                                <div className="font-semibold">{file.name}</div>
                                                <div className="text-xs text-neutral-600">
                                                    {(file.size / 1024).toFixed(2)} KB
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => moveUp(index)}
                                                disabled={index === 0}
                                                className="btn btn-sm btn-ghost"
                                            >
                                                ↑
                                            </button>
                                            <button
                                                onClick={() => moveDown(index)}
                                                disabled={index === selectedFiles.length - 1}
                                                className="btn btn-sm btn-ghost"
                                            >
                                                ↓
                                            </button>
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="btn btn-sm btn-error"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="card-footer mt-6">
                        <button
                            onClick={handleMerge}
                            disabled={selectedFiles.length < 2 || loading}
                            className="btn btn-primary btn-lg flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Merging...
                                </>
                            ) : (
                                'Merge PDFs'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PDFMerge
