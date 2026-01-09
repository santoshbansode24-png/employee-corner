import React, { useState } from 'react'
import axios from 'axios'

function PDFSplit() {
    const [selectedFile, setSelectedFile] = useState(null)
    const [splitMode, setSplitMode] = useState('range')
    const [startPage, setStartPage] = useState(1)
    const [endPage, setEndPage] = useState(1)
    const [manualPages, setManualPages] = useState('')
    const [loading, setLoading] = useState(false)

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        setSelectedFile(file)
    }

    const handleSplit = async () => {
        if (!selectedFile) return

        let range = ''
        if (splitMode === 'range') {
            range = `${startPage}-${endPage}`
        } else {
            range = manualPages
        }

        if (!range) {
            alert('Please specify a valid page range or page numbers.')
            return
        }

        setLoading(true)
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('range', range)

        try {
            const response = await axios.post(`http://${window.location.hostname}:5001/api/split-pdf`, formData, {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'split.pdf')
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

        } catch (error) {
            console.error('Error splitting file:', error)
            alert('Split failed. Please check page numbers and backend server.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="animate-fade-in">
            <div className="card">
                <div className="card-header">
                    <h1 className="card-title">✂️ PDF Split</h1>
                    <p className="card-subtitle">Split PDF into multiple files or extract specific pages</p>
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

                            <div className="mb-6">
                                <label className="form-label">Split Mode</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setSplitMode('range')}
                                        className={`btn ${splitMode === 'range' ? 'btn-primary' : 'btn-outline'}`}
                                    >
                                        Page Range
                                    </button>
                                    <button
                                        onClick={() => setSplitMode('pages')}
                                        className={`btn ${splitMode === 'pages' ? 'btn-primary' : 'btn-outline'}`}
                                    >
                                        Specific Pages
                                    </button>
                                </div>
                            </div>

                            {splitMode === 'range' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="form-label">Start Page</label>
                                        <input
                                            type="number"
                                            value={startPage}
                                            onChange={(e) => setStartPage(e.target.value)}
                                            className="form-input"
                                            min="1"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">End Page</label>
                                        <input
                                            type="number"
                                            value={endPage}
                                            onChange={(e) => setEndPage(e.target.value)}
                                            className="form-input"
                                            min="1"
                                        />
                                    </div>
                                </div>
                            )}

                            {splitMode === 'pages' && (
                                <div className="form-group">
                                    <label className="form-label">Page Numbers</label>
                                    <input
                                        type="text"
                                        value={manualPages}
                                        onChange={(e) => setManualPages(e.target.value)}
                                        className="form-input"
                                        placeholder="e.g., 1,3,5"
                                    />
                                    <span className="form-help">Enter page numbers separated by commas.</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="card-footer mt-6">
                        <button
                            onClick={handleSplit}
                            disabled={!selectedFile || loading}
                            className="btn btn-primary btn-lg flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Splitting...
                                </>
                            ) : (
                                'Split PDF'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PDFSplit
