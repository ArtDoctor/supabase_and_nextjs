import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'

export default function Document({ url, size, onUpload }) {
  const [doc_url, setDocumentUrl] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  async function downloadImage(path) {
    try {
      const { data, error } = await supabase.storage.from('documents').download(path)
      if (error) {
        throw error
      }
      const url = URL.createObjectURL(data)
      setDocumentUrl(url)
    } catch (error) {
      console.log('Error downloading image: ', error.message)
    }
  }


  async function uploadDocument(event) {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      let { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)
    } catch (error) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {doc_url ? (
        <img
          src={doc_url}
          alt="Document"
          className="Document image"
          style={{ height: size, width: size }}
        />
      ) : (
        <div className="Document no-image" style={{ height: size, width: size }} />
      )}
      <div style={{ width: size }}>
        <label className="button primary block" htmlFor="single">
          {uploading ? 'Uploading ...' : 'Upload'}
        </label>
        <input
          style={{
            visibility: 'hidden',
            position: 'absolute',
          }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadDocument}
          disabled={uploading}
        />
      </div>
    </div>
  )
}