import React, { useState } from 'react'
import axios from 'axios'

function PDFtoJPG() {
    const [selectedFile, setSelectedFile] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        setSelectedFile(file)
    }

    const handleConvert = async () => {
        if (!selectedFile) return

        setLoading(true)
        const formData = new FormData()
        formData.append('file', selectedFile)

        try {
            const response = await axios.post(`http://${window.location.hostname}:5001/api/pdf-to-jpg`, formData, {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'converted.jpg')
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

        } catch (error) {
            console.error('Error converting file:', error)
            alert('Conversion failed. Please ensure the backend server is running.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="animate-fade-in">
            <div className="card">
                <div className="card-header">
                    <h1 className="card-title">🎨 PDF to JPG Converter</h1>
                    <p className="card-subtitle">Convert PDF to JPG image</p>
                </div>

                <div className="card-body">
                    <div className="form-group">
                        <label className="form-label">Select PDF File</label>
                        <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileSelect}
                            className="form-input"
                        />
                    </div>

                    {selectedFile && (
                        <div className="mt-6 p-6 bg-neutral-50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">Selected PDF</h3>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <div className="font-semibold">{selectedFile.name}</div>
                                    <div className="text-sm text-neutral-600">
                                        Size: {(selectedFile.size / 1024).toFixed(2)} KB
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="btn btn-sm btn-error"
                                >
                                    Remove
                                </button>
                            </div>
                            <div className="text-xs text-neutral-500 italic">
                                * Currently supports converting the first page or full document depending on system configuration.
                            </div>
                        </div>
                    )}

                    <div className="card-footer mt-6">
                        <button
                            onClick={handleConvert}
                            disabled={!selectedFile || loading}
                            className="btn btn-primary btn-lg flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Converting...
                                </>
                            ) : (
                                'Convert to JPG'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PDFtoJPG
