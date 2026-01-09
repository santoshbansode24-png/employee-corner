import React, { useState } from 'react'
import axios from 'axios'

function ImageCompressor() {
    const [selectedFile, setSelectedFile] = useState(null)
    const [compressionLevel, setCompressionLevel] = useState('medium')
    const [loading, setLoading] = useState(false)

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        setSelectedFile(file)
    }

    const handleCompress = async () => {
        if (!selectedFile) return

        setLoading(true)
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('level', compressionLevel)

        try {
            const response = await axios.post(`http://${window.location.hostname}:5001/api/compress-image`, formData, {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'compressed_' + selectedFile.name)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

        } catch (error) {
            console.error('Error compressing file:', error)
            alert('Compression failed. Please ensure the backend server is running.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="animate-fade-in">
            <div className="card">
                <div className="card-header">
                    <h1 className="card-title">🗜️ Image Compressor</h1>
                    <p className="card-subtitle">Reduce image file size while maintaining quality</p>
                </div>

                <div className="card-body">
                    <div className="form-group">
                        <label className="form-label">Select Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="form-input"
                        />
                        <span className="form-help">Supports JPG, PNG, WebP formats</span>
                    </div>

                    {selectedFile && (
                        <div className="mt-6 p-6 bg-neutral-50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">Selected Image</h3>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <div className="font-semibold">{selectedFile.name}</div>
                                    <div className="text-sm text-neutral-600">
                                        Original Size: {(selectedFile.size / 1024).toFixed(2)} KB
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="btn btn-sm btn-error"
                                >
                                    Remove
                                </button>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Compression Level</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {['low', 'medium', 'high'].map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setCompressionLevel(level)}
                                            className={`btn ${compressionLevel === level ? 'btn-primary' : 'btn-outline'}`}
                                        >
                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <span className="form-help mt-2">
                                    {compressionLevel === 'low' && 'Best quality, larger file size'}
                                    {compressionLevel === 'medium' && 'Balanced quality and size'}
                                    {compressionLevel === 'high' && 'Smaller file size, reduced quality'}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="card-footer mt-6">
                        <button
                            onClick={handleCompress}
                            disabled={!selectedFile || loading}
                            className="btn btn-primary btn-lg flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Compressing...
                                </>
                            ) : (
                                'Compress Image'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ImageCompressor
