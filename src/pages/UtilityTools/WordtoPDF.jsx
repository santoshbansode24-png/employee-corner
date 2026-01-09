import React, { useState } from 'react'
import axios from 'axios'

function WordtoPDF() {
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
            const response = await axios.post(`http://${window.location.hostname}:5001/api/word-to-pdf`, formData, {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', selectedFile.name.replace(/\.[^/.]+$/, "") + '.pdf')
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

        } catch (error) {
            console.error('Error converting file:', error)
            alert('Conversion failed. Please ensure LibreOffice is installed and the backend is running.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="animate-fade-in">
            <div className="card">
                <div className="card-header">
                    <h1 className="card-title">📝 Word to PDF Converter</h1>
                    <p className="card-subtitle">Convert Word documents (.doc, .docx) to PDF</p>
                </div>

                <div className="card-body">
                    <div className="form-group">
                        <label className="form-label">Select Word Document</label>
                        <input
                            type="file"
                            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileSelect}
                            className="form-input"
                        />
                        <span className="form-help">Supported formats: .doc, .docx</span>
                    </div>

                    {selectedFile && (
                        <div className="mt-6 p-6 bg-neutral-50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">Selected File</h3>
                            <div className="flex items-center justify-between">
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
                                'Convert to PDF'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WordtoPDF
